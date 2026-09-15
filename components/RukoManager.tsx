"use client";

import type { Sppg, CandidateRuko } from "@/lib/types";
import { sppgDalamRadius } from "@/lib/geo";

interface Props {
  rukoList: CandidateRuko[];
  sppgList: Sppg[];
  selectedRukoId: string | null;
  placingRuko: boolean;
  onStartPlacing: () => void;
  onSelect: (id: string) => void;
  onUpdate: (r: CandidateRuko) => void;
  onDelete: (id: string) => void;
}

export default function RukoManager({
  rukoList,
  sppgList,
  selectedRukoId,
  placingRuko,
  onStartPlacing,
  onSelect,
  onUpdate,
  onDelete,
}: Props) {
  return (
    <div className="space-y-2">
      <button
        onClick={onStartPlacing}
        className={`w-full rounded px-2 py-1.5 text-sm font-semibold ${
          placingRuko
            ? "bg-blue-600 text-white"
            : "border border-blue-600 text-blue-600 hover:bg-blue-50"
        }`}
      >
        {placingRuko ? "Klik di peta untuk menaruh ruko…" : "🏪 Tambah calon ruko"}
      </button>

      {rukoList.length === 0 && (
        <p className="text-xs text-slate-500">
          Belum ada calon ruko. Tambahkan lalu lihat berapa dapur yang masuk
          jangkauannya.
        </p>
      )}

      {rukoList.map((r) => {
        const inRange = sppgDalamRadius(r, sppgList, r.radiusKm);
        const totalPorsi = inRange.reduce((a, s) => a + (s.porsi || 0), 0);
        const selected = r.id === selectedRukoId;
        return (
          <div
            key={r.id}
            className={`rounded border p-2 text-sm ${
              selected ? "border-blue-500 bg-blue-50" : "border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <input
                className="min-w-0 flex-1 bg-transparent font-semibold focus:outline-none"
                value={r.nama}
                onChange={(e) => onUpdate({ ...r, nama: e.target.value })}
              />
              <button
                onClick={() => onSelect(r.id)}
                className="text-xs text-blue-600 hover:underline"
              >
                {selected ? "aktif" : "pilih"}
              </button>
            </div>

            <div className="mt-1 flex items-center gap-2 text-xs">
              <label className="text-slate-500">Radius</label>
              <input
                type="range"
                min={0.5}
                max={15}
                step={0.5}
                value={r.radiusKm}
                onChange={(e) =>
                  onUpdate({ ...r, radiusKm: parseFloat(e.target.value) })
                }
                className="flex-1"
              />
              <span className="w-12 text-right tabular-nums">
                {r.radiusKm} km
              </span>
            </div>

            <label className="mt-1 flex items-center gap-1 text-xs">
              <input
                type="checkbox"
                checked={r.buka24Jam}
                onChange={(e) =>
                  onUpdate({ ...r, buka24Jam: e.target.checked })
                }
              />
              Buka 24 jam
            </label>

            <textarea
              className="mt-1 w-full rounded border border-slate-200 px-1 py-0.5 text-xs focus:outline-none"
              rows={1}
              placeholder="Catatan (mis. dekat pasar, sewa 2 lantai)"
              value={r.catatan}
              onChange={(e) => onUpdate({ ...r, catatan: e.target.value })}
            />

            <div className="mt-1 rounded bg-slate-100 px-2 py-1 text-xs">
              <span className="font-semibold text-brand">
                {inRange.length} dapur
              </span>{" "}
              dalam jangkauan · est.{" "}
              <span className="font-semibold">
                {totalPorsi.toLocaleString("id-ID")}
              </span>{" "}
              porsi/hari
            </div>

            <button
              onClick={() => onDelete(r.id)}
              className="mt-1 text-xs text-red-600 hover:underline"
            >
              Hapus
            </button>
          </div>
        );
      })}
    </div>
  );
}
