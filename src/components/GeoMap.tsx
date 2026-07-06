'use client';
import { useEffect, useState } from 'react';
import L from 'leaflet';
import { Circle, CircleMarker, MapContainer, Marker, Popup, TileLayer, Tooltip, useMap } from 'react-leaflet';
import { apartments, localities } from '@/lib/data';
import { haversineKm } from '@/lib/geo';
import type { Apartment, Locality, TransitPoi, TransitType } from '@/lib/types';

const bounds: L.LatLngBoundsExpression = [[12.7, 77.2], [13.35, 77.9]];
const colors: Record<TransitType, string> = { metro: '#7c3aed', bus: '#16a34a', railway: '#dc2626', taxi: '#d97706' };

function icon(color: string) {
  return L.divIcon({ className: '', html: `<span style="display:block;width:14px;height:14px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${color};border:2px solid white;box-shadow:0 2px 5px #0005"></span>`, iconSize: [18, 18], iconAnchor: [7, 14] });
}

function localityRadiusMeters(locality: Locality) {
  const localityApartments = apartments.filter((item) => item.locality === locality.locality);
  const farthestKm = localityApartments.reduce((maximum, item) => Math.max(maximum, haversineKm(locality.rep_lat, locality.rep_lon, item.lat, item.lon)), 0);
  return Math.max(1.2, farthestKm + 0.6) * 1000;
}

function Controller({ selected, apartment }: { selected: Locality | null; apartment: Apartment | null }) {
  const map = useMap();
  useEffect(() => {
    if (apartment) map.flyTo([apartment.lat, apartment.lon], 16, { duration: .7 });
    else if (selected) map.fitBounds(L.latLng(selected.rep_lat, selected.rep_lon).toBounds(localityRadiusMeters(selected) * 2), { padding: [36, 36], maxZoom: 14 });
    else map.fitBounds(bounds, { padding: [18, 18] });
  }, [map, selected, apartment]);
  return null;
}

function ZoomLabels() {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());
  useEffect(() => { const update = () => setZoom(map.getZoom()); map.on('zoomend', update); return () => { map.off('zoomend', update); }; }, [map]);
  return <>{zoom >= 13 && localities.map((locality) => <Marker key={locality.id} position={[locality.rep_lat, locality.rep_lon]} interactive={false} icon={L.divIcon({ className: '', html: `<span class="pincode-label">${locality.locality} - ${locality.pincode}</span>`, iconAnchor: [45, -12] })} />)}{zoom >= 16 && apartments.map((apartment) => <Marker key={apartment.id} position={[apartment.lat, apartment.lon]} icon={icon('#0f766e')}><Popup><strong>{apartment.name}</strong><br />{apartment.locality}</Popup></Marker>)}</>;
}

export default function GeoMap({ selected, focusedApartment, adjacent, onSelect, activeTransit, pois }: { selected: Locality | null; focusedApartment: Apartment | null; adjacent: Locality[]; onSelect: (locality: Locality) => void; activeTransit: Set<TransitType>; pois: Record<string, TransitPoi[]> }) {
  const adjacentIds = new Set(adjacent.map((item) => item.id));
  return <MapContainer bounds={bounds} zoomControl preferCanvas>
    <TileLayer attribution='&copy; OpenStreetMap contributors &copy; CARTO' url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
    <Controller selected={selected} apartment={focusedApartment} />
    {selected && <Circle center={[selected.rep_lat, selected.rep_lon]} radius={localityRadiusMeters(selected)} pathOptions={{ color: '#1d4ed8', weight: 3, fillColor: '#3b82f6', fillOpacity: .13 }} eventHandlers={{ click: () => onSelect(selected) }}><Tooltip sticky><strong>{selected.locality} coverage</strong><br />Includes all {selected.apartment_count} listed apartments</Tooltip></Circle>}
    {localities.map((locality) => { const isSelected = locality.id === selected?.id; const isAdjacent = adjacentIds.has(locality.id); return <CircleMarker key={locality.id} center={[locality.rep_lat, locality.rep_lon]} radius={isSelected ? 10 : isAdjacent ? 10 : 8} pathOptions={{ color: isSelected ? '#1d4ed8' : isAdjacent ? '#ea580c' : '#1e3a5f', weight: isSelected ? 4 : isAdjacent ? 3 : 2, fillColor: isSelected ? '#3b82f6' : '#1e3a5f', fillOpacity: isAdjacent ? .12 : .78 }} eventHandlers={{ click: () => onSelect(locality) }}><Tooltip direction="top"><strong>{locality.locality}</strong><br />{locality.pincode} - {locality.apartment_count} apartments</Tooltip></CircleMarker>; })}
    {Array.from(activeTransit).flatMap((type) => (pois[type] ?? []).map((poi) => <Marker key={poi.id} position={[poi.lat, poi.lon]} icon={icon(colors[type])}><Popup><strong>{poi.name}</strong><br />{type}{selected && <><br />{haversineKm(selected.rep_lat, selected.rep_lon, poi.lat, poi.lon).toFixed(1)} km from {selected.locality}</>}</Popup></Marker>))}
    <ZoomLabels />
  </MapContainer>;
}
