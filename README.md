# EzyHelpers GeoSmart

GeoSmart is a map-first locality intelligence web app built for the EzyHelpers Associate Product Manager assignment. It helps sourcing teams understand Bangalore localities, apartments, nearby areas, and public-transit context from one simple interface.

The project is intentionally scoped as a 48-hour MVP: useful enough for an interviewer to test end-to-end, but honest about assumptions, trade-offs, and what would need deeper validation in a real sprint.

## One-line product summary

Help EzyHelpers sourcing agents quickly answer: "Where should we source, which apartments are in this locality, what nearby areas are serviceable, and what transit options exist around it?"

## Why this project matters

EzyHelpers connects households with helpers such as maids, cooks, nannies, babysitters, and drivers. For sourcing and placement operations, geography matters a lot:

- Field sourcers need to plan apartment-heavy locality visits.
- Tele sourcers need to validate a lead's apartment and locality during a call.
- Sourcing leads need consistent locality, pincode, adjacency, and transit assumptions.
- Helpers benefit from clearer daily movement planning, especially when duties are spread across nearby areas.

GeoSmart brings these decisions into a single interactive map.

## Core features

| Feature | What it does | Why it helps |
|---|---|---|
| Locality map | Shows Bangalore localities as clickable map markers | Helps sourcers quickly choose an area |
| Apartment search | Typeahead search across apartments and localities | Helps verify apartment/location during calls |
| Apartment pins | Shows apartment markers at high zoom | Avoids clutter while still supporting detailed inspection |
| Pincode labels | Shows locality + pincode labels after zooming in | Keeps the map readable at city level |
| Adjacent localities | Highlights nearby localities within 3.5 km | Supports commute and nearby-area discussion |
| Transit overlays | Metro, BMTC, Railway, and Auto/Cab layers | Adds public-transit context without switching tools |
| Reset | Clears map state and returns to the default Bangalore view | Gives users a safe escape when exploring |
| Mobile responsive UI | Works on small screens with map + details layout | Useful for field sourcing |

## Extra feature added: DayRoute

I added **DayRoute** as an extra feature from my side.

DayRoute is a helper-facing schedule timeline that shows:

- duty time in one locality;
- travel or buffer time;
- available/free time;
- next duty in another locality;
- indicative distance between the two places.

Example flow:

> 1 hour duty in Sarjapur Road -> 1 hour travel/buffer -> 30 minutes available -> next duty in Bellandur

This is useful because helpers often need to understand not only where the next duty is, but also whether the movement between duties feels realistic.

Important limitation: DayRoute is intentionally read-only in this MVP. It does not store helper personal data, customer addresses, live traffic, or editable schedules. In a real sprint, I would validate this with helpers before expanding it into a full scheduling module.

## How an interviewer can test the deployed app

1. Open the deployed Vercel URL.
2. Select a locality such as **Bellandur**, **Whitefield**, or **Koramangala**.
3. Check that the side panel shows apartments and nearby localities.
4. Search for an apartment such as:
   - `Keerthi Signature`
   - `Prestige Ozone`
   - `Embassy Pristine`
5. Zoom in and confirm apartment pins appear only at higher zoom.
6. Toggle transit layers:
   - Metro
   - BMTC
   - Rail
   - Auto/Cab
7. Open **DayRoute** and review the helper schedule timeline.
8. Click **Reset** and confirm the map returns to the default Bangalore view.

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 App Router |
| Language | TypeScript |
| Map | Leaflet + react-leaflet |
| Map tiles | OpenStreetMap tiles |
| Database | Supabase PostgreSQL |
| Transit data | Overpass API |
| Hosting | Vercel |
| Styling | Tailwind pipeline + custom CSS |
| Testing | Vitest |

## Supabase schema

The app uses three Supabase tables:

| Table | Key columns | Purpose |
|---|---|---|
| `localities` | `id`, `locality`, `district`, `pincode`, `state`, `rep_lat`, `rep_lon`, `apartment_count` | Stores Bangalore locality reference data |
| `apartments` | `id`, `name`, `locality`, `lat`, `lon`, `coordinate_quality` | Stores searchable apartment locations |
| `transit_pois` | `id`, `type`, `name`, `lat`, `lon`, `fetched_at` | Caches Overpass transit POIs |

The schema is in:

```text
supabase/schema.sql
```

Seed data is in:

```text
supabase/seed.sql
```

Verification SQL is in:

```text
supabase/verify.sql
```

## Supabase security and RLS

Row Level Security is enabled on all three tables.

Because this is a public read-only tool:

- frontend users get `SELECT` access only;
- `INSERT`, `UPDATE`, and `DELETE` are revoked from frontend roles;
- the service-role key is used only server-side for transit cache refresh;
- no Supabase secret key should ever be exposed in browser code.

## Overpass API integration

Transit POIs are fetched through the Overpass API and cached in Supabase.

Primary endpoint:

```text
https://overpass-api.de/api/interpreter
```

Bangalore bounding box:

