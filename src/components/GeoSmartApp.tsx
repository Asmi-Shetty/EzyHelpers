'use client';
import { useMemo, useState } from 'react';
import { apartments, localities } from '@/lib/data';
import { adjacentTo } from '@/lib/geo';
import type { Apartment, Locality, TransitPoi, TransitType } from '@/lib/types';
import GeoMap from './GeoMap';
import DayRoute from './DayRoute';

const transitMeta: { type: TransitType; label: string; color: string }[] = [
  { type: 'metro', label: 'Metro', color: '#7c3aed' }, { type: 'bus', label: 'BMTC', color: '#16a34a' },
  { type: 'railway', label: 'Rail', color: '#dc2626' }, { type: 'taxi', label: 'Auto/Cab', color: '#d97706' },
];

export default function GeoSmartApp() {
  const [selected, setSelected] = useState<Locality | null>(null);
  const [focusedApartment, setFocusedApartment] = useState<Apartment | null>(null);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState<Set<TransitType>>(new Set());
  const [pois, setPois] = useState<Record<string, TransitPoi[]>>({});
  const [status, setStatus] = useState('');
  const [showDayRoute, setShowDayRoute] = useState(false);
  const adjacent = useMemo(() => selected ? adjacentTo(selected, localities) : [], [selected]);
  const matches = query.trim().length ? apartments.filter((item) => `${item.name} ${item.locality}`.toLowerCase().includes(query.toLowerCase())).slice(0, 7) : [];
  const chooseLocality = (locality: Locality) => { setSelected(locality); setFocusedApartment(null); };
  const chooseApartment = (apartment: Apartment) => { setFocusedApartment(apartment); setSelected(localities.find((item) => item.locality === apartment.locality) ?? null); setQuery(''); };

  async function toggleTransit(type: TransitType) {
    const next = new Set(active);
    if (next.has(type)) { next.delete(type); setActive(next); return; }
    next.add(type); setActive(next);
    if (pois[type]) return;
    setStatus(`Loading ${type} data...`);
    try {
      const response = await fetch(`/api/transit?type=${type}`); const body = await response.json();
      if (!response.ok) throw new Error(body.error);
      const source = response.headers.get('X-Transit-Source') ?? 'map data';
      setPois((current) => ({ ...current, [type]: body })); setStatus(`${body.length} ${type} points loaded from ${source}`);
    } catch { setStatus('Transit data unavailable - core map remains usable'); }
    setTimeout(() => setStatus(''), 4000);
  }
  function reset() { setSelected(null); setFocusedApartment(null); setQuery(''); setActive(new Set()); setStatus(''); }
  const selectedApartments = selected ? apartments.filter((item) => item.locality === selected.locality) : [];

  return <main className="app">
    <header className="topbar">
      <div className="brand"><span className="brand-mark">EH</span><span>GeoSmart</span></div>
      <div className="search"><input aria-label="Search apartments" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search apartment or locality..." />{matches.length > 0 && <div className="results" role="listbox">{matches.map((apartment) => <button className="result" key={apartment.id} onClick={() => chooseApartment(apartment)}><strong>{apartment.name}</strong><small>{apartment.locality}</small></button>)}</div>}</div>
      <div className="toggles" aria-label="Map and schedule tools">{transitMeta.map((item) => <button key={item.type} className={`toggle ${active.has(item.type) ? 'active' : ''}`} style={{ '--toggle-color': item.color } as React.CSSProperties} aria-pressed={active.has(item.type)} onClick={() => toggleTransit(item.type)}>{item.label}</button>)}<button className="toggle dayroute-trigger" onClick={() => setShowDayRoute(true)}>DayRoute</button></div>
      <button className="reset" onClick={reset} aria-label="Reset map">Reset</button>
    </header>
    <section className="workspace">
      <aside className={`sidebar ${selected ? '' : 'intro'}`}>{selected ? <><span className="eyebrow">Selected locality</span><h1>{selected.locality}</h1><p className="subtle">{selected.pincode} | {selected.district}</p><div className="stat-grid"><div className="stat"><strong>{selectedApartments.length}</strong><span>Apartments</span></div><div className="stat"><strong>{adjacent.length}</strong><span>Within 3.5 km</span></div></div><h2>Apartments</h2>{selectedApartments.length ? selectedApartments.map((apartment) => <button className="item" onClick={() => chooseApartment(apartment)} key={apartment.id}>{apartment.name}</button>) : <p className="subtle">No sample apartments in this locality.</p>}<h2>Adjacent localities</h2><div className="adjacent">{adjacent.length ? adjacent.map((locality) => <button className="chip" key={locality.id} onClick={() => chooseLocality(locality)}>{locality.locality}</button>) : <span className="subtle">None in the 3.5 km radius.</span>}</div></> : <><span className="eyebrow">Bangalore sourcing map</span><h1>Plan field visits. Validate commute.</h1><p className="subtle">Select a locality, search an apartment, or open DayRoute to see a helper&apos;s schedule and travel distance.</p><div className="stat-grid"><div className="stat"><strong>15</strong><span>Localities</span></div><div className="stat"><strong>20</strong><span>Apartments</span></div></div></>}</aside>
      <div className="map-wrap"><GeoMap selected={selected} focusedApartment={focusedApartment} adjacent={adjacent} onSelect={chooseLocality} activeTransit={active} pois={pois} />{status && <div className="status" role="status">{status}</div>}<div className="legend"><div><i className="dot" style={{ background: '#1e3a5f' }} />Locality</div><div><i className="dot" style={{ background: '#2563eb' }} />Selected</div><div><i className="dot" style={{ background: '#ea580c' }} />Adjacent</div></div></div>
    </section>
    {showDayRoute && <><button className="dayroute-backdrop" aria-label="Close DayRoute" onClick={() => setShowDayRoute(false)} /><DayRoute onClose={() => setShowDayRoute(false)} onSelectLocality={chooseLocality} /></>}
  </main>;
}
