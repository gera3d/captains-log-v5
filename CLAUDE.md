# GoodIdea / Claude Code

Read `AGENTS.md`, then `docs/START-HERE.md`. Follow the current task and linked evidence in Paperclip before editing.

The application baseline is the `Ideahub` branch of `gera3d/captains-log-v5`; `main` is older. The test website runs privately on the Mac Pro. Gera's saved decision is to use the existing live backend for manual look/layout testing, while keeping synthetic mock mode for automated checks. Use the explicit dev:live / build:live / preview:live commands and check the actual connection-task evidence before claiming working sign-in or end-to-end AI. Read the runbook for real-data effects, local secret handling and the later separate-backend milestone.

Continue an existing scoped task or claim one in Paperclip. Do not repeat source discovery, invent review acceptance, or change another agent's files without coordinating.

For the initial handoff session, read `docs/CLAUDE-START.md`. The first queued feature task is the welcome-screen redesign (AIW-510). Its screenshot is a before example to replace. Project `.mcp.json` supplies the Paperclip endpoint; complete normal trust/OAuth as the user, without copying credentials.
