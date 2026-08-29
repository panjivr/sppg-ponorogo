"use client";

import { useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";
import type { Sppg, CandidateRuko } from "@/lib/types";
import {
  haversineKm,
  centroidBerbobot,
  skorGrid,
  type LatLng,
} from "@/lib/geo";

const PONOROGO_CENTER: [number, number] = [-7.868, 111.462];

const STATUS_COLOR: Record<string, string> = {
  operasional: "#16a34a",
  akan: "#f59e0b",
  berhenti: "#94a3b8",
  suspend: "#ef4444",
};

function dotIcon(color: string, highlight: boolean): L.DivIcon {
  const size = highlight ? 22 : 16;
  const ring = highlight ? "box-shadow:0 0 0 4px rgba(37,99,235,0.35);" : "";
  return L.divIcon({
    className: "sppg-icon",
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid #fff;${ring}"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function rukoIcon(selected: boolean): L.DivIcon {
  const c = selected ? "#2563eb" : "#7c3aed";
  return L.divIcon({
    className: "ruko-icon",
    html: `<div style="font-size:22px;line-height:22px;filter:drop-shadow(0 1px 2px rgba(0,0,0,.5));color:${c}">🏪</div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 20],
  });
}

const starIcon = L.divIcon({
  className: "rekomendasi-icon",
  html: `<div style="font-size:28px;line-height:28px;filter:drop-shadow(0 1px 2px rgba(0,0,0,.6))">⭐</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

function HeatLayer({ points }: { points: Sppg[] }) {
  const map = useMap();
  useEffect(() => {
    const heatPts = points.map(
      (s) => [s.lat, s.lng, Math.max(0.3, (s.porsi || 1000) / 3000)] as [
        number,
        number,
        number
      ]
    );
    // @ts-expect-error leaflet.heat menambah L.heatLayer secara runtime
    const layer = L.heatLayer(heatPts, {
      radius: 35,
      blur: 25,
      maxZoom: 14,
    });
    layer.addTo(map);
    return () => {
      map.removeLayer(layer);
    };
  }, [map, points]);
  return null;
}

function ClickHandler({ onClick }: { onClick?: (p: LatLng) => void }) {
  useMapEvents({
    click(e) {
      if (onClick) onClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

interface MapViewProps {
  sppgList: Sppg[];
  rukoList: CandidateRuko[];
  selectedRukoId: string | null;
  radiusKm: number;
  showHeatmap: boolean;
  showRekomendasi: boolean;
  onMapClick?: (p: LatLng) => void;
  onSelectRuko: (id: string) => void;
}

export default function MapView({
  sppgList,
  rukoList,
  selectedRukoId,
  radiusKm,
  showHeatmap,
  showRekomendasi,
  onMapClick,
  onSelectRuko,
}: MapViewProps) {
  const selectedRuko = rukoList.find((r) => r.id === selectedRukoId) || null;

  const highlightIds = useMemo(() => {
    if (!selectedRuko) return new Set<string>();
    const ids = new Set<string>();
    for (const s of sppgList) {
      if (haversineKm(selectedRuko, s) <= selectedRuko.radiusKm) ids.add(s.id);
    }
    return ids;
  }, [selectedRuko, sppgList]);

  const centroid = useMemo(
    () => (showRekomendasi ? centroidBerbobot(sppgList) : null),
    [showRekomendasi, sppgList]
  );

  const topCells = useMemo(
    () => (showRekomendasi ? skorGrid(sppgList, radiusKm).slice(0, 3) : []),
    [showRekomendasi, sppgList, radiusKm]
  );

  return (
    <MapContainer
      center={PONOROGO_CENTER}
      zoom={12}
      scrollWheelZoom
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <ClickHandler onClick={onMapClick} />

      {showHeatmap && <HeatLayer points={sppgList} />}

      {sppgList.map((s) => (
        <Marker
          key={s.id}
          position={[s.lat, s.lng]}
          icon={dotIcon(
            STATUS_COLOR[s.status] || "#64748b",
            highlightIds.has(s.id)
          )}
        >
          <Popup>
            <div className="text-sm">
              <div className="font-semibold">{s.nama}</div>
              {s.desa && (
                <div className="text-xs text-slate-500">
                  {s.desa}, Kec. {s.kecamatan}
                </div>
              )}
              <div className="text-slate-600">{s.alamat}</div>
              <div className="mt-1">
                Status: <span className="font-medium">{s.status}</span>
              </div>
              <div>Penerima manfaat: {s.porsi.toLocaleString("id-ID")}</div>
              {s.gmaps && (
                <a
                  href={s.gmaps}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block font-medium text-blue-600 underline"
                >
                  📍 Buka di Google Maps
                </a>
              )}
              {s.perkiraan && (
                <div className="mt-1 text-amber-600">
                  ⚠ koordinat perkiraan (klik Google Maps untuk titik pasti)
                </div>
              )}
            </div>
          </Popup>
        </Marker>
      ))}

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
              {r.buka24Jam && <div className="text-brand">Buka 24 jam</div>}
              {r.catatan && <div className="text-slate-600">{r.catatan}</div>}
              <div className="mt-1">Radius: {r.radiusKm} km</div>
            </div>
          </Popup>
        </Marker>
      ))}

      {selectedRuko && (
        <Circle
          center={[selectedRuko.lat, selectedRuko.lng]}
          radius={selectedRuko.radiusKm * 1000}
          pathOptions={{ color: "#2563eb", fillColor: "#3b82f6", fillOpacity: 0.1 }}
        />
      )}

      {showRekomendasi &&
        topCells.map((c, i) => (
          <Circle
            key={`cell-${i}`}
            center={[c.lat, c.lng]}
            radius={600}
            pathOptions={{
              color: "#dc2626",
              fillColor: "#ef4444",
              fillOpacity: 0.25,
            }}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-semibold">Kandidat titik #{i + 1}</div>
                <div>{c.jumlah} dapur dalam {radiusKm} km</div>
                <div>Total est. porsi: {c.totalPorsi.toLocaleString("id-ID")}</div>
              </div>
            </Popup>
          </Circle>
        ))}

      {centroid && (
        <Marker position={[centroid.lat, centroid.lng]} icon={starIcon}>
          <Popup>
            <div className="text-sm">
              <div className="font-semibold">Titik pusat berbobot</div>
              <div className="text-slate-600">
                Perkiraan pusat gravitasi seluruh dapur (bobot: status &amp;
                porsi).
              </div>
            </div>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
