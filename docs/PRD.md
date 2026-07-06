# GeoSmart Helper Locality Web App — Product Requirements Document

**Owner:** Associate Product Manager candidate  
**Version:** 1.0 · **Status:** Demo-ready MVP · **Date:** 6 July 2026

## Executive decision

Build a map-first internal tool that answers three sourcing questions in under 30 seconds: where should a field sourcer go, which apartments are present, and which nearby localities/transit options make a helper's commute plausible? The MVP optimizes for dependable demonstration and field usability rather than production-scale routing accuracy.

## Problem and users

Field sourcers lack one view for apartment density and visit planning. Tele sourcers lack a quick geographic check while qualifying leads. This increases call handling time, weakens commute conversations, and creates inconsistent field routes. The user job is not “explore a map”; it is “make the next sourcing decision quickly.”

## Outcomes and measures

The MVP is successful if a first-time user can select a locality, identify apartments and nearby localities, find a named apartment, inspect transit options, and reset without training. A production pilot would measure median time-to-locality decision (<30 seconds), successful apartment lookup (>95%), weekly active sourcing agents (>70%), and session error rate (<2%). Retention or placement uplift is a lagging metric and should not be claimed from this prototype.

## Scope and priorities

P0: locality map, locality selection, apartment list/search, 3.5 km adjacency, zoom-aware pincode labels, reset, responsive layout, graceful errors. P1: Metro, BMTC, railway and auto/cab OSM overlays with distance, plus a read-only DayRoute timeline that helps a helper understand duties, travel buffers and available time. Out of scope: authentication, editable scheduling, helper/customer profiles, real-time bus movement, route optimization, editing data, and production analytics.

## Key decisions and trade-offs

1. **3.5 km centroid radius:** a stable, explainable proxy for a short auto/walk connection. It is fast enough for client computation and avoids unreliable sub-locality polygons. It does not represent road travel time; production should compare route duration by job type.
2. **Local seed fallback plus Supabase contract:** the prototype cannot fail because a free database sleeps. Supabase schema and RLS are included, while bundled data demonstrates all core workflows. Production should make Supabase the source of truth and surface freshness.
3. **Overpass via server route:** the browser never hits Overpass directly. A 24-hour shared cache reduces rate pressure and a non-blocking status preserves the core workflow during outages.
4. **Transit off by default:** reduces clutter and initial load. Users opt into the layer relevant to the conversation.
5. **Markers rather than polygons:** sample data supplies centroids, not authoritative boundaries. Markers avoid implying false precision.

## Functional acceptance criteria

- Initial view fits Bangalore and shows every sample locality with name, pincode, and apartment count.
- Selecting a locality distinguishes it, highlights centroids within 3.5 km, and opens apartments and adjacent localities.
- Search returns apartment names; choosing one flies to zoom 16 and displays its pin.
- Below zoom 13 no pincode labels appear; at 13+ locality/pincode labels appear; at 16+ apartment pins appear.
- Four transit controls work independently. Pins show type/name plus distance from a selected locality.
- Reset clears selection, query, transit layers, and returns to Bangalore bounds.
- At 375 px the map remains primary and details appear as a bottom sheet.
- Overpass failure informs the user without breaking locality workflows.
- DayRoute shows duty, travel/buffer and available blocks in chronological order, calculates the indicative distance between consecutive duty localities, and lets the helper open those localities on the map.

## Non-functional requirements

Target interactive load is under three seconds on typical 4G after static assets cache. Controls are keyboard reachable and labeled; color is reinforced by text and position. Support current Chrome and Safari mobile. No secrets are embedded. Public database access is SELECT-only through RLS.

## Delivery plan (48 hours)

- 0–4h: clarify users, acceptance criteria, data contract, low-fidelity interaction model.
- 4–18h: data model, map, locality selection, adjacency and apartment workflows.
- 18–28h: transit proxy/cache, responsive behavior, error states.
- 28–36h: tests, accessibility, performance and browser checks.
- 36–44h: deployment, README, PRD and usability guide.
- 44–48h: demo rehearsal, regression, links and submission package.

## Risks and mitigations

- Overpass rate limits/outage: server cache, layers off by default, graceful fallback.
- OSM incompleteness: label source and freshness; do not promise coverage.
- Misleading adjacency: describe as centroid proximity; validate threshold with sourcing agents.
- Free-tier sleep/demo failure: bundled read-only fallback and pre-demo health check.
- Dense mobile map: bottom sheet, progressive zoom detail and independent layers.

## Launch and validation

Run unit tests and production build, then complete desktop Chrome and 375 px mobile checks. Before review, confirm the deployed URL, search, all toggles, reset, and an Overpass failure path. A real pilot would include five agents completing scripted tasks, followed by a one-week instrumented rollout.

## What changes in a real sprint

Add Google SSO, telemetry, data freshness, Supabase-backed ingestion, marker clustering, and road-time commute bands by job type. Validate data against an operational source, replace heuristic proximity with configurable travel-time isochrones, and establish an OSM tile plan appropriate for production traffic.
