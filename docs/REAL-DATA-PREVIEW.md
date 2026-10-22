# Try the dashboard with your own ideas

The private Mac Pro dashboard has two choices at the top: **Sample data** and **My real data**. Both show the current design. They open separate local websites so synthetic fixtures never become real records and account credentials never move between modes.

- Current sample dashboard: http://127.0.0.1:5194/ (the standard staging command defaults to5176).
- Real-account dashboard: http://127.0.0.1:5177/. Sign in normally; the local site remembers its own session. Existing accounts only; beta enrollment restrictions remain unchanged.

The real-data website uses the existing Supabase account, API and workflows. Saves, pins, archives, deletes, uploads and AI actions have real effects; it is not a separate test database. Note-row deletion still does not erase stored audio or other saved copies. The sample website stays the place for automated tests and experiments.

## Running the current source

From `client`, use `npm run dev:live`, or `npm run build:live` followed by `npm run preview:live`. These select strict loopback5177 and require the existing ignored `.env.live.local`. Its browser key must be publishable/anon; privileged keys are rejected. Never commit or print its values.

For the sample return link in the real-data banner, set `VITE_MOCK_PREVIEW_URL=http://127.0.0.1:5194` in that ignored file. It accepts only an HTTP loopback origin on a distinct explicit port, without credentials, path, query or fragment. Without it the standard sample target is5176. In sample mode, the selected link stays on the current origin.

The switch navigates to the other website's root; it does not transfer the current note, search state, OAuth callback, session or tokens. Auth uses a dedicated live-preview storage key. Production builds have no preview switch. Staging's restrictive network policy stays in place.

## Evidence and limits

[Real-account preview task](https://command.why57.com/AIW/issues/AIW-581) holds the current exact revision, independent switch review and running handoff. [The original connection task](https://command.why57.com/AIW/issues/AIW-509) preserves earlier routing/configuration evidence.

The coordinator used normal Google sign-in and observed the current dashboard load the owner's real saved ideas and pinned collection. No real records were changed, no microphone started and no AI workflow invoked. This establishes normal account sign-in and dashboard reading in this browser, not full real-service mutation, storage, recording or backend qualification. Automated switch checks use synthetic/local inputs only.
