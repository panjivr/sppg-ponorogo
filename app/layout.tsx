import type { Metadata, Viewport } from "next";
import Nav from "@/components/Nav";
import { SITE } from "@/lib/config";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.nama} — Basis Data 85 Dapur MBG & Analisis Lokasi Supplier`,
    template: `%s · ${SITE.nama}`,
  },
  description: SITE.deskripsi,
  applicationName: SITE.nama,
  keywords: [
    "SPPG Ponorogo",
    "dapur MBG Ponorogo",
    "Makan Bergizi Gratis",
    "supplier MBG",
    "peta SPPG",
    "data SPPG Ponorogo",
    "lokasi ruko supplier",
  ],
  authors: [{ name: SITE.nama }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: SITE.url,
    siteName: SITE.nama,
    title: `${SITE.nama} — 85 dapur, 21 kecamatan`,
    description: SITE.deskripsi,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.nama,
    description: SITE.deskripsi,
  },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Pengguna tetap boleh zoom (aksesibilitas) — jangan dikunci.
  maximumScale: 5,
  userScalable: true,
  // Wajib agar padding safe-area iOS (notch / home indicator) bekerja.
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f9f9f7" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0d0d" },
  ],
};

/** Terapkan tema sebelum paint supaya tidak ada kedip putih di mode gelap. */
const themeScript = `(function(){try{var t=JSON.parse(localStorage.getItem('sppg-ponorogo:theme'));if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t)}}catch(e){}})();`;

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  name: "Basis Data SPPG (Dapur MBG) Kabupaten Ponorogo",
  description:
    "85 Satuan Pelayanan Pemenuhan Gizi (SPPG) program Makan Bergizi Gratis di 21 kecamatan Kabupaten Ponorogo: nama, desa, status operasional, jumlah penerima manfaat, alamat, dan koordinat.",
  spatialCoverage: {
    "@type": "Place",
    name: "Kabupaten Ponorogo, Jawa Timur, Indonesia",
  },
  variableMeasured: [
    "Status operasional",
    "Jumlah penerima manfaat harian",
    "Koordinat lokasi",
  ],
  license: "https://creativecommons.org/licenses/by/4.0/",
  isAccessibleForFree: true,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-page text-ink antialiased">
        <a
          href="#konten"
          className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-[2000] focus:rounded-lg focus:bg-brand focus:px-3 focus:py-2 focus:text-white"
        >
          Lewati ke konten utama
        </a>
        <Nav />
        <main id="konten">{children}</main>
      </body>
    </html>
  );
}
