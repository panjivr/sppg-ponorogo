import type { Sppg, SppgStatus } from "./types";

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
