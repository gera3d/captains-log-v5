# Idea Structure — n8n workflow home

This directory is the canonical home (per the 2026-09-10 decision to make this repo
the home for the idea-generation quality work previously living only in
`C:\Users\pcjr3\n8n-idea-upgrade\quality-v10`) for the prompts and builder behind the
**Idea Structure** n8n workflow (`https://n8n.why57.com/workflow/yiozu981GRE6pztk`,
webhook `transcript-summarize`) that powers Create/Regenerate on idea.why57.com.

- `writer.md` — the writer LLM prompt (develops the transcript into a structured brief).
- `reviewer-new.md` — the reviewer/editor LLM prompt (checks and corrects the draft).
- `extractor-new.md` — the planner LLM prompt (extracts intent + plans the 4 research queries).
- `build.py` — reproducible builder: patches these prompts (plus the JS files below) into
  node parameters and emits `workflow.json`, starting from a `rollback-v9.json` export
  (not copied here — see the original `quality-v10` folder if you need to rebuild from v9).
- `recent.js`, `validate-draft.js`, `validate-extras.js`, `format.js`, `markdown-extras.js`,
  `sha256.js` — supporting JS embedded into various Code nodes by `build.py`.
- `published.json` — the exported v10.4 workflow as last verified by the prior quality-v10
  review (version `d59abb65-1153-4e50-94dd-8ed5a88ef5e4`). **No longer current** — see
  `CHANGELOG.md` for the 2026-09-10 fix that superseded it (live `versionId` is now
  `0b28b4a7-88f3-47e2-bb48-fbb4ad4f813a`).
- `QUALITY-REVIEW.md` — validation history through v10.4.
- `CHANGELOG.md` — changes made from this repo, going forward.

## How this gets published

There's no CI/CD here: edits to `writer.md`/`reviewer-new.md`/`extractor-new.md` in this
folder are **not** live until pushed into the actual n8n workflow, either by hand (n8n UI,
paste the updated prompt into the relevant Code node's `request`/`reviewRequest` object) or
via the n8n REST API (`PUT /api/v1/workflows/yiozu981GRE6pztk` with the full `nodes` array,
changing only the target node's `parameters.jsCode`). Always fetch the live workflow first
and diff against these files before patching — the live version can drift from what's
checked in here if someone edits it directly in the n8n UI.

An n8n personal API key scoped to Workflow+Execution read/write only (not `All`) is enough
to do this. Keep it in a local `.env` (gitignored), never commit it.
