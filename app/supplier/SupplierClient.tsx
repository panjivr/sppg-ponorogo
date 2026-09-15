"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { NavSpacer } from "@/components/Nav";
import { Btn, Card } from "@/components/ui";
import produkRaw from "@/data/produk.json";
import { BISNIS, waLink } from "@/lib/config";
import { num, rupiah } from "@/lib/format";
import type { Produk, ProdukItem } from "@/lib/types";

const KATALOG = produkRaw as Produk[];
const K_CART = "sppg-ponorogo:cart";

type Cart = Record<string, number>; // nama -> qty

function bacaCart(): Cart {
  try {
    const raw = localStorage.getItem(K_CART);
    return raw ? (JSON.parse(raw) as Cart) : {};
  } catch {
    return {};
  }
}

export default function SupplierClient() {
  const [cart, setCart] = useState<Cart>({});
  const [kategori, setKategori] = useState<string>("semua");
  const [siap, setSiap] = useState(false);

  useEffect(() => {
    setCart(bacaCart());
    setSiap(true);
  }, []);

  useEffect(() => {
    if (!siap) return;
    try {
      localStorage.setItem(K_CART, JSON.stringify(cart));
    } catch {
      /* mode privat — abaikan */
    }
  }, [cart, siap]);

  const semuaItem = useMemo(
    () => KATALOG.flatMap((k) => k.items.map((i) => ({ ...i, kategori: k.kategori }))),
    []
  );

  const isi = useMemo(
    () =>
      semuaItem
        .filter((i) => (cart[i.nama] ?? 0) > 0)
        .map((i) => ({ ...i, qty: cart[i.nama] })),
    [cart, semuaItem]
  );

  const total = isi.reduce((a, i) => a + i.harga * i.qty, 0);
  const jumlahBaris = isi.length;

  function set(nama: string, qty: number) {
    setCart((c) => {
      const next = { ...c };
      if (qty <= 0) delete next[nama];
      else next[nama] = qty;
      return next;
    });
  }

  const pesanWa = useMemo(() => {
    if (!isi.length) {
      return `Halo ${BISNIS.nama}, saya mau tanya ketersediaan & harga bahan untuk dapur MBG. Terima kasih.`;
    }
    const baris = isi
      .map(
        (i) =>
          `• ${i.nama} — ${i.qty} ${i.satuan} × ${rupiah(i.harga)} = ${rupiah(
            i.harga * i.qty
          )}`
      )
      .join("\n");
    return `Halo ${BISNIS.nama}, saya mau pesan:\n\n${baris}\n\nEstimasi total: ${rupiah(
      total
    )}\n\nMohon konfirmasi stok, harga grosir, dan waktu antar. Terima kasih.`;
  }, [isi, total]);

  const tampil =
    kategori === "semua"
      ? KATALOG
      : KATALOG.filter((k) => k.kategori === kategori);

  return (
    <>
      {/* ---------------- Hero ---------------- */}
      <section className="safe-x border-b border-hairline bg-surface">
        <div className="mx-auto max-w-content px-4 py-8 sm:py-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-warning/15 px-3 py-1 text-xs font-bold text-ink">
            <span aria-hidden="true">⏰</span> BUKA 24 JAM
          </span>
          <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-4xl">
            {BISNIS.nama}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink2 sm:text-base">
            {BISNIS.tagline} Melayani {BISNIS.areaLayanan}. Dapur MBG memasak
            pada malam hari — kami siap kirim saat supplier lain tutup.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              ["⏰", "Buka 24 jam", "Pesan tengah malam pun dilayani."],
              ["🚚", "Antar cepat", "Rute kami dihitung dari sebaran dapur."],
              ["🥕", "Segar & lengkap", "Sayur, buah, protein, sembako."],
            ].map(([ic, t, d]) => (
              <div
                key={t}
                className="rounded-xl border border-hairline bg-page p-3"
              >
                <div aria-hidden="true" className="text-xl">
                  {ic}
                </div>
                <div className="mt-1 text-sm font-semibold">{t}</div>
                <div className="text-xs leading-relaxed text-ink2">{d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Katalog ---------------- */}
      <div className="safe-x mx-auto max-w-content px-4 py-6">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold sm:text-xl">Katalog bahan</h2>
            <p className="mt-1 text-sm text-ink2">
              Atur jumlah, lalu kirim daftarnya lewat WhatsApp. Harga di bawah
              adalah acuan ritel — harga grosir dikonfirmasi saat pemesanan.
            </p>
          </div>
        </div>

        {/* Filter kategori */}
        <div
          className="mb-4 flex snap-x gap-2 overflow-x-auto pb-1"
          role="tablist"
          aria-label="Kategori produk"
        >
          {[{ kategori: "semua", emoji: "🧺" }, ...KATALOG].map((k) => (
            <button
              key={k.kategori}
              role="tab"
              aria-selected={kategori === k.kategori}
              onClick={() => setKategori(k.kategori)}
              className={`tap shrink-0 snap-start rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
                kategori === k.kategori
                  ? "border-brand bg-brand text-white"
                  : "border-hairline text-ink2 hover:bg-surface2"
              }`}
            >
              <span aria-hidden="true">{k.emoji}</span>{" "}
              {k.kategori === "semua" ? "Semua" : k.kategori}
            </button>
          ))}
        </div>

        {tampil.map((kat) => (
          <section key={kat.kategori} className="mb-7">
            <h3 className="mb-3 flex items-center gap-2 text-base font-semibold">
              <span aria-hidden="true">{kat.emoji}</span> {kat.kategori}
            </h3>
            <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
              {kat.items.map((item) => (
                <ProdukKartu
                  key={item.nama}
                  item={item}
                  qty={cart[item.nama] ?? 0}
                  onChange={(q) => set(item.nama, q)}
                />
              ))}
            </ul>
          </section>
        ))}

        {/* ---------------- Kerja sama ---------------- */}
        <Card className="border-brand/30 bg-brand-soft">
          <h2 className="text-lg font-semibold">
            Butuh pasokan rutin untuk dapur Anda?
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-ink2">
            Kami siap jadi supplier tetap: harga grosir, pengiriman terjadwal
            sebelum jam masak, dan penagihan bulanan. Lihat juga{" "}
            <Link href="/dashboard" className="font-semibold underline">
              analisis pasar
            </Link>{" "}
            kami untuk memahami kapasitas layanan.
          </p>
          <a
            href={waLink(
              `Halo ${BISNIS.nama}, dapur kami butuh supplier bahan rutin. Boleh diskusi kerja sama & harga grosir?`
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="tap mt-4 inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
          >
            💬 Hubungi untuk kerja sama
          </a>
        </Card>

        <p className="mt-6 text-xs leading-relaxed text-muted">
          Keranjang tersimpan di perangkat Anda sendiri dan tidak dikirim ke
          mana pun sampai Anda menekan tombol WhatsApp.
        </p>

        <div className="h-24" aria-hidden="true" />
      </div>

      {/* ---------------- Bar keranjang (sticky) ---------------- */}
      {jumlahBaris > 0 && (
        <div className="safe-b fixed bottom-14 left-0 right-0 z-[1090] border-t border-hairline bg-surface/95 backdrop-blur md:bottom-0">
          <div className="mx-auto flex max-w-content items-center gap-3 px-4 py-2.5">
            <div className="min-w-0 flex-1">
              <div className="text-xs text-muted">
                {jumlahBaris} jenis · {num(isi.reduce((a, i) => a + i.qty, 0))}{" "}
                satuan
              </div>
              <div className="truncate text-base font-bold">
                {rupiah(total)}
              </div>
            </div>
            <Btn variant="ghost" onClick={() => setCart({})} className="!px-2">
              Kosongkan
            </Btn>
            <a
              href={waLink(pesanWa)}
              target="_blank"
              rel="noopener noreferrer"
              className="tap inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-brand px-4 py-2.5 text-sm font-bold text-white hover:opacity-90"
            >
              💬 Pesan
            </a>
          </div>
        </div>
      )}

      <NavSpacer />
    </>
  );
}

/* ---------------- Kartu produk dengan stepper ---------------- */

function ProdukKartu({
  item,
  qty,
  onChange,
}: {
  item: ProdukItem;
  qty: number;
  onChange: (q: number) => void;
}) {
  return (
    <li className="flex flex-col justify-between rounded-xl border border-hairline bg-surface p-3">
      <div>
        <div className="text-sm font-medium leading-snug">{item.nama}</div>
        <div className="mt-0.5 text-sm font-semibold text-brand">
          {rupiah(item.harga)}
          <span className="font-normal text-muted"> /{item.satuan}</span>
        </div>
      </div>

      {qty === 0 ? (
        <Btn
          variant="outline"
          className="mt-3 w-full !py-1.5 !text-xs"
          onClick={() => onChange(1)}
          ariaLabel={`Tambah ${item.nama} ke keranjang`}
        >
          + Tambah
        </Btn>
      ) : (
        <div className="mt-3 flex items-center justify-between rounded-lg border border-brand">
          <button
            onClick={() => onChange(qty - 1)}
            className="tap px-3 text-lg font-bold text-brand"
            aria-label={`Kurangi ${item.nama}`}
          >
            −
          </button>
          <span
            className="tabular-nums text-sm font-bold"
            aria-live="polite"
            aria-label={`${qty} ${item.satuan} ${item.nama}`}
          >
            {qty}
          </span>
          <button
            onClick={() => onChange(qty + 1)}
            className="tap px-3 text-lg font-bold text-brand"
            aria-label={`Tambah ${item.nama}`}
          >
            +
          </button>
        </div>
      )}
    </li>
  );
}
