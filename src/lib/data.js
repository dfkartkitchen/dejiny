import data from '../data/otazky.json';
import meta from '../data/obrazky-meta.json';
import videaMap from '../data/videa.json';

/** videa z Higgsfieldu – jen ta, která se při buildu opravdu stáhla */
export const videa = videaMap;
export const videoUrl = (key) => (videaMap[key] ? `${import.meta.env.BASE_URL.replace(/\/$/, '')}${videaMap[key]}` : null);

export const { epochy, otazky } = data;
export const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
export const url = (p) => `${BASE}${p}`;

export const epochaOf = (o) => epochy.find((e) => e.id === o.obdobi);
export const epochaIndex = (id) => epochy.findIndex((e) => e.id === id) + 1;
export const katCislo = (n) => String(n).padStart(2, '0');
export const plain = (segs) => segs.map((s) => s.t).join('');
export const imgMeta = (o) => meta[o.id] ?? {};
export const otazkaUrl = (o) => url(`/otazka/${o.slug}/`);

export function srcset(id, fmt) {
  return [640, 1280, 1920].map((w) => `${url(`/img/${id}-${w}.${fmt}`)} ${w}w`).join(', ');
}
export const fmtMin = (m) => m.toLocaleString('cs-CZ', { maximumFractionDigits: 1 });
