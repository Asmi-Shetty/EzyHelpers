# EzyHelpers GeoSmart

Map-first locality intelligence for Bangalore sourcing agents. The prototype covers 15 localities, 20 apartments, 3.5 km adjacency, typeahead apartment search, zoom-aware labels, four OSM transit overlays, reset, and responsive desktop/mobile layouts.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. The bundled dataset is only a final safety fallback; the configured application reads locality and apartment data from Supabase.

## Required Supabase setup

1. Create a free Supabase project.
2. Open **SQL Editor** and run `supabase/schema.sql`.
3. Run `supabase/seed.sql` in the SQL Editor.
4. In **Project Settings > API**, copy the project URL, anon key, and service-role key.
5. Copy `.env.example` to `.env.local` and set:

```text
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
```

Never expose `SUPABASE_SERVICE_ROLE_KEY` in browser code or prefix it with `NEXT_PUBLIC_`. It is used only by the server-side transit route to refresh the cache.

For Vercel, add the same four variables under **Project Settings > Environment Variables**, select Production/Preview/Development, and redeploy.

## Supabase data flow

- `/api/map-data` reads `localities` and `apartments` through the anon key and read-only RLS policies.
- `/api/transit` first reads transit points fetched within the last 24 hours from `transit_pois`.
- On a cache miss it calls Overpass using the assignment tags and Bangalore bounding box.
- A successful response replaces that transit type in `transit_pois` using the server-only service-role key.
- If Overpass fails, the route uses stale Supabase rows; bundled points are the final fallback.
- Frontend clients have SELECT access only. INSERT, UPDATE, and DELETE are revoked.

## Architecture

- Next.js 14 App Router + strict TypeScript
- Leaflet/react-leaflet + CARTO-hosted OpenStreetMap tiles
- Next route handler proxies Overpass and caches responses for 24 hours
- Supabase-backed map data and 24-hour transit cache with read-only frontend RLS
- Tailwind build pipeline plus purpose-built responsive CSS

## Quality checks

```bash
npm test
npm run build
```

## AI usage

Codex translated the assignment into scope, scaffolded the implementation, created tests and documentation, and supported build verification. Product choices and acceptance criteria are documented in `docs/PRD.md`.
