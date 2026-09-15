import SupplierClient from "./SupplierClient";
import { BISNIS } from "@/lib/config";

export const metadata = {
  title: `${BISNIS.nama} — Supplier Bahan Dapur MBG 24 Jam`,
  description:
    "Katalog sayur, buah, protein, dan sembako untuk dapur SPPG / MBG di Kabupaten Ponorogo. Buka 24 jam, pesan langsung via WhatsApp dengan rincian dan estimasi total.",
  alternates: { canonical: "/supplier" },
};

export default function SupplierPage() {
  return <SupplierClient />;
}
