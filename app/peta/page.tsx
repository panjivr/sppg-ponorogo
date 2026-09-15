import PetaClient from "./PetaClient";

export const metadata = {
  title: "Peta Interaktif 85 Dapur SPPG",
  description:
    "Peta interaktif seluruh dapur SPPG (MBG) Kabupaten Ponorogo. Cari, filter per kecamatan dan status, lihat heatmap permintaan, dan simulasikan lokasi ruko supplier beserta radius antarnya.",
  alternates: { canonical: "/peta" },
};

export default function PetaPage() {
  return <PetaClient />;
}
