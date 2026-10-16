# Idea-quality investigation — 2026-09-10

Scope: why generated ideas are sometimes mediocre, and what to fix first. Investigated the live app code, production Supabase (`uobhsikllffnwvvpedui`), and the prior n8n upgrade work in `C:\Users\pcjr3\n8n-idea-upgrade\quality-v10`. n8n itself could not be inspected directly (no session cookie in this environment — hit the n8n.io logged-out landing page), so workflow-level claims below are inferred from production data + the quality-v10 artifacts, not a live workflow read.

## What's actually running today

The `quality-v10` work (writer.md / reviewer-new.md, published as workflow version `d59abb65` / "v10.4") is not vaporware — it is reflected in production data. The most recent real note, created **2026-09-06** (4 days ago), reads as sparse-input-aware, hedged, and honest ("Concept Pending Definition... does not yet define the user, asset class...") — that is exactly the sparse/nonproduct handling writer.md specifies, not the old generic-checklist style. So the improved prompts are very likely still the live workflow. Two important corrections to the brief:

- **The "public read access to voice_notes" risk is already closed** — but closed hard enough to break a real feature (see Finding 3). Production RLS on `voice_notes` is `voice_notes_select_own` / `_insert_own` / `_update_own` / `_delete_own`, all `authenticated`-only, `user_id = auth.uid()`. The repo's migration `20250413064500_allow_public_read_access_to_all_voice_notes.sql` and `database_structure.md` describe a public-read policy that **is not what's live**. Verified with a direct anon-key REST call against a real row → `401 permission denied for table voice_notes`. Do not reapply that migration's blanket policy; production has already (correctly) moved away from it.
- `voice_notes.is_featured`, `.status`, `.updated_at` — referenced in `client/src/App.jsx` (`Dashboard`'s "active ideas" promotion/sort) — **do not exist** in production (`information_schema.columns` checked). Every `is_featured`/`status` write silently errors and is swallowed by `catch`; the dashboard's "featured" sort is a no-op after reload. Not a generation-quality issue, but worth knowing before touching that component.

## Three highest-impact causes of mediocre/broken output

### 1. Regenerate can silently destroy a good result with garbage
[`NotesList.jsx:258-287`](../client/src/components/NotesList.jsx#L258) does the whole Create/Regenerate round trip client-side: `fetch('.../webhook/transcript-summarize')` → `data.idea || JSON.stringify(data)` → `supabase.from('voice_notes').update({ business_idea: idea })`. If the webhook ever responds `200` with a shape that isn't exactly `{ idea: "..." }` — a n8n error payload, a partial JSON object, anything — the **entire stringified response object gets written over the previous, possibly-good `business_idea`**, with no snapshot and no way back.

This isn't hypothetical: two production rows still carry the scar —
- `639739b3-6b3c-4570-8953-5771654398ad` (2026-01-18): `business_idea` starts with the literal text `` text":"# AI-Generated Meme Story Continuation Platform...`` — a truncated JSON fragment, not clean Markdown.
- `8f81c8d6-d3a3-4a02-9ffb-fa19623fd212` (2026-01-07): same `` text":"...`` prefix bug.

Three different places in the frontend (`NotesList.jsx` list preview, `App.jsx` `extractTitle`, `App.jsx` `FullIdeaPage`) each carry their own regex to strip this exact malformed prefix — i.e., the team already hand-patched around this failure mode repeatedly instead of fixing the write path. The two most recent generations (Jan 31 and Sep 6, 2026) don't show the corruption, suggesting v10.4's editorial formatting made it rarer — but the unsafe fallback (`|| JSON.stringify(data)`) is still sitting in the code today, live.

### 2. There is no generation history — every Regenerate is a destructive overwrite
The n8n side reportedly archives every generation and produces a rich structured object per `writer.md`'s schema (title, summary, sections, persona, keywords, metrics, `research` with source/passage IDs). None of that structure reaches Supabase or the UI — only a single mutable `business_idea` text column exists. Concretely:
- No prior version of a report is ever kept once Regenerate succeeds.
- No research/citation provenance (`sourceId`, `passageId`) is stored, so a later reviewer (human or model) can't audit *why* a claim was made without re-running n8n.
- The task's own evaluation method — "compare before/after for fidelity, depth, evidence quality, readability, latency and cost" — is currently impossible to do *in the app*; it can only be done by manually digging through n8n execution history, which is exactly the gap the brief calls out.

### 3. The "Share Idea" feature is broken for anyone but the note's owner
`FullIdeaPage` (`App.jsx`, the `/idea/:id` route that "Copy Link" and "Share Idea" point at) does a plain `supabase.from('voice_notes').select('*').eq('id', id).single()` with no auth branching. Given Finding 0 above (RLS is owner-only), **any shared link 401s silently** for every viewer except the creator — confirmed live against the real saved-result URL from the quality-v10 test (`/idea/d755aa0a-...`) via a raw anon REST call. The page just spins on "Loading idea..." forever for anyone else. This matters for the core loop because a "thoughtful, well-researched development" that can't be shown to anyone but its author is a dead end for actually using the output — and it blocks the natural way to get outside feedback on report quality.

Notably, the schema already has a *correct* pattern for this: `saved_ideas` has a real, scoped "Allow public read access to all ideas" policy — but it's wired only into the unrelated Hub-collaboration feature (`HubCreateModal.jsx`), never into the voice-note Share flow. The fix is not "make voice_notes public again" (that's the footgun the old migration set up); it's "route sharing through an explicit, scoped publish action," the same shape `saved_ideas` already models.

## Proposed acceptance criteria

1. **Regenerate never corrupts a note.** If the webhook response isn't a valid non-empty idea string, the update is rejected client-side, the previous `business_idea` is left untouched, and the user sees a specific error (not a silent DB write). Verified by forcing a malformed response and confirming the stored value is unchanged.
2. **At least one prior version survives every Regenerate.** Before overwriting `business_idea`, the previous value (plus generation timestamp) is preserved somewhere queryable — minimally a `previous_business_idea`/`previous_generated_at` pair, ideally a small `voice_note_generations` table if we're going to compare more than one prior version. Verified by regenerating an existing idea twice and reading both versions back from Supabase.
3. **A shared link works for a non-owner.** Opening `/idea/:id` in an incognito/logged-out browser renders the report, not an infinite spinner. Verified with the actual anon key against a real row (the same curl-style check used above), not just "n8n reported success."

## Recommended sequencing

- **Increment 1 (frontend-only, no DB/n8n change, safe to do now):** fix the Finding-1 corruption bug in `NotesList.jsx` — validate the webhook response shape strictly before writing, never fall back to `JSON.stringify(data)`, surface a real error, leave the existing `business_idea` in place on failure.
- **Increment 2 (needs a Supabase migration — asking first):** minimal version preservation, satisfying acceptance criterion 2. Smallest viable shape: two nullable columns on `voice_notes` (`previous_business_idea text`, `previous_generated_at timestamptz`), populated by the same regenerate handler right before the update. Cheap, additive, non-breaking; a fuller `voice_note_generations` history table is the "if we want to compare more than one prior version" upgrade path, not required for the first increment.
- **Increment 3 (needs an RLS/schema decision — asking first):** make sharing actually work without reopening the old blanket-public hole. Two reasonable shapes: (a) a `voice_notes.is_shared boolean default false` column + an RLS policy scoped to `is_shared = true`, flipped on by an explicit "Share" action the user takes (mirrors how `saved_ideas` already works); or (b) a Supabase Edge Function that serves a single note's display fields via the service role when given a valid ID, keeping the table itself locked down. (a) is simpler and consistent with the existing `saved_ideas` pattern; (b) is more defensible if we ever want per-field redaction.
- **Out of scope for this pass, not because it's unimportant:** the `is_featured`/`status`/`updated_at` phantom-column bug in `App.jsx` Dashboard (cosmetic sort issue, unrelated to generation quality); the stray `client/src/components/App.jsx` file that literally contains raw diff-conflict text as its content (dead code — nothing imports `components/App`, confirmed by grep — worth deleting in a follow-up, not touched here to keep this change focused).

## What was verified vs. inferred

- Verified directly: production RLS policies on `voice_notes`/`saved_ideas`; anon-key 401 on a real shared idea; `voice_notes` column list (no `is_featured`/`status`/`updated_at`); two corrupted production rows matching the exact "silent JSON.stringify" failure mode; the "Share" flow's code path; that `client/src/components/App.jsx` is unimported dead code.
- Inferred, not directly verified: that v10.4 (or something behaviorally equivalent) is the *currently* live n8n workflow — based on the Sep 6, 2026 production sample's tone/behavior matching `writer.md`'s sparse-input rules, not a direct read of the n8n workflow (blocked — no authenticated session available in this environment).
