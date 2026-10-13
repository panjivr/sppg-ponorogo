'use client';
import { useState } from 'react';
import Link from 'next/link';
export default function LoginForm() {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  return <div className="site-container py-16"><form className="mx-auto max-w-sm space-y-4 rounded-2xl border border-hairline bg-surface p-8" onSubmit={async event => {
    event.preventDefault(); setBusy(true); setError('');
    const password = new FormData(event.currentTarget).get('password');
    try {
      const response = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
      if (!response.ok) { setError((await response.json()).error || 'Gagal masuk. Coba lagi.'); return; }
      const next = new URLSearchParams(window.location.search).get('next') || '/admin';
      window.location.replace(/^\/(admin|dashboard|blast|direktori|peta|ringkasan|tentang|laporan)(\/|$)/.test(next) && !next.includes('\\') ? next : '/admin');
    } catch { setError('Koneksi gagal. Coba lagi.'); } finally { setBusy(false); }
  }}><h1 className="text-2xl font-bold">Masuk pengelola</h1><label className="block" htmlFor="password">Kata sandi</label><input className="w-full rounded-lg border border-hairline bg-page p-3" id="password" name="password" type="password" autoComplete="current-password" required maxLength={256} aria-describedby={error ? 'login-error' : undefined} /><button disabled={busy} className="button button-primary w-full">{busy ? 'Memeriksa…' : 'Masuk'}</button>{error && <p id="login-error" role="alert">{error}</p>}<Link href="/">Kembali ke beranda</Link></form></div>;
}
