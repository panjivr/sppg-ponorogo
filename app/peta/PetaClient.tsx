"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import Sheet from "@/components/Sheet";
import { Btn, StatusBadge, StatusDot } from "@/components/ui";
import { useIsDesktop } from "@/lib/useMediaQuery";
import { rukoRepo, sppgRepo } from "@/lib/store";
import {
  FILTER_KOSONG,
  daftarKecamatan,
  nilaiBahanTahunan,
  terapkanFilter,
  type Filter,
} from "@/lib/data";
import { haversineKm, urutTerdekat, type LatLng } from "@/lib/geo";
import { ASUMSI } from "@/lib/config";
import { km, num, persen, rupiahRingkas } from "@/lib/format";
import {
  STATUS_META,
  STATUS_ORDER,
  type CandidateRuko,
  type Sppg,
  type SppgStatus,
} from "@/lib/types";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-surface2 text-sm text-ink2">
      Memuat peta…
    </div>
  ),
});

type Tab = "cari" | "ruko" | "layer";
const input =
  "w-full rounded-lg border border-hairline bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-seqA focus:outline-none";

export default function PetaClient() {
  const isDesktop = useIsDesktop();

  const [all, setAll] = useState<Sppg[]>([]);
  const [ruko, setRuko] = useState<CandidateRuko[]>([]);
  const [filter, setFilter] = useState<Filter>(FILTER_KOSONG);
  const [tab, setTab] = useState<Tab>("cari");
  const [selSppg, setSelSppg] = useState<string | null>(null);
  const [selRuko, setSelRuko] = useState<string | null>(null);
  const [fly, setFly] = useState<LatLng | null>(null);
  const [radiusKm, setRadiusKm] = useState(5);
  const [heat, setHeat] = useState(false);
  const [rekom, setRekom] = useState(false);
  const [taruhRuko, setTaruhRuko] = useState(false);
  const [sheetTutup, setSheetTutup] = useState(0);

  useEffect(() => {
    void sppgRepo.all().then(setAll);
    void rukoRepo.all().then(setRuko);
  }, []);

  const kecamatanList = useMemo(() => daftarKecamatan(all), [all]);
  const tampil = useMemo(() => terapkanFilter(all, filter), [all, filter]);
  const aktifRuko = ruko.find((r) => r.id === selRuko) ?? null;

  const persistRuko = useCallback((list: CandidateRuko[]) => {
    setRuko(list);
    void rukoRepo.saveAll(list);
  }, []);

  /* ---------------- Interaksi peta ---------------- */

  function onMapClick(p: LatLng) {
    if (!taruhRuko) return;
    const r: CandidateRuko = {
      id: `ruko-${Date.now()}`,
      nama: `Calon ruko ${ruko.length + 1}`,
      lat: p.lat,
      lng: p.lng,
      catatan: "",
      radiusKm,
      buka24Jam: true,
      sewaBulanan: 0,
      createdAt: Date.now(),
    };
    persistRuko([...ruko, r]);
    setSelRuko(r.id);
    setTaruhRuko(false);
    setTab("ruko");
  }

  function pilihSppg(id: string) {
    setSelSppg(id);
    const s = all.find((x) => x.id === id);
    if (s) setFly({ lat: s.lat, lng: s.lng });
  }

  /* ---------------- Panel (dipakai desktop & mobile) ---------------- */

  const panel = (
    <div className="space-y-4 pt-2">
      {/* Tab */}
      <div
        role="tablist"
        aria-label="Panel peta"
        className="flex rounded-lg bg-surface2 p-1"
      >
        {(
          [
            ["cari", `Cari (${tampil.length})`],
            ["ruko", `Ruko (${ruko.length})`],
            ["layer", "Lapisan"],
          ] as [Tab, string][]
        ).map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`flex-1 rounded-md px-2 py-1.5 text-xs font-semibold transition sm:text-sm ${
              tab === id ? "bg-surface text-ink shadow-sm" : "text-ink2"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ---------------- Tab: Cari ---------------- */}
      {tab === "cari" && (
        <div className="space-y-3">
          <div>
            <label htmlFor="q" className="sr-only">
              Cari dapur SPPG
            </label>
            <input
              id="q"
              type="search"
              inputMode="search"
              className={input}
              placeholder="Cari nama, desa, kecamatan, alamat…"
              value={filter.q}
              onChange={(e) => setFilter({ ...filter, q: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label
                htmlFor="kec"
                className="mb-1 block text-xs font-medium text-ink2"
              >
                Kecamatan
              </label>
              <select
                id="kec"
                className={input}
                value={filter.kecamatan}
                onChange={(e) =>
                  setFilter({ ...filter, kecamatan: e.target.value })
                }
              >
                <option value="">Semua ({kecamatanList.length})</option>
                {kecamatanList.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="st"
                className="mb-1 block text-xs font-medium text-ink2"
              >
                Status
              </label>
              <select
                id="st"
                className={input}
                value={filter.status}
                onChange={(e) =>
                  setFilter({
                    ...filter,
                    status: e.target.value as SppgStatus | "",
                  })
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

          <label className="flex items-center gap-2 text-xs text-ink2">
            <input
              type="checkbox"
              checked={filter.hanyaPastiKoordinat}
              onChange={(e) =>
                setFilter({ ...filter, hanyaPastiKoordinat: e.target.checked })
              }
            />
            Hanya koordinat GPS pasti
          </label>

          {(filter.q || filter.kecamatan || filter.status) && (
            <Btn
              variant="ghost"
              onClick={() => setFilter(FILTER_KOSONG)}
              className="w-full"
            >
              ✕ Hapus semua filter
            </Btn>
          )}

          <div className="rounded-lg bg-surface2 px-3 py-2 text-xs text-ink2">
            <strong className="text-ink">{tampil.length}</strong> dapur ·{" "}
            <strong className="text-ink">
              {num(tampil.reduce((a, s) => a + s.porsi, 0))}
            </strong>{" "}
            penerima manfaat/hari
          </div>

          <ul className="space-y-1.5">
            {tampil.map((s) => (
              <li key={s.id}>
                <button
                  onClick={() => pilihSppg(s.id)}
                  className={`w-full rounded-lg border p-2.5 text-left transition ${
                    selSppg === s.id
                      ? "border-seqA bg-surface2"
                      : "border-hairline hover:bg-surface2"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="mt-1.5">
                      <StatusDot status={s.status} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {s.nama}
                      </span>
                      <span className="block truncate text-xs text-muted">
                        {s.desa ? `${s.desa}, ` : ""}Kec. {s.kecamatan} ·{" "}
                        {num(s.porsi)} pm
                        {s.perkiraan ? " · perkiraan" : ""}
                      </span>
                    </span>
                  </div>
                </button>
              </li>
            ))}
            {tampil.length === 0 && (
              <li className="rounded-lg border border-hairline p-4 text-center text-sm text-ink2">
                Tidak ada dapur yang cocok. Coba hapus filter.
              </li>
            )}
          </ul>
        </div>
      )}

      {/* ---------------- Tab: Calon ruko ---------------- */}
      {tab === "ruko" && (
        <div className="space-y-3">
          <Btn
            onClick={() => setTaruhRuko(!taruhRuko)}
            variant={taruhRuko ? "solid" : "outline"}
            className="w-full"
          >
            {taruhRuko
              ? "👆 Ketuk peta untuk menaruh ruko…"
              : "🏪 Tambah calon ruko"}
          </Btn>

          <div>
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="rad" className="font-medium text-ink2">
                Radius antar default
              </label>
              <span className="tabular-nums font-semibold">{radiusKm} km</span>
            </div>
            <input
              id="rad"
              type="range"
              min={1}
              max={20}
              step={0.5}
              value={radiusKm}
              onChange={(e) => setRadiusKm(parseFloat(e.target.value))}
              className="mt-1 w-full accent-seqA"
            />
          </div>

          {ruko.length === 0 && (
            <p className="rounded-lg border border-hairline p-4 text-sm leading-relaxed text-ink2">
              Belum ada calon ruko. Tambahkan satu, lalu web akan menghitung
              berapa dapur yang terjangkau, nilai belanja bahannya per tahun,
              dan berapa pangsa yang perlu direbut agar sewa tertutup.
            </p>
          )}

          {ruko.map((r) => {
            const dalam = all.filter(
              (s) => haversineKm(r, s) <= r.radiusKm
            );
            const aktif = dalam.filter((s) => s.status === "operasional");
            const porsi = aktif.reduce((a, s) => a + s.porsi, 0);
            const nilai = nilaiBahanTahunan(porsi);
            const sewaTahun = r.sewaBulanan * 12;
            const labaPotensi = nilai * ASUMSI.marginKotor;
            const butuhPangsa = labaPotensi > 0 ? sewaTahun / labaPotensi : 0;
            const sel = r.id === selRuko;

            return (
              <div
                key={r.id}
                className={`rounded-xl border p-3 ${
                  sel ? "border-seqA bg-surface2" : "border-hairline"
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    className="min-w-0 flex-1 bg-transparent text-sm font-semibold focus:outline-none"
                    value={r.nama}
                    aria-label="Nama calon ruko"
                    onChange={(e) =>
                      persistRuko(
                        ruko.map((x) =>
                          x.id === r.id ? { ...x, nama: e.target.value } : x
                        )
                      )
                    }
                  />
                  <button
                    onClick={() => {
                      setSelRuko(sel ? null : r.id);
                      if (!sel) setFly({ lat: r.lat, lng: r.lng });
                    }}
                    className="shrink-0 text-xs font-semibold text-seqA hover:underline"
                  >
                    {sel ? "aktif" : "pilih"}
                  </button>
                </div>

                <div className="mt-2 flex items-center gap-2 text-xs">
                  <span className="text-muted">Radius</span>
                  <input
                    type="range"
                    min={0.5}
                    max={20}
                    step={0.5}
                    value={r.radiusKm}
                    aria-label={`Radius antar ${r.nama}`}
                    onChange={(e) =>
                      persistRuko(
                        ruko.map((x) =>
                          x.id === r.id
                            ? { ...x, radiusKm: parseFloat(e.target.value) }
                            : x
                        )
                      )
                    }
                    className="flex-1 accent-seqA"
                  />
                  <span className="w-14 text-right tabular-nums font-semibold">
                    {r.radiusKm} km
                  </span>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg bg-surface p-2">
                    <div className="text-muted">Dapur terjangkau</div>
                    <div className="text-base font-bold text-brand">
                      {dalam.length}
                    </div>
                    <div className="text-muted">{aktif.length} operasional</div>
                  </div>
                  <div className="rounded-lg bg-surface p-2">
                    <div className="text-muted">Pasar bahan/tahun</div>
                    <div className="text-base font-bold text-seqB">
                      {rupiahRingkas(nilai)}
                    </div>
                    <div className="text-muted">{num(porsi)} pm/hari</div>
                  </div>
                </div>

                <label className="mt-2 block text-xs">
                  <span className="text-muted">Estimasi sewa / bulan (Rp)</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={500000}
                    value={r.sewaBulanan || ""}
                    placeholder="mis. 3000000"
                    className={`${input} mt-1`}
                    onChange={(e) =>
                      persistRuko(
                        ruko.map((x) =>
                          x.id === r.id
                            ? {
                                ...x,
                                sewaBulanan: parseInt(e.target.value, 10) || 0,
                              }
                            : x
                        )
                      )
                    }
                  />
                </label>

                {r.sewaBulanan > 0 && labaPotensi > 0 && (
                  <p className="mt-2 rounded-lg bg-brand-soft px-2 py-1.5 text-xs leading-relaxed text-brand">
                    Untuk menutup sewa {rupiahRingkas(sewaTahun)}/tahun, Anda
                    perlu merebut{" "}
                    <strong>{persen(butuhPangsa, 1)}</strong> pasar dalam radius
                    ini (asumsi margin kotor {persen(ASUMSI.marginKotor)}).
                  </p>
                )}

                <label className="mt-2 flex items-center gap-2 text-xs text-ink2">
                  <input
                    type="checkbox"
                    checked={r.buka24Jam}
                    onChange={(e) =>
                      persistRuko(
                        ruko.map((x) =>
                          x.id === r.id
                            ? { ...x, buka24Jam: e.target.checked }
                            : x
                        )
                      )
                    }
                  />
                  Rencana buka 24 jam
                </label>

                <textarea
                  rows={2}
                  className={`${input} mt-2 text-xs`}
                  placeholder="Catatan: dekat pasar, akses truk, listrik, dll."
                  value={r.catatan}
                  aria-label={`Catatan ${r.nama}`}
                  onChange={(e) =>
                    persistRuko(
                      ruko.map((x) =>
                        x.id === r.id ? { ...x, catatan: e.target.value } : x
                      )
                    )
                  }
                />

                {sel && dalam.length > 0 && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs font-semibold text-ink2">
                      Dapur terdekat dari ruko ini
                    </summary>
                    <ol className="mt-1.5 space-y-1">
                      {urutTerdekat(r, dalam)
                        .slice(0, 8)
                        .map(({ sppg, km: d }) => (
                          <li
                            key={sppg.id}
                            className="flex items-center justify-between gap-2 text-xs"
                          >
                            <span className="flex min-w-0 items-center gap-1.5">
                              <StatusDot status={sppg.status} />
                              <span className="truncate">{sppg.nama}</span>
                            </span>
                            <span className="shrink-0 tabular-nums text-muted">
                              {km(d)}
                            </span>
                          </li>
                        ))}
                    </ol>
                  </details>
                )}

                <div className="mt-2 flex gap-2">
                  <Btn
                    variant="danger"
                    className="flex-1 !py-1.5 !text-xs"
                    onClick={() => {
                      persistRuko(ruko.filter((x) => x.id !== r.id));
                      if (sel) setSelRuko(null);
                    }}
                  >
                    Hapus
                  </Btn>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ---------------- Tab: Lapisan ---------------- */}
      {tab === "layer" && (
        <div className="space-y-4">
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="mt-1"
              checked={heat}
              onChange={(e) => setHeat(e.target.checked)}
            />
            <span>
              <span className="font-medium">Heatmap permintaan</span>
              <span className="block text-xs text-ink2">
                Area panas = penerima manfaat terpadat.
              </span>
            </span>
          </label>

          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="mt-1"
              checked={rekom}
              onChange={(e) => setRekom(e.target.checked)}
            />
            <span>
              <span className="font-medium">Rekomendasi lokasi</span>
              <span className="block text-xs text-ink2">
                ⭐ pusat gravitasi permintaan · 🟠 3 kandidat terbaik dalam
                radius {radiusKm} km, disebar minimal 4 km agar tidak menumpuk.
              </span>
            </span>
          </label>

          <div className="border-t border-hairline pt-3">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
              Keterangan warna
            </h3>
            <ul className="space-y-1.5">
              {STATUS_ORDER.map((s) => (
                <li key={s} className="flex items-center gap-2 text-sm">
                  <StatusDot status={s} />
                  <span className="text-ink2">{STATUS_META[s].label}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs leading-relaxed text-muted">
              Titik besar = dapur operasional. Titik kecil = belum/berhenti
              beroperasi. Warna selalu disertai label agar tetap terbaca oleh
              pengguna buta warna.
            </p>
          </div>
        </div>
      )}
    </div>
  );

  /* ---------------- Layout ---------------- */

  return (
    <div className="relative flex h-[calc(100dvh-3.25rem)] flex-col md:h-[calc(100dvh-3.5rem)] md:flex-row">
      {/* Sidebar: tablet & desktop */}
      {isDesktop && (
        <aside className="scroll-y w-80 shrink-0 border-r border-hairline bg-surface px-4 pb-6 lg:w-96">
          {panel}
        </aside>
      )}

      {/* Peta */}
      <section className="relative min-h-0 flex-1">
        {taruhRuko && (
          <div
            role="status"
            className="pointer-events-none absolute left-1/2 top-3 z-[1000] -translate-x-1/2 rounded-full bg-seqA px-4 py-1.5 text-xs font-semibold text-white shadow-lg"
          >
            Ketuk peta untuk menaruh calon ruko
          </div>
        )}
        <MapView
          sppgList={tampil}
          rukoList={ruko}
          selectedRukoId={selRuko}
          selectedSppgId={selSppg}
          flyTarget={fly}
          radiusKm={radiusKm}
          showHeatmap={heat}
          showRekomendasi={rekom}
          bottomInset={isDesktop ? 0 : sheetTutup}
          onMapClick={onMapClick}
          onSelectRuko={(id) => {
            setSelRuko(id);
            setTab("ruko");
          }}
          onSelectSppg={setSelSppg}
        />
      </section>

      {/* Bottom sheet: mobile */}
      {!isDesktop && (
        <Sheet
          title={`${tampil.length} dapur · panel analisis`}
          onCoverChange={setSheetTutup}
        >
          {panel}
        </Sheet>
      )}
    </div>
  );
}
