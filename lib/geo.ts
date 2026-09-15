import type { Sppg } from "./types";

export interface LatLng {
  lat: number;
  lng: number;
}

const R = 6371; // radius bumi (km)
const toRad = (d: number) => (d * Math.PI) / 180;

/** Jarak garis lurus (haversine) antara dua titik, dalam kilometer. */
export function haversineKm(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * Jarak tempuh perkiraan. Jalan tidak lurus, jadi jarak garis lurus
 * dikalikan faktor belok (detour factor) ~1,35 untuk jalan kabupaten.
 */
export const FAKTOR_JALAN = 1.35;
export function jarakTempuhKm(a: LatLng, b: LatLng): number {
  return haversineKm(a, b) * FAKTOR_JALAN;
}

/**
 * Bobot relevansi per status: dapur yang sudah jalan bernilai penuh,
 * yang belum/berhenti bernilai lebih rendah karena belum menghasilkan order.
 */
export function bobotStatus(s: Pick<Sppg, "status">): number {
  switch (s.status) {
    case "operasional":
      return 1;
    case "akan":
      return 0.5;
    case "berhenti":
      return 0.2;
    case "suspend":
      return 0.2;
    default:
      return 0.3;
  }
}

export function sppgDalamRadius(
  titik: LatLng,
  daftar: Sppg[],
  radiusKm: number
): Sppg[] {
  return daftar.filter((s) => haversineKm(titik, s) <= radiusKm);
}

/** Daftar SPPG diurutkan dari yang terdekat, lengkap dengan jaraknya. */
export function urutTerdekat(
  titik: LatLng,
  daftar: Sppg[]
): { sppg: Sppg; km: number }[] {
  return daftar
    .map((sppg) => ({ sppg, km: haversineKm(titik, sppg) }))
    .sort((a, b) => a.km - b.km);
}

/** Titik pusat gravitasi permintaan (dibobot status & jumlah porsi). */
export function centroidBerbobot(daftar: Sppg[]): LatLng | null {
  if (!daftar.length) return null;
  let sw = 0,
    slat = 0,
    slng = 0;
  for (const s of daftar) {
    const w = bobotStatus(s) * (1 + (s.porsi || 0) / 1000);
    sw += w;
    slat += s.lat * w;
    slng += s.lng * w;
  }
  return sw ? { lat: slat / sw, lng: slng / sw } : null;
}

export interface GridCell extends LatLng {
  jumlah: number;
  skor: number;
  totalPorsi: number;
}

/**
 * Skor grid: bagi wilayah jadi kisi, lalu nilai tiap sel dari jumlah &
 * besarnya dapur yang bisa dijangkau dalam radius tertentu. Sel dengan
 * skor tertinggi = kandidat lokasi ruko terbaik.
 */
export function skorGrid(
  daftar: Sppg[],
  radiusKm: number,
  steps = 28
): GridCell[] {
  if (!daftar.length) return [];
  const lats = daftar.map((s) => s.lat);
  const lngs = daftar.map((s) => s.lng);
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
      let jumlah = 0,
        skor = 0,
        totalPorsi = 0;
      for (const s of daftar) {
        if (haversineKm({ lat, lng }, s) <= radiusKm) {
          jumlah++;
          skor += bobotStatus(s) * (1 + (s.porsi || 0) / 1000);
          totalPorsi += s.porsi || 0;
        }
      }
      if (jumlah > 0) cells.push({ lat, lng, jumlah, skor, totalPorsi });
    }
  }
  return cells.sort((a, b) => b.skor - a.skor);
}

/**
 * Ambil kandidat terbaik yang saling berjarak, supaya tidak menampilkan
 * 3 titik yang praktis menumpuk di lokasi yang sama.
 */
export function kandidatTersebar(
  cells: GridCell[],
  jumlah: number,
  minJarakKm: number
): GridCell[] {
  const out: GridCell[] = [];
  for (const c of cells) {
    if (out.length >= jumlah) break;
    if (out.every((o) => haversineKm(o, c) >= minJarakKm)) out.push(c);
  }
  return out;
}
