"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export const ADMIN_PASS = "sppg-admin";
export const AUTH_KEY = "sppg-ponorogo:admin-auth";

/** Gate kata sandi untuk seluruh area internal/admin. */
export default function AdminGate({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [ready, setReady] = useState(false);
  const [pass, setPass] = useState("");

  useEffect(() => {
    try {
      if (sessionStorage.getItem(AUTH_KEY) === "1") setAuthed(true);
    } catch {}
    setReady(true);
  }, []);

  if (!ready) return null;

  if (!authed) {
    return (
      <main className="grid min-h-screen place-items-center bg-page p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (pass === ADMIN_PASS) {
              try {
                sessionStorage.setItem(AUTH_KEY, "1");
              } catch {}
              setAuthed(true);
            } else alert("Kata sandi salah.");
          }}
          className="w-full max-w-sm space-y-3 rounded-2xl border border-hairline bg-surface p-6 shadow-sm"
        >
          <div className="text-center">
            <div className="text-3xl">🔐</div>
            <h1 className="mt-1 text-lg font-bold text-ink">Area Admin</h1>
            <p className="text-xs text-muted">
              Dashboard internal SPPG (peta, data, analisis, blast). Masukkan
              kata sandi.
            </p>
          </div>
          <input
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder="Kata sandi admin"
            className="w-full rounded-lg border border-hairline bg-page px-3 py-2 text-sm text-ink outline-none focus:border-brand"
            autoFocus
          />
          <button className="w-full rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-white hover:bg-brand-ink">
            Masuk
          </button>
          <Link href="/" className="block text-center text-xs text-brand hover:underline">
            ← Kembali ke beranda Bumbu Pawon
          </Link>
        </form>
      </main>
    );
  }

  return <>{children}</>;
}
