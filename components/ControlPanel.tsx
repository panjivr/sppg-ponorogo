"use client";

import type { Sppg } from "@/lib/types";

interface Props {
  sppgList: Sppg[];
  radiusKm: number;
  showHeatmap: boolean;
  showRekomendasi: boolean;
  onRadiusChange: (v: number) => void;
  onToggleHeatmap: (v: boolean) => void;
  onToggleRekomendasi: (v: boolean) => void;
}

export default function ControlPanel({
  sppgList,
  radiusKm,
  showHeatmap,
  showRekomendasi,
  onRadiusChange,
  onToggleHeatmap,
  onToggleRekomendasi,
}: Props) {
  const operasional = sppgList.filter((s) => s.status === "operasional").length;
  const totalPorsi = sppgList.reduce((a, s) => a + (s.porsi || 0), 0);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2 text-center">
        <Stat label="Total dapur" value={sppgList.length} />
        <Stat label="Operasional" value={operasional} />
        <Stat
          label="Porsi/hari"
          value={totalPorsi.toLocaleString("id-ID")}
        />
      </div>

      <div>
        <div className="flex items-center justify-between text-xs">
          <label className="font-medium">Radius analisis</label>
          <span className="tabular-nums">{radiusKm} km</span>
        </div>
        <input
          type="range"
          min={1}
          max={15}
          step={0.5}
          value={radiusKm}
          onChange={(e) => onRadiusChange(parseFloat(e.target.value))}
          className="w-full"
        />
        <p className="text-[11px] text-slate-500">
          Dipakai untuk menghitung kandidat titik terbaik (jangkauan supplier).
        </p>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={showHeatmap}
          onChange={(e) => onToggleHeatmap(e.target.checked)}
        />
        Heatmap kepadatan permintaan
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={showRekomendasi}
          onChange={(e) => onToggleRekomendasi(e.target.checked)}
        />
        Rekomendasi titik ruko terbaik
      </label>
      {showRekomendasi && (
        <p className="rounded bg-amber-50 px-2 py-1 text-[11px] text-amber-800">
          ⭐ titik pusat berbobot · 🔴 3 area dengan dapur terbanyak dalam radius
          {" "}
          {radiusKm} km. Perkiraan berdasarkan sebaran & status dapur.
        </p>
      )}

      <div className="border-t border-slate-200 pt-2 text-xs">
        <div className="mb-1 font-medium">Keterangan</div>
        <Legend color="#16a34a" text="Operasional" />
        <Legend color="#f59e0b" text="Akan operasional" />
        <Legend color="#94a3b8" text="Berhenti sementara" />
        <Legend color="#ef4444" text="Suspend" />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded bg-slate-100 px-1 py-1.5">
      <div className="text-sm font-bold text-brand">{value}</div>
      <div className="text-[10px] leading-tight text-slate-500">{label}</div>
    </div>
  );
}

function Legend({ color, text }: { color: string; text: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="inline-block h-3 w-3 rounded-full border border-white"
        style={{ background: color }}
      />
      {text}
    </div>
  );
}
