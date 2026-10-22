# Add to idea and regeneration

Application candidate `fbac1f6a8c5938ddecc5d4339b0dc0f2b1eb6413` passed bounded independent synthetic review. Current work: [AIW-596](https://command.why57.com/AIW/issues/AIW-596), repair597, additive material598, independent review599. Read the current Paperclip handoff for the exact candidate and actual checks; this file is the behavioral/storage guide. Production promotion is separate.

## Intended use

Open one of your recorded ideas and choose **Add to idea**. Save additional text or a pasted transcript. Saving material does not invoke AI or replace an existing report. Then explicitly regenerate the idea from all saved material. Unsaved draft text is not an input to generation. Existing product specs do not automatically refresh when material is added or a report changes.

The original material and saved additions are shown separately. Addition times are client timestamps. New additions do not pin, archive, promote, rename or create another idea. Original recording/storage and unrelated copies are unchanged. Ambient API `idea_` records and other owners' notes do not gain append permissions through this feature.

## Persistence and conflicts

The current implementation uses the existing `voice_notes.transcript` TEXT column. A strict versioned `goodidea_context` envelope preserves exact nullable `originalRaw`, stable-ID typed/time-stamped additions, and equal `data`/`text`/`transcript` projections of complete combined readable input. Existing plain and legacy wrapped originals remain readable; unsupported marked envelopes fail closed. The feature does not edit/remove previous additions. External writers can still replace this column; this is not a server-enforced immutable journal.

General conditional saves use Supabase's existing GraphQL API with current user authentication, body-carried values and `atMost:1`. Explicit owner/id and exact previous source conditions prevent overwriting concurrent changes. Report updates also compare the previous report. NULL and empty text remain different. A write is confirmed only by an exact one-row receipt. Ambiguous responses require readback/reconciliation; a retry must preserve the same addition ID rather than append twice. No unsafe read-then-blind-write fallback. Long text must not be placed in equality-filter URLs or silently truncated.

Opening the panel performs authenticated read-only capability introspection; it does not save material or generate anything. A missing/unreadable interface leaves saving unavailable. No migration or new privileges are installed by this feature. 

## Generation failure and recovery

HTTP failures and malformed workflow responses must become concise safe messages; raw provider/proxy HTML never belongs in the HUD. Workflow502 before a valid result must not replace the existing report. Regeneration uses the complete saved combined material, not envelope metadata or a threefold copy. Appending or changing the report while generation runs must stop a stale result overwriting the newer state. A save-only retry must not invoke AI again. An ambiguous persistence result is not proof that no write occurred.

Original owner report: n8n.why57.com returned Cloudflare502 during regeneration Oct22 2026 15:59:45UTC. Later health/readiness GETs returned200, but those do not prove the workflow succeeded or explain the earlier failure. Execution-log access and actual workflow qualification are tracked separately in597.

## Access and integration limits

Read-only live catalog inspection found an existing public SELECT policy and anonSELECT grant on voice_notes. Strict client owner filters do not make stored notes private. [AIW-600](https://command.why57.com/AIW/issues/AIW-600) tracks a separately reviewed access correction; no RLS/auth changes are included here.

Legacy browser readers using data/text/transcript projections can obtain combined text. A historical recovered API synthesize route passes raw transcript strings directly to AI; it needs an explicit validated decoder before claiming complete API/harness parity. Live backend version/mirror behavior remains unqualified. Do not publish claims of universal compatibility, complete deletion, original audio erasure, private database access, or successful real AI based on synthetic checks.

## Verification rules

Use invented fixtures and blocked production for automated tests. Qualify normal/NULL/legacy/large inputs, strict receipts, concurrent append/regeneration, failed/malformed/ambiguous responses, explicit retries without duplicate writes/AI, reload, account/route changes, mobile and keyboard behavior. A signed-in read-only interface check is distinct from a real write or AI execution. Keep source, independent report and owner acceptance identities separate.

## Exact review and remaining qualification

Independent AIW-599 review preserved initial failures: rapid double-clicks issued two AI requests, and invalid direct helper snapshots could construct incomplete mutation predicates. The reviewed successor uses synchronous request locks and rejects invalid snapshots before network access. Fourteen invalid-input calls then made zero requests; detail/library double-click each produced one AI request and one synthetic save. Save-only report/spec retries did not repeat AI. Append/reload, strict receipts, ambiguous response reconciliation, concurrent changes, account/route changes and complete saved generation input passed isolated fixture checks. Both staging and placeholder-configured live builds passed; affected controls were checked at1440/818/390/320.

Capability portability remains partial: reflected field names are checked, but not every nested filter operator. The actual deployment's equality/NULL operators were verified read-only. A changed/incompatible schema must reject the operation; there is no predicate-dropping fallback. This review did not exercise real persistence, RLS writes, provider generation or every upper size/count boundary. The original upstream502 and n8n account recovery remain open under597/601. Owner acceptance and production release are separate.

Storage limits are512KiB original/combined input,64KiB per addition,100 additions and2MiB envelope. Workflow input is512KiB, request2MiB and output2MiB; document/report limit2MiB, GraphQL body12MiB. Oversized data is rejected rather than truncated. Workflow timeout180s warns that remote work may continue; save timeout30s requires reconciliation when the outcome is uncertain. No automatic generation retry.
