"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { Sppg, SppgStatus, SppgPerijinan } from "@/lib/types";
import { recalcPM, fmt, STATUS_META, PERIJINAN_ITEMS, parseGmaps } from "@/lib/sppgMeta";

const IZIN_OPTS = ["", "SUDAH", "PROSES", "BELUM PENGAJUAN"];

const CoordPicker = dynamic(() => import("@/components/CoordPicker"), {
  ssr: false,
  loading: () => (
    <div className="grid h-56 place-items-center rounded-md bg-slate-100 text-sm text-slate-400">
      Memuat peta…
    </div>
  ),
});

interface Props {
  sppg: Sppg;
  onSave: (s: Sppg) => void;
  onCancel: () => void;
  onResetPoint?: () => void;
  onDelete?: () => void;
}

const numOrU = (v: string) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : undefined;
};

function cleanIzin(p: SppgPerijinan): SppgPerijinan | undefined {
  const out: SppgPerijinan = {};
  (Object.keys(p) as (keyof SppgPerijinan)[]).forEach((k) => {
    const v = p[k];
    if (v != null && String(v).trim() !== "") out[k] = String(v).trim();
  });
  return Object.keys(out).length ? out : undefined;
}

export default function AdminEditor({
  sppg,
  onSave,
  onCancel,
  onResetPoint,
  onDelete,
}: Props) {
  const d = sppg.detail ?? {};
  const pm = sppg.pm ?? {};
  const [f, setF] = useState({
    nama: sppg.nama,
    jenis: d.jenis ?? "",
    idSppg: d.idSppg ?? "",
    status: sppg.status,
    statusLabel: d.statusLabel ?? "",
    kecamatan: sppg.kecamatan,
    desa: sppg.desa ?? "",
    alamat: sppg.alamat,
    lat: String(sppg.lat),
    lng: String(sppg.lng),
    perkiraan: sppg.perkiraan,
    gmaps: sppg.gmaps ?? "",
    // PM
    pmSiswa: pm.pmSiswa != null ? String(pm.pmSiswa) : "",
    pmGuruTendik: pm.pmGuruTendik != null ? String(pm.pmGuruTendik) : "",
    pmSatdikKelompok:
      pm.pmSatdikKelompok != null ? String(pm.pmSatdikKelompok) : "",
    pmBalita: pm.pmBalita != null ? String(pm.pmBalita) : "",
    pmBumil: pm.pmBumil != null ? String(pm.pmBumil) : "",
    pmBusui: pm.pmBusui != null ? String(pm.pmBusui) : "",
    pm3bKelompok: pm.pm3bKelompok != null ? String(pm.pm3bKelompok) : "",
    // kontak
    namaKa: d.namaKa ?? "",
    nomorKa: d.nomorKa ?? "",
    yayasan: d.yayasan ?? "",
    bankVa: d.bankVa ?? "",
    picNama: d.picNama ?? "",
    picNomor: d.picNomor ?? "",
    slhs: d.slhs ?? false,
    tglOperasional: d.tglOperasional ?? "",
    tglTarget: d.tglTarget ?? "",
  });

  const set = (k: keyof typeof f, v: string | boolean) =>
    setF((s) => ({ ...s, [k]: v }));

  const [izin, setIzin] = useState<SppgPerijinan>(d.perijinan ?? {});
  const setIz = (k: keyof SppgPerijinan, v: string) =>
    setIzin((s) => ({ ...s, [k]: v }));

  const derived = useMemo(
    () =>
      recalcPM({
        pmSiswa: numOrU(f.pmSiswa),
        pmGuruTendik: numOrU(f.pmGuruTendik),
        pmBalita: numOrU(f.pmBalita),
        pmBumil: numOrU(f.pmBumil),
        pmBusui: numOrU(f.pmBusui),
      }),
    [f.pmSiswa, f.pmGuruTendik, f.pmBalita, f.pmBumil, f.pmBusui]
  );

  function save() {
    const lat = parseFloat(f.lat);
    const lng = parseFloat(f.lng);
    if (!f.nama.trim() || Number.isNaN(lat) || Number.isNaN(lng)) {
      alert("Nama, latitude, dan longitude wajib benar.");
      return;
    }
    const out: Sppg = {
      ...sppg,
      nama: f.nama.trim(),
      kecamatan: f.kecamatan.trim(),
      desa: f.desa.trim() || undefined,
      alamat: f.alamat.trim(),
      lat,
      lng,
      status: f.status,
      perkiraan: f.perkiraan,
      gmaps: f.gmaps.trim() || undefined,
      porsi: derived.porsi,
      pm: {
        pmSatdikTotal: derived.pmSatdikTotal,
        pmSiswa: numOrU(f.pmSiswa),
        pmGuruTendik: numOrU(f.pmGuruTendik),
        pmSatdikKelompok: numOrU(f.pmSatdikKelompok),
        pm3bTotal: derived.pm3bTotal,
        pmBalita: numOrU(f.pmBalita),
        pmBumil: numOrU(f.pmBumil),
        pmBusui: numOrU(f.pmBusui),
        pm3bKelompok: numOrU(f.pm3bKelompok),
      },
      detail: {
        ...d,
        idSppg: f.idSppg.trim() || undefined,
        jenis: f.jenis.trim() || undefined,
        namaKa: f.namaKa.trim() || undefined,
        nomorKa: f.nomorKa.trim() || undefined,
        statusLabel: f.statusLabel.trim() || undefined,
        tglOperasional: f.tglOperasional.trim() || undefined,
        tglTarget: f.tglTarget.trim() || undefined,
        yayasan: f.yayasan.trim() || undefined,
        bankVa: f.bankVa.trim() || undefined,
        picNama: f.picNama.trim() || undefined,
        picNomor: f.picNomor.trim() || undefined,
        slhs: f.slhs,
        perijinan: cleanIzin(izin),
      },
    };
    onSave(out);
  }

  const inp =
    "w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand";
  const lbl = "text-[11px] font-medium uppercase tracking-wide text-slate-400";

  return (
    <div className="space-y-5">
      {/* Identitas */}
      <Section title="Identitas">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <L label="Nama SPPG" className="sm:col-span-2">
            <input className={inp} value={f.nama} onChange={(e) => set("nama", e.target.value)} />
          </L>
          <L label="Jenis SPPG">
            <input className={inp} value={f.jenis} onChange={(e) => set("jenis", e.target.value)} placeholder="SPPG MITRA / POLRI / 3T…" />
          </L>
          <L label="ID SPPG">
            <input className={inp} value={f.idSppg} onChange={(e) => set("idSppg", e.target.value)} />
          </L>
          <L label="Status">
            <select className={inp} value={f.status} onChange={(e) => set("status", e.target.value as SppgStatus)}>
              {(Object.keys(STATUS_META) as SppgStatus[]).map((s) => (
                <option key={s} value={s}>{STATUS_META[s].label}</option>
              ))}
            </select>
          </L>
          <L label="Label status (opsional)">
            <input className={inp} value={f.statusLabel} onChange={(e) => set("statusLabel", e.target.value)} placeholder="mis. BERHENTI OPS SEMENTARA" />
          </L>
          <L label="Kecamatan">
            <input className={inp} value={f.kecamatan} onChange={(e) => set("kecamatan", e.target.value)} />
          </L>
          <L label="Desa / kelurahan">
            <input className={inp} value={f.desa} onChange={(e) => set("desa", e.target.value)} />
          </L>
          <L label="Alamat lengkap" className="sm:col-span-2">
            <textarea className={inp} rows={2} value={f.alamat} onChange={(e) => set("alamat", e.target.value)} />
          </L>
        </div>
      </Section>

      {/* Koordinat */}
      <Section title="Koordinat (presisi)">
        <div className="grid grid-cols-2 gap-3">
          <L label="Latitude">
            <input className={inp} value={f.lat} onChange={(e) => set("lat", e.target.value)} inputMode="decimal" />
          </L>
          <L label="Longitude">
            <input className={inp} value={f.lng} onChange={(e) => set("lng", e.target.value)} inputMode="decimal" />
          </L>
        </div>
        <p className="mt-1 text-[11px] text-slate-500">
          Klik peta atau geser 📍 untuk menaruh titik. Cocokkan dengan lokasi di{" "}
          {f.gmaps ? (
            <a href={f.gmaps} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 underline">Google Maps</a>
          ) : ("Google Maps")}
          {" "}agar presisi.
        </p>
        {/* Tempel dari Google Maps → set titik presisi */}
        <div className="mt-2 flex gap-2">
          <input
            className={inp}
            placeholder="Tempel URL / koordinat Google Maps (mis. -7.9603, 111.4689)"
            onChange={(e) => {
              const p = parseGmaps(e.target.value);
              if (p) {
                setF((s) => ({
                  ...s,
                  lat: p.lat.toFixed(6),
                  lng: p.lng.toFixed(6),
                  perkiraan: false,
                }));
                e.target.value = "";
              }
            }}
          />
        </div>
        <p className="text-[11px] text-slate-400">
          Buka lokasi di Google Maps, salin URL-nya (atau ketik &quot;lat, lng&quot;), tempel di sini — titik langsung disamakan.
        </p>
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
            Koordinat masih perkiraan
          </label>
          <L label="Link Google Maps" className="flex-1 min-w-[200px]">
            <input className={inp} value={f.gmaps} onChange={(e) => set("gmaps", e.target.value)} placeholder="https://maps.app.goo.gl/…" />
          </L>
        </div>
      </Section>

      {/* Jumlah PM */}
      <Section title="Jumlah penerima manfaat (PM)">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <L label="Siswa"><input className={inp} value={f.pmSiswa} onChange={(e) => set("pmSiswa", e.target.value)} inputMode="numeric" /></L>
          <L label="Guru & tendik"><input className={inp} value={f.pmGuruTendik} onChange={(e) => set("pmGuruTendik", e.target.value)} inputMode="numeric" /></L>
          <L label="Kelompok SATDIK"><input className={inp} value={f.pmSatdikKelompok} onChange={(e) => set("pmSatdikKelompok", e.target.value)} inputMode="numeric" /></L>
          <L label="Balita"><input className={inp} value={f.pmBalita} onChange={(e) => set("pmBalita", e.target.value)} inputMode="numeric" /></L>
          <L label="Ibu hamil"><input className={inp} value={f.pmBumil} onChange={(e) => set("pmBumil", e.target.value)} inputMode="numeric" /></L>
          <L label="Ibu menyusui"><input className={inp} value={f.pmBusui} onChange={(e) => set("pmBusui", e.target.value)} inputMode="numeric" /></L>
          <L label="Kelompok 3B"><input className={inp} value={f.pm3bKelompok} onChange={(e) => set("pm3bKelompok", e.target.value)} inputMode="numeric" /></L>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 rounded-md bg-brand/5 p-2 text-center">
          <Derived label="SATDIK" value={derived.pmSatdikTotal} />
          <Derived label="3B" value={derived.pm3bTotal} />
          <Derived label="Total PM/hari" value={derived.porsi} strong />
        </div>
        <p className="mt-1 text-[11px] text-slate-500">Total dihitung otomatis dari rincian di atas.</p>
      </Section>

      {/* Kontak & administrasi */}
      <Section title="Kontak & administrasi">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <L label="Kepala SPPG"><input className={inp} value={f.namaKa} onChange={(e) => set("namaKa", e.target.value)} /></L>
          <L label="Nomor Ka SPPG"><input className={inp} value={f.nomorKa} onChange={(e) => set("nomorKa", e.target.value)} inputMode="tel" /></L>
          <L label="Yayasan"><input className={inp} value={f.yayasan} onChange={(e) => set("yayasan", e.target.value)} /></L>
          <L label="Bank (VA)"><input className={inp} value={f.bankVa} onChange={(e) => set("bankVa", e.target.value)} /></L>
          <L label="PIC yayasan"><input className={inp} value={f.picNama} onChange={(e) => set("picNama", e.target.value)} /></L>
          <L label="Nomor PIC"><input className={inp} value={f.picNomor} onChange={(e) => set("picNomor", e.target.value)} inputMode="tel" /></L>
          <L label="Tanggal operasional"><input className={inp} type="date" value={f.tglOperasional} onChange={(e) => set("tglOperasional", e.target.value)} /></L>
          <L label="Target operasional"><input className={inp} type="date" value={f.tglTarget} onChange={(e) => set("tglTarget", e.target.value)} /></L>
        </div>
        <label className="mt-2 flex items-center gap-2 text-sm">
          <input type="checkbox" className="h-4 w-4 accent-brand" checked={f.slhs} onChange={(e) => set("slhs", e.target.checked)} />
          SLHS (Sertifikat Laik Higiene Sanitasi) sudah terbit
        </label>
      </Section>

      {/* Perizinan & sertifikasi */}
      <Section title="Perizinan & sertifikasi">
        <div className="space-y-2">
          {PERIJINAN_ITEMS.map((it) => (
            <div key={it.key} className="grid grid-cols-12 items-center gap-2">
              <span className="col-span-5 text-xs text-slate-600 sm:col-span-4">{it.label}</span>
              <select
                className={`${inp} col-span-7 sm:col-span-3`}
                value={(izin[it.key] as string) ?? ""}
                onChange={(e) => setIz(it.key, e.target.value)}
              >
                {IZIN_OPTS.map((o) => (
                  <option key={o} value={o}>{o || "—"}</option>
                ))}
              </select>
              {it.noKey && (
                <input
                  className={`${inp} col-span-12 sm:col-span-5`}
                  placeholder={`Nomor ${it.label}`}
                  value={(izin[it.noKey] as string) ?? ""}
                  onChange={(e) => setIz(it.noKey!, e.target.value)}
                />
              )}
            </div>
          ))}
          <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
            <L label="Link dokumen perizinan">
              <input className={inp} value={(izin.dokPerijinan as string) ?? ""} onChange={(e) => setIz("dokPerijinan", e.target.value)} placeholder="https://drive.google.com/…" />
            </L>
            <L label="Link dokumen kelengkapan">
              <input className={inp} value={(izin.dokKelengkapan as string) ?? ""} onChange={(e) => setIz("dokKelengkapan", e.target.value)} placeholder="https://drive.google.com/…" />
            </L>
          </div>
        </div>
      </Section>

      {/* Aksi */}
      <div className="sticky bottom-0 -mx-4 flex flex-wrap gap-2 border-t border-slate-200 bg-white px-4 py-3">
        <button onClick={save} className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
          💾 Simpan perubahan
        </button>
        <button onClick={onCancel} className="rounded-md border border-slate-300 px-4 py-2 text-sm hover:bg-slate-100">
          Batal
        </button>
        {onResetPoint && (
          <button onClick={onResetPoint} className="rounded-md border border-amber-300 px-3 py-2 text-sm text-amber-700 hover:bg-amber-50">
            ↺ Kembalikan ke data awal
          </button>
        )}
        {onDelete && (
          <button onClick={onDelete} className="ml-auto rounded-md border border-red-300 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
            Hapus titik ini
          </button>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-2 border-b border-slate-200 pb-1 text-sm font-semibold text-slate-700">{title}</h3>
      {children}
    </section>
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

function Derived({ label, value, strong }: { label: string; value: number; strong?: boolean }) {
  return (
    <div>
      <div className={`tabular-nums ${strong ? "text-lg font-bold text-brand" : "text-base font-semibold text-slate-700"}`}>{fmt(value)}</div>
      <div className="text-[10px] text-slate-500">{label}</div>
    </div>
  );
}
