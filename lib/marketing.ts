import type { Sppg } from "./types";

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
  opts: { includeKa: boolean; includePic: boolean }
): Recipient[] {
  const out: Recipient[] = [];
  const seen = new Set<string>();
  for (const s of list) {
    const d = s.detail ?? {};
    const rows: [Peran, string | undefined, string | undefined][] = [];
    if (opts.includeKa) rows.push(["Ka SPPG", d.namaKa, d.nomorKa]);
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
  };
  return tpl.replace(/\{(\w+)\}/g, (m, k) => (k in map ? map[k] : m));
}

/** Tautan klik-untuk-chat WhatsApp dengan teks terisi. */
export function waSendLink(r: Recipient, tpl: string): string {
  return `https://wa.me/${r.nomor}?text=${encodeURIComponent(renderTemplate(tpl, r))}`;
}

export const DEFAULT_TEMPLATE =
  "Halo {contact} 🙏\n\nSaya dari [Nama Toko/Supplier Anda] — penyedia kebutuhan dapur (sayur, buah, telur, bumbu, sembako) untuk dapur SPPG/MBG.\n\nUntuk {nama} di Kec. {kecamatan} yang melayani ±{porsi} porsi/hari, kami siap suplai harian dengan harga bersaing, kualitas terjaga, dan bisa antar. Boleh saya kirimkan katalog & daftar harga?\n\nTerima kasih.";

/** Ekspor penerima ke CSV. */
export function toCsv(rows: Recipient[]): string {
  const head = ["nama_kontak", "peran", "nomor", "sppg", "kecamatan", "yayasan"];
  const esc = (v: string) => `"${(v ?? "").replace(/"/g, '""')}"`;
  const lines = rows.map((r) =>
    [r.contact, r.peran, r.nomor, r.sppg.nama, r.sppg.kecamatan, r.sppg.detail?.yayasan ?? ""]
      .map((x) => esc(String(x)))
      .join(",")
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
      ].join("\n")
    )
    .join("\n");
}
