import type { MetadataRoute } from "next";
import { SITE } from "@/lib/config";
import { PRODUK } from "@/lib/catalog";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE.url}/kredit-foto`,
      changeFrequency: "monthly",
      priority: 0.2,
    },
    { url: SITE.url, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE.url}/supplier`, changeFrequency: "weekly", priority: 0.9 },
    ...PRODUK.map((p) => ({
      url: `${SITE.url}/supplier/${p.id}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
