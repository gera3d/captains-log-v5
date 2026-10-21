# Dashboard safety checkpoint

The private hierarchy candidate separates original Captures, developed Ideas and independently Featured notes. Earlier flat-library screenshots were superseded. Prototype `8b8c584` records the first hierarchy; final safety corrections and exact independent review belong in AIW-561/565. No owner design acceptance or deployment is implied.

Current task: [AIW-561](https://command.why57.com/AIW/issues/AIW-561). Capture and library work is [AIW-563](https://command.why57.com/AIW/issues/AIW-563); record management is [AIW-564](https://command.why57.com/AIW/issues/AIW-564). [AIW-562](https://command.why57.com/AIW/issues/AIW-562#document-archive-delete-contract) holds the verified existing-operation contract. [AIW-565](https://command.why57.com/AIW/issues/AIW-565) owns independent review. These are private frontend preparation and verification, not a deployment or backend acceptance.

## Product flow

The workspace opens directly without a blocking dialog. Record idea opens voice controls without starting the microphone. A browser-local welcome flag never blocks returning users or changes capture method. Nothing starts the microphone until the person activates the recorder. Text is an explicit secondary choice. An empty library gives inline guidance.

A quiet navigation rail on desktop and an accessible view selector on phones lead to Workspace, Captures, Ideas, Featured and Archived. Workspace has a bounded Featured shelf, compact recent captures and nonfeatured recent ideas; it does not duplicate the entire library. Captures retain original notes, Ideas have actual developed content, and Featured is an explicit independent flag. A raw thought can be featured without AI. Existing marks are preserved without inventing curation provenance. Generation never sets a new featured flag; new voice recordings explicitly save false, text ingestion uses the existing backend false default, and regeneration retains stored flags. Open, Feature/Remove featured, Archive/Restore and Delete each describe a separate action. The existing persona and integrations controls remain available. Placeholder Facebook/Twitter links are removed.

## Existing-operation boundaries

The library reads only records with the exact signed-in user ID; ambient records must also identify that user. Realtime inserts and updates are checked against the same account. Legacy unknown-owner records and other people's records do not become "Your ideas". Public/shared detail reads remain available; generation and PRD controls are closed unless the detail is an owned UUID voice note. Client gates do not replace backend authorization.

Feature, Archive and Restore operate on exact owned UUID note rows only when the current-account idea list is complete and no matching account-visible mirror is returned. This conservative guard does not prove global absence of copies: another account’s or legacy ownerless ambient copies may remain outside the list. Known account-visible mirrors, incomplete metadata and ambient management stay closed pending backend566; these frontend controls do not coordinate other stores. Feature requires the exact returned ID and boolean flag, and does not imply development. Archive and Restore use both `id` and `user_id` predicates. The returned row must match the requested ID, boolean `archived` and exact `status` before local success. Pending blocks duplicate requests; a failure is reported with a retry path.

Delete is a bounded **Delete note** operation, not complete idea erasure. It is offered only for an owned UUID with no known account-visible ambient mirror and a complete current-account API list response. This means only that no owned mirror was seen; it is not evidence that the note is globally standalone. The permitted removal is the exact owned `voice_notes` row and its inline fields; other-account and ownerless legacy copies may remain. Truncated, failed or malformed metadata leaves Delete unavailable. Known mirrored and ambient ideas remain readable, with explicit management limitations. A newly captured UUID remains uncertain until Refresh qualifies it.

The confirmation names the target, starts focus on Cancel, and states that deletion removes the note, inline transcript and report permanently while retaining stored audio and other copies. Cancel/Escape perform zero writes. Deletion uses both `id` and `user_id`, requires exactly one matching returned row, and retains a retryable dialog on denial, missing/mismatched result or transport failure. A linked `saved_ideas` foreign-key conflict is reported without deleting linked records. No Undo or Trash is implied.

Complete cross-store deletion and coordinated ambient archive need separate backend work under [AIW-566](https://command.why57.com/AIW/issues/AIW-566). No proposed backend route is invoked by this candidate; AIW-564 is not fully complete while those operations remain unavailable.

## Private mock preview and checks

From `client`:

```sh
npm run build:staging
./node_modules/.bin/vite --mode staging --host 127.0.0.1 --port 5194 --strictPort
DASHBOARD_EVIDENCE_DIR=/absolute/private/evidence npm run check:dashboard
```

Use a free port and do not stop shared previews. The dashboard checker starts its own loopback-only Vite server and intercepts external requests and WebSockets. It uses synthetic data and injected adapter failures; it never calls a real microphone, authentication provider, API, AI provider or database. It checks new/returning fresh-origin states, all four target widths (1440/818/390/320 at1x to avoid a verified local2x1440 compositor tiling bug), owned and unsupported record types, confirmation cancellation, success, failure, pending behavior, ownership predicates and retry paths. It also checks manual Featured failures/pending/reload, generation flag preservation, confirmed regeneration persistence, developed-only returning accounts and synthetic recording lifecycle/transport failures. The focused `DASHBOARD_SCOPE_ONLY=true` checker uses the real account-filtered mock-list semantics to verify hidden foreign/ownerless mirrors remain after note-row removal, retained-copy confirmation wording, zero-write cancellation and closed known-mirror/incomplete guards. This is UI/adapter verification, not real backend qualification.

Voice controls use explicit keyboard-accessible Start/Stop. Close, Escape and Text switching are blocked while preparing, recording or saving; unmount stops recorder/media tracks and suppresses subsequent save steps. Upload/auth/insert transport rejections enter a recoverable error that unlocks controls. These paths are checked with synthetic streams and MediaRecorder only. No real microphone is exercised.

The ordinary staging preview seeds owned UUID voice/text metadata examples, independent raw/developed featured examples and an explicitly unsupported connected-tool example. Synthetic voice duration metadata has no playable audio URL; no fake recording is served. Synthetic data uses `goodidea.mock-staging.v4` in browser localStorage; remove only that key and reload to reset the mock fixture. This does not change production data or account settings.

Production builds remain the existing explicit configuration path. The beta waiting-list routes, signup restrictions, authentication providers and backend configuration are unchanged. Production release/rollback remains with [AIW-551](https://command.why57.com/AIW/issues/AIW-551) and [AIW-545](https://command.why57.com/AIW/issues/AIW-545), subject to owner approval of an exact reviewed release.
