// Konfigurasi bisnis — GANTI nilai di bawah sesuai usaha Anda.

/** Nama bisnis / brand supplier. */
export const NAMA_BISNIS = "Ruko Sumber Dapur Ponorogo";

/** Tagline singkat. */
export const TAGLINE = "Supplier bahan dapur MBG — sayur, buah, protein, sembako. Buka 24 jam.";

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
