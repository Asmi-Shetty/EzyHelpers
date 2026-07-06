import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase';
import type { TransitPoi, TransitType } from '@/lib/types';

const ENDPOINTS = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter'];
const BBOX = '12.7,77.2,13.35,77.9';
const CACHE_HOURS = 24;
const clauses: Record<TransitType, string[]> = {
  metro: ['node["railway"="station"]["network"="Namma Metro"]', 'node["railway"="station"]["network"="BMRCL"]', 'node["railway"="station"]["station"="subway"]'],
  bus: ['node["highway"="bus_stop"]["operator"="BMTC"]', 'node["highway"="bus_stop"]["network"="BMTC"]', 'node["highway"="bus_stop"]["operator"="Bengaluru Metropolitan Transport Corporation"]'],
  railway: ['node["railway"="station"][!"subway"]'],
  taxi: ['node["amenity"="taxi"]', 'node["amenity"="bus_station"]'],
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

type OverpassElement = { id: number; lat?: number; lon?: number; tags?: { name?: string } };
type OverpassResponse = { elements?: OverpassElement[] };
type TransitRow = TransitPoi & { fetched_at?: string };
export const revalidate = 0;

async function readSupabaseCache(type: TransitType, freshOnly: boolean) {
  const supabase = getAdminSupabase();
  if (!supabase) return [];
  let query = supabase.from('transit_pois').select('id,type,name,lat,lon,fetched_at').eq('type', type).order('name');
  if (freshOnly) query = query.gte('fetched_at', new Date(Date.now() - CACHE_HOURS * 60 * 60 * 1000).toISOString());
  const { data, error } = await query;
  if (error || !data) return [];
  return (data as TransitRow[]).map(({ id, type: rowType, name, lat, lon }) => ({ id, type: rowType, name, lat, lon }));
}

async function writeSupabaseCache(type: TransitType, items: TransitPoi[]) {
  const supabase = getAdminSupabase();
  if (!supabase) return false;
  const fetchedAt = new Date().toISOString();
  const deletion = await supabase.from('transit_pois').delete().eq('type', type);
  if (deletion.error) return false;
  const insertion = await supabase.from('transit_pois').upsert(items.map((item) => ({ ...item, fetched_at: fetchedAt })), { onConflict: 'id' });
  return !insertion.error;
}

async function requestEndpoint(endpoint: string, query: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(endpoint, { method: 'POST', body: new URLSearchParams({ data: query }), headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, signal: controller.signal, cache: 'no-store' });
    if (!response.ok) throw new Error(`Overpass ${response.status}`);
    return await response.json() as OverpassResponse;
  } finally { clearTimeout(timeout); }
}

function response(items: TransitPoi[], source: string) {
  return NextResponse.json(items, { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600', 'X-Transit-Source': source } });
}

export async function GET(request: Request) {
  const type = new URL(request.url).searchParams.get('type') as TransitType;
  if (!clauses[type]) return NextResponse.json({ error: 'Invalid transit type' }, { status: 400 });

  const freshCache = await readSupabaseCache(type, true);
  if (freshCache.length) return response(freshCache, 'Supabase cache');

  const query = `[out:json][timeout:12];(${clauses[type].map((clause) => `${clause}(${BBOX});`).join('')});out body 300;`;
  try {
    const data = await Promise.any(ENDPOINTS.map((endpoint) => requestEndpoint(endpoint, query)));
    const items = (data.elements ?? []).flatMap((element): TransitPoi[] => element.lat === undefined || element.lon === undefined ? [] : [{ id: `${type}-${element.id}`, type, name: element.tags?.name || `${type[0].toUpperCase() + type.slice(1)} point`, lat: element.lat, lon: element.lon }]);
    if (!items.length) throw new Error('No usable Overpass results');
    const cached = await writeSupabaseCache(type, items);
    return response(items, cached ? 'live Overpass, saved to Supabase' : 'live Overpass (Supabase cache not configured)');
  } catch {
    const staleCache = await readSupabaseCache(type, false);
    if (staleCache.length) return response(staleCache, 'stale Supabase cache');
    return response(fallback[type], 'bundled fallback');
  }
}
