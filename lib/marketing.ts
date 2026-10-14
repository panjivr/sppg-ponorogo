import type { Sppg } from "./types";
import { BISNIS, SITE, WA_NUMBER } from "./config";
import { KATALOG } from "./catalog";

export type Peran = "Ka SPPG" | "PIC Yayasan";

export interface Recipient {
  /** id unik (sppgId + peran). */
  id: string;
  /** nomor ternormalisasi format internasional tanpa +, mis. 62812xxxx. */
  nomor: string;
  /** nomor asli seperti di data. */
  nomorAsli: string;
  /** nama orang yang dihubungi. */
  contact: string;
  peran: Peran;
  sppg: Sppg;
}

/** Normalkan nomor Indonesia → "62xxxxxxxx". Kembalikan null bila tak valid. */
export function normalizePhone(raw?: string): string | null {
  if (!raw) return null;
  let d = raw.replace(/[^0-9]/g, "");
  if (!d) return null;
  if (d.startsWith("620")) d = "62" + d.slice(3);
  else if (d.startsWith("0")) d = "62" + d.slice(1);
  else if (d.startsWith("8")) d = "62" + d;
  else if (!d.startsWith("62")) d = "62" + d;
  // panjang wajar nomor HP ID: 62 + 9..12 digit
  if (d.length < 11 || d.length > 15) return null;
  return d;
}

/** Susun daftar penerima dari data SPPG, dedup per nomor. */
export function buildRecipients(
  list: Sppg[],
  opts: { includeKa: boolean; includePic: boolean },
): Recipient[] {
  const out: Recipient[] = [];
  const seen = new Set<string>();
  for (const s of list) {
    const d = s.detail ?? {};
    const rows: [Peran, string | undefined, string | undefined][] = [];
    if (opts.includeKa && !d.kaContactNeedsVerification) rows.push(["Ka SPPG", d.namaKa, d.nomorKa]);
    if (opts.includePic) rows.push(["PIC Yayasan", d.picNama, d.picNomor]);
    for (const [peran, nama, nomor] of rows) {
      const norm = normalizePhone(nomor);
      if (!norm || seen.has(norm)) continue;
      seen.add(norm);
      out.push({
        id: `${s.id}::${peran}`,
        nomor: norm,
        nomorAsli: nomor ?? "",
        contact: nama || (peran === "Ka SPPG" ? "Bapak/Ibu" : "Bapak/Ibu"),
        peran,
        sppg: s,
      });
    }
  }
  return out;
}

/** Variabel yang bisa dipakai di template. */
export const TEMPLATE_VARS: { key: string; label: string }[] = [
  { key: "contact", label: "Nama kontak" },
  { key: "nama", label: "Nama SPPG" },
  { key: "kecamatan", label: "Kecamatan" },
  { key: "desa", label: "Desa" },
  { key: "yayasan", label: "Yayasan" },
  { key: "porsi", label: "Jumlah porsi/hari" },
  { key: "peran", label: "Peran kontak" },
  { key: "bisnis", label: "Nama bisnis" },
  { key: "alamat", label: "Alamat toko" },
  { key: "telepon", label: "Nomor WhatsApp toko" },
  { key: "wa_toko", label: "Tautan WhatsApp toko" },
  { key: "katalog", label: "Tautan katalog publik" },
  { key: "kategori", label: "Kategori produk" },
  { key: "layanan", label: "Area layanan" },
];

/** Ganti {var} di template dengan nilai dari penerima. */
export function renderTemplate(tpl: string, r: Recipient): string {
  const map: Record<string, string> = {
    contact: r.contact,
    nama: r.sppg.nama,
    kecamatan: r.sppg.kecamatan,
    desa: r.sppg.desa ?? r.sppg.kecamatan,
    yayasan: r.sppg.detail?.yayasan ?? "",
    porsi: (r.sppg.porsi || 0).toLocaleString("id-ID"),
    peran: r.peran,
    bisnis: BISNIS.nama,
    alamat: BISNIS.alamat,
    telepon: BISNIS.telepon,
    wa_toko: `https://wa.me/${WA_NUMBER}`,
    katalog: `${SITE.url}/supplier`,
    kategori: KATALOG.map(k => k.kategori).join(", "),
    layanan: BISNIS.areaLayanan,
  };
  return tpl.replace(/\{(\w+)\}/g, (m, k) => (k in map ? map[k] : m));
}

/** Tautan klik-untuk-chat WhatsApp dengan teks terisi. */
export function waSendLink(r: Recipient, tpl: string): string {
  return `https://wa.me/${r.nomor}?text=${encodeURIComponent(renderTemplate(tpl, r))}`;
}

export const LEGACY_DEFAULT_TEMPLATE = `Halo {contact},\n\nSaya dari ${BISNIS.nama}, supplier kebutuhan dapur di Ponorogo.\n\nBoleh saya bantu menyusun penawaran untuk kebutuhan {nama} di Kec. {kecamatan}? Kirim daftar bahan, jumlah, dan jadwal yang dibutuhkan; stok, harga, serta pengiriman akan dikonfirmasi terlebih dahulu.\n\nTerima kasih.`;

export const DEFAULT_TEMPLATE = `Halo {contact},

Kami dari {bisnis}, grosir dan supplier kebutuhan dapur untuk rumah, usaha, dan pengadaan di {layanan}.

Pilihan bahan kami: {kategori}. Melayani grosir dan eceran sesuai kebutuhan.

Boleh kami membantu menyiapkan penawaran untuk {nama} di Kec. {kecamatan}? Kirim daftar bahan, jumlah, dan jadwal kebutuhan. Stok, harga, kemasan, serta jadwal pengiriman akan dikonfirmasi saat pemesanan.

Katalog: {katalog}
Alamat: {alamat}
WhatsApp: {telepon}
{wa_toko}

Terima kasih,
{bisnis}`;

/** Upgrade the previous default; preserve customized drafts and their legacy backup. */
export function resolveSavedTemplate(current: string | null, legacy: string | null): string {
  if (current?.trim()) return current;
  if (!legacy?.trim() || legacy === LEGACY_DEFAULT_TEMPLATE) return DEFAULT_TEMPLATE;
  return legacy.replace(/Bumbu Pawon Mas Dhoo/gi, BISNIS.nama)
    .replace(/0822[ -]?3166[ -]?7384/g, BISNIS.telepon)
    .replace(/sppg-ponorogo-web-mr-ps-projects-8da5766a\.vercel\.app/g, new URL(SITE.url).host);
}

/** Ekspor penerima ke CSV. */
export function toCsv(rows: Recipient[]): string {
  const head = [
    "nama_kontak",
    "peran",
    "nomor",
    "sppg",
    "kecamatan",
    "yayasan",
  ];
  const esc = (v: string) => `"${(v ?? "").replace(/"/g, '""')}"`;
  const lines = rows.map((r) =>
    [
      r.contact,
      r.peran,
      r.nomor,
      r.sppg.nama,
      r.sppg.kecamatan,
      r.sppg.detail?.yayasan ?? "",
    ]
      .map((x) => esc(String(x)))
      .join(","),
  );
  return [head.join(","), ...lines].join("\n");
}

/** Ekspor penerima ke vCard (untuk impor kontak HP). */
export function toVcard(rows: Recipient[]): string {
  return rows
    .map((r) =>
      [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `N:;${r.contact};;;`,
        `FN:${r.contact} (${r.sppg.nama})`,
        `TEL;TYPE=CELL:+${r.nomor}`,
        `NOTE:${r.peran} — ${r.sppg.kecamatan}`,
        "END:VCARD",
      ].join("\n"),
    )
    .join("\n");
}
