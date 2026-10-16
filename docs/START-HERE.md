# GoodIdea: start here

## Current testing decision — saved October 16, 2026

Gera chose this approach for now: run the test website on the Mac Pro and use the existing live backend while improving the site's look and layout. Reuse the current backend; a separate backend environment is deferred until work changes how data is stored or processed.

- The test website stays private on the Mac Pro. The public website stays at https://idea.why57.com.
- Manual testing may use the existing Supabase login/database/storage, n8n workflows and ingestion API, with a dedicated test account where available.
- Saves and deletes affect the real app. Uploads, messages or AI workflow/provider requests have their real effects and normal costs. A test account does not isolate shared workflows or database structure.
- Keep the existing synthetic mock preview for automated agent checks and quick layout work. Automated checks must not run against live services by default.
- Before changing backend behavior, database structure, shared workflows or access rules, prepare separate test data/services and a scoped task. This decision does not authorize production backend code/schema/access changes.
- Store real connection values only in ignored local environment files or an existing secret store; never in GitHub or Paperclip. Use browser-safe Supabase keys only, never service-role keys.

**Saved decision, not a connection claim:** the currently running preview is still synthetic mock mode. A live-connected local mode, credentials and API proxy/routing have not been installed or tested. Next work is [connect the Mac Pro test website to the existing backend](https://command.why57.com/AIW/issues/AIW-509). Keep both modes clearly labelled; do not silently switch the running mock preview.

## Current handoff

Owner: Gera. Task system: Paperclip, Good Idea project. Start with [Prove the development, staging and production workflow](https://command.why57.com/AIW/issues/AIW-504#document-start-here).

The frontend source search is finished. Use `gera3d/captains-log-v5`, branch `Ideahub`; the verified starting commit is `b3e12c42f162a8b11cc06a48e7074c1456739e10`. GitHub's `main` branch is older. Mac Pro checkout: `/Users/gerayeremin/Documents/GoodIdea`. Initial setup work is on [`staging/mac-pro-workflow`](https://github.com/gera3d/captains-log-v5/tree/staging/mac-pro-workflow), a feature branch based on that commit. Use that branch to try this setup until its pull request is merged into `Ideahub`. Do not silently change the default branch or treat this feature branch as a permanent environment branch.

Initial checks: `npm ci --no-audit --no-fund` and `npm run build` passed on the Mac Pro with placeholder loopback Supabase settings. That proves frontend compilation; it does not test the backend or establish production readiness. Dependencies are installed in `client`.

## Pick up work without repeating discovery

| Work | Paperclip task | Current responsibility |
| --- | --- | --- |
| Private mock preview | [Build the Mac Pro preview](https://command.why57.com/AIW/issues/AIW-506) | Codex implementation helper under coordinator |
| Independent verification | [Verify preview isolation](https://command.why57.com/AIW/issues/AIW-507) | Separate Codex verification helper |
| Shared agent instructions | [Prepare the handoff](https://command.why57.com/AIW/issues/AIW-508) | Coordinator |

Read each task's current status before taking over. These are coordinator-tracked implementation subtasks, not autonomous Paperclip-agent runs or native review verdicts. Claim/record the next bounded change in Paperclip, then use an isolated feature branch/worktree. Do not duplicate an agent's active work.

## Private development and staging preview

First milestone: **mock preview**, with browser-local synthetic data and local mock API/AI responses. It does not run the real ingestion server, Supabase or n8n. The staging build and independent browser smoke checks on both the development server and built preview passed on October 16, 2026. The tested flow captured a synthetic text idea, produced a deterministic mock result and preserved it after reload, with zero outbound request attempts and zero browser exceptions. This does not exercise a real backend.

From `client`:

```sh
npm ci --no-audit --no-fund
npm run dev:staging
# Open http://127.0.0.1:5176
```

The built preview is currently running privately at http://127.0.0.1:5176 on the Mac Pro. To start it again after stopping the existing server:

```sh
npm run build:staging
npm run preview:staging
# Open http://127.0.0.1:5176
```

To repeat the browser smoke check while the staging server is running:

```sh
npm run check:staging
```

The check uses the existing Playwright dependency. If its Chromium executable is unavailable, provide an installed compatible browser with `PLAYWRIGHT_CHROMIUM_EXECUTABLE`; do not infer a pass from a browser launch failure. It blocks outbound requests before transmission and reports any attempt as a test failure. Its screenshot is local-only in `client/artifacts/mock-staging.png` (ignored by Git).

Use one server at a time; stop the foreground server with Ctrl-C. The implementation must bind to loopback and fail rather than silently pick a different port or production endpoint. No production `.env` is required. Ordinary `npm run dev` is the legacy integration mode and currently lacks the complete same-origin API routing. It is not a tested live-connected local setup. The saved decision above permits a deliberately configured manual live-connected mode; keep its ignored environment file separate from the synthetic mock commands.

## Verified environment map

| Part | Current evidence |
| --- | --- |
| Live website | https://idea.why57.com; live HTML references the same JS/CSS filenames as the Mac Mini frontend. This coordinator did not independently compare the bytes. The supplied README separately reports a parity build on October 16. |
| Live frontend | Portainer `agent-homeserver`, host `10.0.0.60`; container `thoughts`, image `goodidea:ideahub`; host ports 3001/5175 to Nginx 80. Compiled files `/usr/share/nginx/html`. Image build copied `/app/client/dist`. |
| Ingestion/API | Same host, `storyapp-5`, image `storyapp_5-storyapp`, host 3005 to container 3000. Frontend Nginx proxies to `172.17.0.1:3005`. Editable TypeScript exists in container `/app/src`, with package/lock/Dockerfile/Compose files. Compose labels point to `/Users/gerayeremin/Projects/StoryApp_5/docker-compose.yml` on that host. No Git metadata/package repository field was found. Code has been inspected, not yet exported into this repository. |
| Database/login/storage | Production Supabase project `uobhsikllffnwvvpedui`, supplied by Gera and documented in README. No project data or live configuration changed here. |
| AI workflows | Production `n8n.why57.com`. Repository `n8n/idea-structure` contains historical artifacts; current production parity is unverified. |
| Mac Pro preview | Dedicated loopback port 5176; mock mode. Keep separate from unrelated `why57-staging` on 8057 and Paperclip on 3100. |

## Known preview limits

This preview is auto-signed in as a synthetic user; it does not test authentication. Audio upload/storage, real AI, Edge Functions and integration keys are disabled. Data is local to this browser origin, not a shared staging database. Hub creation has a pre-existing reference to undefined `initialSelectedIdeas` in `HubCreateModal`; it was not repaired or qualified in this setup. Record any feature repair as its own task.

## Backend work after the initial website pass

The immediate next task is AIW-509: configure and verify the Mac Pro website's manual connection to the existing backend. Do not replace the backend or build a separate one as the next step. Keep the real public website unchanged and preserve the mock preview for automated checks.

Separate API/auth/storage and synthetic test data become a later milestone when changing how information is stored or processed. The known API source and host locations above remain useful then. Historical migrations and n8n exports require validation before use; do not apply them wholesale to production.

## Working agreement for any agent

1. Read `AGENTS.md`, this file and the master task; inspect current Git changes. Claude Code also reads `CLAUDE.md`.
2. Work on one bounded task with explicit acceptance. Keep secrets out of code, logs and Paperclip. Report environment variable names, not values.
3. Run checks appropriate to the change. Record actual command/outcome, files/revision, limitations and next owner in Paperclip. Never present synthetic checks as production qualification.
4. Review changes through a PR against the current application baseline (`Ideahub` until Gera changes that policy). CI/builds should pin release artifacts. No automatic production deployment or credentials/permission changes.
5. Try the exact reviewed release privately. Gera's later release decision is required to promote to live; keep the previous release/config and account for migrations/side effects in rollback.

The accepted architecture plan is [Choose the development, staging and live workflow](https://command.why57.com/AIW/issues/AIW-496#document-start-here), authored by Iron Man with actual Fury/Ultron acceptance. That accepted plan remains historical architecture evidence. Gera's later testing decision above changes the immediate priority to a private test website using the existing backend; a separate backend environment is deferred. The current mock preview remains available and is not the live-connected setup. Paperclip speed work remains paused.
