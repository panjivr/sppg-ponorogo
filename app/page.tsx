"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { Sppg, CandidateRuko } from "@/lib/types";
import type { LatLng } from "@/lib/geo";
import {
  getAllSppg,
  addSppg,
  updateSppg,
  deleteSppg,
  getRuko,
  saveRuko,
} from "@/lib/storage";
import ControlPanel from "@/components/ControlPanel";
import RukoManager from "@/components/RukoManager";
import SppgForm from "@/components/SppgForm";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-slate-200 text-slate-500">
      Memuat peta…
    </div>
  ),
});

type Tab = "analisis" | "ruko" | "data";
type PlacingMode = "none" | "ruko" | "sppg";

export default function Home() {
  const [sppgList, setSppgList] = useState<Sppg[]>([]);
  const [rukoList, setRukoList] = useState<CandidateRuko[]>([]);
  const [selectedRukoId, setSelectedRukoId] = useState<string | null>(null);
  const [radiusKm, setRadiusKm] = useState(3);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showRekomendasi, setShowRekomendasi] = useState(false);
  const [tab, setTab] = useState<Tab>("analisis");
  const [placing, setPlacing] = useState<PlacingMode>("none");
  const [editingSppg, setEditingSppg] = useState<Sppg | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [pickedCoord, setPickedCoord] = useState<LatLng | null>(null);

  // muat data dari localStorage + seed setelah mount (hindari mismatch SSR)
  useEffect(() => {
    setSppgList(getAllSppg());
    setRukoList(getRuko());
  }, []);

  function refreshSppg() {
    setSppgList(getAllSppg());
  }

  function persistRuko(list: CandidateRuko[]) {
    setRukoList(list);
    saveRuko(list);
  }

  function handleMapClick(p: LatLng) {
    if (placing === "ruko") {
      const r: CandidateRuko = {
        id: `ruko-${Date.now()}`,
        nama: `Calon ruko ${rukoList.length + 1}`,
        lat: p.lat,
        lng: p.lng,
        catatan: "",
        radiusKm,
        buka24Jam: true,
        createdAt: Date.now(),
      };
      persistRuko([...rukoList, r]);
      setSelectedRukoId(r.id);
      setPlacing("none");
      setTab("ruko");
    } else if (placing === "sppg") {
      setPickedCoord(p);
      setPlacing("none");
    }
  }

  function handleSaveSppg(s: Sppg) {
    if (editingSppg) updateSppg(s);
    else addSppg(s);
    refreshSppg();
    setShowForm(false);
    setEditingSppg(null);
    setPickedCoord(null);
  }

  function handleDeleteSppg(id: string) {
    deleteSppg(id);
    refreshSppg();
    setShowForm(false);
    setEditingSppg(null);
  }

  const placingHint = useMemo(() => {
    if (placing === "ruko") return "Mode: klik peta untuk menaruh calon ruko";
    if (placing === "sppg") return "Mode: klik peta untuk memilih koordinat SPPG";
    return null;
  }, [placing]);

  return (
    <main className="flex h-screen flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="flex w-full flex-col border-b border-slate-200 bg-white md:h-full md:w-96 md:border-b-0 md:border-r">
        <header className="bg-brand px-4 py-3 text-white">
          <h1 className="text-base font-bold leading-tight">
            Peta SPPG Ponorogo
          </h1>
          <p className="text-xs text-brand-light">
            Analisis lokasi ruko supplier dapur MBG
          </p>
        </header>

        <nav className="flex border-b border-slate-200 text-sm">
          {(
            [
              ["analisis", "Analisis"],
              ["ruko", "Calon Ruko"],
              ["data", "Data SPPG"],
            ] as [Tab, string][]
          ).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 px-2 py-2 ${
                tab === id
                  ? "border-b-2 border-brand font-semibold text-brand"
                  : "text-slate-500"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="flex-1 overflow-y-auto p-4">
          {tab === "analisis" && (
            <ControlPanel
              sppgList={sppgList}
              radiusKm={radiusKm}
              showHeatmap={showHeatmap}
              showRekomendasi={showRekomendasi}
              onRadiusChange={setRadiusKm}
              onToggleHeatmap={setShowHeatmap}
              onToggleRekomendasi={setShowRekomendasi}
            />
          )}

          {tab === "ruko" && (
            <RukoManager
              rukoList={rukoList}
              sppgList={sppgList}
              selectedRukoId={selectedRukoId}
              placingRuko={placing === "ruko"}
              onStartPlacing={() => setPlacing("ruko")}
              onSelect={(id) =>
                setSelectedRukoId((cur) => (cur === id ? null : id))
              }
              onUpdate={(r) =>
                persistRuko(rukoList.map((x) => (x.id === r.id ? r : x)))
              }
              onDelete={(id) => {
                persistRuko(rukoList.filter((x) => x.id !== id));
                if (selectedRukoId === id) setSelectedRukoId(null);
              }}
            />
          )}

          {tab === "data" && (
            <div className="space-y-3">
              {!showForm && (
                <button
                  onClick={() => {
                    setEditingSppg(null);
                    setPickedCoord(null);
                    setShowForm(true);
                  }}
                  className="w-full rounded bg-brand px-2 py-1.5 text-sm font-semibold text-white hover:bg-brand-dark"
                >
                  + Tambah SPPG baru
                </button>
              )}

              {showForm && (
                <div className="rounded border border-slate-200 p-2">
                  <SppgForm
                    editing={editingSppg}
                    pickedCoord={pickedCoord}
                    onRequestPick={() => setPlacing("sppg")}
                    onSave={handleSaveSppg}
                    onDelete={handleDeleteSppg}
                    onCancel={() => {
                      setShowForm(false);
                      setEditingSppg(null);
                      setPickedCoord(null);
                      setPlacing("none");
                    }}
                  />
                </div>
              )}

              <ul className="space-y-1 text-sm">
                {sppgList.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between gap-2 rounded border border-slate-100 px-2 py-1"
                  >
                    <div className="min-w-0">
                      <div className="truncate font-medium">{s.nama}</div>
                      <div className="truncate text-xs text-slate-500">
                        {s.kecamatan} · {s.status}
                        {s.perkiraan && " · perkiraan"}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setEditingSppg(s);
                        setPickedCoord(null);
                        setShowForm(true);
                      }}
                      className="shrink-0 text-xs text-brand hover:underline"
                    >
                      edit
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <footer className="border-t border-slate-200 px-4 py-2 text-[10px] text-slate-400">
          Data awal hasil riset sumber publik & sebagian koordinat perkiraan.
          Peta © OpenStreetMap.
        </footer>
      </aside>

      {/* Peta */}
      <section className="relative h-72 flex-1 md:h-full">
        {placingHint && (
          <div className="pointer-events-none absolute left-1/2 top-3 z-[1000] -translate-x-1/2 rounded-full bg-blue-600 px-4 py-1.5 text-xs font-medium text-white shadow-lg">
            {placingHint}
          </div>
        )}
        <MapView
          sppgList={sppgList}
          rukoList={rukoList}
          selectedRukoId={selectedRukoId}
          radiusKm={radiusKm}
          showHeatmap={showHeatmap}
          showRekomendasi={showRekomendasi}
          onMapClick={handleMapClick}
          onSelectRuko={(id) => {
            setSelectedRukoId(id);
            setTab("ruko");
          }}
        />
      </section>
    </main>
  );
}
