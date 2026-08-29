"use client";

import type { Sppg } from "@/lib/types";
import {
  fmt,
  fmtTanggal,
  statusMeta,
  waLink,
  PERIJINAN_ITEMS,
  statusIzin,
  perijinanProgress,
} from "@/lib/sppgMeta";

/** Kartu rincian lengkap satu dapur SPPG. */
export default function SppgDetailCard({
  s,
  yayasanCount,
  onShowYayasan,
}: {
  s: Sppg;
  /** jumlah dapur lain di yayasan yang sama (untuk info "benang merah"). */
  yayasanCount?: number;
  onShowYayasan?: () => void;
}) {
  const meta = statusMeta(s.status);
  const d = s.detail ?? {};
  const pm = s.pm ?? {};
  const kaWa = waLink(d.nomorKa);
  const picWa = waLink(d.picNomor);
  const izin = d.perijinan;
  const prog = perijinanProgress(izin);
  const progPct = Math.round((prog.done / prog.total) * 100);

  return (
    <div className="space-y-3 text-sm">
      {/* Header identitas */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${meta.badge}`}
        >
          <span
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ background: meta.color }}
          />
          {d.statusLabel ?? meta.label}
        </span>
        {d.jenis && (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
            {d.jenis}
          </span>
        )}
        {d.slhs != null && (
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
              d.slhs
                ? "bg-emerald-100 text-emerald-700"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {d.slhs ? "✓ SLHS terbit" : "SLHS belum"}
          </span>
        )}
        {s.perkiraan && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700">
            ⚠ koordinat perkiraan
          </span>
        )}
      </div>

      {/* Info administratif */}
      <dl className="grid grid-cols-1 gap-x-4 gap-y-1.5">
        <Field label="ID SPPG" value={d.idSppg} mono />
        <Field
          label="Lokasi"
          value={
            s.desa ? `${s.desa}, Kec. ${s.kecamatan}` : `Kec. ${s.kecamatan}`
          }
        />
        <Field label="Alamat" value={s.alamat} />
        <Field
          label="Mulai operasional"
          value={fmtTanggal(d.tglOperasional) ?? undefined}
        />
        {d.tglTarget && (
          <Field
            label="Target operasional"
            value={fmtTanggal(d.tglTarget) ?? undefined}
          />
        )}
      </dl>

      {/* Rincian penerima manfaat */}
      <div className="overflow-hidden rounded-lg border border-slate-200">
        <div className="flex items-center justify-between gap-2 bg-slate-50 px-3 py-1.5">
          <span className="text-xs font-semibold text-slate-600">
            Penerima manfaat (PM)
          </span>
          {d.pmAsOf && (
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
              {d.pmAsOf}
            </span>
          )}
        </div>
        <table className="w-full text-xs">
          <tbody>
            <Row
              label="Satuan pendidikan"
              value={pm.pmSatdikTotal}
              extra={
                pm.pmSatdikKelompok
                  ? `${fmt(pm.pmSatdikKelompok)} kelompok`
                  : undefined
              }
              bold
            />
            <Row label="Siswa" value={pm.pmSiswa} indent />
            <Row label="Guru & tenaga kependidikan" value={pm.pmGuruTendik} indent />
            <Row
              label="Kelompok 3B"
              value={pm.pm3bTotal}
              extra={
                pm.pm3bKelompok ? `${fmt(pm.pm3bKelompok)} kelompok` : undefined
              }
              bold
            />
            <Row label="Balita" value={pm.pmBalita} indent />
            <Row label="Ibu hamil" value={pm.pmBumil} indent />
            <Row label="Ibu menyusui" value={pm.pmBusui} indent />
            <tr className="bg-brand/5 font-bold text-brand">
              <td className="px-3 py-1.5">Total penerima manfaat</td>
              <td className="px-3 py-1.5 text-right tabular-nums">
                {fmt(s.porsi)}
              </td>
              <td />
            </tr>
          </tbody>
        </table>
      </div>

      {/* Kontak & pengelola */}
      <div className="space-y-1.5">
        <Contact
          role="Kepala SPPG"
          nama={d.namaKa}
          nomor={d.nomorKa}
          wa={kaWa}
        />
        <Contact
          role="PIC Yayasan"
          nama={d.picNama}
          nomor={d.picNomor}
          wa={picWa}
        />
        <Field label="Yayasan pengelola" value={d.yayasan} />
        {d.yayasan && yayasanCount != null && yayasanCount > 0 && (
          <button
            onClick={onShowYayasan}
            className="flex w-full items-center gap-1.5 rounded-md bg-brand/5 px-2.5 py-1.5 text-left text-[11px] font-medium text-brand hover:bg-brand/10"
          >
            🔗 Yayasan ini mengelola {yayasanCount + 1} dapur — lihat benang merahnya
          </button>
        )}
        <Field label="Bank (Virtual Account)" value={d.bankVa} />
      </div>

      {/* Perizinan & sertifikasi */}
      {izin && (
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <div className="flex items-center justify-between gap-2 bg-slate-50 px-3 py-1.5">
            <span className="text-xs font-semibold text-slate-600">
              Perizinan &amp; sertifikasi
            </span>
            <span className="text-[11px] font-medium text-slate-500">
              {prog.done}/{prog.total} lengkap
            </span>
          </div>
          <div className="px-3 pt-2">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-brand transition-all"
                style={{ width: `${progPct}%` }}
              />
            </div>
          </div>
          <ul className="divide-y divide-slate-100 px-3 py-1.5">
            {PERIJINAN_ITEMS.map((it) => {
              const meta = statusIzin(izin[it.key] as string | undefined);
              const no = it.noKey ? (izin[it.noKey] as string | undefined) : undefined;
              return (
                <li key={it.key} className="flex items-start justify-between gap-2 py-1 text-xs">
                  <div className="min-w-0">
                    <span className="text-slate-700">{it.label}</span>
                    {no && (
                      <span className="block truncate font-mono text-[10px] text-slate-400">
                        No. {no}
                      </span>
                    )}
                  </div>
                  <span
                    className={`inline-flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${meta.badge}`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.dot }} />
                    {meta.label}
                  </span>
                </li>
              );
            })}
          </ul>
          {(izin.dokPerijinan || izin.dokKelengkapan) && (
            <div className="flex flex-wrap gap-2 border-t border-slate-100 px-3 py-2">
              {izin.dokPerijinan && (
                <a
                  href={izin.dokPerijinan}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-200"
                >
                  📁 Dokumen perizinan
                </a>
              )}
              {izin.dokKelengkapan && (
                <a
                  href={izin.dokKelengkapan}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-200"
                >
                  📁 Dokumen kelengkapan
                </a>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tautan */}
      <div className="flex flex-wrap gap-2 pt-1">
        {s.gmaps && (
          <a
            href={s.gmaps}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
          >
            📍 Google Maps
          </a>
        )}
        {kaWa && (
          <a
            href={kaWa}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-md bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 hover:bg-green-100"
          >
            💬 WhatsApp Ka SPPG
          </a>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value?: string;
  mono?: boolean;
}) {
  if (!value) return null;
  return (
    <div className="flex gap-2">
      <dt className="w-32 shrink-0 text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </dt>
      <dd className={`min-w-0 flex-1 text-slate-700 ${mono ? "font-mono" : ""}`}>
        {value}
      </dd>
    </div>
  );
}

function Row({
  label,
  value,
  extra,
  bold,
  indent,
}: {
  label: string;
  value?: number;
  extra?: string;
  bold?: boolean;
  indent?: boolean;
}) {
  return (
    <tr className="border-b border-slate-100 last:border-0">
      <td
        className={`px-3 py-1.5 ${bold ? "font-semibold text-slate-800" : "text-slate-600"} ${
          indent ? "pl-6" : ""
        }`}
      >
        {label}
        {extra && (
          <span className="ml-1.5 text-[10px] font-normal text-slate-400">
            ({extra})
          </span>
        )}
      </td>
      <td className="px-3 py-1.5 text-right tabular-nums text-slate-800">
        {fmt(value)}
      </td>
      <td className="w-0" />
    </tr>
  );
}

function Contact({
  role,
  nama,
  nomor,
  wa,
}: {
  role: string;
  nama?: string;
  nomor?: string;
  wa: string | null;
}) {
  if (!nama && !nomor) return null;
  return (
    <div className="flex items-center justify-between gap-2 rounded-md bg-slate-50 px-2.5 py-1.5">
      <div className="min-w-0">
        <div className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
          {role}
        </div>
        <div className="truncate font-medium text-slate-700">{nama ?? "–"}</div>
      </div>
      {nomor && (
        <a
          href={wa ?? undefined}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-xs font-medium text-brand hover:underline"
        >
          {nomor}
        </a>
      )}
    </div>
  );
}
