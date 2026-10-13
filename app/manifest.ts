import type { MetadataRoute } from "next";
import { SITE } from "@/lib/config";

/**
 * Manifest PWA — membuat web bisa "Add to Home Screen" di Android & iOS
 * sehingga terbuka layar penuh seperti aplikasi.
 * Ikon SVG lokal dipakai bersama favicon agar identitas konsisten.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bumbu Pawon",
    short_name: "Bumbu Pawon",
    description: SITE.deskripsi,
    start_url: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#fafbf7",
    theme_color: "#17603a",
    lang: "id",
    categories: ["shopping", "business"],
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
