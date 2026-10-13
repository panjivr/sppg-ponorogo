'use client';
import { useEffect, useState } from 'react';
import { initializePrivateData, clearPrivateData, migrateLegacyPrivateData } from '@/lib/storage';
import { logout } from '@/lib/logout';
export default function PrivateDataProvider({ expiresAt, children }: { expiresAt: number; children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const [migrated, setMigrated] = useState(false);
  useEffect(() => {
    const abort = new AbortController();
    fetch('/api/admin/sppg', { cache: 'no-store', signal: abort.signal }).then(async response => {
      if (response.status === 401) { window.location.replace('/login'); return; }
      if (!response.ok) throw new Error('Private data unavailable');
      const data = await response.json();
      if (!abort.signal.aborted) { initializePrivateData(data); setMigrated(migrateLegacyPrivateData()); setReady(true); }
    }).catch(() => { if (!abort.signal.aborted) setError(true); });
    const timer = window.setTimeout(() => { void logout(); }, Math.max(0, expiresAt - Date.now()));
    return () => { abort.abort(); clearTimeout(timer); clearPrivateData(); };
  }, [expiresAt]);
  if (error) return <p role="alert" className="p-8">Data tidak dapat dimuat. Muat ulang halaman untuk mencoba lagi.</p>;
  return ready ? <>{migrated && <p role="status" className="border-b border-hairline bg-surface p-4 text-ink">Koreksi lama sudah dimuat ke sesi ini. Ekspor cadangan melalui halaman admin sebelum reload atau keluar; koreksi kini tidak disimpan permanen di browser.</p>}{children}</> : <p role="status" className="p-8">Memuat area pengelola…</p>;
}
