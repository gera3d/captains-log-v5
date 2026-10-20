# Good Idea workflow lessons

Keep this short: record an observed problem, the change it led to, and evidence. Add a lesson when a task finishes or a repeated problem reveals something useful. Promote recurring lessons into AGENTS.md and the start guide; do not generate more repair tasks automatically.

| What happened | Rule applied now | Evidence |
| --- | --- | --- |
| A fresh welcome layout introduced a different palette and logo from the dashboard. | A layout redesign preserves the existing brand unless Gera asks for a rebrand. Inspect the rendered adjacent screen and compare logo, typography, surfaces and accents before visual acceptance. | Gera rejected the green/cream welcome; corrected9717a42 passed independent comparison and Gera approved it. |
| Similar repository names obscured the actual app. | Every task names the canonical source, baseline and exact input revision. | App is captains-log-v5 / Ideahub; setup snapshot 8f3d2c8. |
| A screenshot of the poor welcome screen could be mistaken for a target. | Label references as BEFORE, TARGET or inspiration. | Welcome task explicitly requests a fresh design, not a copy. |
| Mock and real-service previews were easy to confuse. | Keep distinct addresses and visible labels; automated tests use mock data. | Separate preview setup and isolation checks. |
| A saved configuration or prepared handoff was reported too much like a running result. | Record prepared, running, tested and accepted separately; recheck transient state. | Claude launch unverified; local live preview stopped October20, which says nothing about backend health. |
| Earlier native work showed that successful execution alone is not acceptance. | Complete inputs before activation; preserve author identity; original independent reviews; at most two correction rounds. | Accepted workflow plan retains Iron Man, Fury and Ultron history. |
| New Codex chats failed immediately because the account default model was unsupported. | Verify an actual execution step after creation; continue the same chat with the saved supported model preference. | Both chats performed tool calls after continuation with GPT-6.1; original failed turns remain in their history. |
| Parallel agents can duplicate edits and discovery. | One accountable task owner, separate worktrees, explicit files and handoff revision. | Welcome builder, independent preview reviewer, native source analyst have distinct scopes. |

For this trial, capture only useful new findings: time lost to missing inputs, overlapping ownership, failed tests, or confusing handoffs. Record the concrete prevention change and whether it has actually been tested. Do not call an untested idea a proven improvement. Speed research remains paused.
