# GoodIdea: start here

## Next release candidate — beta waiting list (AIW-548)

The bounded frontend candidate is prepared on `feature/beta-relaunch` from reviewed `f1e8d45`, retaining the voice-first homepage. Read [BETA-RELAUNCH.md](BETA-RELAUNCH.md) for the explicit `VITE_BETA_MODE` / `VITE_BETA_WAITLIST_URL` contract, local fixture preview and offline verification. The verified official responder URL comes from AIW-549; exact-source review belongs to AIW-550 and publication to AIW-551. Invitations are deferred. This candidate is separate from the production release below.

Accepted hero/navigation work is separately committed at `80b1d62`. The authorized [AIW-555 visual story](VISUAL-STORY.md) builds on that checkpoint with Capture, Refine and Use in your tools, retaining actual product outputs and manual coding-tool handoff.

## Current production release — October 20, 2026

The approved welcome screen, dashboard-aligned homepage, visible report/spec/build examples and coding-tool brand row are live at https://idea.why57.com. The exact deployed frontend source is `18929f35ac3397812e9a4291f7cc68afd31e5cd5`; its production assets passed an independent rebuild and all 42 files were verified after deployment. The public page and sign-in/account-form entry were checked without submitting credentials or running AI.

The release replaced only the frontend through Portainer. Existing Nginx/API routing, ports, Supabase browser configuration, workflows and backend were preserved. Old hashed assets and a complete pre-release frontend image are retained for rollback. [Publish the reviewed website with rollback](https://command.why57.com/AIW/issues/AIW-545) holds the exact image/container identities, checks and rollback procedure.

Before new work, fetch `Ideahub` and verify it includes the deployed source above; `main` remains older. Read the current Paperclip master and task before assuming any preview server is still running. Local addresses and older status statements below are setup history that require a fresh health check.

**Future production builds need explicit settings:** `VITE_SUPABASE_URL`, browser-safe `VITE_SUPABASE_ANON_KEY`, canonical public `VITE_REDIRECT_URL` and verified `VITE_WORKFLOW_BASE_URL`. Keep values in ignored local configuration or an authorized secret store. Production uses ordinary `npm run build` with production mode, never `build:staging` or `build:live`. The workflow base is now required; leaving it unset disables workflow actions. Do not copy local preview proxy paths or loopback redirects into a public release.

**The legacy root Dockerfile is not the preserved production recipe.** It omits the live API proxy and contains an old redirect setting. This release used a snapshot of the running frontend plus the reviewed static files, preserving the actual server configuration. Use the release task evidence before any later rebuild or promotion.

## Current feature — homepage

Gera approved the corrected welcome appearance; independent checks of revision `9717a42fccdb77e573b644408c44c87bd29e088b` passed. Welcome design/testing tasks AIW-510 and AIW-536 are Done. The reviewed UI is integrated locally in the setup branch. This is not a production deployment or a default-branch merge.

The active task is [Align the whole public homepage with the dashboard](https://command.why57.com/AIW/issues/AIW-540). It covers the signed-out homepage from header/hero to footer, preserving the real dashboard’s logo, typography, colors and controls. Builder workspace: `/Users/gerayeremin/Documents/GoodIdea-worktrees/homepage`. Read the master’s [current owners and handoffs](https://command.why57.com/AIW/issues/AIW-504#document-parallel-work) before editing. The revised homepage candidate is built at `c9d2f388e131fa9b421e518593338111381fab4a` on `feature/homepage-dashboard-alignment`, backed up to GitHub. [Private signed-out preview](http://127.0.0.1:5192/?preview=homepage). The first homepage direction was rejected; this revision applied frontend-design and the locally found Voice Kit with actual owner samples. Technical checks and independent review are recorded under AIW-541; Gera’s design/copy decision is still pending. The approved welcome is not another open redesign.

## Current testing decision — saved October 16, 2026

Gera chose this approach for now: run the test website on the Mac Pro and use the existing live backend while improving the site's look and layout. Reuse the current backend; a separate backend environment is deferred until work changes how data is stored or processed.

- The test website stays private on the Mac Pro. The public website stays at https://idea.why57.com.
- Manual testing may use the existing Supabase login/database/storage, n8n workflows and ingestion API, with a dedicated test account where available.
- Saves and deletes affect the real app. Uploads, messages or AI workflow/provider requests have their real effects and normal costs. A test account does not isolate shared workflows or database structure.
- Keep the existing synthetic mock preview for automated agent checks and quick layout work. Automated checks must not run against live services by default.
- Before changing backend behavior, database structure, shared workflows or access rules, prepare separate test data/services and a scoped task. This decision does not authorize production backend code/schema/access changes.
- Store real connection values only in ignored local environment files or an existing secret store; never in GitHub or Paperclip. Use browser-safe Supabase keys only, never service-role keys.

**Last verified October 16:** the built real-backend website ran at http://127.0.0.1:5177 with a red LIVE BACKEND banner. **October 20 recheck:** that local preview is stopped; restoration is assigned to AIW-536. This is not evidence of a production-backend outage. Its API health request reached the existing server successfully. Supabase public auth settings responded; the workflow server passed a TLS reachability check without invoking a workflow. Independent local-stub checks passed for dev and built routing, required settings and privileged-key rejection. Real sign-in/return URLs, permissions, uploads and AI operations have not been exercised; those remain manual checks. The [connection task](https://command.why57.com/AIW/issues/AIW-509) records exact evidence. The sample-data preview remains on port 5176.

## Parallel work and lessons — October20

Gera chose to continue in Codex. Read [current owners and handoffs](https://command.why57.com/AIW/issues/AIW-504#document-parallel-work) before taking a task. Welcome builder/testing assignments AIW-510 and AIW-536 are completed. The homepage builder now owns AIW-540 in its own worktree. Native Iron Man’s source analysis AIW-537 has a separate review blocker; it does not block homepage UI work. The Claude handoff remains prepared history, not an active owner.

Apply [WORKFLOW-LESSONS.md](WORKFLOW-LESSONS.md): supply complete inputs before execution, one owner per deliverable, isolated edits, exact revision for review, actual test evidence and truthful completion states. Record one useful lesson when a task finishes; update shared instructions when it prevents a recurring problem.

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
| Existing-backend connection | [Connect the test website](https://command.why57.com/AIW/issues/AIW-509) | Implemented and checked; manual sign-in/feature tests remain |

Read each task's current status before taking over. These are coordinator-tracked implementation subtasks, not autonomous Paperclip-agent runs or native review verdicts. Claim/record the next bounded change in Paperclip, then use an isolated feature branch/worktree. Do not duplicate an agent's active work.

## Test website using the existing backend

This mode is for manual website testing with real services. It is separate from the mock preview and does not replace or deploy the public website.

The live-connected local preview was stopped at the October20 recheck. AIW-536 owns restoring it; read that task before starting a competing server. To start a development server after stopping any existing live-mode server, from `client`:

```sh
npm run dev:live
# Open http://127.0.0.1:5177
```

For the built website:

```sh
npm run build:live
npm run preview:live
# Open http://127.0.0.1:5177
```

Use one live-mode server at a time; stop its foreground process with Ctrl-C. Both modes bind only to loopback and use a strict port. The running built website uses `dist-live`, which is ignored by Git. The sample-data preview keeps port 5176 and its separate output/data.

The ignored, owner-readable-only `client/.env.live.local` holds the browser-safe Supabase connection plus explicit API/workflow settings. It was created on this Mac Pro from the public frontend's existing anon key, with its role and project checked; no server/service-role credential was copied. Another computer needs its own private environment file. Variable names:

- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`: existing login/database/storage service and a browser-safe publishable/anon key.
- `VITE_REDIRECT_URL`: this website's local address.
- `VITE_WORKFLOW_BASE_URL`: the local workflow proxy path.
- `LIVE_API_TARGET`, `LIVE_WORKFLOW_TARGET`: explicit existing API and workflow-server origins, used only by the local server proxy.

The local server forwards `/api/v1/...` to the existing API and `/__live/workflows/...` to the existing n8n webhook paths. Missing configuration fails startup. No production fallback is supplied silently. The red banner states that saves, deletes and AI calls use real services. Live mode starts signed out and uses a separate browser auth-storage key.

Run `npm run check:live-config` to repeat configuration, labelling and proxy checks against disposable local stub servers; this command never needs real credentials or production requests.

Verification must distinguish connection checks from app actions. API health and public login settings can be checked without reading idea records or running a workflow. Route/method forwarding is tested with disposable local stub servers. Do not run the synthetic mock smoke check against this address. Real sign-in and changes to records are manual tests; OAuth/magic-link return URLs may require an existing matching allowlist entry. No production callback/CORS/access settings are changed by this setup.

## Private development and staging preview

First milestone: **mock preview**, with browser-local synthetic data and local mock API/AI responses. It does not run the real ingestion server, Supabase or n8n. The staging build and independent browser smoke checks on both the development server and built preview passed on October 16, 2026. The tested flow captured a synthetic text idea, produced a deterministic mock result and preserved it after reload, with zero outbound request attempts and zero browser exceptions. This does not exercise a real backend.

From `client`:

```sh
npm ci --no-audit --no-fund
npm run dev:staging
# Open http://127.0.0.1:5176
```

The mock preview responded at http://127.0.0.1:5176 on the Mac Pro at the October20 recheck. To start it again after stopping the existing server:

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

The current connection task is AIW-509: configure and verify the Mac Pro website's manual connection to the existing backend. Do not replace the backend or build a separate one as the next step. Keep the real public website unchanged and preserve the mock preview for automated checks.

Separate API/auth/storage and synthetic test data become a later milestone when changing how information is stored or processed. The known API source and host locations above remain useful then. Historical migrations and n8n exports require validation before use; do not apply them wholesale to production.

## Working agreement for any agent

1. Read `AGENTS.md`, this file and the master task; inspect current Git changes. Claude Code also reads `CLAUDE.md`.
2. Work on one bounded task with explicit acceptance. Keep secrets out of code, logs and Paperclip. Report environment variable names, not values.
3. Run checks appropriate to the change. Record actual command/outcome, files/revision, limitations and next owner in Paperclip. Never present synthetic checks as production qualification.
4. Review changes through a PR against the current application baseline (`Ideahub` until Gera changes that policy). CI/builds should pin release artifacts. No automatic production deployment or credentials/permission changes.
5. Try the exact reviewed release privately. Gera's later release decision is required to promote to live; keep the previous release/config and account for migrations/side effects in rollback.

The accepted architecture plan is [Choose the development, staging and live workflow](https://command.why57.com/AIW/issues/AIW-496#document-start-here), authored by Iron Man with actual Fury/Ultron acceptance. That accepted plan remains historical architecture evidence. Gera's later testing decision above changes the immediate priority to a private test website using the existing backend; a separate backend environment is deferred. The current mock preview remains available and is not the live-connected setup. Paperclip speed work remains paused.
