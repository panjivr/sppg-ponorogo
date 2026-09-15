"use client";

import { useEffect, useMemo } from "react";
import {
  Circle,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";
import { STATUS_META, type CandidateRuko, type Sppg } from "@/lib/types";
import {
  centroidBerbobot,
  haversineKm,
  kandidatTersebar,
  skorGrid,
  type GridCell,
  type LatLng,
} from "@/lib/geo";
import { num } from "@/lib/format";

const PONOROGO: [number, number] = [-7.93, 111.49];

/* ---------------- Ikon ---------------- */

function dotIcon(color: string, aktif: boolean, pilih: boolean): L.DivIcon {
  const size = pilih ? 22 : aktif ? 15 : 12;
  const ring = pilih
    ? "box-shadow:0 0 0 4px rgba(42,120,214,.35);"
    : "box-shadow:0 1px 3px rgba(0,0,0,.35);";
  return L.divIcon({
    className: "sppg-icon",
    html: `<span style="display:block;width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid #fff;${ring}"></span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

const rukoIcon = (sel: boolean) =>
  L.divIcon({
    className: "ruko-icon",
    html: `<span style="font-size:${sel ? 28 : 22}px;line-height:1;filter:drop-shadow(0 1px 2px rgba(0,0,0,.5))">🏪</span>`,
    iconSize: [28, 28],
    iconAnchor: [14, 24],
  });

const starIcon = L.divIcon({
  className: "rekomendasi-icon",
  html: `<span style="font-size:26px;line-height:1;filter:drop-shadow(0 1px 2px rgba(0,0,0,.6))">⭐</span>`,
  iconSize: [26, 26],
  iconAnchor: [13, 13],
});

/* ---------------- Lapisan pembantu ---------------- */

function HeatLayer({ points }: { points: Sppg[] }) {
  const map = useMap();
  useEffect(() => {
    const pts = points.map(
      (s) =>
        [s.lat, s.lng, Math.max(0.25, (s.porsi || 1000) / 3500)] as [
          number,
          number,
          number,
        ]
    );
    // @ts-expect-error leaflet.heat menambahkan L.heatLayer saat runtime
    const layer = L.heatLayer(pts, { radius: 32, blur: 22, maxZoom: 13 });
    layer.addTo(map);
    return () => void map.removeLayer(layer);
  }, [map, points]);
  return null;
}

function ClickHandler({ onClick }: { onClick?: (p: LatLng) => void }) {
  useMapEvents({
    click(e) {
      onClick?.({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

/**
 * Sekali saat data siap: rapatkan peta ke seluruh titik.
 * `bottomInset` = tinggi area yang tertutup bottom sheet di HP, supaya
 * titik tidak tersembunyi di balik panel.
 */
function FitToData({
  points,
  bottomInset,
}: {
  points: Sppg[];
  bottomInset: number;
}) {
  const map = useMap();
  useEffect(() => {
    if (points.length < 2) return;
    const b = L.latLngBounds(points.map((s) => [s.lat, s.lng]));
    map.fitBounds(b, {
      paddingTopLeft: [28, 28],
      paddingBottomRight: [28, 28 + bottomInset],
    });
    // sengaja hanya sekali (saat data pertama kali tersedia)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, points.length === 0, bottomInset]);
  return null;
}

/**
 * Terbang ke titik yang dipilih. Pusat peta digeser ke selatan sejauh
 * setengah `bottomInset` supaya markernya muncul DI ATAS bottom sheet,
 * bukan tertutup olehnya.
 */
function FlyTo({
  target,
  bottomInset,
}: {
  target: LatLng | null;
  bottomInset: number;
}) {
  const map = useMap();
  useEffect(() => {
    if (!target) return;
    const zoom = 15;
    const geser = map
      .project([target.lat, target.lng], zoom)
      .add([0, bottomInset / 2]);
    map.flyTo(map.unproject(geser, zoom), zoom, { duration: 0.7 });
  }, [map, target, bottomInset]);
  return null;
}

/* ---------------- Komponen utama ---------------- */

export interface MapViewProps {
  sppgList: Sppg[];
  rukoList: CandidateRuko[];
  selectedRukoId: string | null;
  selectedSppgId: string | null;
  flyTarget: LatLng | null;
  radiusKm: number;
  showHeatmap: boolean;
  showRekomendasi: boolean;
  /** Tinggi piksel area peta yang tertutup panel (bottom sheet di HP). */
  bottomInset?: number;
  onMapClick?: (p: LatLng) => void;
  onSelectRuko: (id: string) => void;
  onSelectSppg: (id: string) => void;
}

export default function MapView({
  sppgList,
  rukoList,
  selectedRukoId,
  selectedSppgId,
  flyTarget,
  radiusKm,
  showHeatmap,
  showRekomendasi,
  bottomInset = 0,
  onMapClick,
  onSelectRuko,
  onSelectSppg,
}: MapViewProps) {
  const ruko = rukoList.find((r) => r.id === selectedRukoId) ?? null;

  const dalamRadius = useMemo(() => {
    if (!ruko) return new Set<string>();
    const ids = new Set<string>();
    for (const s of sppgList)
      if (haversineKm(ruko, s) <= ruko.radiusKm) ids.add(s.id);
    return ids;
  }, [ruko, sppgList]);

  const centroid = useMemo(
    () => (showRekomendasi ? centroidBerbobot(sppgList) : null),
    [showRekomendasi, sppgList]
  );

  const kandidat: GridCell[] = useMemo(() => {
    if (!showRekomendasi) return [];
    // sebar minimal 4 km supaya kandidat tidak menumpuk di satu tempat
    return kandidatTersebar(skorGrid(sppgList, radiusKm), 3, 4);
  }, [showRekomendasi, sppgList, radiusKm]);

  return (
    <MapContainer
      center={PONOROGO}
      zoom={10}
      scrollWheelZoom
      zoomControl
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />

      <FitToData points={sppgList} bottomInset={bottomInset} />
      <FlyTo target={flyTarget} bottomInset={bottomInset} />
      <ClickHandler onClick={onMapClick} />
      {showHeatmap && <HeatLayer points={sppgList} />}

      {/* ---- Dapur SPPG ---- */}
      {sppgList.map((s) => {
        const m = STATUS_META[s.status];
        return (
          <Marker
            key={s.id}
            position={[s.lat, s.lng]}
            icon={dotIcon(
              m.color,
              m.aktif,
              s.id === selectedSppgId || dalamRadius.has(s.id)
            )}
            eventHandlers={{ click: () => onSelectSppg(s.id) }}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-semibold">{s.nama}</div>
                {s.desa && (
                  <div className="text-xs text-ink2">
                    {s.desa}, Kec. {s.kecamatan}
                  </div>
                )}
                <div className="mt-1 text-ink2">{s.alamat}</div>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span aria-hidden="true" style={{ color: m.color }}>
                    {m.icon}
                  </span>
                  <span className="font-medium">{m.label}</span>
                </div>
                <div>Penerima manfaat: {num(s.porsi)}/hari</div>
                {s.gmaps && (
                  <a
                    href={s.gmaps}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1.5 inline-block font-medium text-seqA underline"
                  >
                    📍 Buka di Google Maps
                  </a>
                )}
                {s.perkiraan && (
                  <div className="mt-1 text-xs text-serious">
                    ⚠ Koordinat perkiraan — pakai tautan Maps untuk titik pasti.
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}

      {/* ---- Calon ruko + radius layanan ---- */}
      {rukoList.map((r) => (
        <Marker
          key={r.id}
          position={[r.lat, r.lng]}
          icon={rukoIcon(r.id === selectedRukoId)}
          eventHandlers={{ click: () => onSelectRuko(r.id) }}
        >
          <Popup>
            <div className="text-sm">
              <div className="font-semibold">🏪 {r.nama}</div>
              {r.buka24Jam && (
                <div className="text-brand">Rencana buka 24 jam</div>
              )}
              {r.catatan && <div className="text-ink2">{r.catatan}</div>}
              <div className="mt-1">Radius antar: {r.radiusKm} km</div>
            </div>
          </Popup>
        </Marker>
      ))}

      {ruko && (
        <Circle
          center={[ruko.lat, ruko.lng]}
          radius={ruko.radiusKm * 1000}
          pathOptions={{
            color: "var(--seq-a)",
            weight: 2,
            fillColor: "var(--seq-a)",
            fillOpacity: 0.08,
          }}
        />
      )}

      {/* ---- Kandidat lokasi terbaik ---- */}
      {kandidat.map((c, i) => (
        <Circle
          key={`k-${i}`}
          center={[c.lat, c.lng]}
          radius={700}
          pathOptions={{
            color: "var(--seq-b)",
            weight: 2,
            fillColor: "var(--seq-b)",
            fillOpacity: 0.22,
          }}
        >
          <Popup>
            <div className="text-sm">
              <div className="font-semibold">Kandidat lokasi #{i + 1}</div>
              <div>
                {c.jumlah} dapur dalam radius {radiusKm} km
              </div>
              <div>Total {num(c.totalPorsi)} penerima manfaat/hari</div>
            </div>
          </Popup>
        </Circle>
      ))}

      {centroid && (
        <Marker position={[centroid.lat, centroid.lng]} icon={starIcon}>
          <Popup>
            <div className="text-sm">
              <div className="font-semibold">Pusat gravitasi permintaan</div>
              <div className="text-ink2">
                Titik tengah seluruh dapur, dibobot status &amp; jumlah
                penerima manfaat.
              </div>
            </div>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
