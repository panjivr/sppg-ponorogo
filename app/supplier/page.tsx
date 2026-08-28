"use client";

import Link from "next/link";
import produk from "@/data/produk.json";
import { NAMA_BISNIS, TAGLINE, AREA_LAYANAN, waLink } from "@/lib/config";

interface Item {
  nama: string;
  satuan: string;
  harga: string;
}
interface Kategori {
  kategori: string;
  emoji: string;
  items: Item[];
}

const katalog = produk as Kategori[];

export default function SupplierPage() {
  const pesanUmum = `Halo ${NAMA_BISNIS}, saya mau tanya ketersediaan & harga bahan dapur untuk kebutuhan dapur MBG. Terima kasih.`;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="bg-brand text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <div>
            <div className="text-lg font-bold leading-tight">{NAMA_BISNIS}</div>
            <div className="text-xs text-brand-light">Etalase supplier</div>
          </div>
          <Link
            href="/"
            className="rounded-full border border-white/40 px-3 py-1.5 text-xs font-medium hover:bg-white/10"
          >
            🗺️ Peta SPPG
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-brand to-brand-dark text-white">
        <div className="mx-auto max-w-5xl px-4 py-10 text-center">
          <span className="inline-block rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-amber-950">
            ⏰ BUKA 24 JAM
          </span>
          <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">
            Supplier Bahan Dapur MBG
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-brand-light">{TAGLINE}</p>
          <p className="mt-1 text-sm text-brand-light">
            Melayani area {AREA_LAYANAN}
          </p>
          <a
            href={waLink(pesanUmum)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-brand shadow-lg hover:bg-slate-100"
          >
            💬 Pesan / Tanya via WhatsApp
          </a>
        </div>
      </section>

      {/* Keunggulan */}
      <section className="mx-auto max-w-5xl px-4 py-8">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Fitur
            emoji="⏰"
            judul="Buka 24 Jam"
            teks="Siap melayani dapur MBG yang bekerja malam hari — pesan kapan saja."
          />
          <Fitur
            emoji="🚚"
            judul="Antar Cepat"
            teks="Lokasi ruko strategis dekat banyak dapur, pengiriman singkat."
          />
          <Fitur
            emoji="🥕"
            judul="Segar & Lengkap"
            teks="Sayur, buah, protein, dan sembako dalam satu tempat."
          />
        </div>
      </section>

      {/* Katalog */}
      <section className="mx-auto max-w-5xl px-4 pb-12">
        <h2 className="mb-4 text-xl font-bold">Katalog Produk</h2>
        <p className="mb-6 text-sm text-slate-500">
          Harga bersifat perkiraan dan bisa berubah — konfirmasi via WhatsApp untuk
          harga grosir & stok terbaru.
        </p>

        <div className="space-y-8">
          {katalog.map((kat) => (
            <div key={kat.kategori}>
              <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                <span>{kat.emoji}</span> {kat.kategori}
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {kat.items.map((item) => {
                  const pesan = `Halo ${NAMA_BISNIS}, saya mau pesan *${item.nama}* (${item.harga}/${item.satuan}). Jumlah: ___ ${item.satuan}. Mohon konfirmasi stok & total harga. Terima kasih.`;
                  return (
                    <div
                      key={item.nama}
                      className="flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
                    >
                      <div>
                        <div className="font-medium">{item.nama}</div>
                        <div className="text-sm text-brand">
                          {item.harga}
                          <span className="text-slate-400"> / {item.satuan}</span>
                        </div>
                      </div>
                      <a
                        href={waLink(pesan)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 rounded bg-brand px-2 py-1.5 text-center text-xs font-semibold text-white hover:bg-brand-dark"
                      >
                        Pesan
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA bawah */}
      <section className="bg-brand-dark text-white">
        <div className="mx-auto max-w-5xl px-4 py-8 text-center">
          <h2 className="text-xl font-bold">Butuh pasokan rutin untuk dapur Anda?</h2>
          <p className="mt-1 text-sm text-brand-light">
            Kami siap jadi supplier tetap dengan harga grosir dan pengiriman terjadwal.
          </p>
          <a
            href={waLink(
              `Halo ${NAMA_BISNIS}, dapur kami butuh supplier bahan rutin. Boleh diskusi kerja sama & harga grosir?`
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-sm font-bold text-amber-950 hover:bg-amber-300"
          >
            💬 Hubungi untuk Kerja Sama
          </a>
        </div>
      </section>

      <footer className="border-t border-slate-200 px-4 py-4 text-center text-xs text-slate-400">
        {NAMA_BISNIS} · Etalase demo — ganti nomor WhatsApp & harga di{" "}
        <code>lib/config.ts</code> dan <code>data/produk.json</code>.
      </footer>
    </main>
  );
}

function Fitur({
  emoji,
  judul,
  teks,
}: {
  emoji: string;
  judul: string;
  teks: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="text-2xl">{emoji}</div>
      <div className="mt-1 font-semibold">{judul}</div>
      <div className="text-sm text-slate-500">{teks}</div>
    </div>
  );
}
