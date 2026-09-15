import PetaApp from "./PetaApp";

export const metadata = {
  title: "Peta Interaktif 85 Dapur SPPG",
  description:
    "Peta interaktif seluruh dapur SPPG (MBG) Kabupaten Ponorogo. Filter per kecamatan dan status, lihat rincian penerima manfaat, layer pasar, heatmap permintaan, dan simulasikan lokasi ruko supplier.",
  alternates: { canonical: "/peta" },
};

export default function PetaPage() {
  return <PetaApp />;
}
