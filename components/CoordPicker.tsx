"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";

const pinIcon = L.divIcon({
  className: "coord-pin",
  html: `<div style="font-size:26px;line-height:26px;filter:drop-shadow(0 1px 2px rgba(0,0,0,.5))">📍</div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 24],
});

function ClickToSet({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

/** Peta mini untuk menaruh/menggeser titik koordinat dengan presisi. */
export default function CoordPicker({
  lat,
  lng,
  onPick,
}: {
  lat: number;
  lng: number;
  onPick: (lat: number, lng: number) => void;
}) {
  const valid = Number.isFinite(lat) && Number.isFinite(lng);
  const center: [number, number] = valid ? [lat, lng] : [-7.868, 111.462];

  return (
    <MapContainer
      center={center}
      zoom={valid ? 16 : 12}
      scrollWheelZoom
      className="h-56 w-full rounded-md"
    >
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickToSet onPick={onPick} />
      {valid && (
        <Marker
          position={[lat, lng]}
          icon={pinIcon}
          draggable
          eventHandlers={{
            dragend(e) {
              const p = (e.target as L.Marker).getLatLng();
              onPick(p.lat, p.lng);
            },
          }}
        />
      )}
    </MapContainer>
  );
}
