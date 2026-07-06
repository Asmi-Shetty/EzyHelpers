import { NextResponse } from 'next/server';
import { apartments as fallbackApartments, localities as fallbackLocalities } from '@/lib/data';
import { getPublicSupabase } from '@/lib/supabase';

export const revalidate = 3600;

export async function GET() {
  const supabase = getPublicSupabase();
  if (!supabase) return NextResponse.json({ localities: fallbackLocalities, apartments: fallbackApartments, source: 'bundled fallback', warning: 'Supabase environment variables are not configured' });

  const [localityResult, apartmentResult] = await Promise.all([
    supabase.from('localities').select('*').order('locality'),
    supabase.from('apartments').select('*').order('name'),
  ]);
  if (localityResult.error || apartmentResult.error || !localityResult.data?.length || !apartmentResult.data?.length) {
    return NextResponse.json({ localities: fallbackLocalities, apartments: fallbackApartments, source: 'bundled fallback', warning: localityResult.error?.message ?? apartmentResult.error?.message ?? 'Supabase contains no seed data' });
  }
  return NextResponse.json({ localities: localityResult.data, apartments: apartmentResult.data, source: 'Supabase' }, { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } });
}
