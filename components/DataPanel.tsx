"use client";

import { useMemo, useState } from "react";
import type { Sppg, SppgStatus } from "@/lib/types";
import { statusMeta, fmt, STATUS_META, perijinanProgress } from "@/lib/sppgMeta";
import SppgDetailCard from "@/components/SppgDetailCard";

interface Props {
  sppgList: Sppg[];
  onAdd: () => void;
  onEdit: (s: Sppg) => void;
  onFocus: (s: Sppg) => void;
  onShowYayasan: (nama: string) => void;
}

type StatusFilter = "all" | SppgStatus;

export default function DataPanel({
  sppgList,
  onAdd,
  onEdit,
  onFocus,
  onShowYayasan,
}: Props) {
  const [q, setQ] = useState("");
  const [kec, setKec] = useState("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const yayasanCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const s of sppgList) {
      const y = s.detail?.yayasan?.trim();
      if (y) m.set(y, (m.get(y) ?? 0) + 1);
    }
    return m;
  }, [sppgList]);

  const kecamatanList = useMemo(
    () =>
      Array.from(new Set(sppgList.map((s) => s.kecamatan)))
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b, "id")),
    [sppgList]
  );

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return sppgList
      .filter((s) => {
        if (kec !== "all" && s.kecamatan !== kec) return false;
        if (status !== "all" && s.status !== status) return false;
        if (!needle) return true;
        return (
          s.nama.toLowerCase().includes(needle) ||
          s.alamat.toLowerCase().includes(needle) ||
          (s.desa ?? "").toLowerCase().includes(needle) ||
          (s.detail?.namaKa ?? "").toLowerCase().includes(needle) ||
          (s.detail?.yayasan ?? "").toLowerCase().includes(needle) ||
          (s.detail?.idSppg ?? "").toLowerCase().includes(needle)
        );
      })
      .sort(
        (a, b) =>
          a.kecamatan.localeCompare(b.kecamatan, "id") ||
          a.nama.localeCompare(b.nama, "id")
      );
  }, [sppgList, q, kec, status]);

  return (
    <div className="space-y-3">
      <button
        onClick={onAdd}
        className="w-full rounded-md bg-brand px-2 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-dark"
      >
        + Tambah SPPG baru
      </button>

      {/* Pencarian & filter */}
      <div className="space-y-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari nama, alamat, kepala SPPG, yayasan, ID…"
          className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
        <div className="flex gap-2">
          <select
            value={kec}
            onChange={(e) => setKec(e.target.value)}
            className="min-w-0 flex-1 rounded-md border border-slate-300 px-2 py-1.5 text-xs focus:border-brand focus:outline-none"
          >
            <option value="all">Semua kecamatan</option>
            {kecamatanList.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusFilter)}
            className="min-w-0 flex-1 rounded-md border border-slate-300 px-2 py-1.5 text-xs focus:border-brand focus:outline-none"
          >
            <option value="all">Semua status</option>
            {(Object.keys(STATUS_META) as SppgStatus[]).map((s) => (
              <option key={s} value={s}>
                {STATUS_META[s].label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>
          Menampilkan <strong className="text-slate-700">{filtered.length}</strong>{" "}
          dari {sppgList.length} dapur
        </span>
        {(q || kec !== "all" || status !== "all") && (
          <button
            onClick={() => {
              setQ("");
              setKec("all");
              setStatus("all");
            }}
            className="text-brand hover:underline"
          >
            reset filter
          </button>
        )}
      </div>

      {/* Daftar */}
      <ul className="space-y-1.5">
        {filtered.map((s) => {
          const meta = statusMeta(s.status);
          const open = openId === s.id;
          return (
            <li
              key={s.id}
              className="overflow-hidden rounded-lg border border-slate-200 bg-white"
            >
              <button
                onClick={() => setOpenId(open ? null : s.id)}
                className="flex w-full items-center gap-2 px-2.5 py-2 text-left hover:bg-slate-50"
              >
                <span
                  className="mt-0.5 inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: meta.color }}
                  title={meta.label}
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-slate-800">
                    {s.nama}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-1.5 text-[11px] text-slate-500">
                    <span className="truncate">
                      {s.desa ? `${s.desa} · ` : ""}
                      {s.kecamatan} · {fmt(s.porsi)} PM/hari
                    </span>
                    {s.detail?.perijinan && (
                      <span className="rounded bg-slate-100 px-1 py-px text-[10px] font-medium text-slate-500">
                        izin {perijinanProgress(s.detail.perijinan).done}/
                        {perijinanProgress(s.detail.perijinan).total}
                      </span>
                    )}
                  </div>
                </div>
                <span className="shrink-0 text-slate-400">{open ? "▾" : "▸"}</span>
              </button>

              {open && (
                <div className="border-t border-slate-100 bg-slate-50/60 px-3 py-3">
                  <SppgDetailCard
                    s={s}
                    yayasanCount={
                      s.detail?.yayasan
                        ? (yayasanCounts.get(s.detail.yayasan.trim()) ?? 1) - 1
                        : 0
                    }
                    onShowYayasan={() =>
                      s.detail?.yayasan && onShowYayasan(s.detail.yayasan.trim())
                    }
                  />
                  <div className="mt-3 flex gap-2 border-t border-slate-200 pt-2">
                    <button
                      onClick={() => onFocus(s)}
                      className="flex-1 rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-white"
                    >
                      🗺 Lihat di peta
                    </button>
                    <button
                      onClick={() => onEdit(s)}
                      className="flex-1 rounded-md border border-brand px-2 py-1 text-xs font-medium text-brand hover:bg-brand hover:text-white"
                    >
                      ✎ Edit
                    </button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
        {filtered.length === 0 && (
          <li className="rounded-lg border border-dashed border-slate-300 px-3 py-6 text-center text-sm text-slate-400">
            Tidak ada dapur yang cocok dengan filter.
          </li>
        )}
      </ul>
    </div>
  );
}
