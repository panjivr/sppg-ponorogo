export type SppgStatus = "operasional" | "akan" | "berhenti" | "suspend";

/** Rincian penerima manfaat (PM) per dapur, dari database resmi. */
export interface SppgPM {
  /** PM satuan pendidikan (sekolah): total. */
  pmSatdikTotal?: number;
  /** PM siswa. */
  pmSiswa?: number;
  /** PM guru & tenaga kependidikan. */
  pmGuruTendik?: number;
  /** Jumlah kelompok PM satuan pendidikan. */
  pmSatdikKelompok?: number;
  /** PM 3B (Balita, Bumil, Busui): total. */
  pm3bTotal?: number;
  /** PM ibu menyusui (busui). */
  pmBusui?: number;
  /** PM ibu hamil (bumil). */
  pmBumil?: number;
  /** PM balita. */
  pmBalita?: number;
  /** Jumlah kelompok PM 3B. */
  pm3bKelompok?: number;
}

/** Status & nomor perizinan/sertifikasi dapur (dari DATA PERIJINAN). */
export interface SppgPerijinan {
  suratKesanggupan?: string;
  pkkpr?: string;
  dokLingkungan?: string;
  pbgSlf?: string;
  sertifikatStandar?: string;
  slhs?: string;
  noSlhs?: string;
  dokPerijinan?: string;
  sertiChef?: string;
  noSertiChef?: string;
  halal?: string;
  noSertiHalal?: string;
  haccp?: string;
  noSertiHaccp?: string;
  penjamahMakan?: string;
  bpjs?: string;
  dokKelengkapan?: string;
}

/** Rincian administratif/kontak dapur, dari database resmi SPPG Ponorogo. */
export interface SppgDetail {
  /** ID resmi SPPG (kode SIBRD). */
  idSppg?: string;
  /** Jenis SPPG: MITRA / POLRI / TNI AD / PONPES / 3T, dll. */
  jenis?: string;
  /** Nama kepala SPPG. */
  namaKa?: string;
  /** Nomor kontak kepala SPPG. */
  nomorKa?: string;
  /** Label status asli dari database (mis. "BERHENTI OPS SEMENTARA"). */
  statusLabel?: string;
  /** Tanggal mulai operasional (ISO). */
  tglOperasional?: string;
  /** Target tanggal operasional untuk dapur yang belum operasional. */
  tglTarget?: string;
  /** Nama yayasan pengelola. */
  yayasan?: string;
  /** Bank penyedia Virtual Account. */
  bankVa?: string;
  /** Nama PIC yayasan. */
  picNama?: string;
  /** Nomor kontak PIC yayasan. */
  picNomor?: string;
  /** true bila SLHS (Sertifikat Laik Higiene Sanitasi) sudah terbit. */
  slhs?: boolean;
  /** Status & nomor perizinan/sertifikasi lengkap. */
  perijinan?: SppgPerijinan;
}

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
  /** Rincian penerima manfaat (siswa, guru, balita, bumil, busui). */
  pm?: SppgPM;
  /** Rincian administratif & kontak dapur. */
  detail?: SppgDetail;
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
