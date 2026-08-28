import seed from "@/data/sppg.json";
import type { Sppg, CandidateRuko } from "./types";

const KEY_SPPG_USER = "sppg-ponorogo:sppg-user";
const KEY_SPPG_OVERRIDE = "sppg-ponorogo:sppg-override";
const KEY_RUKO = "sppg-ponorogo:ruko";

const seedData = seed as Sppg[];

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function read<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* kuota penuh / private mode — abaikan */
  }
}

/** Override koordinat/atribut untuk titik seed yang dikoreksi user. */
type OverrideMap = Record<string, Partial<Sppg>>;

/** Gabungan seed (dengan override) + titik buatan user. */
export function getAllSppg(): Sppg[] {
  const overrides = read<OverrideMap>(KEY_SPPG_OVERRIDE, {});
  const userAdded = read<Sppg[]>(KEY_SPPG_USER, []);
  const merged = seedData.map((s) =>
    overrides[s.id] ? { ...s, ...overrides[s.id] } : s
  );
  return [...merged, ...userAdded];
}

/** Simpan SPPG baru buatan user. */
export function addSppg(s: Sppg): void {
  const userAdded = read<Sppg[]>(KEY_SPPG_USER, []);
  userAdded.push({ ...s, buatanUser: true });
  write(KEY_SPPG_USER, userAdded);
}

/** Perbarui SPPG (seed → simpan override; buatan user → ubah entri). */
export function updateSppg(s: Sppg): void {
  if (s.buatanUser) {
    const userAdded = read<Sppg[]>(KEY_SPPG_USER, []);
    const idx = userAdded.findIndex((x) => x.id === s.id);
    if (idx >= 0) userAdded[idx] = s;
    write(KEY_SPPG_USER, userAdded);
  } else {
    const overrides = read<OverrideMap>(KEY_SPPG_OVERRIDE, {});
    overrides[s.id] = {
      nama: s.nama,
      alamat: s.alamat,
      kecamatan: s.kecamatan,
      lat: s.lat,
      lng: s.lng,
      status: s.status,
      porsi: s.porsi,
      perkiraan: s.perkiraan,
    };
    write(KEY_SPPG_OVERRIDE, overrides);
  }
}

/** Hapus SPPG buatan user (titik seed tidak bisa dihapus, hanya dikoreksi). */
export function deleteSppg(id: string): void {
  const userAdded = read<Sppg[]>(KEY_SPPG_USER, []).filter((x) => x.id !== id);
  write(KEY_SPPG_USER, userAdded);
}

export function getRuko(): CandidateRuko[] {
  return read<CandidateRuko[]>(KEY_RUKO, []);
}

export function saveRuko(list: CandidateRuko[]): void {
  write(KEY_RUKO, list);
}
