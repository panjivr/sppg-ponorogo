import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Peta SPPG Ponorogo — Analisis Lokasi Ruko Supplier MBG",
  description:
    "Pemetaan dapur SPPG / Makan Bergizi Gratis di Kabupaten Ponorogo untuk menentukan lokasi ruko supplier bahan dapur yang strategis.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="h-full bg-slate-100 text-slate-900">{children}</body>
    </html>
  );
}
