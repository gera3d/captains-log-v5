# Changelog

## 2026-09-10 — fix ungrounded "close alternative" citations

**Root cause, found by live-tracing a real production execution (n8n execution `228`,
idea: "daily LinkedIn outreach agent" — the real transcript from voice-note
`cfcc8880-bc83-49ee-9ac8-023ee57bb30c`):**

`extractor-new.md`'s Query 2 instruction told the planner model to guess the close
alternative's official domain and hard-code it into a `site:` filter (e.g.
`site:dex.com AI networking relationship reminders announcement`). The guess was wrong —
the real personal-CRM product "Dex" lives at `getdex.com`, not `dex.com` — and Brave
Search returned **zero results**, flagging `"bad_results": true, "should_fallback": true`
in its own response. Nothing downstream retried or flagged this: the "close alternative"
research slot silently ended up empty (0 of 24 candidate sources had `queryIndex: 1`,
the slot reserved for Query 2), while the writer still confidently named "Clay vs Dex" in
the keywords section from its own general knowledge — a competitor claim that looked
sourced but wasn't grounded in anything actually retrieved.

**Fix (two changes, both prompt-only, no workflow topology change):**

1. `extractor-new.md` — Query 2 no longer instructs a guessed `site:` domain filter.
   Instead it searches by product name + "official site"/"product page"/"announcement",
   which reliably surfaces the true official domain via ordinary ranking instead of
   requiring the model to already know it.
2. `reviewer-new.md` — added an explicit check: if the draft names a specific competing
   product/brand without a citation that actually discusses it, the reviewer must either
   add a matching product-role source or replace the brand name with generic category
   language. This is a defense-in-depth catch for the same failure mode even when it's
   not a `site:`-query problem specifically.

**Applied to production** via the n8n REST API (`PUT /api/v1/workflows/yiozu981GRE6pztk`),
changing only the `Prepare Source Extraction` and `Build Review Request` nodes' embedded
prompt text — all other 43 nodes byte-identical, diff-verified before pushing.
`versionId` moved from `d59abb65-1153-4e50-94dd-8ed5a88ef5e4` (the prior "v10.4") to
`0b28b4a7-88f3-47e2-bb48-fbb4ad4f813a`. Workflow remained active throughout.

**Verification:** re-ran a different real production transcript (the "Magic: The
Gathering Commander deck builder" idea, voice-note `97e01879-49d7-4f5a-996d-4cc3f40f9652`,
which names real close alternatives — Moxfield, Archidekt, EDHREC) through the live
webhook after the patch. See the investigation doc in `docs/` for the before/after
comparison. Direct isolated confirmation: re-ran the original Dex/LinkedIn case with a
reworded transcript (to force a fresh search past the 6h research cache) and captured the
raw Brave Search response for Query 2 via the n8n execution API — `"Dex personal CRM
official site announcement"` returned 8 results including the real `getdex.com` page,
versus 0 results for the old `site:dex.com ...` phrasing. `versionId` after this change:
`0b28b4a7-88f3-47e2-bb48-fbb4ad4f813a`.

## 2026-09-10 — reviewer citation-discipline fix (found while verifying the fix above)

The isolated Dex retest above (execution `232`) still failed end-to-end with
`INVALID_REPORT`, even though the extractor fix worked and the reviewer correctly added a
grounded `role:"product"` citation for the real getdex.com page. Root-caused by replaying
the exact live `validateDraft`/`validateExtras` code from the `Validate and Format Report`
node against the real draft + sources from that execution (Node.js harness, not guesswork):
the reviewer's corrected draft listed a second source (`S13`, a LinkedIn-outreach-benchmark
page) in `research` to satisfy its own "needs differentiated sources" issue, but never
actually cited it with an inline `[S13]` marker anywhere in the summary/sections/metrics/
persona — so the validator's "every listed source must be used in the argument" check
(correctly) rejected the whole draft, falling back to the prior report as designed. This is
the same failure family as the "reviewer response-format variations caused failed saves"
problem noted before v10.4 — v10.4 narrowed it, but didn't close every case.

**Fix:** added one explicit instruction to `reviewer-new.md` telling the reviewer to check,
before returning, that every `research` entry it lists actually has a matching `[S_]`
citation somewhere in the text — and to either add the citation or drop the entry, rather
than leaving an uncited source that fails the whole draft. Prompt-only change, pushed via
the same API-patch method to `Build Review Request`'s `reviewRequest` prompt. Post-patch
sanity check (a cheap sparse-input probe) confirmed the workflow still runs end-to-end
without errors. This is a probabilistic model-compliance fix, not a guarantee — a single
test can't prove it eliminates the failure mode, only that it doesn't regress anything.

