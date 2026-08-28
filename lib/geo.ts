import type { Sppg } from "./types";

export interface LatLng {
  lat: number;
  lng: number;
}

const R = 6371; // radius bumi (km)

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Jarak haversine antara dua titik dalam kilometer. */
export function haversineKm(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Bobot tiap SPPG berdasarkan status (operasional paling berat). */
export function bobotStatus(s: Sppg): number {
  switch (s.status) {
    case "operasional":
      return 1;
    case "pembangunan":
      return 0.6;
    case "rencana":
      return 0.4;
    default:
      return 0.4;
  }
}

/** SPPG yang berada dalam radius (km) dari sebuah titik. */
export function sppgDalamRadius(
  titik: LatLng,
  daftar: Sppg[],
  radiusKm: number
): Sppg[] {
  return daftar.filter((s) => haversineKm(titik, s) <= radiusKm);
}

/**
 * Centroid berbobot dari sebaran SPPG.
 * Bobot = bobotStatus * (1 + porsi/porsiRef) agar dapur besar & operasional
 * lebih menarik titik ke arahnya.
 */
export function centroidBerbobot(daftar: Sppg[]): LatLng | null {
  if (daftar.length === 0) return null;
  const porsiRef = 1000;
  let sw = 0;
  let slat = 0;
  let slng = 0;
  for (const s of daftar) {
    const w = bobotStatus(s) * (1 + (s.porsi || 0) / porsiRef);
    sw += w;
    slat += s.lat * w;
    slng += s.lng * w;
  }
  if (sw === 0) return null;
  return { lat: slat / sw, lng: slng / sw };
}

export interface GridCell {
  lat: number;
  lng: number;
  /** Jumlah SPPG dalam radius dari pusat sel. */
  jumlah: number;
  /** Skor berbobot (status + porsi). */
  skor: number;
  totalPorsi: number;
}

/**
 * Skor grid: bagi bounding box sebaran SPPG jadi grid `steps x steps`,
 * hitung skor tiap sel = akumulasi bobot SPPG dalam `radiusKm`.
 * Mengembalikan sel-sel terurut dari skor tertinggi.
 */
export function skorGrid(
  daftar: Sppg[],
  radiusKm: number,
  steps = 24
): GridCell[] {
  if (daftar.length === 0) return [];
  const lats = daftar.map((s) => s.lat);
  const lngs = daftar.map((s) => s.lng);
  // beri sedikit padding di sekeliling sebaran
  const pad = 0.02;
  const minLat = Math.min(...lats) - pad;
  const maxLat = Math.max(...lats) + pad;
  const minLng = Math.min(...lngs) - pad;
  const maxLng = Math.max(...lngs) + pad;

  const cells: GridCell[] = [];
  for (let i = 0; i <= steps; i++) {
    for (let j = 0; j <= steps; j++) {
      const lat = minLat + ((maxLat - minLat) * i) / steps;
      const lng = minLng + ((maxLng - minLng) * j) / steps;
      const titik = { lat, lng };
      let jumlah = 0;
      let skor = 0;
      let totalPorsi = 0;
      for (const s of daftar) {
        if (haversineKm(titik, s) <= radiusKm) {
          jumlah += 1;
          skor += bobotStatus(s) * (1 + (s.porsi || 0) / 1000);
          totalPorsi += s.porsi || 0;
        }
      }
      if (jumlah > 0) cells.push({ lat, lng, jumlah, skor, totalPorsi });
    }
  }
  cells.sort((a, b) => b.skor - a.skor);
  return cells;
}
