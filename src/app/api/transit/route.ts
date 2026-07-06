import { NextResponse } from 'next/server';
import type { TransitPoi, TransitType } from '@/lib/types';

const ENDPOINTS = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter'];
const BBOX = '12.7,77.2,13.35,77.9';
const filters: Record<TransitType, string> = {
  metro: 'nwr["railway"="station"]["station"="subway"]',
  bus: 'node["highway"="bus_stop"]',
  railway: 'nwr["railway"="station"]["station"!="subway"]',
  taxi: 'nwr["amenity"="taxi"]',
};

const fallback: Record<TransitType, TransitPoi[]> = {
  metro: [
    { id: 'metro-majestic', type: 'metro', name: 'Nadaprabhu Kempegowda (Majestic)', lat: 12.9757, lon: 77.5729 },
    { id: 'metro-indiranagar', type: 'metro', name: 'Indiranagar Metro', lat: 12.9785, lon: 77.6386 },
    { id: 'metro-baiyappanahalli', type: 'metro', name: 'Baiyappanahalli Metro', lat: 12.9905, lon: 77.6526 },
    { id: 'metro-silk-institute', type: 'metro', name: 'Silk Institute Metro', lat: 12.8619, lon: 77.5298 },
    { id: 'metro-whitefield', type: 'metro', name: 'Whitefield (Kadugodi) Metro', lat: 12.9958, lon: 77.7574 },
  ],
  bus: [
    { id: 'bus-majestic', type: 'bus', name: 'Kempegowda Bus Station', lat: 12.9776, lon: 77.5713 },
    { id: 'bus-shivajinagar', type: 'bus', name: 'Shivajinagar Bus Station', lat: 12.9831, lon: 77.6036 },
    { id: 'bus-kr-market', type: 'bus', name: 'K.R. Market Bus Station', lat: 12.9642, lon: 77.5762 },
    { id: 'bus-silk-board', type: 'bus', name: 'Central Silk Board', lat: 12.9177, lon: 77.6238 },
    { id: 'bus-marathahalli', type: 'bus', name: 'Marathahalli Bridge', lat: 12.9569, lon: 77.7011 },
  ],
  railway: [
    { id: 'rail-ksr', type: 'railway', name: 'KSR Bengaluru City Junction', lat: 12.9783, lon: 77.5695 },
    { id: 'rail-cantonment', type: 'railway', name: 'Bengaluru Cantonment', lat: 12.9937, lon: 77.5981 },
    { id: 'rail-yeshwanthpur', type: 'railway', name: 'Yeshwanthpur Junction', lat: 13.0237, lon: 77.5509 },
    { id: 'rail-kr-puram', type: 'railway', name: 'Krishnarajapuram Railway Station', lat: 13.0005, lon: 77.6750 },
    { id: 'rail-whitefield', type: 'railway', name: 'Whitefield Railway Station', lat: 13.0210, lon: 77.7610 },
  ],
  taxi: [
    { id: 'taxi-koramangala', type: 'taxi', name: 'Koramangala Auto Stand', lat: 12.9352, lon: 77.6245 },
    { id: 'taxi-indiranagar', type: 'taxi', name: 'Indiranagar Auto Stand', lat: 12.9784, lon: 77.6408 },
    { id: 'taxi-whitefield', type: 'taxi', name: 'Whitefield Auto Stand', lat: 12.9698, lon: 77.7427 },
    { id: 'taxi-bellandur', type: 'taxi', name: 'Bellandur Auto Stand', lat: 12.9296, lon: 77.6839 },
    { id: 'taxi-hsr', type: 'taxi', name: 'HSR Layout Auto Stand', lat: 12.9121, lon: 77.6389 },
  ],
};

type OverpassElement = { id: number; lat?: number; lon?: number; center?: { lat: number; lon: number }; tags?: { name?: string } };
type OverpassResponse = { elements?: OverpassElement[] };
export const revalidate = 86400;

async function requestEndpoint(endpoint: string, query: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(endpoint, { method: 'POST', body: new URLSearchParams({ data: query }), headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, signal: controller.signal, next: { revalidate: 86400 } });
    if (!response.ok) throw new Error(`Overpass ${response.status}`);
    return await response.json() as OverpassResponse;
  } finally { clearTimeout(timeout); }
}

export async function GET(request: Request) {
  const type = new URL(request.url).searchParams.get('type') as TransitType;
  if (!filters[type]) return NextResponse.json({ error: 'Invalid transit type' }, { status: 400 });
  const query = `[out:json][timeout:12];(${filters[type]}(${BBOX}););out center 300;`;
  try {
    const data = await Promise.any(ENDPOINTS.map((endpoint) => requestEndpoint(endpoint, query)));
    const items = (data.elements ?? []).flatMap((element): TransitPoi[] => {
      const lat = element.lat ?? element.center?.lat; const lon = element.lon ?? element.center?.lon;
      if (lat === undefined || lon === undefined) return [];
      return [{ id: `${type}-${element.id}`, type, name: element.tags?.name || `${type[0].toUpperCase() + type.slice(1)} point`, lat, lon }];
    });
    if (!items.length) throw new Error('No usable Overpass results');
    return NextResponse.json(items, { headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800', 'X-Transit-Source': 'OpenStreetMap live cache' } });
  } catch {
    return NextResponse.json(fallback[type], { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400', 'X-Transit-Source': 'bundled fallback' } });
  }
}
