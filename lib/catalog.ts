import produkRaw from "@/data/produk.json";
import type { Produk } from "@/lib/types";
export const KATALOG: Produk[] = produkRaw;
export const PRODUK = KATALOG.flatMap((k) =>
  k.items.map((item) => ({ ...item, kategori: k.kategori, kategoriId: k.id })),
);
export function cariProduk(id: string) {
  return PRODUK.find((p) => p.id === id);
}
export function normalisasiCari(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("id")
    .trim();
}
