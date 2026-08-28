export type SppgStatus = "operasional" | "pembangunan" | "rencana";

export interface Sppg {
  id: string;
  nama: string;
  alamat: string;
  kecamatan: string;
  lat: number;
  lng: number;
  status: SppgStatus;
  /** Estimasi porsi/hari yang diproduksi dapur ini (0 jika tidak diketahui). */
  porsi: number;
  /** true bila koordinat masih perkiraan (bukan titik pasti). */
  perkiraan: boolean;
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
