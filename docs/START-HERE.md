# GoodIdea: current handoff

Start with [dashboard usability AIW-561](https://command.why57.com/AIW/issues/AIW-561) and its current-work document for current ownership, evidence and the next owner decision. The launched homepage and beta release history remain under [AIW-547](https://command.why57.com/AIW/issues/AIW-547) and [release/rollback AIW-551](https://command.why57.com/AIW/issues/AIW-551). Paperclip holds task ownership and acceptance; read the current task before using old reports or restarting a preview.

## Source and active owners

Canonical source is `gera3d/captains-log-v5`, baseline `Ideahub`; `main` is older. The private dashboard candidate is `/Users/gerayeremin/Documents/GoodIdea-worktrees/dashboard-usability`, branch `feature/dashboard-usability`, based on accepted `Ideahub` merge `2a9280ed1689665ebc0389c2a631c5e435e11cfb`. The current restoration candidate and exact independent review belong in AIW-561/568 evidence; AIW-565 preserves the earlier rejected-layout safety review.

The original-first application candidate `e610bb5bde5a0e6dad7cae4965be6ca8d8385b26` passed [independent source, synthetic flow and render review](https://command.why57.com/AIW/issues/AIW-568#document-original-first-independent-review). A later documentation-only handoff commit does not imply another application test run. Read the [morning handoff](https://command.why57.com/AIW/issues/AIW-561#document-morning-handoff-20261021) for the source backup, comparison images and actual current task state. Owner visual acceptance and production release remain pending.

- [AIW-563: capture and library](https://command.why57.com/AIW/issues/AIW-563) and [AIW-564: Archive, Restore and Delete](https://command.why57.com/AIW/issues/AIW-564) share one accountable frontend source editor. The October21 original-first restoration puts the large voice microphone inline beside a compact idea overview, with rich searchable notes and Captures/Ideas/Featured/Archived filters below. Recording starts only on explicit microphone activation. [AIW-567](https://command.why57.com/AIW/issues/AIW-567) owns the original audit; [AIW-568](https://command.why57.com/AIW/issues/AIW-568) reviews the new exact revision. The prior rail/desk design is historical and was not accepted by the owner. [DASHBOARD-USABILITY.md](DASHBOARD-USABILITY.md) describes the supported operations, synthetic fixtures and private test commands.
- [AIW-562: existing-operation contract](https://command.why57.com/AIW/issues/AIW-562) records verified backend boundaries; [AIW-566](https://command.why57.com/AIW/issues/AIW-566) prepares separate cross-store management work. Bounded note-row deletion is not complete idea erasure. No production backend/schema/workflow changes are authorized by the frontend task.
- [AIW-568: original-first independent review](https://command.why57.com/AIW/issues/AIW-568) checks the exact restoration candidate; [AIW-565](https://command.why57.com/AIW/issues/AIW-565) remains historical. Helper checks are implementation evidence, not native Fury/Ultron acceptance. The coordinator owns Paperclip master state, release decisions and production administration.

The prior beta candidate `/Users/gerayeremin/Documents/GoodIdea-worktrees/beta-relaunch` and homepage work [AIW-556](https://command.why57.com/AIW/issues/AIW-556)/[AIW-557](https://command.why57.com/AIW/issues/AIW-557) remain historical release inputs under551. Preserve551 and545 release/rollback evidence before any later promotion. Invitations are deferred; Paperclip speed research stays paused. Use [WORKFLOW-LESSONS.md](WORKFLOW-LESSONS.md) and one editor per deliverable.

## Production and private candidates are separate

Prior live frontend source is `18929f35ac3397812e9a4291f7cc68afd31e5cd5` at https://idea.why57.com. [AIW-545](https://command.why57.com/AIW/issues/AIW-545) records its actual image/container identities, exact assets and rollback. That source is historical; consult551 for subsequent approved homepage promotion. Dashboard preparation or a private preview is not deployment evidence.

Production builds require explicit `VITE_SUPABASE_URL`, browser-safe `VITE_SUPABASE_ANON_KEY`, canonical `VITE_REDIRECT_URL` and verified `VITE_WORKFLOW_BASE_URL`. Keep values in private ignored configuration. Use ordinary production `npm run build`, with reviewed beta configuration from [BETA-RELAUNCH.md](BETA-RELAUNCH.md). Never publish mock/live-preview proxy settings. The legacy root Dockerfile does not preserve the production API proxy; use545 release/rollback evidence before rebuilding.

## Private previews and checks

[Beta preview](http://127.0.0.1:5193/?preview=homepage) is a transient private Mac Pro mock preview. Check its process before assuming it is running. [BETA-RELAUNCH.md](BETA-RELAUNCH.md) defines beta flags, offline fixture, build matrix and capture/check commands. [VISUAL-STORY.md](VISUAL-STORY.md) records accepted visual assets and output evidence. Automated checks intercept or mock external traffic and must not perform real authentication, recording, data writes or AI calls.

From `client`, `npm run dev:staging` / `build:staging` / `preview:staging` use synthetic browser-local data on strict loopback5176. `npm run check:staging` checks that isolated workflow. Mock mode does not qualify real auth, storage or AI.

Gera’s saved manual-testing decision allows a separate private Mac Pro website using the existing backend, with real effects/costs. `dev:live` / `build:live` / `preview:live` select that explicitly labelled mode on5177 using ignored `.env.live.local`; `check:live-config` uses disposable local stubs. Verify current preview status and read [AIW-509](https://command.why57.com/AIW/issues/AIW-509) before restarting it. Ordinary `npm run dev` is the legacy generic mode, not the tested live setup. No backend/schema/workflow/access changes are authorized by a frontend task.

## History and working agreement

The [archived full starting guide](archive/START-HERE-2026-10-20-before-relaunch.md) preserves setup history, environment map, manual-testing decision, historical checks and all evidence links. Its “current” sections are dated history, superseded by547 and the task handoff above. [AIW-504](https://command.why57.com/AIW/issues/AIW-504) and the accepted [architecture plan496](https://command.why57.com/AIW/issues/AIW-496#document-start-here) remain historical evidence.

Read `AGENTS.md`, this guide and the assigned task; inspect Git state and never reset another worker’s changes. Use an isolated task worktree and exact reviewed revision. Record real checks, limits and actor identity in Paperclip. Keep source review, independent acceptance, owner release decision and deployment separate. No automatic deployment, secret exposure, production migrations or permission changes. Preserve rollback and approved backend routing/configuration.
