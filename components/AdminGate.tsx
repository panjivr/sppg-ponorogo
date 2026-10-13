"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";
export const ADMIN_PASS = "sppg-admin";
export const AUTH_KEY = "sppg-ponorogo:admin-auth";
export default function AdminGate({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false),
    [ready, setReady] = useState(false),
    [pass, setPass] = useState(""),
    [error, setError] = useState("");
  useEffect(() => {
    try {
      setAuthed(sessionStorage.getItem(AUTH_KEY) === "1");
    } catch {}
    setReady(true);
  }, []);
  if (!ready)
    return (
      <main
        id="konten"
        className="grid min-h-screen place-items-center bg-page"
      >
        <p role="status" className="text-sm text-ink2">
          Menyiapkan area pengelola…
        </p>
      </main>
    );
  if (!authed)
    return (
      <main
        id="konten"
        className="grid min-h-screen place-items-center bg-page p-4"
      >
        <form
          className="w-full max-w-sm rounded-2xl border border-hairline bg-surface p-7"
          onSubmit={(e) => {
            e.preventDefault();
            if (pass === ADMIN_PASS) {
              try {
                sessionStorage.setItem(AUTH_KEY, "1");
              } catch {}
              setError("");
              setAuthed(true);
            } else setError("Kata sandi tidak sesuai. Periksa dan coba lagi.");
          }}
        >
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-soft text-brand">
            <Icon name="lock" />
          </div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-brand">
            Bumbu Pawon · internal
          </p>
          <h1 className="text-2xl font-bold text-ink">Area pengelola</h1>
          <p className="mb-6 mt-2 text-sm text-ink2">
            Masuk untuk mengelola data dan analisis SPPG.
          </p>
          <label
            htmlFor="admin-password"
            className="mb-2 block text-sm font-medium"
          >
            Kata sandi
          </label>
          <input
            id="admin-password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={pass}
            onChange={(e) => {
              setPass(e.target.value);
              setError("");
            }}
            aria-invalid={!!error}
            aria-describedby={error ? "admin-error" : undefined}
            className="w-full rounded-lg border border-hairline bg-page px-3 py-3 text-ink"
            required
          />
          {error && (
            <p
              role="alert"
              id="admin-error"
              className="mt-2 text-sm text-critical"
            >
              {error}
            </p>
          )}
          <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 py-3 text-sm font-semibold text-white">
            Masuk <Icon name="arrow" />
          </button>
          <Link
            href="/supplier"
            className="mt-5 block py-2 text-center text-sm text-brand"
          >
            Lihat katalog publik
          </Link>
        </form>
      </main>
    );
  return <>{children}</>;
}
