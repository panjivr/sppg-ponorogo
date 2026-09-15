"use client";

import { useEffect, useState } from "react";

/**
 * Deteksi lebar layar secara reaktif (bukan hanya sekali saat muat),
 * supaya layout ikut berubah saat tablet diputar atau jendela diubah.
 * Mengembalikan `false` saat render server agar tidak ada mismatch.
 */
export function useMediaQuery(query: string): boolean {
  const [match, setMatch] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatch(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setMatch(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return match;
}

/** md: ke atas — tablet landscape & desktop pakai sidebar. */
export const useIsDesktop = () => useMediaQuery("(min-width: 768px)");