```text
12.7,77.2,13.35,77.9
```

Transit layers:

| Layer | Overpass query idea |
|---|---|
| Metro | `node["railway"="station"]["network"="Namma Metro"]` plus BMRCL/subway variants |
| BMTC | `node["highway"="bus_stop"]["operator"="BMTC"]` plus BMTC variants |
| Railway | `node["railway"="station"][!"subway"]` |
| Auto/Cab | `node["amenity"="taxi"]` and `node["amenity"="bus_station"]` |

The app does not re-query Overpass on every page refresh. It first checks the Supabase `transit_pois` cache. If fresh cached data exists, it uses that.

Fallback order:

1. Fresh Supabase cache
2. Live Overpass response
3. Stale Supabase cache
4. Bundled fallback transit points

This keeps the core map usable even if Overpass is slow, rate-limited, or temporarily unavailable.

## Data flow

```text
Browser
  -> /api/map-data
  -> Supabase localities + apartments
  -> Map UI

Browser transit toggle
  -> /api/transit?type=metro|bus|railway|taxi
  -> Fresh Supabase transit cache?
  -> If no, call Overpass
  -> Save result to transit_pois
  -> Return POIs to map
```

## Local setup

Install dependencies:

```bash
npm install
```

Create `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
```

Add Supabase values:

```text
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_OR_PUBLISHABLE_KEY
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
```

Run locally:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Vercel deployment

In Vercel, add these environment variables under:

```text
Project Settings -> Environment Variables
```

Required variables:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

Use:

```text
npm run build
```

as the build command.

Do not expose `SUPABASE_SERVICE_ROLE_KEY` with a `NEXT_PUBLIC_` prefix.

## Quality checks

Run tests:

```bash
npm test
```

Run production build:

```bash
npm run build
```

Current verified status:

- `npm test` passes
- `npm run build` passes
- Supabase schema includes RLS and read-only frontend policies
- Overpass transit cache flow is implemented
- Vercel deployment configuration is documented

## Product assumptions

- The sample dataset is enough for MVP demonstration.
- Locality representative coordinates are acceptable for first-pass discovery.
- A 3.5 km Haversine distance threshold is a useful starting point for adjacent-locality logic.
- Transit POIs are static planning context, not real-time route availability.
- The app is public and read-only, so authentication is out of scope for this MVP.

## Design decisions

- Use a map-first UI because the problem is geographic.
- Use progressive map detail so the city-level map does not become cluttered.
- Use clear color coding:
  - navy = normal locality;
  - blue = selected locality;
  - orange = adjacent locality;
  - purple/green/red/amber = transit categories.
- Cache Overpass results in Supabase to avoid unnecessary API calls.
- Keep DayRoute read-only to show the product idea without creating privacy or scheduling complexity.

## Scope trade-offs

What is intentionally not included:

- Login and role management
- Helper personal profiles
- Customer-home matching
- Editable schedules
- Live traffic or road routing
- Real-time BMTC/Metro schedules
- Official locality boundary polygons
- Admin dashboard for data editing

These are real product opportunities, but they would expand the 48-hour MVP beyond a fair assignment scope.

## What I would do differently in a real sprint

In a real sprint, I would:

1. Interview 2-3 tele sourcers, 2-3 field sourcers, and a few helpers.
2. Validate whether 3.5 km is the right threshold for different job types.
3. Add analytics for searches, selected localities, failed lookups, and transit toggles.
4. Add a lightweight admin/data-quality workflow for correcting coordinates.
5. Evaluate road-distance or travel-time APIs after understanding cost and privacy implications.
6. Validate DayRoute with helpers before expanding it into a full scheduling feature.
7. Replace representative circles or approximations with verified locality boundary data if available.

## AI-assisted development note

Codex was used as an AI development assistant for:

- converting the assignment into product requirements;
- scaffolding the Next.js/TypeScript implementation;
- debugging Vercel and Leaflet issues;
- implementing Supabase and Overpass caching flow;
- writing tests and documentation;
- preparing PRD and usability guide PDFs.

Product judgement, scope decisions, assumptions, trade-offs, and final submission choices were treated as PM ownership decisions.

## Repository structure

```text
src/
  app/
    api/map-data/       Supabase map-data API
    api/transit/        Overpass + Supabase transit cache API
  components/           Main UI, map, sidebar, DayRoute
  lib/                  Types, geo utilities, Supabase client

supabase/
  schema.sql            Tables, indexes, RLS policies
  seed.sql              Sample locality and apartment data
  verify.sql            Verification queries

docs/
  PRD.md                Product requirements document
```

## Final evaluator summary

GeoSmart demonstrates product thinking and technical breadth in one focused MVP:

- user problem translated into scoped requirements;
- responsive map-based UX;
- Supabase schema with RLS;
- Overpass API integration with caching;
- graceful fallback behavior;
- TypeScript implementation;
- Vercel deployment readiness;
- documented assumptions and trade-offs;
- extra DayRoute feature showing helper empathy beyond the base assignment.
