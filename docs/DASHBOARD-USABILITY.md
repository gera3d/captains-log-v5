# Dashboard safety checkpoint

The flat-library composition in this checkpoint has not received owner visual acceptance. The next design pass must distinguish raw Captures, developed Ideas and a deliberately curated Featured selection; preserve the safety/voice-first fixes while revising that hierarchy.

Current task: [AIW-561](https://command.why57.com/AIW/issues/AIW-561). Capture and library work is [AIW-563](https://command.why57.com/AIW/issues/AIW-563); record management is [AIW-564](https://command.why57.com/AIW/issues/AIW-564). [AIW-562](https://command.why57.com/AIW/issues/AIW-562#document-archive-delete-contract) holds the verified existing-operation contract. [AIW-565](https://command.why57.com/AIW/issues/AIW-565) owns independent review. These are private frontend preparation and verification, not a deployment or backend acceptance.

## Product flow

The workspace opens directly with Voice Memo selected. A browser-local welcome flag never blocks returning users or changes capture method. Nothing starts the microphone until the person activates the recorder. Text is an explicit secondary choice. An empty library gives inline guidance.

Capture sits beside one searchable library on desktop and above it on narrow screens. The duplicate Active Ideas gallery is removed. Active and Archived filters, Open, Archive/Restore and Delete each describe a separate action. The existing persona and integrations controls remain available. Placeholder Facebook/Twitter links are removed.

## Existing-operation boundaries

The library reads only records with the exact signed-in user ID; ambient records must also identify that user. Realtime inserts and updates are checked against the same account. Legacy unknown-owner records and other people's records do not become "Your ideas". Public/shared detail reads remain available; generation and PRD controls are closed unless the detail is an owned UUID voice note. Client gates do not replace backend authorization.

Archive and Restore apply only to owned UUID voice notes, using both `id` and `user_id` predicates. The returned row must match the requested ID, boolean `archived` and exact `status` before local success. Pending blocks duplicate requests; a failure is reported with a retry path.

Delete is a bounded **Delete note** operation, not complete idea erasure. It is offered only for an owned UUID with no known ambient mirror and a complete existing API list response. Truncated, failed or malformed metadata leaves Delete unavailable. Known mirrored and ambient ideas remain readable, with explicit management limitations. A newly captured UUID remains uncertain until Refresh qualifies it.

The confirmation names the target, starts focus on Cancel, and states that deletion removes the note, inline transcript and report permanently while retaining stored audio and other copies. Cancel/Escape perform zero writes. Deletion uses both `id` and `user_id`, requires exactly one matching returned row, and retains a retryable dialog on denial, missing/mismatched result or transport failure. A linked `saved_ideas` foreign-key conflict is reported without deleting linked records. No Undo or Trash is implied.

Complete cross-store deletion and coordinated ambient archive need separate backend work under [AIW-566](https://command.why57.com/AIW/issues/AIW-566). No proposed backend route is invoked by this candidate; AIW-564 is not fully complete while those operations remain unavailable.

## Private mock preview and checks

From `client`:

```sh
npm run build:staging
./node_modules/.bin/vite --mode staging --host 127.0.0.1 --port 5194 --strictPort
DASHBOARD_EVIDENCE_DIR=/absolute/private/evidence npm run check:dashboard
```

Use a free port and do not stop shared previews. The dashboard checker starts its own loopback-only Vite server and intercepts external requests and WebSockets. It uses synthetic data and injected adapter failures; it never calls a real microphone, authentication provider, API, AI provider or database. It checks new/returning fresh-origin states, all four target widths (1440/818/390/320), owned and unsupported record types, confirmation cancellation, success, failure, pending behavior, ownership predicates and retry paths. This is UI/adapter verification, not real backend qualification.

The ordinary staging preview seeds several owned UUID examples and an explicitly unsupported connected-tool example. Synthetic data uses `goodidea.mock-staging.v2` in browser localStorage; remove only that key and reload to reset the mock fixture. This does not change production data or account settings.

Production builds remain the existing explicit configuration path. The beta waiting-list routes, signup restrictions, authentication providers and backend configuration are unchanged. Production release/rollback remains with [AIW-551](https://command.why57.com/AIW/issues/AIW-551) and [AIW-545](https://command.why57.com/AIW/issues/AIW-545), subject to owner approval of an exact reviewed release.
