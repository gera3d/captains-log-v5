# GoodIdea agent entry point

Read `docs/START-HERE.md` before changing this project. It is the shared runbook for Codex, Claude Code, and other agents; Paperclip is the source of task ownership and completion evidence.

- Canonical repository: `gera3d/captains-log-v5`; current application baseline is `Ideahub`, not the older `main` branch. Fetch/check current state before starting. Never reset or overwrite another agent's changes.
- Work in a task branch/worktree based on the current accepted application baseline. The initial Mac Pro setup branch is `staging/mac-pro-workflow`; it is not a permanent deployment branch.
- Private staging belongs on the Mac Pro. Use the explicit mock staging commands in the runbook. Ordinary `npm run dev` with a live `.env` is not isolated staging.
- Do not put production credentials, user data, Supabase project access, n8n webhooks or paid model calls into preview tests. Never put a service-role key in the browser. Ignore environment files; do not print their values.
- Keep each task's scope, current owner, changed files, checks, limitations and next step in its linked Paperclip task. Use the connected person's normal supported interface; do not impersonate a Paperclip agent or fabricate reviews.
- A helper's work is implementation/verification evidence, not native Fury/Ultron acceptance. Preserve actual author/reviewer identity.
- Do not deploy to production, change DNS/access, apply production migrations, or publish workflows as part of a staging task. Promote only the exact reviewed release after Gera's release decision.
- Historical migrations and workflow exports are not verified production snapshots. Keep synthetic preview, isolated backend qualification and production readiness distinct.
- Paperclip speed work remains paused; this project does not resume it.

If this checkout has no runnable staging commands yet, consult the master task for current implementation progress instead of falling back to production services.
