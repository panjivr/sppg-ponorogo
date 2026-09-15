"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { Pasar } from "@/lib/types";
import { parseGmaps } from "@/lib/sppgMeta";

const CoordPicker = dynamic(() => import("@/components/CoordPicker"), {
  ssr: false,
  loading: () => (
    <div className="grid h-56 place-items-center rounded-md bg-slate-100 text-sm text-slate-400">
      Memuat peta…
    </div>
  ),
});

interface Props {
  pasar: Pasar;
  onSave: (p: Pasar) => void;
  onCancel: () => void;
  onResetPoint?: () => void;
  onDelete?: () => void;
}

export default function PasarEditor({
  pasar,
  onSave,
  onCancel,
  onResetPoint,
  onDelete,
}: Props) {
  const [f, setF] = useState({
    nama: pasar.nama,
    kecamatan: pasar.kecamatan,
    kategori: pasar.kategori ?? "",
    catatan: pasar.catatan ?? "",
    lat: String(pasar.lat),
    lng: String(pasar.lng),
    perkiraan: pasar.perkiraan,
    gmaps: pasar.gmaps ?? "",
  });
  const set = (k: keyof typeof f, v: string | boolean) =>
    setF((s) => ({ ...s, [k]: v }));

  function save() {
    const lat = parseFloat(f.lat);
    const lng = parseFloat(f.lng);
    if (!f.nama.trim() || Number.isNaN(lat) || Number.isNaN(lng)) {
      alert("Nama, latitude, dan longitude wajib benar.");
      return;
    }
    onSave({
      ...pasar,
      nama: f.nama.trim(),
      kecamatan: f.kecamatan.trim(),
      kategori: f.kategori.trim() || undefined,
      catatan: f.catatan.trim() || undefined,
      lat,
      lng,
      perkiraan: f.perkiraan,
      gmaps: f.gmaps.trim() || undefined,
    });
  }

  const inp =
    "w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <L label="Nama pasar" className="sm:col-span-2">
          <input className={inp} value={f.nama} onChange={(e) => set("nama", e.target.value)} />
        </L>
        <L label="Kecamatan">
          <input className={inp} value={f.kecamatan} onChange={(e) => set("kecamatan", e.target.value)} />
        </L>
        <L label="Kategori">
          <input className={inp} value={f.kategori} onChange={(e) => set("kategori", e.target.value)} placeholder="mis. Pasar induk" />
        </L>
        <L label="Catatan" className="sm:col-span-2">
          <input className={inp} value={f.catatan} onChange={(e) => set("catatan", e.target.value)} placeholder="mis. buka pagi, ramai sayur" />
        </L>
      </div>

      <div>
        <div className="grid grid-cols-2 gap-3">
          <L label="Latitude">
            <input className={inp} value={f.lat} onChange={(e) => set("lat", e.target.value)} inputMode="decimal" />
          </L>
          <L label="Longitude">
            <input className={inp} value={f.lng} onChange={(e) => set("lng", e.target.value)} inputMode="decimal" />
          </L>
        </div>
        <input
          className={`${inp} mt-2`}
          placeholder="Tempel URL / koordinat Google Maps → titik disamakan"
          onChange={(e) => {
            const p = parseGmaps(e.target.value);
            if (p) {
              setF((s) => ({ ...s, lat: p.lat.toFixed(6), lng: p.lng.toFixed(6), perkiraan: false }));
              e.target.value = "";
            }
          }}
        />
        <div className="mt-2">
          <CoordPicker
            lat={parseFloat(f.lat)}
            lng={parseFloat(f.lng)}
            onPick={(la, ln) => setF((s) => ({ ...s, lat: la.toFixed(6), lng: ln.toFixed(6) }))}
          />
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="h-4 w-4 accent-brand" checked={f.perkiraan} onChange={(e) => set("perkiraan", e.target.checked)} />
            Lokasi masih perkiraan
          </label>
          <L label="Link Google Maps" className="min-w-[200px] flex-1">
            <input className={inp} value={f.gmaps} onChange={(e) => set("gmaps", e.target.value)} placeholder="https://maps.app.goo.gl/…" />
          </L>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-slate-200 pt-3">
        <button onClick={save} className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
          💾 Simpan
        </button>
        <button onClick={onCancel} className="rounded-md border border-slate-300 px-4 py-2 text-sm hover:bg-slate-100">
          Batal
        </button>
        {onResetPoint && (
          <button onClick={onResetPoint} className="rounded-md border border-amber-300 px-3 py-2 text-sm text-amber-700 hover:bg-amber-50">
            ↺ Data awal
          </button>
        )}
        {onDelete && (
          <button onClick={onDelete} className="ml-auto rounded-md border border-red-300 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
            Hapus
          </button>
        )}
      </div>
    </div>
  );
}

function L({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-0.5 block text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</span>
      {children}
    </label>
  );
}
