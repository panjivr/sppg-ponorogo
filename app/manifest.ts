import type { MetadataRoute } from "next";
import { SITE } from "@/lib/config";

/**
 * Manifest PWA — membuat web bisa "Add to Home Screen" di Android & iOS
 * sehingga terbuka layar penuh seperti aplikasi.
 * Ikon memakai SVG inline (data URI) agar tidak perlu berkas biner.
 */
const ikonSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="96" fill="#17603a"/><circle cx="256" cy="200" r="72" fill="#fcfcfb"/><circle cx="256" cy="200" r="30" fill="#17603a"/><path d="M256 296c-53 0-96 30-96 68v44h192v-44c0-38-43-68-96-68z" fill="#fcfcfb"/></svg>`;
const ikon = `data:image/svg+xml,${encodeURIComponent(ikonSvg)}`;

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE.nama} — Dapur MBG & Analisis Supplier`,
    short_name: "SPPG Ponorogo",
    description: SITE.deskripsi,
    start_url: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#f9f9f7",
    theme_color: "#17603a",
    lang: "id",
    categories: ["business", "productivity", "utilities"],
    icons: [
      { src: ikon, sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: ikon, sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
