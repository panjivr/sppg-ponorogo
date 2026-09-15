// ============================================================
// Konfigurasi bisnis & asumsi ekonomi.
// GANTI nilai di bawah sesuai usaha Anda — semua angka di web
// (TAM, potensi omzet, kelayakan ruko) dihitung dari sini.
// ============================================================

export const BISNIS = {
  nama: "Sumber Dapur Ponorogo",
  tagline: "Supplier bahan dapur untuk dapur MBG — buka 24 jam.",
  /** Nomor WhatsApp, format internasional tanpa "+" atau "0". */
  waNumber: "6281234567890",
  areaLayanan: "Kabupaten Ponorogo & sekitarnya",
  email: "",
};

/**
 * Asumsi ekonomi untuk menghitung ukuran pasar.
 * Angka ini transparan & bisa diaudit — lihat halaman /tentang.
 */
export const ASUMSI = {
  /** Anggaran bahan pangan per porsi MBG (Rupiah). */
  hargaPerPorsi: 10_000,
  /** Porsi belanja bahan yang realistis dilayani supplier (sayur/buah/protein/sembako). */
  porsiBelanjaBahan: 0.6,
  /** Hari operasional sekolah per tahun. */
  hariPerTahun: 260,
  /** Target pangsa pasar yang ingin direbut (untuk proyeksi). */
  targetPangsaPasar: 0.02,
  /** Margin kotor khas usaha distribusi bahan pangan. */
  marginKotor: 0.12,
};

/** Situs — dipakai untuk SEO (sitemap, canonical, Open Graph). */
export const SITE = {
  url: "https://sppg-ponorogo-web-mr-ps-projects-8da5766a.vercel.app",
  nama: "Peta SPPG Ponorogo",
  deskripsi:
    "Peta dan basis data 85 dapur SPPG program Makan Bergizi Gratis (MBG) di Kabupaten Ponorogo — untuk analisis lokasi ruko supplier bahan pangan.",
};

/** Bangun tautan WhatsApp dengan pesan awal. */
export function waLink(pesan: string): string {
  return `https://wa.me/${BISNIS.waNumber}?text=${encodeURIComponent(pesan)}`;
}
