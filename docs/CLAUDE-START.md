# Good Idea — Claude Code starter prompt

Copy the text below into a new local Claude Code session for this project. This is the handoff brief; Codex has not started the welcome redesign.

---

You are taking over the existing Good Idea website on this Mac Pro. Continue the project already set up; keep discovery brief and use the recorded evidence.

Project folder: /Users/gerayeremin/Documents/GoodIdea
Read CLAUDE.md, AGENTS.md and docs/START-HERE.md first. Inspect Git status and current branch before changing files. The repository is gera3d/captains-log-v5. Ideahub is the application baseline; main is older. The current setup lives on staging/mac-pro-workflow in an existing draft PR, https://github.com/gera3d/captains-log-v5/pull/1. Preserve those changes and any concurrent edits. Use a scoped feature branch/worktree based on the setup, not the older main branch.

Paperclip is the task record. Master: https://command.why57.com/AIW/issues/AIW-504#document-start-here
Your first task: https://command.why57.com/AIW/issues/AIW-510 — Redesign Good Idea’s welcome screen.
The project .mcp.json provides the Paperclip connection endpoint without credentials. Use the normal connection/trust/authentication flow and verify the connected company/person before task changes. If authentication is needed, ask Gera to complete that flow; do not copy another agent’s tokens or use private operator credentials. If temporarily unavailable, use this brief and report unsaved task updates honestly.

Gera says the current welcome screen “just sucks.” The screenshot is the bad BEFORE experience, never the target design to copy. The local image is client/artifacts/welcome-before.png; view it if available. The relevant current UI is onboardingModal in client/src/App.jsx, containing “Welcome aboard!”, Record/View/Share, “GOT IT!” and Learn more. Focus on this first-run welcome, not a wholesale marketing-page redesign.

Create a fresh, polished welcome experience that makes the first useful action obvious. Use the existing brand and client/design-system/goodidea guidance with judgment. Favor concise copy, strong hierarchy and comfortable spacing over a generic full-screen tutorial. Offer a clear way to begin recording or typing an idea, and make dismissal easy. Give Learn more a useful destination or remove it. Keep mobile layout, keyboard/focus/Escape behavior and screen-reader labels sound. Preserve first-run dismissal persistence so returning users are not repeatedly blocked. Do not invent product capabilities.

Start by briefly stating the main usability problems and your chosen design direction, then implement this subtask. Track the actual work and evidence on that task. Use additional subtasks only for concrete independent work, not repair/queue busywork.

Testing setup:
- http://127.0.0.1:5176 is the synthetic mock preview: use it for automated UI and first-run/returning-user checks. npm run dev:staging, npm run build:staging, npm run preview:staging, npm run check:staging are in client/package.json. One server at a time per port; check existing listeners before starting another.
- http://127.0.0.1:5177 is a separate private website using the EXISTING LIVE BACKEND. Saves/deletes/uploads/AI calls have real effects and costs. Do not run automated mutating tests there. Keep its red environment banner intact; it is not part of the welcome redesign.
- Do not replace the backend, apply migrations, change authentication/access/DNS/workflows, deploy or merge to production for this UI task. Real login/AI/storage flows have not been fully tested. Never print or commit .env.live.local values or service credentials. Existing public deployment is unchanged.

Finish with relevant build/browser checks, desktop and mobile before/after screenshots, first-run dismissal and returning-user behavior, a short change summary and honest limitations. Save local evidence under client/artifacts (ignored); record useful results in Paperclip. Keep actual implementation and independent/native review identities distinct; do not invent acceptance. Paperclip speed work remains paused.
