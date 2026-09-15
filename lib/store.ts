import {
  getAllSppg,
  addSppg,
  updateSppg,
  deleteSppg,
  resetAll,
  getRuko,
  saveRuko,
} from "./storage";
import type { CandidateRuko, Sppg } from "./types";

/**
 * ============================================================
 * LAPISAN REPOSITORY
 * ============================================================
 * Pembungkus tipis di atas `lib/storage.ts` (localStorage), dengan
 * antarmuka async agar halaman baru tidak terikat ke mekanisme
 * penyimpanan. Halaman lama tetap boleh memakai `lib/storage.ts`
 * secara langsung — keduanya membaca sumber yang sama.
 *
 * CARA PINDAH KE DATABASE (multi-pengguna):
 *   1. Buat API route, mis. `app/api/sppg/route.ts`, yang membaca/
 *      menulis ke Postgres/Supabase.
 *   2. Ganti isi fungsi di `sppgRepo`/`rukoRepo` di bawah dengan
 *      panggilan fetch ke route tersebut.
 *   3. Selesai — pemanggil sudah memakai await, jadi tidak ada
 *      komponen yang perlu diubah.
 */

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
    return getAllSppg();
  },
  async add(s) {
    addSppg(s);
  },
  async update(s) {
    updateSppg(s);
  },
  async remove(id) {
    deleteSppg(id);
  },
  async reset() {
    resetAll();
  },
};

export const rukoRepo: RukoRepo = {
  async all() {
    return getRuko();
  },
  async saveAll(list) {
    saveRuko(list);
  },
};

/* ---------------- Tema ---------------- */

const K_THEME = "sppg-ponorogo:theme";
export type Theme = "light" | "dark" | "system";

export function getTheme(): Theme {
  if (typeof window === "undefined") return "system";
  try {
    const raw = window.localStorage.getItem(K_THEME);
    return raw ? (JSON.parse(raw) as Theme) : "system";
  } catch {
    return "system";
  }
}

export function setTheme(t: Theme): void {
  try {
    window.localStorage.setItem(K_THEME, JSON.stringify(t));
  } catch {
    /* mode privat — abaikan */
  }
  applyTheme(t);
}

export function applyTheme(t: Theme): void {
  if (typeof document === "undefined") return;
  const el = document.documentElement;
  if (t === "system") el.removeAttribute("data-theme");
  else el.setAttribute("data-theme", t);
}
