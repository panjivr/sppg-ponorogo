"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { KATALOG } from "@/lib/catalog";
/** Keep filters aligned with links, native history, and browser navigation. */
export default function CategoryQuerySync({
  onChange,
}: {
  onChange: (category: string) => void;
}) {
  const params = useSearchParams();
  const category = params.get("kategori");
  useEffect(() => {
    onChange(KATALOG.some((c) => c.id === category) ? category! : "semua");
  }, [category, onChange]);
  return null;
}
