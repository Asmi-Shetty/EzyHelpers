# GeoSmart — Usability Guide

## Use the app

1. Open the app; it starts at the full Bangalore view.
2. Select a navy locality marker to see its pincode, sample apartments, and orange-ring localities within 3.5 km.
3. Search for an apartment and select a result to zoom to apartment detail.
4. Turn Metro, BMTC, Rail, or Auto/Cab on only when needed. Select a transit pin for its name, type, and distance from the current locality.
5. Zoom to level 13+ for locality/pincode labels and level 16+ for apartment pins.
6. Select **Reset** to clear search, selection, transit layers and map position.
7. Open **DayRoute** to review the helper's duty timeline, travel/buffer window, available time, and the approximate distance between Sarjapur Road and Bellandur. Use the locality buttons to inspect either stop on the map.

On mobile, locality information appears in a bottom sheet so the map remains usable. Every top-bar control remains available.

## Visual language

Navy is an unselected locality, blue is selected, and orange means within the 3.5 km threshold. Purple, green, red, and amber identify Metro, BMTC, railway, and auto/cab data. Labels and control text accompany colors so meaning does not depend on color alone.

## Known limitations

- Adjacency is centroid distance, not road time or shared administrative borders.
- Apartment and locality data is the provided sample, not production coverage.
- OSM transit POIs may be incomplete or temporarily unavailable.
- Transit is static location data, not arrivals, schedules, or service status.
- The prototype has no authentication and is unsuitable for sensitive data.

## Recommended v2

Prioritize configurable commute bands by job type, route-time estimates, authentication, Supabase ingestion and freshness indicators, usage analytics, and marker clustering. Validate these priorities through observed sourcing sessions before adding route optimization or helper profiles.
