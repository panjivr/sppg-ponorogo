import { SPPG_SEED } from "./data";
import type { CandidateRuko, Sppg } from "./types";

/**
 * ============================================================
 * LAPISAN PENYIMPANAN
 * ============================================================
 * Semua akses data melewati antarmuka `SppgRepo` / `RukoRepo` di
 * bawah. Implementasi saat ini memakai localStorage browser
 * (data tersimpan per-perangkat, tidak dibagi antar pengguna).
 *
 * CARA PINDAH KE DATABASE (multi-pengguna):
 *   1. Buat API route, mis. `app/api/sppg/route.ts`, yang membaca/
 *      menulis ke Postgres/Supabase.
 *   2. Tulis adapter baru dengan bentuk yang sama seperti
 *      `localRepo` di bawah (fungsi async boleh — pemanggil sudah
 *      memakai await).
 *   3. Tukar nilai ekspor `sppgRepo` / `rukoRepo`.
 * Tidak ada komponen UI yang perlu diubah.
 */

const K_USER = "sppg-ponorogo:sppg-user";
const K_OVERRIDE = "sppg-ponorogo:sppg-override";
const K_RUKO = "sppg-ponorogo:ruko";
const K_THEME = "sppg-ponorogo:theme";

const isBrowser = () => typeof window !== "undefined";

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
    /* kuota penuh / mode privat — diabaikan, aplikasi tetap jalan */
  }
}

type OverrideMap = Record<string, Partial<Sppg>>;

export interface SppgRepo {
  all(): Promise<Sppg[]>;
  add(s: Sppg): Promise<void>;
  update(s: Sppg): Promise<void>;
  remove(id: string): Promise<void>;
  reset(): Promise<void>;
}

export interface RukoRepo {
  all(): Promise<CandidateRuko[]>;
  saveAll(list: CandidateRuko[]): Promise<void>;
}

export const sppgRepo: SppgRepo = {
  async all() {
    const over = read<OverrideMap>(K_OVERRIDE, {});
    const extra = read<Sppg[]>(K_USER, []);
    const base = SPPG_SEED.map((s) =>
      over[s.id] ? { ...s, ...over[s.id] } : s
    );
    return [...base, ...extra];
  },

  async add(s) {
    const extra = read<Sppg[]>(K_USER, []);
    extra.push({ ...s, buatanUser: true });
    write(K_USER, extra);
  },

  async update(s) {
    if (s.buatanUser) {
      const extra = read<Sppg[]>(K_USER, []);
      const i = extra.findIndex((x) => x.id === s.id);
      if (i >= 0) extra[i] = s;
      write(K_USER, extra);
      return;
    }
    // Titik dari database resmi tidak ditimpa — koreksi disimpan terpisah
    // sebagai "override", sehingga data asli selalu bisa dipulihkan.
    const over = read<OverrideMap>(K_OVERRIDE, {});
    over[s.id] = {
      nama: s.nama,
      alamat: s.alamat,
      kecamatan: s.kecamatan,
      desa: s.desa,
      lat: s.lat,
      lng: s.lng,
      status: s.status,
      porsi: s.porsi,
      perkiraan: s.perkiraan,
    };
    write(K_OVERRIDE, over);
  },

  async remove(id) {
    write(
      K_USER,
      read<Sppg[]>(K_USER, []).filter((x) => x.id !== id)
    );
  },

  /** Buang semua koreksi & tambahan lokal, kembali ke data resmi. */
  async reset() {
    if (!isBrowser()) return;
    window.localStorage.removeItem(K_USER);
    window.localStorage.removeItem(K_OVERRIDE);
  },
};

export const rukoRepo: RukoRepo = {
  async all() {
    return read<CandidateRuko[]>(K_RUKO, []);
  },
  async saveAll(list) {
    write(K_RUKO, list);
  },
};

/* ---------------- Tema ---------------- */

export type Theme = "light" | "dark" | "system";

export function getTheme(): Theme {
  return read<Theme>(K_THEME, "system");
}

export function setTheme(t: Theme): void {
  write(K_THEME, t);
  applyTheme(t);
}

export function applyTheme(t: Theme): void {
  if (!isBrowser()) return;
  const el = document.documentElement;
  if (t === "system") el.removeAttribute("data-theme");
  else el.setAttribute("data-theme", t);
}
