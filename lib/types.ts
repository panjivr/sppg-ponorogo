export type SppgStatus = "operasional" | "akan" | "berhenti" | "suspend";

export interface Sppg {
  id: string;
  nama: string;
  alamat: string;
  kecamatan: string;
  /** Desa/kelurahan lokasi SPPG. */
  desa?: string;
  lat: number;
  lng: number;
  status: SppgStatus;
  /** Estimasi porsi/hari (jumlah penerima manfaat) yang dilayani dapur ini. */
  porsi: number;
  /** true bila koordinat masih perkiraan (bukan titik pasti). */
  perkiraan: boolean;
  /** Tautan Google Maps ke lokasi persis. */
  gmaps?: string;
  sumber?: string;
  /** true untuk titik yang ditambahkan user lewat web (disimpan di localStorage). */
  buatanUser?: boolean;
}

export interface CandidateRuko {
  id: string;
  nama: string;
  lat: number;
  lng: number;
  catatan: string;
  /** Radius layanan/jangkauan dalam kilometer. */
  radiusKm: number;
  buka24Jam: boolean;
  createdAt: number;
}
