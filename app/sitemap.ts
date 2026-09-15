import type { MetadataRoute } from "next";
import { SITE } from "@/lib/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const halaman = [
    { path: "", priority: 1 },
    { path: "/peta", priority: 0.9 },
    { path: "/dashboard", priority: 0.9 },
    { path: "/direktori", priority: 0.8 },
    { path: "/supplier", priority: 0.7 },
    { path: "/tentang", priority: 0.5 },
  ];
  return halaman.map((h) => ({
    url: `${SITE.url}${h.path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: h.priority,
  }));
}
