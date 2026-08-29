"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Sppg, Pasar } from "@/lib/types";
import {
  getAllSppg,
  addSppg,
  updateSppg,
  deleteSppg,
  resetSppgOverride,
  resetAll,
  importAll,
  isOverridden,
  getAllPasar,
  addPasar,
  updatePasar,
  deletePasar,
  resetPasarOverride,
  isPasarOverridden,
} from "@/lib/storage";
import { computeStats, fmt, statusMeta, STATUS_META, parseGmaps } from "@/lib/sppgMeta";
import AdminEditor from "@/components/AdminEditor";
import PasarEditor from "@/components/PasarEditor";

function blankPasar(): Pasar {
  return {
    id: `pasar-user-${Date.now()}`,
    nama: "",
    kecamatan: "",
    lat: -7.868,
    lng: 111.462,
    perkiraan: true,
    buatanUser: true,
  };
}

const ADMIN_PASS = "sppg-admin";
const AUTH_KEY = "sppg-ponorogo:admin-auth";

function blankSppg(): Sppg {
  return {
    id: `user-${Date.now()}`,
    nama: "",
    alamat: "",
    kecamatan: "",
    lat: -7.868,
    lng: 111.462,
    status: "akan",
    porsi: 0,
    perkiraan: true,
    buatanUser: true,
    pm: {},
    detail: {},
  };
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pass, setPass] = useState("");
  const [list, setList] = useState<Sppg[]>([]);
  const [editing, setEditing] = useState<Sppg | null>(null);
  const [q, setQ] = useState("");
  const [kec, setKec] = useState("all");
  const [perkOnly, setPerkOnly] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"sppg" | "pasar">("sppg");
  const [pasarList, setPasarList] = useState<Pasar[]>([]);
  const [editingPasar, setEditingPasar] = useState<Pasar | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [bulkResult, setBulkResult] = useState<string | null>(null);

  function normName(s: string) {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  }

  function handleBulkPasar() {
    const lines = bulkText.split("\n").map((l) => l.trim()).filter(Boolean);
    const current = getAllPasar();
    const byName = new Map(current.map((p) => [normName(p.nama), p]));
    let updated = 0;
    const unmatched: string[] = [];
    const noCoord: string[] = [];
    for (const line of lines) {
      // pisahkan nama dari URL/koordinat: pakai pemisah | atau tab, atau URL/angka pertama
      let nama = "";
      let rest = "";
      const sep = line.match(/\s*[|\t]\s*/);
      if (sep) {
        const i = line.indexOf(sep[0]);
        nama = line.slice(0, i).trim();
        rest = line.slice(i + sep[0].length).trim();
      } else {
        const m = line.match(/(https?:\/\/|-?\d{1,3}\.\d{3,})/);
        if (m) {
          nama = line.slice(0, m.index).replace(/[,;]\s*$/, "").trim();
          rest = line.slice(m.index).trim();
        } else {
          nama = line;
        }
      }
      const coord = parseGmaps(rest);
      const hit = byName.get(normName(nama));
      if (!hit) { unmatched.push(nama || line); continue; }
      if (!coord) { noCoord.push(nama); continue; }
      updatePasar({ ...hit, lat: coord.lat, lng: coord.lng, perkiraan: false });
      updated++;
    }
    refreshPasar();
    const parts = [`${updated} pasar diperbarui`];
    if (noCoord.length) parts.push(`${noCoord.length} tanpa koordinat (${noCoord.join(", ")})`);
    if (unmatched.length) parts.push(`${unmatched.length} nama tak cocok (${unmatched.join(", ")})`);
    setBulkResult(parts.join(" · "));
    if (updated) setBulkText("");
  }

  useEffect(() => {
    try {
      if (sessionStorage.getItem(AUTH_KEY) === "1") setAuthed(true);
    } catch {}
  }, []);

  useEffect(() => {
    if (authed) {
      setList(getAllSppg());
      setPasarList(getAllPasar());
    }
  }, [authed]);

  function refresh() {
    setList(getAllSppg());
  }
  function refreshPasar() {
    setPasarList(getAllPasar());
  }
  function handleSavePasar(p: Pasar) {
    if (pasarList.some((x) => x.id === p.id)) updatePasar(p);
    else addPasar(p);
    refreshPasar();
    setEditingPasar(null);
  }

  const stats = useMemo(() => computeStats(list), [list]);
  const kecamatanList = useMemo(
    () =>
      Array.from(new Set(list.map((s) => s.kecamatan)))
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b, "id")),
    [list]
  );
  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase();
    return list
      .filter((s) => (kec === "all" || s.kecamatan === kec))
      .filter((s) => (!perkOnly || s.perkiraan))
      .filter(
        (s) =>
          !n ||
          s.nama.toLowerCase().includes(n) ||
          s.kecamatan.toLowerCase().includes(n) ||
          (s.detail?.namaKa ?? "").toLowerCase().includes(n)
      )
      .sort(
        (a, b) =>
          a.kecamatan.localeCompare(b.kecamatan, "id") ||
          a.nama.localeCompare(b.nama, "id")
      );
  }, [list, q, kec, perkOnly]);
  const perkiraanCount = useMemo(
    () => list.filter((s) => s.perkiraan).length,
    [list]
  );

  function handleSave(s: Sppg) {
    if (list.some((x) => x.id === s.id)) updateSppg(s);
    else addSppg(s);
    refresh();
    setEditing(null);
  }

  function handleExport() {
    const blob = new Blob([JSON.stringify(getAllSppg(), null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sppg-ponorogo-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result)) as Sppg[];
        if (!Array.isArray(data)) throw new Error("format");
        importAll(data);
        refresh();
        alert(`Berhasil impor ${data.length} data.`);
      } catch {
        alert("File tidak valid. Pastikan JSON hasil ekspor dari halaman ini.");
      }
    };
    reader.readAsText(file);
  }

  // --- Gate ---
  if (!authed) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-100 p-4">
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
          className="w-full max-w-sm space-y-3 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="text-center">
            <div className="text-3xl">🔐</div>
            <h1 className="mt-1 text-lg font-bold text-slate-800">
              Admin — Database SPPG Ponorogo
            </h1>
            <p className="text-xs text-slate-500">
              Masukkan kata sandi untuk mengelola data.
            </p>
          </div>
          <input
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder="Kata sandi admin"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            autoFocus
          />
          <button className="w-full rounded-md bg-brand px-3 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
            Masuk
          </button>
          <p className="text-center text-[11px] text-slate-400">
            Kata sandi awal: <code className="font-mono">sppg-admin</code> — ubah di{" "}
            <code className="font-mono">app/admin/page.tsx</code>.
          </p>
          <Link href="/" className="block text-center text-xs text-brand hover:underline">
            ← Kembali ke peta
          </Link>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between gap-2 bg-gradient-to-r from-brand-dark to-brand px-4 py-3 text-white shadow">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/15 text-lg">🛠️</span>
          <div>
            <h1 className="text-base font-bold leading-tight">Admin Database SPPG</h1>
            <p className="text-[11px] text-brand-light">Kelola titik & jumlah penerima manfaat</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/" className="rounded-full border border-white/40 px-3 py-1.5 text-xs font-medium hover:bg-white/15">
            🗺 Peta
          </Link>
          <button
            onClick={() => {
              try { sessionStorage.removeItem(AUTH_KEY); } catch {}
              setAuthed(false);
            }}
            className="rounded-full border border-white/40 px-3 py-1.5 text-xs font-medium hover:bg-white/15"
          >
            Keluar
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-5xl p-4">
        {/* Mode tabs */}
        <div className="mb-4 inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
          {([["sppg", "🍚 Data SPPG"], ["pasar", "🛒 Pasar"]] as const).map(
            ([m, label]) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setEditing(null);
                  setEditingPasar(null);
                }}
                className={`rounded-md px-4 py-1.5 text-sm font-medium ${
                  mode === m
                    ? "bg-brand text-white"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {label}
              </button>
            )
          )}
        </div>

        {mode === "pasar" ? (
          editingPasar ? (
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <button onClick={() => setEditingPasar(null)} className="text-sm text-brand hover:underline">
                  ← Kembali ke daftar
                </button>
                <h2 className="ml-auto text-sm font-semibold text-slate-500">
                  {pasarList.some((x) => x.id === editingPasar.id) ? "Edit pasar" : "Tambah pasar"}
                </h2>
              </div>
              <PasarEditor
                pasar={editingPasar}
                onSave={handleSavePasar}
                onCancel={() => setEditingPasar(null)}
                onResetPoint={
                  !editingPasar.buatanUser && isPasarOverridden(editingPasar.id)
                    ? () => {
                        if (confirm("Kembalikan pasar ini ke data awal?")) {
                          resetPasarOverride(editingPasar.id);
                          refreshPasar();
                          setEditingPasar(null);
                        }
                      }
                    : undefined
                }
                onDelete={
                  editingPasar.buatanUser && pasarList.some((x) => x.id === editingPasar.id)
                    ? () => {
                        if (confirm("Hapus pasar ini?")) {
                          deletePasar(editingPasar.id);
                          refreshPasar();
                          setEditingPasar(null);
                        }
                      }
                    : undefined
                }
              />
            </div>
          ) : (
            <>
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-sm text-slate-500">
                  <strong className="text-slate-700">{pasarList.length}</strong> pasar
                  tradisional — untuk peta kebutuhan/kompetitor supplier.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setBulkOpen((v) => !v)}
                    className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50"
                  >
                    📋 Impor massal titik
                  </button>
                  <button
                    onClick={() => setEditingPasar(blankPasar())}
                    className="rounded-md bg-brand px-3 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
                  >
                    + Tambah pasar
                  </button>
                </div>
              </div>

              {bulkOpen && (
                <div className="mb-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-700">
                    Impor titik pasar dari Google Maps
                  </h3>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                    Tempel satu pasar per baris:{" "}
                    <code className="font-mono">Nama Pasar | URL-Google-Maps</code> atau{" "}
                    <code className="font-mono">Nama Pasar | -7.8xxxx, 111.4xxxx</code>.
                    Nama dicocokkan dengan pasar yang ada. Gunakan{" "}
                    <strong>URL lengkap</strong> yang memuat <code className="font-mono">@lat,lng</code>{" "}
                    (buka lokasi di Google Maps → salin URL dari address bar), bukan link pendek{" "}
                    <code className="font-mono">maps.app.goo.gl</code> (tak memuat koordinat).
                  </p>
                  <textarea
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                    rows={6}
                    placeholder={"Pasar Legi Songgolangit | https://www.google.com/maps/@-7.8677,111.4716,17z\nPasar Babadan | -7.8155, 111.5106"}
                    className="mt-2 w-full rounded-md border border-slate-300 px-2 py-1.5 font-mono text-xs focus:border-brand focus:outline-none"
                  />
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      onClick={handleBulkPasar}
                      className="rounded-md bg-brand px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-dark"
                    >
                      Terapkan
                    </button>
                    {bulkResult && (
                      <span className="text-[11px] text-slate-600">{bulkResult}</span>
                    )}
                  </div>
                </div>
              )}
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-3 py-2">Nama / Kategori</th>
                        <th className="px-3 py-2">Kecamatan</th>
                        <th className="px-3 py-2">Koordinat</th>
                        <th className="px-3 py-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {pasarList
                        .slice()
                        .sort((a, b) => a.kecamatan.localeCompare(b.kecamatan, "id") || a.nama.localeCompare(b.nama, "id"))
                        .map((p) => {
                          const changed = p.buatanUser || isPasarOverridden(p.id);
                          return (
                            <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50">
                              <td className="px-3 py-2">
                                <div className="font-medium text-slate-800">
                                  🛒 {p.nama || <span className="text-slate-400">(tanpa nama)</span>}
                                  {changed && (
                                    <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                                      {p.buatanUser ? "baru" : "diedit"}
                                    </span>
                                  )}
                                </div>
                                {p.kategori && <div className="text-[11px] text-slate-500">{p.kategori}</div>}
                              </td>
                              <td className="px-3 py-2 text-slate-600">{p.kecamatan || "–"}</td>
                              <td className="px-3 py-2">
                                <div className="font-mono text-[11px] text-slate-600">
                                  {p.lat.toFixed(5)}, {p.lng.toFixed(5)}
                                </div>
                                {p.perkiraan && <span className="text-[10px] text-amber-600">⚠ perkiraan</span>}
                              </td>
                              <td className="px-3 py-2 text-right">
                                <button
                                  onClick={() => setEditingPasar(p)}
                                  className="rounded-md border border-brand px-2.5 py-1 text-xs font-medium text-brand hover:bg-brand hover:text-white"
                                >
                                  ✎ Edit
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
                Koordinat awal masih perkiraan (pusat kecamatan). Buka pasar di Google Maps,
                salin URL, lalu tempel di editor agar titiknya persis.
              </p>
            </>
          )
        ) : editing ? (
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <button onClick={() => setEditing(null)} className="text-sm text-brand hover:underline">
                ← Kembali ke daftar
              </button>
              <h2 className="ml-auto text-sm font-semibold text-slate-500">
                {list.some((x) => x.id === editing.id) ? "Edit data" : "Tambah data baru"}
              </h2>
            </div>
            <AdminEditor
              sppg={editing}
              onSave={handleSave}
              onCancel={() => setEditing(null)}
              onResetPoint={
                !editing.buatanUser && isOverridden(editing.id)
                  ? () => {
                      if (confirm("Kembalikan titik ini ke data awal?")) {
                        resetSppgOverride(editing.id);
                        refresh();
                        setEditing(null);
                      }
                    }
                  : undefined
              }
              onDelete={
                editing.buatanUser && list.some((x) => x.id === editing.id)
                  ? () => {
                      if (confirm("Hapus titik ini?")) {
                        deleteSppg(editing.id);
                        refresh();
                        setEditing(null);
                      }
                    }
                  : undefined
              }
            />
          </div>
        ) : (
          <>
            {/* Dashboard jumlah data */}
            <section className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              <Card label="Total dapur" value={fmt(stats.total)} accent="text-brand" />
              <Card label="Total PM/hari" value={fmt(stats.totalPM)} accent="text-emerald-600" />
              <Card label="Operasional" value={fmt(stats.operasional)} />
              <Card label="Akan operasional" value={fmt(stats.akan)} />
              <Card label="Berhenti/suspend" value={fmt(stats.berhenti + stats.suspend)} />
              <Card label="Kecamatan" value={fmt(stats.kecamatan)} />
            </section>

            {/* Toolbar */}
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <button
                onClick={() => setEditing(blankSppg())}
                className="rounded-md bg-brand px-3 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
              >
                + Tambah SPPG
              </button>
              <button onClick={handleExport} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50">
                ⬇ Ekspor JSON
              </button>
              <button onClick={() => fileRef.current?.click()} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50">
                ⬆ Impor JSON
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImport(file);
                  e.target.value = "";
                }}
              />
              <button
                onClick={() => {
                  if (confirm("Hapus SEMUA koreksi & titik tambahan, kembali ke data awal?")) {
                    resetAll();
                    refresh();
                  }
                }}
                className="rounded-md border border-red-300 bg-white px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                ↺ Reset ke data awal
              </button>
            </div>

            <div className="mb-3 flex flex-wrap gap-2">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari nama / kecamatan / kepala SPPG…"
                className="min-w-[200px] flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
              />
              <select value={kec} onChange={(e) => setKec(e.target.value)} className="rounded-md border border-slate-300 px-2 py-2 text-sm">
                <option value="all">Semua kecamatan</option>
                {kecamatanList.map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
              <button
                onClick={() => setPerkOnly((v) => !v)}
                className={`rounded-md border px-3 py-2 text-sm font-medium ${
                  perkOnly
                    ? "border-amber-400 bg-amber-50 text-amber-700"
                    : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                }`}
                title="Tampilkan hanya titik yang koordinatnya masih perkiraan"
              >
                ⚠ Perlu koreksi ({perkiraanCount})
              </button>
            </div>

            {/* Tabel data */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-3 py-2">Nama / Kecamatan</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2 text-right">PM/hari</th>
                      <th className="px-3 py-2">Koordinat</th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((s) => {
                      const meta = statusMeta(s.status);
                      const changed = s.buatanUser || isOverridden(s.id);
                      return (
                        <tr key={s.id} className="border-t border-slate-100 hover:bg-slate-50">
                          <td className="px-3 py-2">
                            <div className="font-medium text-slate-800">
                              {s.nama || <span className="text-slate-400">(tanpa nama)</span>}
                              {changed && (
                                <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                                  {s.buatanUser ? "baru" : "diedit"}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {s.desa ? `${s.desa} · ` : ""}{s.kecamatan || "–"}
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${meta.badge}`}>
                              <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} />
                              {meta.label}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right tabular-nums font-medium">{fmt(s.porsi)}</td>
                          <td className="px-3 py-2">
                            <div className="font-mono text-[11px] text-slate-600">
                              {s.lat.toFixed(5)}, {s.lng.toFixed(5)}
                            </div>
                            {s.perkiraan && (
                              <span className="text-[10px] text-amber-600">⚠ perkiraan</span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-right">
                            <button
                              onClick={() => setEditing(s)}
                              className="rounded-md border border-brand px-2.5 py-1 text-xs font-medium text-brand hover:bg-brand hover:text-white"
                            >
                              ✎ Edit
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-3 py-6 text-center text-slate-400">
                          Tidak ada data yang cocok.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
              Semua perubahan tersimpan otomatis di <strong>localStorage browser ini</strong>.
              Untuk cadangan/berbagi atau menjadikannya data permanen aplikasi, gunakan
              <strong> Ekspor JSON</strong> lalu ganti isi <code className="font-mono">data/sppg.json</code>.
              Gate kata sandi bersifat client-side (bukan keamanan server) — lindungi URL ini bila perlu.
            </p>
          </>
        )}
      </div>
    </main>
  );
}

function Card({ label, value, accent = "text-slate-800" }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className={`text-xl font-bold tabular-nums ${accent}`}>{value}</div>
      <div className="text-[11px] leading-tight text-slate-500">{label}</div>
    </div>
  );
}
