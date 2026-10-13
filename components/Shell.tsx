"use client";

import { usePathname } from "next/navigation";
import Nav from "@/components/Nav";
import AdminGate from "@/components/AdminGate";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";

/** Landing dan katalog publik; alat analisis tetap di area pengelola. */
const INTERNAL = new Set<string>([
  "/peta",
  "/dashboard",
  "/direktori",
  "/admin",
  "/blast",
  "/ringkasan",
  "/tentang",
]);

/**
 * Shell menampilkan navigasi toko untuk landing dan katalog,
 * serta navigasi pengelola untuk peta, data, dan analisis.
 */
export default function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();

  if (
    !INTERNAL.has(path) ||
    path === "/supplier" ||
    path.startsWith("/supplier/")
  ) {
    return (
      <div className="public-site">
        <PublicNav />
        <main id="konten">{children}</main>
        <PublicFooter />
      </div>
    );
  }

  return (
    <AdminGate>
      <Nav />
      <main id="konten">{children}</main>
    </AdminGate>
  );
}
