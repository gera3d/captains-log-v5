# Markdown persona and research upgrade

Scope: existing Idea Structure workflow yiozu981GRE6pztk. Create and Regenerate retain the original transcript as input. Frontend unchanged. No new idea records created during testing.

## Implemented

- Standard Markdown only for new reports: bold observed-data callouts, proposed-persona blockquote, labeled persona fields, ordered product steps, keyword intent groups, visible Blue team / Red team headings, separators and dated source links.
- New generations contain no images. Existing v9 image retrieval remains unchanged so prior reports keep working.
- Rolling 24-month Brave date range and US English search settings; publication metadata checked after retrieval. Old publication dates override recent search-index dates. Unknown publication dates cannot support trend claims. Copyright and last-modified dates do not establish publication.
- Proposed behavioral persona with job, trigger, workaround, friction, objection and design consequence. No invented demographic measurements or testimonials.
- Six to eight proposed natural US keywords across problem, solution and comparison intent. Keyword volumes explicitly unavailable; provider absence never renders zero or model-estimated numbers.
- Current measured data in callouts; projections rejected. Reviewer checks metric scope, population, dates and source passages. A draft cannot silently ignore a large retrieved evidence set and publish a one-source argument.
- Source transcript and generation history remain archived. Regeneration reuses research within its TTL but always writes and reviews a fresh report.

## Validation

- 17 actual-graph mocked workflow scenarios cover input rejection, call budgets, full research, fresh regeneration, original-based archives, history retention, malformed model output, unavailable research/pages/cache, citation integrity and atomic editorial patches.
- Additional checks cover rolling date boundaries, original publication versus modification, unknown/future dates, exact metric values, forecast rejection, forbidden keyword-volume fields, no new figures, unchanged old-figure nodes and syntax of every Code node.
- Published export is compared against all expected node parameters and connections.
- Initial test execution 218 completed in 106 seconds. Review caught metric population/date problems. Readability and source selection were subsequently tightened.
- Production execution 219 completed and saved in 68.5 seconds. Manual review found one-source underuse and a projected statistic; these were corrected with explicit validation and reviewer requirements in v10.2.
- Executions 220 and 221 generated materially better revisions but returned validation errors to the app because reviewer issue metadata varied in shape. v10.4 normalizes issue descriptions while still validating the entire corrected report and every citation. Captured-response regression tests now pass both cases, including three/four-source research, observed metrics, and two explicit arguments per team. These failed saves left the preceding app report intact.
- Final published version: `d59abb65-1153-4e50-94dd-8ed5a88ef5e4`, label `v10.4 · Robust editorial metadata, verified Markdown reports`. Exported parameters and connections match the tested local workflow.
- Final production execution **222** saved successfully through the app in **67.57 seconds**: 1,045 words, three cited sources, two observed metrics, one persona, eight US keyword hypotheses, zero images. Model cost **$0.105591321** with cached research (three model calls, no new searches/page requests). History saved successfully. This is an observed run, not a latency or price guarantee.
- Inspected the saved app DOM and screenshot: three Markdown blockquotes, one ordered walkthrough, visible Blue team / Red team headings, dated links, no duplicate list numbering, and no image elements. Original transcript still exactly matches the captured source; the original 1:05 audio remains present.
- Saved result: https://idea.why57.com/idea/d755aa0a-d775-4b42-bfec-32d85a15b2d9 . Execution artifact: `app-execution-222.json`; report: `app-final.md`.

## Remaining dependency

No Google Ads Keyword Planner, DataForSEO, Semrush or other measured keyword-volume credential is present in n8n. No callable Infisical connection or local Infisical CLI was available. Real US monthly search volumes require a provider connection; this version supplies transparent keyword hypotheses only. Google Ads historical metrics distinguish approximate 12-month average searches and monthly volumes by geography/language; search result counts are not a substitute.

## Limits

Full page reading and date metadata improve grounding but do not independently prove every publisher claim. Sampling and metric semantics still require the model review and human review of important decisions. A recent page may summarize older research; the prompts explicitly require checking measurement dates too. Model/API latency varies and the app's roughly 120-second response window remains a constraint.
