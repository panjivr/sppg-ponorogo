"use client";

import { usePathname } from "next/navigation";
import Nav from "@/components/Nav";
import AdminGate from "@/components/AdminGate";

/** Rute publik (tanpa Nav & tanpa gate). Selain ini → area admin. */
const PUBLIC = new Set<string>(["/"]);

/**
 * Shell aplikasi: landing publik "/" tampil apa adanya; semua rute lain
 * (peta, data, analisis, blast, dsb.) hanya untuk admin — dibungkus gate
 * kata sandi + navigasi internal.
 */
export default function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();

  if (PUBLIC.has(path)) {
    return <main id="konten">{children}</main>;
  }

  return (
    <AdminGate>
      <Nav />
      <main id="konten">{children}</main>
    </AdminGate>
  );
}
