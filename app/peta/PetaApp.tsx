"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { Sppg, CandidateRuko, Pasar } from "@/lib/types";
import type { LatLng } from "@/lib/geo";
import {
  getAllSppg,
  addSppg,
  updateSppg,
  deleteSppg,
  getRuko,
  saveRuko,
  getAllPasar,
} from "@/lib/storage";
import ControlPanel from "@/components/ControlPanel";
import RukoManager from "@/components/RukoManager";
import SppgForm from "@/components/SppgForm";
import DataPanel from "@/components/DataPanel";

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

export default function PetaApp() {
  const [sppgList, setSppgList] = useState<Sppg[]>([]);
  const [rukoList, setRukoList] = useState<CandidateRuko[]>([]);
  const [selectedRukoId, setSelectedRukoId] = useState<string | null>(null);
  const [radiusKm, setRadiusKm] = useState(3);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showRekomendasi, setShowRekomendasi] = useState(false);
  const [showYayasan, setShowYayasan] = useState(false);
  const [selectedYayasan, setSelectedYayasan] = useState<string | null>(null);
  const [pasarList, setPasarList] = useState<Pasar[]>([]);
  const [showPasar, setShowPasar] = useState(false);
  const [tab, setTab] = useState<Tab>("analisis");
  const [placing, setPlacing] = useState<PlacingMode>("none");
  const [editingSppg, setEditingSppg] = useState<Sppg | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [pickedCoord, setPickedCoord] = useState<LatLng | null>(null);
  const [focusPoint, setFocusPoint] = useState<LatLng | null>(null);

  // muat data dari localStorage + seed setelah mount (hindari mismatch SSR)
  useEffect(() => {
    setSppgList(getAllSppg());
    setRukoList(getRuko());
    setPasarList(getAllPasar());
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
    <main className="flex min-h-[100dvh] flex-col md:h-[calc(100dvh-3.5rem)] md:flex-row">
      {/* Sidebar */}
      <aside className="safe-b flex w-full flex-col border-b border-slate-200 bg-white pb-16 md:h-full md:w-96 md:shrink-0 md:border-b-0 md:border-r md:pb-0 md:shadow-sm">
        {/* Di HP header ini redundan: brand, Blast WA & Katalog sudah ada di nav global. */}
        <header className="hidden items-center justify-between gap-2 bg-gradient-to-r from-brand-dark to-brand px-4 py-3.5 text-white md:flex">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/15 text-lg">
              🍚
            </span>
            <div>
              <h1 className="text-base font-bold leading-tight">
                Peta SPPG Ponorogo
              </h1>
              <p className="text-[11px] text-brand-light">
                Database dapur MBG &amp; analisis lokasi ruko supplier
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <Link
              href="/blast"
              className="rounded-full border border-white/40 px-3 py-1.5 text-xs font-medium transition hover:bg-white/15"
            >
              💬 Blast WA
            </Link>
            <Link
              href="/supplier"
              className="rounded-full border border-white/40 px-3 py-1.5 text-xs font-medium transition hover:bg-white/15"
            >
              🏪 Katalog
            </Link>
          </div>
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
              className={`flex-1 px-2 py-2.5 transition ${
                tab === id
                  ? "border-b-2 border-brand font-semibold text-brand"
                  : "border-b-2 border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700"
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
              showYayasan={showYayasan}
              selectedYayasan={selectedYayasan}
              showPasar={showPasar}
              pasarCount={pasarList.length}
              onRadiusChange={setRadiusKm}
              onToggleHeatmap={setShowHeatmap}
              onToggleRekomendasi={setShowRekomendasi}
              onTogglePasar={setShowPasar}
              onToggleYayasan={(v) => {
                setShowYayasan(v);
                if (!v) setSelectedYayasan(null);
              }}
              onSelectYayasan={setSelectedYayasan}
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

          {tab === "data" &&
            (showForm ? (
              <div className="space-y-3">
                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <h2 className="mb-2 text-sm font-semibold text-slate-700">
                    {editingSppg ? "Edit SPPG" : "Tambah SPPG baru"}
                  </h2>
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
              </div>
            ) : (
              <DataPanel
                sppgList={sppgList}
                onAdd={() => {
                  setEditingSppg(null);
                  setPickedCoord(null);
                  setShowForm(true);
                }}
                onEdit={(s) => {
                  setEditingSppg(s);
                  setPickedCoord(null);
                  setShowForm(true);
                }}
                onFocus={(s) => setFocusPoint({ lat: s.lat, lng: s.lng })}
                onShowYayasan={(nama) => {
                  setShowYayasan(true);
                  setSelectedYayasan(nama);
                  setTab("analisis");
                }}
              />
            ))}
        </div>

        <footer className="flex items-center justify-between gap-2 border-t border-slate-200 px-4 py-2 text-[10px] text-slate-400">
          <span>
            Data awal database resmi & sebagian koordinat perkiraan. Peta ©
            OpenStreetMap.
          </span>
          <Link
            href="/admin"
            className="shrink-0 rounded border border-slate-200 px-2 py-0.5 font-medium text-slate-500 hover:bg-slate-50 hover:text-brand"
          >
            🛠️ Admin
          </Link>
        </footer>
      </aside>

      {/* Peta */}
      <section className="relative order-first h-[48dvh] min-h-[18rem] md:order-none md:h-full md:flex-1">
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
          showYayasan={showYayasan}
          selectedYayasan={selectedYayasan}
          pasarList={pasarList}
          showPasar={showPasar}
          focusPoint={focusPoint}
          onMapClick={handleMapClick}
          onSelectYayasan={(nama) => {
            setShowYayasan(true);
            setSelectedYayasan(nama);
          }}
          onSelectRuko={(id) => {
            setSelectedRukoId(id);
            setTab("ruko");
          }}
        />
      </section>
    </main>
  );
}
