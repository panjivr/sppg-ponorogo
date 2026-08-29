import seed from "@/data/sppg.json";
import pasarSeed from "@/data/pasar.json";
import type { Sppg, CandidateRuko, Pasar } from "./types";

const KEY_SPPG_USER = "sppg-ponorogo:sppg-user";
const KEY_SPPG_OVERRIDE = "sppg-ponorogo:sppg-override";
const KEY_RUKO = "sppg-ponorogo:ruko";
const KEY_PASAR_USER = "sppg-ponorogo:pasar-user";
const KEY_PASAR_OVERRIDE = "sppg-ponorogo:pasar-override";

const seedData = seed as Sppg[];
const pasarData = pasarSeed as Pasar[];

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
      desa: s.desa,
      lat: s.lat,
      lng: s.lng,
      status: s.status,
      porsi: s.porsi,
      perkiraan: s.perkiraan,
      gmaps: s.gmaps,
      pm: s.pm,
      detail: s.detail,
    };
    write(KEY_SPPG_OVERRIDE, overrides);
  }
}

/** Kembalikan satu titik seed ke nilai awal (hapus override-nya). */
export function resetSppgOverride(id: string): void {
  const overrides = read<OverrideMap>(KEY_SPPG_OVERRIDE, {});
  if (overrides[id]) {
    delete overrides[id];
    write(KEY_SPPG_OVERRIDE, overrides);
  }
}

/** Hapus semua koreksi & titik buatan user (kembali ke data awal). */
export function resetAll(): void {
  write(KEY_SPPG_OVERRIDE, {});
  write(KEY_SPPG_USER, []);
}

/** Impor daftar SPPG penuh: seed yang berbeda → override, sisanya → user. */
export function importAll(list: Sppg[]): void {
  const seedIds = new Set(seedData.map((s) => s.id));
  const overrides: OverrideMap = {};
  const userAdded: Sppg[] = [];
  for (const s of list) {
    if (seedIds.has(s.id)) {
      const base = seedData.find((b) => b.id === s.id)!;
      if (JSON.stringify(base) !== JSON.stringify(s)) {
        overrides[s.id] = { ...s };
      }
    } else {
      userAdded.push({ ...s, buatanUser: true });
    }
  }
  write(KEY_SPPG_OVERRIDE, overrides);
  write(KEY_SPPG_USER, userAdded);
}

/** Apakah sebuah titik seed sedang dikoreksi (punya override)? */
export function isOverridden(id: string): boolean {
  const overrides = read<OverrideMap>(KEY_SPPG_OVERRIDE, {});
  return !!overrides[id];
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

// ── Pasar ───────────────────────────────────────────────────────────────────

type PasarOverrideMap = Record<string, Partial<Pasar>>;

/** Gabungan seed pasar (dengan override) + pasar buatan user. */
export function getAllPasar(): Pasar[] {
  const overrides = read<PasarOverrideMap>(KEY_PASAR_OVERRIDE, {});
  const userAdded = read<Pasar[]>(KEY_PASAR_USER, []);
  const merged = pasarData.map((p) =>
    overrides[p.id] ? { ...p, ...overrides[p.id] } : p
  );
  return [...merged, ...userAdded];
}

export function addPasar(p: Pasar): void {
  const userAdded = read<Pasar[]>(KEY_PASAR_USER, []);
  userAdded.push({ ...p, buatanUser: true });
  write(KEY_PASAR_USER, userAdded);
}

export function updatePasar(p: Pasar): void {
  if (p.buatanUser) {
    const userAdded = read<Pasar[]>(KEY_PASAR_USER, []);
    const idx = userAdded.findIndex((x) => x.id === p.id);
    if (idx >= 0) userAdded[idx] = p;
    write(KEY_PASAR_USER, userAdded);
  } else {
    const overrides = read<PasarOverrideMap>(KEY_PASAR_OVERRIDE, {});
    overrides[p.id] = { ...p };
    write(KEY_PASAR_OVERRIDE, overrides);
  }
}

export function deletePasar(id: string): void {
  const userAdded = read<Pasar[]>(KEY_PASAR_USER, []).filter((x) => x.id !== id);
  write(KEY_PASAR_USER, userAdded);
}

export function resetPasarOverride(id: string): void {
  const overrides = read<PasarOverrideMap>(KEY_PASAR_OVERRIDE, {});
  if (overrides[id]) {
    delete overrides[id];
    write(KEY_PASAR_OVERRIDE, overrides);
  }
}

export function isPasarOverridden(id: string): boolean {
  const overrides = read<PasarOverrideMap>(KEY_PASAR_OVERRIDE, {});
  return !!overrides[id];
}
