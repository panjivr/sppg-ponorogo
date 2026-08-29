"use client";

import { useMemo } from "react";
import type { Sppg } from "@/lib/types";
import { computeStats, fmt, STATUS_META, yayasanGroups } from "@/lib/sppgMeta";

interface Props {
  sppgList: Sppg[];
  radiusKm: number;
  showHeatmap: boolean;
  showRekomendasi: boolean;
  showYayasan: boolean;
  selectedYayasan: string | null;
  onRadiusChange: (v: number) => void;
  onToggleHeatmap: (v: boolean) => void;
  onToggleRekomendasi: (v: boolean) => void;
  onToggleYayasan: (v: boolean) => void;
  onSelectYayasan: (nama: string | null) => void;
}

export default function ControlPanel({
  sppgList,
  radiusKm,
  showHeatmap,
  showRekomendasi,
  showYayasan,
  selectedYayasan,
  onRadiusChange,
  onToggleHeatmap,
  onToggleRekomendasi,
  onToggleYayasan,
  onSelectYayasan,
}: Props) {
  const s = computeStats(sppgList);
  const groups = useMemo(() => yayasanGroups(sppgList), [sppgList]);

  return (
    <div className="space-y-4">
      {/* Ringkasan utama */}
      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Ringkasan
        </h2>
        <div className="grid grid-cols-2 gap-2">
          <BigStat
            label="Total dapur SPPG"
            value={fmt(s.total)}
            sub={`${s.kecamatan} kecamatan`}
            accent="text-brand"
          />
          <BigStat
            label="Penerima manfaat / hari"
            value={fmt(s.totalPM)}
            sub="porsi makan / hari"
            accent="text-emerald-600"
          />
        </div>
      </section>

      {/* Status dapur */}
      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Status operasional
        </h2>
        <div className="grid grid-cols-2 gap-2">
          <MiniStat
            dot={STATUS_META.operasional.color}
            label="Operasional"
            value={s.operasional}
          />
          <MiniStat
            dot={STATUS_META.akan.color}
            label="Akan operasional"
            value={s.akan}
          />
          <MiniStat
            dot={STATUS_META.berhenti.color}
            label="Berhenti sementara"
            value={s.berhenti}
          />
          <MiniStat
            dot={STATUS_META.suspend.color}
            label="Suspend"
            value={s.suspend}
          />
        </div>
      </section>

      {/* Rincian penerima manfaat */}
      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Rincian penerima manfaat
        </h2>
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <PMRow label="Satuan pendidikan" value={s.satdik} bold />
          <PMRow label="— Siswa" value={s.siswa} indent />
          <PMRow label="— Guru & tendik" value={s.guruTendik} indent />
          <PMRow label="Kelompok 3B (Balita/Bumil/Busui)" value={s.pm3b} bold />
          <PMRow label="— Balita" value={s.balita} indent />
          <PMRow label="— Ibu hamil" value={s.bumil} indent />
          <PMRow label="— Ibu menyusui" value={s.busui} indent />
          <div className="flex items-center justify-between bg-brand/5 px-3 py-2 text-sm font-bold text-brand">
            <span>Total penerima manfaat</span>
            <span className="tabular-nums">{fmt(s.totalPM)}</span>
          </div>
        </div>
      </section>

      {/* Analisis lokasi ruko */}
      <section className="rounded-lg border border-slate-200 p-3">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Analisis lokasi ruko
        </h2>
        <div className="flex items-center justify-between text-xs">
          <label className="font-medium">Radius jangkauan supplier</label>
          <span className="tabular-nums font-semibold text-brand">
            {radiusKm} km
          </span>
        </div>
        <input
          type="range"
          min={1}
          max={15}
          step={0.5}
          value={radiusKm}
          onChange={(e) => onRadiusChange(parseFloat(e.target.value))}
          className="mt-1 w-full accent-brand"
        />
        <p className="text-[11px] text-slate-500">
          Dipakai untuk menghitung kandidat titik ruko terbaik (jangkauan supplier).
        </p>

        <div className="mt-3 space-y-2">
          <Toggle
            checked={showHeatmap}
            onChange={onToggleHeatmap}
            label="Heatmap kepadatan permintaan"
          />
          <Toggle
            checked={showRekomendasi}
            onChange={onToggleRekomendasi}
            label="Rekomendasi titik ruko terbaik"
          />
        </div>
        {showRekomendasi && (
          <p className="mt-2 rounded bg-amber-50 px-2 py-1.5 text-[11px] text-amber-800">
            ⭐ titik pusat berbobot · 🔴 3 area dengan dapur terbanyak dalam radius{" "}
            {radiusKm} km. Perkiraan berdasarkan sebaran &amp; status dapur.
          </p>
        )}
      </section>

      {/* Jaringan yayasan — benang merah */}
      <section className="rounded-lg border border-slate-200 p-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Jaringan yayasan
          </h2>
          <span className="text-[11px] text-slate-400">
            {groups.length} yayasan · {groups.reduce((a, g) => a + g.items.length, 0)} dapur
          </span>
        </div>
        <Toggle
          checked={showYayasan}
          onChange={onToggleYayasan}
          label="Tampilkan benang merah antar dapur"
        />
        <p className="mt-0.5 text-[11px] text-slate-500">
          Garis menghubungkan dapur yang dikelola yayasan yang sama.
        </p>

        {showYayasan && (
          <div className="mt-2 max-h-56 space-y-0.5 overflow-y-auto pr-1">
            {selectedYayasan && (
              <button
                onClick={() => onSelectYayasan(null)}
                className="mb-1 w-full rounded bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-200"
              >
                ← Tampilkan semua jaringan
              </button>
            )}
            {groups.map((g) => {
              const active = selectedYayasan === g.nama;
              return (
                <button
                  key={g.nama}
                  onClick={() => onSelectYayasan(active ? null : g.nama)}
                  className={`flex w-full items-center gap-2 rounded px-2 py-1 text-left text-xs ${
                    active ? "bg-slate-100 ring-1 ring-slate-300" : "hover:bg-slate-50"
                  }`}
                >
                  <span
                    className="inline-block h-3 w-3 shrink-0 rounded-full border border-white shadow-sm"
                    style={{ background: g.color }}
                  />
                  <span className="min-w-0 flex-1 truncate text-slate-700">
                    {g.nama}
                  </span>
                  <span className="shrink-0 rounded-full bg-slate-100 px-1.5 text-[10px] font-semibold text-slate-500">
                    {g.items.length}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Legenda */}
      <section className="border-t border-slate-200 pt-3 text-xs">
        <div className="mb-1.5 font-semibold text-slate-500">Keterangan peta</div>
        <div className="grid grid-cols-2 gap-y-1">
          <Legend color={STATUS_META.operasional.color} text="Operasional" />
          <Legend color={STATUS_META.akan.color} text="Akan operasional" />
          <Legend color={STATUS_META.berhenti.color} text="Berhenti sementara" />
          <Legend color={STATUS_META.suspend.color} text="Suspend" />
        </div>
      </section>
    </div>
  );
}

function BigStat({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  accent: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className={`text-2xl font-bold tabular-nums ${accent}`}>{value}</div>
      <div className="text-[11px] font-medium leading-tight text-slate-600">
        {label}
      </div>
      <div className="text-[10px] leading-tight text-slate-400">{sub}</div>
    </div>
  );
}

function MiniStat({
  dot,
  label,
  value,
}: {
  dot: string;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-2.5 py-2">
      <span
        className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
        style={{ background: dot }}
      />
      <div className="min-w-0">
        <div className="text-base font-bold leading-none tabular-nums text-slate-800">
          {value}
        </div>
        <div className="truncate text-[10px] leading-tight text-slate-500">
          {label}
        </div>
      </div>
    </div>
  );
}

function PMRow({
  label,
  value,
  bold,
  indent,
}: {
  label: string;
  value: number;
  bold?: boolean;
  indent?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between border-b border-slate-100 px-3 py-1.5 text-xs ${
        bold ? "font-semibold text-slate-800" : "text-slate-600"
      } ${indent ? "pl-5" : ""}`}
    >
      <span>{label}</span>
      <span className="tabular-nums">{fmt(value)}</span>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-brand"
      />
      {label}
    </label>
  );
}

function Legend({ color, text }: { color: string; text: string }) {
  return (
    <div className="flex items-center gap-2 text-slate-600">
      <span
        className="inline-block h-3 w-3 rounded-full border border-white shadow-sm"
        style={{ background: color }}
      />
      {text}
    </div>
  );
}
