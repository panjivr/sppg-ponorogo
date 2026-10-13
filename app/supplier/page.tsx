import { headers } from "next/headers";
import SupplierClient from "./SupplierClient";
import { PRODUK } from "@/lib/catalog";
import { SITE } from "@/lib/config";
export const metadata = {
  title: "Katalog Sayur, Bumbu & Sembako Ponorogo",
  description:
    "Katalog Bumbu Pawon: sayuran segar, jamur, polo pendem, buah, bumbu, tepung, beras, telur, dan kelapa. Pilih kebutuhan lalu minta penawaran WhatsApp.",
  alternates: { canonical: "/supplier" },
};
export default function SupplierPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Katalog Bumbu Pawon",
    url: `${SITE.url}/supplier`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: PRODUK.length,
      itemListElement: PRODUK.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: p.nama,
        url: `${SITE.url}/supplier/${p.id}`,
      })),
    },
  };
  return (
    <>
      <script
        nonce={headers().get("x-nonce") || undefined} type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <SupplierClient />
    </>
  );
}
