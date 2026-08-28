"use client";

import { useState, useEffect } from "react";
import type { Sppg, SppgStatus } from "@/lib/types";

interface Props {
  editing: Sppg | null;
  pickedCoord: { lat: number; lng: number } | null;
  onRequestPick: () => void;
  onSave: (s: Sppg) => void;
  onDelete?: (id: string) => void;
  onCancel: () => void;
}

const empty = {
  nama: "",
  alamat: "",
  kecamatan: "",
  lat: "",
  lng: "",
  status: "operasional" as SppgStatus,
  porsi: "3000",
};

export default function SppgForm({
  editing,
  pickedCoord,
  onRequestPick,
  onSave,
  onDelete,
  onCancel,
}: Props) {
  const [form, setForm] = useState(empty);

  useEffect(() => {
    if (editing) {
      setForm({
        nama: editing.nama,
        alamat: editing.alamat,
        kecamatan: editing.kecamatan,
        lat: String(editing.lat),
        lng: String(editing.lng),
        status: editing.status,
        porsi: String(editing.porsi),
      });
    } else {
      setForm(empty);
    }
  }, [editing]);

  useEffect(() => {
    if (pickedCoord) {
      setForm((f) => ({
        ...f,
        lat: pickedCoord.lat.toFixed(5),
        lng: pickedCoord.lng.toFixed(5),
      }));
    }
  }, [pickedCoord]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const lat = parseFloat(form.lat);
    const lng = parseFloat(form.lng);
    if (!form.nama.trim() || Number.isNaN(lat) || Number.isNaN(lng)) {
      alert("Nama, latitude, dan longitude wajib diisi dengan benar.");
      return;
    }
    const s: Sppg = {
      id: editing ? editing.id : `user-${Date.now()}`,
      nama: form.nama.trim(),
      alamat: form.alamat.trim(),
      kecamatan: form.kecamatan.trim(),
      lat,
      lng,
      status: form.status,
      porsi: parseInt(form.porsi, 10) || 0,
      perkiraan: editing ? editing.perkiraan : false,
      buatanUser: editing ? editing.buatanUser : true,
      sumber: editing?.sumber,
    };
    onSave(s);
  }

  const input =
    "w-full rounded border border-slate-300 px-2 py-1 text-sm focus:border-brand focus:outline-none";

  return (
    <form onSubmit={submit} className="space-y-2">
      <input
        className={input}
        placeholder="Nama dapur / SPPG"
        value={form.nama}
        onChange={(e) => setForm({ ...form, nama: e.target.value })}
      />
      <input
        className={input}
        placeholder="Alamat"
        value={form.alamat}
        onChange={(e) => setForm({ ...form, alamat: e.target.value })}
      />
      <input
        className={input}
        placeholder="Kecamatan"
        value={form.kecamatan}
        onChange={(e) => setForm({ ...form, kecamatan: e.target.value })}
      />
      <div className="flex gap-2">
        <input
          className={input}
          placeholder="Latitude"
          value={form.lat}
          onChange={(e) => setForm({ ...form, lat: e.target.value })}
        />
        <input
          className={input}
          placeholder="Longitude"
          value={form.lng}
          onChange={(e) => setForm({ ...form, lng: e.target.value })}
        />
      </div>
      <button
        type="button"
        onClick={onRequestPick}
        className="w-full rounded border border-brand px-2 py-1 text-xs font-medium text-brand hover:bg-brand hover:text-white"
      >
        📍 Pilih koordinat dengan klik di peta
      </button>
      <div className="flex gap-2">
        <select
          className={input}
          value={form.status}
          onChange={(e) =>
            setForm({ ...form, status: e.target.value as SppgStatus })
          }
        >
          <option value="operasional">Operasional</option>
          <option value="pembangunan">Pembangunan</option>
          <option value="rencana">Rencana</option>
        </select>
        <input
          className={input}
          placeholder="Porsi/hari"
          value={form.porsi}
          onChange={(e) => setForm({ ...form, porsi: e.target.value })}
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 rounded bg-brand px-2 py-1.5 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          {editing ? "Simpan perubahan" : "Tambah SPPG"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded border border-slate-300 px-2 py-1.5 text-sm hover:bg-slate-100"
        >
          Batal
        </button>
      </div>
      {editing && editing.buatanUser && onDelete && (
        <button
          type="button"
          onClick={() => onDelete(editing.id)}
          className="w-full rounded border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
        >
          Hapus titik ini
        </button>
      )}
    </form>
  );
}
