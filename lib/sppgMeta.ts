import type { Sppg, SppgStatus, SppgPerijinan } from "./types";

export interface StatusMeta {
  label: string;
  color: string;
  /** kelas Tailwind untuk pill/badge. */
  badge: string;
}

export const STATUS_META: Record<SppgStatus, StatusMeta> = {
  operasional: {
    label: "Operasional",
    color: "#16a34a",
    badge: "bg-green-100 text-green-800 ring-green-600/20",
  },
  akan: {
    label: "Akan operasional",
    color: "#f59e0b",
    badge: "bg-amber-100 text-amber-800 ring-amber-600/20",
  },
  berhenti: {
    label: "Berhenti sementara",
    color: "#94a3b8",
    badge: "bg-slate-200 text-slate-700 ring-slate-500/20",
  },
  suspend: {
    label: "Suspend",
    color: "#ef4444",
    badge: "bg-red-100 text-red-800 ring-red-600/20",
  },
};

export function statusMeta(status: SppgStatus): StatusMeta {
  return STATUS_META[status] ?? STATUS_META.operasional;
}

/** Format angka ala Indonesia (1.234). */
export function fmt(n: number | undefined | null): string {
  if (n == null) return "–";
  return n.toLocaleString("id-ID");
}

/** Format tanggal ISO → "6 Apr 2026". */
export function fmtTanggal(iso?: string): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Total penerima manfaat harian sebuah dapur. */
export function totalPM(s: Sppg): number {
  return s.porsi || 0;
}

/**
 * Hitung ulang total turunan dari rincian PM:
 * SATDIK = siswa + guru/tendik, 3B = balita + bumil + busui, porsi = SATDIK + 3B.
 * Dipakai admin agar "jumlah data" selalu konsisten saat diedit.
 */
export function recalcPM(pm: {
  pmSiswa?: number;
  pmGuruTendik?: number;
  pmSatdikKelompok?: number;
  pmBalita?: number;
  pmBumil?: number;
  pmBusui?: number;
  pm3bKelompok?: number;
}): { pmSatdikTotal: number; pm3bTotal: number; porsi: number } {
  const satdik = (pm.pmSiswa || 0) + (pm.pmGuruTendik || 0);
  const b3 = (pm.pmBalita || 0) + (pm.pmBumil || 0) + (pm.pmBusui || 0);
  return { pmSatdikTotal: satdik, pm3bTotal: b3, porsi: satdik + b3 };
}

/** Ubah nomor telepon jadi tautan wa.me (0812… → 62812…). */
export function waLink(nomor?: string): string | null {
  if (!nomor) return null;
  const digits = nomor.replace(/[^0-9]/g, "");
  if (!digits) return null;
  const intl = digits.startsWith("0") ? "62" + digits.slice(1) : digits;
  return `https://wa.me/${intl}`;
}

/** Agregat statistik untuk seluruh daftar SPPG. */
export interface SppgStats {
  total: number;
  operasional: number;
  akan: number;
  berhenti: number;
  suspend: number;
  kecamatan: number;
  totalPM: number;
  satdik: number;
  siswa: number;
  guruTendik: number;
  pm3b: number;
  balita: number;
  bumil: number;
  busui: number;
}

export function computeStats(list: Sppg[]): SppgStats {
  const s: SppgStats = {
    total: list.length,
    operasional: 0,
    akan: 0,
    berhenti: 0,
    suspend: 0,
    kecamatan: new Set(list.map((x) => x.kecamatan)).size,
    totalPM: 0,
    satdik: 0,
    siswa: 0,
    guruTendik: 0,
    pm3b: 0,
    balita: 0,
    bumil: 0,
    busui: 0,
  };
  for (const x of list) {
    if (x.status === "operasional") s.operasional++;
    else if (x.status === "akan") s.akan++;
    else if (x.status === "berhenti") s.berhenti++;
    else if (x.status === "suspend") s.suspend++;
    s.totalPM += x.porsi || 0;
    const pm = x.pm;
    if (pm) {
      s.satdik += pm.pmSatdikTotal || 0;
      s.siswa += pm.pmSiswa || 0;
      s.guruTendik += pm.pmGuruTendik || 0;
      s.pm3b += pm.pm3bTotal || 0;
      s.balita += pm.pmBalita || 0;
      s.bumil += pm.pmBumil || 0;
      s.busui += pm.pmBusui || 0;
    }
  }
  return s;
}

// ── Perizinan / sertifikasi ────────────────────────────────────────────────

export interface IzinItem {
  /** kunci status di SppgPerijinan */
  key: keyof SppgPerijinan;
  label: string;
  /** kunci nomor sertifikat (opsional) */
  noKey?: keyof SppgPerijinan;
}

