"use client";

import { useEffect, useMemo, useState } from "react";
import { NavSpacer } from "@/components/Nav";
import { Btn, StatusBadge, StatusDot } from "@/components/ui";
import { sppgRepo } from "@/lib/store";
import {
  FILTER_KOSONG,
  daftarKecamatan,
  keCsv,
  keGeoJson,
  terapkanFilter,
  unduh,
  type Filter,
} from "@/lib/data";
import { num } from "@/lib/format";
import { type Sppg, type SppgStatus } from "@/lib/types";
import { STATUS_META, STATUS_ORDER } from "@/lib/sppgMeta";

type SortKey = "nama" | "kecamatan" | "porsi" | "status";

const input =
  "w-full rounded-lg border border-hairline bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-seqA focus:outline-none";

export default function DirektoriClient() {
  const [all, setAll] = useState<Sppg[]>([]);
  const [filter, setFilter] = useState<Filter>(FILTER_KOSONG);
  const [sortKey, setSortKey] = useState<SortKey>("porsi");
  const [asc, setAsc] = useState(false);

  useEffect(() => {
    void sppgRepo.all().then(setAll);
  }, []);

  const kecamatanList = useMemo(() => daftarKecamatan(all), [all]);

  const rows = useMemo(() => {
    const out = terapkanFilter(all, filter);
    const dir = asc ? 1 : -1;
    return [...out].sort((a, b) => {
      if (sortKey === "porsi") return (a.porsi - b.porsi) * dir;
      if (sortKey === "status")
        return (
          (STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status)) *
          dir
        );
      return String(a[sortKey]).localeCompare(String(b[sortKey]), "id") * dir;
    });
  }, [all, filter, sortKey, asc]);

  const totalPorsi = rows.reduce((a, s) => a + s.porsi, 0);

  function sortBy(k: SortKey) {
    if (k === sortKey) setAsc(!asc);
    else {
      setSortKey(k);
      setAsc(k === "nama" || k === "kecamatan");
    }
  }

  const th = (k: SortKey, label: string, align = "left") => (
    <th
      scope="col"
      className={`py-2 ${align === "right" ? "pl-3 text-right" : "pr-3 text-left"} font-medium`}
      aria-sort={sortKey === k ? (asc ? "ascending" : "descending") : "none"}
    >
      <button
        onClick={() => sortBy(k)}
        className="inline-flex items-center gap-1 hover:text-ink"
      >
        {label}
        <span aria-hidden="true" className="text-[10px]">
          {sortKey === k ? (asc ? "▲" : "▼") : "↕"}
        </span>
      </button>
    </th>
  );

  return (
    <div className="safe-x mx-auto max-w-content px-4 py-6 sm:py-8">
      <header className="mb-5">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Direktori SPPG Ponorogo
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink2">
          Seluruh {all.length} dapur beserta desa, status, penerima manfaat,
          alamat, dan koordinat. Bisa dicari, diurutkan, dan diekspor untuk
          diolah di Excel atau QGIS.
        </p>
      </header>

      {/* ---- Kontrol: satu baris di atas tabel ---- */}
      <div className="mb-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <label htmlFor="cari" className="sr-only">
            Cari dapur
          </label>
          <input
            id="cari"
            type="search"
            inputMode="search"
            className={input}
            placeholder="Cari nama, desa, kecamatan, alamat…"
            value={filter.q}
            onChange={(e) => setFilter({ ...filter, q: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="kecd" className="sr-only">
            Kecamatan
          </label>
          <select
            id="kecd"
            className={input}
            value={filter.kecamatan}
            onChange={(e) => setFilter({ ...filter, kecamatan: e.target.value })}
          >
            <option value="">Semua kecamatan</option>
            {kecamatanList.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="std" className="sr-only">
            Status
          </label>
          <select
            id="std"
            className={input}
            value={filter.status}
            onChange={(e) =>
              setFilter({ ...filter, status: e.target.value as SppgStatus | "" })
            }
          >
            <option value="">Semua status</option>
            {STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {STATUS_META[s].label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="rounded-lg bg-surface2 px-3 py-1.5 text-xs text-ink2">
          <strong className="text-ink">{rows.length}</strong> dapur ·{" "}
          <strong className="text-ink">{num(totalPorsi)}</strong> penerima
          manfaat/hari
        </span>
        <div className="ml-auto flex gap-2">
          <Btn
            variant="outline"
            className="!py-1.5 !text-xs"
            onClick={() =>
              unduh("sppg-ponorogo.csv", keCsv(rows), "text/csv")
            }
          >
            ⬇ CSV
          </Btn>
          <Btn
            variant="outline"
            className="!py-1.5 !text-xs"
            onClick={() =>
              unduh(
                "sppg-ponorogo.geojson",
                keGeoJson(rows),
                "application/geo+json"
              )
            }
          >
            ⬇ GeoJSON
          </Btn>
        </div>
      </div>

      {/* ---- Kartu: HP ---- */}
      <ul className="space-y-2 md:hidden">
        {rows.map((s) => (
          <li
            key={s.id}
            className="rounded-xl border border-hairline bg-surface p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <h2 className="min-w-0 flex-1 text-sm font-semibold">{s.nama}</h2>
              <StatusBadge status={s.status} size="xs" />
            </div>
            <p className="mt-1 text-xs text-muted">
              {s.desa ? `${s.desa}, ` : ""}Kec. {s.kecamatan}
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-ink2">
              {s.alamat}
            </p>
            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="text-xs">
                <strong className="tabular-nums">{num(s.porsi)}</strong>
                <span className="text-muted"> pm/hari</span>
              </span>
              {s.gmaps && (
                <a
                  href={s.gmaps}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-seqA underline"
                >
                  📍 Maps
                </a>
              )}
            </div>
            {s.perkiraan && (
              <p className="mt-1.5 text-[11px] text-serious">
                ⚠ koordinat perkiraan
              </p>
            )}
          </li>
        ))}
      </ul>

      {/* ---- Tabel: tablet & desktop ---- */}
      <div className="table-wrap hidden rounded-xl border border-hairline bg-surface md:block">
        <table className="w-full min-w-[52rem] text-sm">
          <caption className="sr-only">
            Direktori dapur SPPG Kabupaten Ponorogo, dapat diurutkan
          </caption>
          <thead className="border-b border-hairline text-xs uppercase tracking-wide text-muted">
            <tr className="px-4">
              {th("nama", "Nama SPPG")}
              {th("kecamatan", "Kecamatan")}
              <th scope="col" className="py-2 pr-3 text-left font-medium">
                Desa
              </th>
              {th("status", "Status")}
              {th("porsi", "Penerima manfaat", "right")}
              <th scope="col" className="py-2 pr-3 text-left font-medium">
                Alamat
              </th>
              <th scope="col" className="py-2 text-left font-medium">
                Maps
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr
                key={s.id}
                className="border-b border-hairline last:border-0 hover:bg-surface2"
              >
                <th
                  scope="row"
                  className="max-w-[16rem] py-2.5 pr-3 text-left font-medium"
                >
                  <span className="flex items-center gap-2">
                    <StatusDot status={s.status} />
                    <span className="truncate">{s.nama}</span>
                  </span>
                </th>
                <td className="py-2.5 pr-3 text-ink2">{s.kecamatan}</td>
                <td className="py-2.5 pr-3 text-ink2">{s.desa ?? "—"}</td>
                <td className="py-2.5 pr-3">
                  <StatusBadge status={s.status} size="xs" />
                </td>
                <td className="py-2.5 pl-3 text-right tabular-nums font-semibold">
                  {num(s.porsi)}
                </td>
                <td className="max-w-[20rem] py-2.5 pr-3 text-xs leading-relaxed text-ink2">
                  {s.alamat}
                  {s.perkiraan && (
                    <span className="ml-1 whitespace-nowrap text-serious">
                      ⚠ perkiraan
                    </span>
                  )}
                </td>
                <td className="py-2.5">
                  {s.gmaps ? (
                    <a
                      href={s.gmaps}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-seqA underline"
                    >
                      buka
                    </a>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows.length === 0 && (
        <p className="rounded-xl border border-hairline p-6 text-center text-sm text-ink2">
          Tidak ada dapur yang cocok dengan pencarian.
        </p>
      )}

      <p className="mt-4 text-xs leading-relaxed text-muted">
        Ekspor mengikuti filter yang aktif. CSV memakai BOM UTF-8 agar Excel
        membaca huruf Indonesia dengan benar. GeoJSON siap dibuka di QGIS,
        Google Earth, atau Mapbox.
      </p>

      <NavSpacer />
    </div>
  );
}
