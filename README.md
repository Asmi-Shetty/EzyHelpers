# EzyHelpers GeoSmart

Map-first locality intelligence for Bangalore sourcing agents. The prototype covers 15 localities, 20 apartments, 3.5 km adjacency, typeahead apartment search, zoom-aware labels, four OSM transit overlays, reset, and responsive desktop/mobile layouts.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. No credentials are required for the bundled demo dataset. To connect Supabase, run `supabase/schema.sql`, load the supplied seed rows, and copy `.env.example` to `.env.local` with your project values.

## Architecture

- Next.js 14 App Router + strict TypeScript
- Leaflet/react-leaflet + CARTO-hosted OpenStreetMap tiles
- Next route handler proxies Overpass and caches responses for 24 hours
- Supabase schema with read-only RLS policies; local seed fallback keeps demos reliable
- Tailwind build pipeline plus purpose-built responsive CSS

## Quality checks

```bash
npm test
npm run build
```

## AI usage

Codex translated the assignment into scope, scaffolded the implementation, created tests and documentation, and supported build verification. Product choices and acceptance criteria are documented in `docs/PRD.md`.
