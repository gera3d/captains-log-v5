# GoodIdea

Source for the frontend at https://idea.why57.com. The active development branch is
`Ideahub`; GitHub's default `main` branch is older.

## Set up another computer

```powershell
git clone --branch Ideahub https://github.com/gera3d/captains-log-v5.git
cd captains-log-v5/client
Copy-Item .env.example .env
# Set VITE_SUPABASE_ANON_KEY in .env to the project's public anon key.
npm ci
npm run dev
```

Open http://localhost:5174. For an existing clone, commit or stash your own changes,
then run `git fetch origin`, `git switch Ideahub`, and `git pull --ff-only origin Ideahub`.
Run `npm ci` in `client` after pulling dependency changes. `npm run build` creates
`client/dist`; `npm run preview` serves that build locally.

Copy the existing computer's `client/.env` privately or get the public anon key from
the Supabase project. Never use a service-role key in the frontend. Environment
files are excluded from new commits.

## Backend map

The frontend depends on multiple separately deployed services:

| Service | Location | Source in this repository |
| --- | --- | --- |
| Database, authentication, storage | https://uobhsikllffnwvvpedui.supabase.co | `supabase/functions`, `supabase/migrations`, `supabase/config.toml` |
| Idea-generation and PRD automation | https://n8n.why57.com; webhooks `/webhook/transcript-summarize` and `/webhook/prd` | `n8n/idea-structure` contains prompt/build artifacts and a historical workflow export; see its README for drift and publishing details |
| Idea ingestion, idea records, username lookup and API-key integration | Same-origin `/api/v1/...` on https://idea.why57.com | The server implementation and production reverse-proxy mapping were not found in this checkout |

The local scripts reference `http://10.0.0.60:3001` as a previous app testing
address. This is a clue, not verified evidence of the current backend host.

`npm run build` only builds the frontend. Pulling this repo does not deploy n8n,
provision the database, or start the separate `/api/v1` server. Existing migrations
and workflow exports are historical artifacts, not a verified snapshot of current
production. Do not apply them wholesale to production.

The Vite development config currently has no `/api` proxy, and the included Nginx
config only serves the SPA. Same-origin API features therefore require the actual
API server and appropriate development proxy/routing configuration. The physical
server/container and full backend deployment configuration remain unverified.

## Deployment parity

On 2026-10-16, a fresh build of this working tree produced JavaScript and CSS
bundles that matched the public site's bundles byte for byte. This confirms
frontend parity, not backend/database/workflow parity. GitHub updates do not by
themselves deploy the production website.
