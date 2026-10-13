import type { Metadata, Viewport } from "next";
import Shell from "@/components/Shell";
import { ALAMAT, BISNIS, SITE, WA_NUMBER } from "@/lib/config";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Bumbu Pawon — Supplier Sayur & Sembako Ponorogo",
    template: "%s · Bumbu Pawon",
  },
  description: SITE.deskripsi,
  applicationName: SITE.nama,
  authors: [{ name: BISNIS.nama }],
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: BISNIS.nama,
    title: "Bumbu Pawon — Kebutuhan Dapur Ponorogo",
    description: SITE.deskripsi,
  },
  twitter: {
    card: "summary_large_image",
    title: BISNIS.nama,
    description: SITE.deskripsi,
  },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  userScalable: true,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafbf7" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0d0d" },
  ],
};
const themeScript = `(function(){try{var t=JSON.parse(localStorage.getItem('sppg-ponorogo:theme'));if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t)}}catch(e){}})();`;
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "GroceryStore",
  "@id": `${SITE.url}/#business`,
  name: BISNIS.nama,
  url: SITE.url,
  description: SITE.deskripsi,
  telephone: `+${WA_NUMBER}`,
  address: {
    "@type": "PostalAddress",
    streetAddress: ALAMAT,
    addressLocality: "Ponorogo",
    addressRegion: "Jawa Timur",
    addressCountry: "ID",
  },
  areaServed: { "@type": "AdministrativeArea", name: "Ponorogo" },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Katalog bahan dapur Bumbu Pawon",
    url: `${SITE.url}/supplier`,
  },
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
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
      </head>
      <body className="bg-page text-ink antialiased">
        <a
          href="#konten"
          className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-[2000] focus:rounded-lg focus:bg-brand focus:px-3 focus:py-2 focus:text-white"
        >
          Lewati ke konten utama
        </a>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
