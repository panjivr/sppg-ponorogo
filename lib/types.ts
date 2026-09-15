/** Status operasional SPPG — mengikuti istilah database resmi Kab. Ponorogo. */
export type SppgStatus = "operasional" | "akan" | "berhenti" | "suspend";

export const STATUS_META: Record<
  SppgStatus,
  { label: string; short: string; color: string; icon: string; aktif: boolean }
> = {
  operasional: {
    label: "Operasional",
    short: "Aktif",
    color: "var(--st-good)",
    icon: "●",
    aktif: true,
  },
  akan: {
    label: "Akan operasional",
    short: "Akan",
    color: "var(--st-warning)",
    icon: "◒",
    aktif: false,
  },
  berhenti: {
    label: "Berhenti sementara",
    short: "Berhenti",
    color: "var(--st-serious)",
    icon: "◍",
    aktif: false,
  },
  suspend: {
    label: "Suspend",
    short: "Suspend",
    color: "var(--st-critical)",
    icon: "◼",
    aktif: false,
  },
};

export const STATUS_ORDER: SppgStatus[] = [
  "operasional",
  "akan",
  "berhenti",
  "suspend",
];

export interface Sppg {
  id: string;
  nama: string;
  kecamatan: string;
  desa?: string;
  alamat: string;
  status: SppgStatus;
  /** Jumlah penerima manfaat per hari (porsi/hari). */
  porsi: number;
  lat: number;
  lng: number;
  /** true bila koordinat masih perkiraan pusat kecamatan, bukan titik pasti. */
  perkiraan: boolean;
  /** Tautan Google Maps resmi dari database. */
  gmaps?: string;
  sumber?: string;
  /** true untuk titik yang ditambahkan pengguna (tersimpan lokal). */
  buatanUser?: boolean;
}

export interface CandidateRuko {
  id: string;
  nama: string;
  lat: number;
  lng: number;
  catatan: string;
  /** Radius layanan/antar dalam kilometer. */
  radiusKm: number;
  buka24Jam: boolean;
  /** Estimasi biaya sewa per bulan (Rupiah) — untuk hitung kelayakan. */
  sewaBulanan: number;
  createdAt: number;
}

export interface ProdukItem {
  nama: string;
  satuan: string;
  /** Harga satuan dalam Rupiah. Angka, bukan teks, agar total bisa dihitung. */
  harga: number;
}

export interface Produk {
  kategori: string;
  emoji: string;
  items: ProdukItem[];
}

export interface CartItem extends ProdukItem {
  qty: number;
}
