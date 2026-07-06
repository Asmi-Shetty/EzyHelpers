'use client';
import { localities } from '@/lib/data';
import { haversineKm } from '@/lib/geo';
import type { Locality } from '@/lib/types';

type Props = { onClose: () => void; onSelectLocality: (locality: Locality) => void };
const sarjapur = localities.find((item) => item.locality === 'Sarjapur Road')!;
const bellandur = localities.find((item) => item.locality === 'Bellandur')!;
const distanceKm = haversineKm(sarjapur.rep_lat, sarjapur.rep_lon, bellandur.rep_lat, bellandur.rep_lon);
const schedule = [
  { time: '8:00 - 9:00', duration: '1 hr', type: 'duty', title: 'Morning duty', place: 'Sarjapur Road' },
  { time: '9:00 - 10:00', duration: '1 hr', type: 'travel', title: 'Travel / buffer', place: 'Sarjapur Road to Bellandur' },
  { time: '10:00 - 10:30', duration: '30 min', type: 'available', title: 'Available', place: 'Near Bellandur' },
  { time: '10:30 - 12:00', duration: '1.5 hr', type: 'duty', title: 'Next duty', place: 'Bellandur' },
] as const;

export default function DayRoute({ onClose, onSelectLocality }: Props) {
  return <section className="dayroute" role="dialog" aria-modal="true" aria-labelledby="dayroute-title">
    <div className="dayroute-head"><div><span className="eyebrow">Helper schedule</span><h2 id="dayroute-title">DayRoute</h2></div><button className="dayroute-close" onClick={onClose}>Close</button></div>
    <p className="subtle">Your duties, travel buffers and free time in one simple route.</p>
    <div className="route-summary"><div><small>Next journey</small><strong>Sarjapur Road to Bellandur</strong></div><div className="distance"><strong>{distanceKm.toFixed(1)} km</strong><small>centroid distance</small></div></div>
    <ol className="timeline">{schedule.map((entry) => <li className={`timeline-entry ${entry.type}`} key={entry.time}><div className="timeline-time"><strong>{entry.time}</strong><span>{entry.duration}</span></div><div className="timeline-card"><span className="timeline-type">{entry.type}</span><strong>{entry.title}</strong><span>{entry.place}</span>{entry.type === 'travel' && <span className="travel-distance">Approx. {distanceKm.toFixed(1)} km between localities</span>}</div></li>)}</ol>
    <div className="route-actions"><button onClick={() => { onSelectLocality(sarjapur); onClose(); }}>View Sarjapur</button><button onClick={() => { onSelectLocality(bellandur); onClose(); }}>View Bellandur</button></div>
    <p className="distance-note">Distance uses locality centroids and is indicative, not road-routing distance.</p>
  </section>;
}
