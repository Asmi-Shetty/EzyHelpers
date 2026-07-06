import type { Locality } from './types';
export const ADJACENCY_KM=3.5;
export function haversineKm(lat1:number,lon1:number,lat2:number,lon2:number){const R=6371;const dLat=(lat2-lat1)*Math.PI/180;const dLon=(lon2-lon1)*Math.PI/180;const a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;return R*2*Math.asin(Math.sqrt(a));}
export function adjacentTo(selected:Locality,all:Locality[],threshold=ADJACENCY_KM){return all.filter(l=>l.id!==selected.id&&haversineKm(selected.rep_lat,selected.rep_lon,l.rep_lat,l.rep_lon)<=threshold);}
