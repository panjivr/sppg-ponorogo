// ============================================================
// Konfigurasi bisnis & asumsi ekonomi.
// GANTI nilai di bawah sesuai usaha Anda — semua angka di web
// (ukuran pasar, potensi omzet, kelayakan ruko) dihitung dari sini.
// ============================================================

/** Nama bisnis / brand supplier. */
export const NAMA_BISNIS = "Ruko Sumber Dapur Ponorogo";

/** Tagline singkat. */
export const TAGLINE =
  "Supplier bahan dapur MBG — sayur, buah, protein, sembako. Buka 24 jam.";

/**
 * Nomor WhatsApp untuk order, format internasional tanpa "+" atau "0" di depan.
 * Contoh untuk 0812-3456-7890 -> "6281234567890".
 * GANTI dengan nomor Anda.
 */
export const WA_NUMBER = "6281234567890";

/** Alamat/area layanan singkat untuk ditampilkan. */
export const AREA_LAYANAN = "Ponorogo & sekitarnya";

/** Bangun link WhatsApp dengan pesan awal. */
export function waLink(pesan: string): string {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(pesan)}`;
}

/** Bentuk objek dari nilai di atas — dipakai halaman analisis & landing. */
export const BISNIS = {
  nama: NAMA_BISNIS,
  tagline: TAGLINE,
  waNumber: WA_NUMBER,
  areaLayanan: AREA_LAYANAN,
};

/**
 * Asumsi ekonomi untuk menghitung ukuran pasar.
 * Angka ini transparan & bisa diaudit — lihat halaman /tentang.
 */
export const ASUMSI = {
  /** Anggaran bahan pangan per porsi MBG (Rupiah). */
  hargaPerPorsi: 10_000,
  /** Porsi belanja bahan yang realistis dilayani supplier. */
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
