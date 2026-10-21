# GoodIdea: current handoff

Start with [beta relaunch AIW-547](https://command.why57.com/AIW/issues/AIW-547), its [current work and next steps](https://command.why57.com/AIW/issues/AIW-547#document-current-work), and the [completed work archive](https://command.why57.com/AIW/issues/AIW-547#document-completed-archive). Paperclip holds current task ownership and acceptance. Read the latest task before using old status reports or restarting a preview.

## Source and active owners

Canonical source is `gera3d/captains-log-v5`, baseline `Ideahub`; `main` is older. The beta candidate worktree is `/Users/gerayeremin/Documents/GoodIdea-worktrees/beta-relaunch`, branch `feature/beta-relaunch`. Accepted input `7d9b977d119dd9d2ec32cd948a05c9d5789c8cf8` contains the voice-first Capture → Refine → Use in your tools story, output previews, dashboard branding and GoodIdea typography. The next frontend checkpoint adds the bounded fixes below; use its exact commit from the task evidence for final review.

- [AIW-556: homepage destinations](https://command.why57.com/AIW/issues/AIW-556) and [AIW-557: sign-in dialog](https://command.why57.com/AIW/issues/AIW-557), under542: sole source editor is Codex helper `beta_frontend_finish`. Footer/FAQ links get factual beta-access information; unsupported contact/terms offers are removed. Auth handlers and beta routing are preserved.
- [AIW-551: beta release with rollback](https://command.why57.com/AIW/issues/AIW-551): coordinator owns exact-source review, release decision, collector publication/verification, enrollment controls and production administration. Check its children558–560 for current executor/evidence. Helper checks are not native reviewer acceptance.

New design/release acceptance and live checks must be recorded distinctly from implementation. Invitations are deferred; Paperclip speed research stays paused. Use [WORKFLOW-LESSONS.md](WORKFLOW-LESSONS.md) and one accountable editor per deliverable.

## Production and next beta release are separate

Prior live frontend source is `18929f35ac3397812e9a4291f7cc68afd31e5cd5` at https://idea.why57.com. [AIW-545](https://command.why57.com/AIW/issues/AIW-545) records its actual image/container identities, exact assets and rollback. The beta candidate is a later release; preparation or a private preview is not deployment evidence. Consult551 for any subsequent approved promotion.

Production builds require explicit `VITE_SUPABASE_URL`, browser-safe `VITE_SUPABASE_ANON_KEY`, canonical `VITE_REDIRECT_URL` and verified `VITE_WORKFLOW_BASE_URL`. Keep values in private ignored configuration. Use ordinary production `npm run build`, with reviewed beta configuration from [BETA-RELAUNCH.md](BETA-RELAUNCH.md). Never publish mock/live-preview proxy settings. The legacy root Dockerfile does not preserve the production API proxy; use545 release/rollback evidence before rebuilding.

## Private previews and checks

[Beta preview](http://127.0.0.1:5193/?preview=homepage) is a transient private Mac Pro mock preview. Check its process before assuming it is running. [BETA-RELAUNCH.md](BETA-RELAUNCH.md) defines beta flags, offline fixture, build matrix and capture/check commands. [VISUAL-STORY.md](VISUAL-STORY.md) records accepted visual assets and output evidence. Automated checks intercept or mock external traffic and must not perform real authentication, recording, data writes or AI calls.

From `client`, `npm run dev:staging` / `build:staging` / `preview:staging` use synthetic browser-local data on strict loopback5176. `npm run check:staging` checks that isolated workflow. Mock mode does not qualify real auth, storage or AI.

Gera’s saved manual-testing decision allows a separate private Mac Pro website using the existing backend, with real effects/costs. `dev:live` / `build:live` / `preview:live` select that explicitly labelled mode on5177 using ignored `.env.live.local`; `check:live-config` uses disposable local stubs. Verify current preview status and read [AIW-509](https://command.why57.com/AIW/issues/AIW-509) before restarting it. Ordinary `npm run dev` is the legacy generic mode, not the tested live setup. No backend/schema/workflow/access changes are authorized by a frontend task.

## History and working agreement

The [archived full starting guide](archive/START-HERE-2026-10-20-before-relaunch.md) preserves setup history, environment map, manual-testing decision, historical checks and all evidence links. Its “current” sections are dated history, superseded by547 and the task handoff above. [AIW-504](https://command.why57.com/AIW/issues/AIW-504) and the accepted [architecture plan496](https://command.why57.com/AIW/issues/AIW-496#document-start-here) remain historical evidence.

Read `AGENTS.md`, this guide and the assigned task; inspect Git state and never reset another worker’s changes. Use an isolated task worktree and exact reviewed revision. Record real checks, limits and actor identity in Paperclip. Keep source review, independent acceptance, owner release decision and deployment separate. No automatic deployment, secret exposure, production migrations or permission changes. Preserve rollback and approved backend routing/configuration.
