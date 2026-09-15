import seed from "@/data/sppg.json";
import { ASUMSI } from "./config";
import type { Sppg, SppgStatus } from "./types";
import { STATUS_ORDER } from "./sppgMeta";

/** Data dasar dari database resmi (statis, tidak berubah saat runtime). */
export const SPPG_SEED = seed as Sppg[];

/* ------------------------------------------------------------
   Agregasi
   ------------------------------------------------------------ */

export interface RingkasanStatus {
  status: SppgStatus;
  jumlah: number;
  porsi: number;
}

export function ringkasStatus(list: Sppg[]): RingkasanStatus[] {
  return STATUS_ORDER.map((status) => {
    const rows = list.filter((s) => s.status === status);
    return {
      status,
      jumlah: rows.length,
      porsi: rows.reduce((a, s) => a + (s.porsi || 0), 0),
    };
  });
}

export interface RingkasanKecamatan {
  kecamatan: string;
  jumlah: number;
  operasional: number;
  porsi: number;
}

export function ringkasKecamatan(list: Sppg[]): RingkasanKecamatan[] {
  const map = new Map<string, RingkasanKecamatan>();
  for (const s of list) {
    const k = s.kecamatan || "Lainnya";
    const cur =
      map.get(k) ?? { kecamatan: k, jumlah: 0, operasional: 0, porsi: 0 };
    cur.jumlah++;
    if (s.status === "operasional") cur.operasional++;
    cur.porsi += s.porsi || 0;
    map.set(k, cur);
  }
  return [...map.values()].sort((a, b) => b.porsi - a.porsi);
}

export function daftarKecamatan(list: Sppg[]): string[] {
  return [...new Set(list.map((s) => s.kecamatan))].sort((a, b) =>
    a.localeCompare(b, "id")
  );
}

/* ------------------------------------------------------------
   Ukuran pasar (TAM) — semua dari ASUMSI agar bisa diaudit
   ------------------------------------------------------------ */

export interface UkuranPasar {
  porsiHarian: number;
  belanjaHarian: number;
  belanjaTahunan: number;
  /** Bagian belanja yang realistis dilayani supplier bahan. */
  pasarBahanTahunan: number;
  /** Proyeksi omzet pada target pangsa pasar. */
  proyeksiOmzet: number;
}

export function hitungPasar(list: Sppg[]): UkuranPasar {
  // Hanya dapur yang benar-benar beroperasi menghasilkan order hari ini.
  const porsiHarian = list
    .filter((s) => s.status === "operasional")
    .reduce((a, s) => a + (s.porsi || 0), 0);

  const belanjaHarian = porsiHarian * ASUMSI.hargaPerPorsi;
  const belanjaTahunan = belanjaHarian * ASUMSI.hariPerTahun;
  const pasarBahanTahunan = belanjaTahunan * ASUMSI.porsiBelanjaBahan;

  return {
    porsiHarian,
    belanjaHarian,
    belanjaTahunan,
    pasarBahanTahunan,
    proyeksiOmzet: pasarBahanTahunan * ASUMSI.targetPangsaPasar,
  };
}

/** Nilai belanja bahan per tahun dari sekumpulan dapur (mis. dalam radius ruko). */
export function nilaiBahanTahunan(porsiHarian: number): number {
  return (
    porsiHarian *
    ASUMSI.hargaPerPorsi *
    ASUMSI.hariPerTahun *
    ASUMSI.porsiBelanjaBahan
  );
}

/* ------------------------------------------------------------
   Pencarian & filter
   ------------------------------------------------------------ */

export interface Filter {
  q: string;
  kecamatan: string; // "" = semua
  status: SppgStatus | "";
  hanyaPastiKoordinat: boolean;
}

export const FILTER_KOSONG: Filter = {
  q: "",
  kecamatan: "",
  status: "",
  hanyaPastiKoordinat: false,
};

export function terapkanFilter(list: Sppg[], f: Filter): Sppg[] {
  const q = f.q.trim().toLowerCase();
  return list.filter((s) => {
    if (f.kecamatan && s.kecamatan !== f.kecamatan) return false;
    if (f.status && s.status !== f.status) return false;
    if (f.hanyaPastiKoordinat && s.perkiraan) return false;
    if (!q) return true;
    return (
      s.nama.toLowerCase().includes(q) ||
      s.kecamatan.toLowerCase().includes(q) ||
      (s.desa ?? "").toLowerCase().includes(q) ||
      s.alamat.toLowerCase().includes(q)
    );
  });
}

/* ------------------------------------------------------------
   Ekspor data
   ------------------------------------------------------------ */

const KOLOM: { key: keyof Sppg | "statusLabel"; judul: string }[] = [
  { key: "nama", judul: "Nama SPPG" },
  { key: "kecamatan", judul: "Kecamatan" },
  { key: "desa", judul: "Desa" },
  { key: "status", judul: "Status" },
  { key: "porsi", judul: "Penerima Manfaat" },
  { key: "alamat", judul: "Alamat" },
  { key: "lat", judul: "Latitude" },
  { key: "lng", judul: "Longitude" },
  { key: "perkiraan", judul: "Koordinat Perkiraan" },
  { key: "gmaps", judul: "Link Google Maps" },
];

export function keCsv(list: Sppg[]): string {
  const esc = (v: unknown) => {
    const s = v === undefined || v === null ? "" : String(v);
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const head = KOLOM.map((c) => esc(c.judul)).join(",");
  const rows = list.map((s) =>
    KOLOM.map((c) => {
      if (c.key === "perkiraan") return esc(s.perkiraan ? "ya" : "tidak");
      return esc(s[c.key as keyof Sppg]);
    }).join(",")
  );
  // BOM supaya Excel membaca UTF-8 dengan benar
  return "﻿" + [head, ...rows].join("\r\n");
}

export function keGeoJson(list: Sppg[]): string {
  return JSON.stringify(
    {
      type: "FeatureCollection",
      features: list.map((s) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [s.lng, s.lat] },
        properties: {
          id: s.id,
          nama: s.nama,
          kecamatan: s.kecamatan,
          desa: s.desa ?? "",
          status: s.status,
          penerima_manfaat: s.porsi,
          alamat: s.alamat,
          koordinat_perkiraan: s.perkiraan,
          gmaps: s.gmaps ?? "",
          sumber: s.sumber ?? "",
        },
      })),
    },
    null,
    2
  );
}

/** Unduh string sebagai berkas di sisi klien. */
export function unduh(namaFile: string, isi: string, mime: string): void {
  const blob = new Blob([isi], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = namaFile;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
