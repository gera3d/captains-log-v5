# Beta waiting-list frontend — AIW-548

This release candidate retains the reviewed voice-first homepage and dashboard assets. Beta navigation is an explicit build setting, independent of Vite staging/live/production mode. Publication remains assigned to AIW-551.

AIW-553 adds the owner's responsive composition correction: at960px and below, the hero becomes a single left-aligned reading flow; above960px its columns align at the top. Section links remain on the header row above650px, including the reported818px width. At650px and below they move to an intentional second row. The reusable `GoodIdeaWord` component renders contiguous GoodIdea with regular Good and bold Idea; alt/title strings stay plain GoodIdea. Existing logo and gallery image assets are preserved.

## Configuration

Set `VITE_BETA_MODE=true` to replace the three homepage signup entrances and both signin signup switches with **Join the waiting list**. False or unset retains normal signup; any other mode value fails configuration validation. Existing password and OAuth signin controls retain their behavior. Every AuthCard applies the beta setting even when called outside the homepage.

Set `VITE_BETA_WAITLIST_URL` to the official, published Google Forms responder URL verified by AIW-549: `https://docs.google.com/forms/d/e/<published-id>/viewform`. The validator checks URL shape; only the integration owner can verify publication/access and the linked private Sheet. Owner edit/preview links, shortened links, formResponse POST targets, other hosts, credentials, query parameters and fragments are rejected. Obtain the canonical responder URL without tracking parameters from the collection owner.

In beta mode, a missing URL leaves signup closed in the frontend and shows “The waiting list isn’t open yet. Please check back soon.” The build remains inspectable, but a missing or unverified URL blocks release. Do not infer verification from a valid URL shape.

The dialog opens the form in a new tab with `noopener noreferrer`. Users must submit the hosted form there. Opening it does not save an email or prove collection; the website has no email input, request to Google, credentials or saved-state confirmation. No URL is stored in source as the production destination.

The previous invitation/code draft and route are removed. AIW-552 is deferred. Frontend beta navigation does not enforce server-side admission: under current backend policy OAuth may create a first-time user. No auth settings, schemas, API handlers or workflows change in AIW-548.

## Local review

Use existing dependencies and Node20. The isolated AIW-548 preview is on strict loopback port5193; do not stop another task's server or reuse its port.

```sh
cd client
node scripts/preview-beta-fixture.mjs
```

The fixture listens only on 127.0.0.1:5194 and accepts only GET `/waitlist-form`; it contains no submission controls. In another terminal:

```sh
VITE_BETA_MODE=true VITE_BETA_WAITLIST_URL=http://127.0.0.1:5194/waitlist-form npm run dev:staging -- --port 5193
```

Open `http://127.0.0.1:5193/?preview=homepage`. Only staging builds accept that disposable loopback URL. Production, live and generic development reject it. The fixture is never a release destination.

## Verification

```sh
npm run check:beta-config
npm run check:beta-matrix
npm run check:homepage-composition
```

The matrix builds staging beta, production beta with a synthetic canonical responder, production beta without a URL, and production with beta disabled. Checks cover all three homepage entrances, both signin switches, footer signin, signed-out integrations fallback, retired invitation offers, missing URL, accessible dialog focus/Tab/Escape/return, popup destination and opener isolation, 1440/390/320 layouts and preserved voice-first image semantics. All backend/form dependencies are intercepted locally before transmission; no signup, signin, email submission, saved row, recording or AI action is performed. Existing production font loading is fulfilled with empty offline CSS. A production build test is UI qualification with synthetic settings, not a live integration test.

Default evidence is ignored `client/artifacts/beta-relaunch`. Set `BETA_EVIDENCE_DIR` to write logs/results to the coordinator handoff folder. Early screenshot capture uses `scripts/capture-beta-relaunch.mjs` against the running local fixture preview.

The composition check uses the running5193 mock source preview and checks15 widths, including both sides of the960/650px transitions and818px. To capture the corrected818/1440/390px header, hero and dialog views, run `BETA_CAPTURE_DESIGN=true BETA_EVIDENCE_DIR=<output-folder> node scripts/capture-beta-relaunch.mjs`. These are CSS-sized screenshots; the product dashboard imagery retains its original2x density.

AIW-550 independently verifies the exact committed candidate with the verified responder configuration. AIW-551 must confirm the final public URL and exact build settings before publishing. Successful collection requires separate agreed submission/Sheet-row evidence from AIW-549; UI tests cannot establish it.

## Homepage completion — AIW-556 / AIW-557

The footer and FAQ now link to `/privacy`, labelled **Beta access & privacy**. It states the verified waiting-list purpose and distinguishes joining the hosted form from creating an account. It explicitly limits its scope; unsupported Terms and Contact offers are removed rather than supplied with invented content. The page supports direct loading, reload and homepage/back navigation.

AuthModal uses the installed Headless UI dialog with an accessible title, input focus on entry, contained Tab/Shift-Tab, Escape/outside/close dismissal and trigger focus restoration. Required labels are associated by unique IDs and the password visibility control has a changing accessible name. Authentication handlers and beta routing are unchanged.

`npm run check:homepage-access` checks a production beta build at `artifacts/homepage-access/production-beta` by default. Set `BETA_BUILD_DIR` to another build, `BETA_EVIDENCE_DIR` for output, or `ACCESS_ORIGIN` to an already running synthetic dev server. `ACCESS_BETA=false` checks normal account creation on a separately configured synthetic nonbeta server. All backend/font requests are intercepted before transmission; screenshots and JSON cover1440/818/390/320. No auth request, microphone call, form submission or AI action is performed. This focused check supplements unchanged prior config/missing-URL/matrix evidence; it does not establish live admission or collector behavior.