/** Daftar item perizinan yang ditampilkan, berurutan. */
export const PERIJINAN_ITEMS: IzinItem[] = [
  { key: "suratKesanggupan", label: "Surat Kesanggupan" },
  { key: "pkkpr", label: "PKKPR" },
  { key: "dokLingkungan", label: "Dokumen Lingkungan" },
  { key: "pbgSlf", label: "PBG / SLF" },
  { key: "sertifikatStandar", label: "Sertifikat Standar" },
  { key: "slhs", label: "SLHS", noKey: "noSlhs" },
  { key: "sertiChef", label: "Sertifikat Chef", noKey: "noSertiChef" },
  { key: "halal", label: "Sertifikat Halal", noKey: "noSertiHalal" },
  { key: "haccp", label: "HACCP", noKey: "noSertiHaccp" },
  { key: "penjamahMakan", label: "Penjamah Makanan" },
  { key: "bpjs", label: "BPJS Ketenagakerjaan" },
];

export interface IzinStatusMeta {
  label: string;
  badge: string;
  dot: string;
  done: boolean;
}

/** Petakan teks status izin (SUDAH/PROSES/BELUM…) ke tampilan. */
export function statusIzin(v?: string): IzinStatusMeta {
  const t = (v ?? "").trim().toUpperCase();
  if (t === "SUDAH" || t === "ADA" || t === "SELESAI")
    return { label: "Sudah", badge: "bg-green-100 text-green-800", dot: "#16a34a", done: true };
  if (t === "PROSES" || t === "PENGAJUAN")
    return { label: "Proses", badge: "bg-amber-100 text-amber-800", dot: "#f59e0b", done: false };
  if (!t)
    return { label: "–", badge: "bg-slate-100 text-slate-400", dot: "#cbd5e1", done: false };
  return { label: "Belum", badge: "bg-slate-100 text-slate-500", dot: "#94a3b8", done: false };
}

/** Progres kelengkapan izin: jumlah "Sudah" dari total item yang punya data. */
export function perijinanProgress(p?: SppgPerijinan): { done: number; total: number } {
  if (!p) return { done: 0, total: PERIJINAN_ITEMS.length };
  let done = 0;
  for (const it of PERIJINAN_ITEMS) {
    if (statusIzin(p[it.key] as string | undefined).done) done++;
  }
  return { done, total: PERIJINAN_ITEMS.length };
}

// ── Jaringan yayasan (benang merah) ─────────────────────────────────────────

/** Palet warna distinct untuk jaringan yayasan (benang merah). */
export const YAYASAN_COLORS = [
  "#dc2626", "#2563eb", "#7c3aed", "#059669", "#d97706",
  "#db2777", "#0891b2", "#65a30d", "#e11d48", "#4f46e5",
  "#ca8a04", "#0d9488", "#9333ea", "#c2410c", "#0284c7",
  "#be123c", "#15803d", "#7e22ce",
];

export interface YayasanGroup {
  nama: string;
  color: string;
  items: Sppg[];
  totalPM: number;
}

/**
 * Kelompokkan dapur per yayasan; hanya yayasan dengan ≥2 dapur (punya "benang
 * merah"), diurutkan dari yang terbanyak, masing-masing diberi satu warna tetap.
 */
export function yayasanGroups(list: Sppg[]): YayasanGroup[] {
  const map = new Map<string, Sppg[]>();
  for (const s of list) {
    const y = s.detail?.yayasan?.trim();
    if (!y) continue;
    if (!map.has(y)) map.set(y, []);
    map.get(y)!.push(s);
  }
  const groups = Array.from(map.entries())
    .filter(([, v]) => v.length > 1)
    .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0], "id"));
  return groups.map(([nama, items], i) => ({
    nama,
    color: YAYASAN_COLORS[i % YAYASAN_COLORS.length],
    items,
    totalPM: items.reduce((a, s) => a + (s.porsi || 0), 0),
  }));
}

/** Peta nama yayasan → warna (hanya yayasan multi-dapur). */
export function yayasanColorMap(list: Sppg[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const g of yayasanGroups(list)) out[g.nama] = g.color;
  return out;
}

/**
 * Ekstrak koordinat dari URL/teks Google Maps yang ditempel.
 * Mendukung: "@lat,lng", "!3dlat!4dlng", "q=lat,lng", "ll=lat,lng",
 * dan "lat, lng" polos. Kembalikan null bila tak ditemukan.
 */
export function parseGmaps(input: string): { lat: number; lng: number } | null {
  const s = (input || "").trim();
  if (!s) return null;
  const pats = [
    /@(-?\d{1,3}\.\d+),(-?\d{1,3}\.\d+)/,
    /!3d(-?\d{1,3}\.\d+)!4d(-?\d{1,3}\.\d+)/,
    /[?&](?:q|ll|query|center)=(-?\d{1,3}\.\d+),\s*(-?\d{1,3}\.\d+)/,
    /^(-?\d{1,3}\.\d+),\s*(-?\d{1,3}\.\d+)$/,
  ];
  for (const p of pats) {
    const m = s.match(p);
    if (m) {
      const lat = parseFloat(m[1]);
      const lng = parseFloat(m[2]);
      if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
    }
  }
  return null;
}
