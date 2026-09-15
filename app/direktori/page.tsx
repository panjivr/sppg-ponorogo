import DirektoriClient from "./DirektoriClient";

export const metadata = {
  title: "Direktori 85 Dapur SPPG Ponorogo + Ekspor CSV & GeoJSON",
  description:
    "Tabel lengkap 85 dapur SPPG (MBG) Kabupaten Ponorogo: nama, desa, kecamatan, status, penerima manfaat, alamat, koordinat, dan tautan Google Maps. Bisa diekspor ke CSV dan GeoJSON.",
  alternates: { canonical: "/direktori" },
};

export default function DirektoriPage() {
  return <DirektoriClient />;
}
