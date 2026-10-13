"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";
import ProductPhoto from "@/components/ProductPhoto";
import CategoryQuerySync from "@/components/CategoryQuerySync";
import { KATALOG, PRODUK, normalisasiCari } from "@/lib/catalog";
import { BISNIS, waLink } from "@/lib/config";

const STORAGE_KEY = "bumbu-pawon:request:v1";
type Cart = Record<string, number>;
function validCart(value: unknown): Cart {
  const result: Cart = {};
  if (value && typeof value === "object" && !Array.isArray(value))
    for (const p of PRODUK) {
      const qty = (value as Record<string, unknown>)[p.id];
      if (
        typeof qty === "number" &&
        Number.isInteger(qty) &&
        qty > 0 &&
        qty <= 999
      )
        result[p.id] = qty;
    }
  return result;
}
function Quantity({
  id,
  nama,
  qty,
  onChange,
}: {
  id: string;
  nama: string;
  qty: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="quantity-control">
      <button
        onClick={() => onChange(qty - 1)}
        aria-label={`Kurangi ${nama}`}
        className="icon-button"
      >
        <Icon name="minus" />
      </button>
      <label className="sr-only" htmlFor={`qty-${id}`}>
        Jumlah {nama}
      </label>
      <input
        id={`qty-${id}`}
        type="number"
        inputMode="numeric"
        min="1"
        max="999"
        step="1"
        value={qty}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (Number.isInteger(n) && n >= 1 && n <= 999) onChange(n);
        }}
      />
      <button
        onClick={() => onChange(Math.min(999, qty + 1))}
        disabled={qty >= 999}
        aria-label={`Tambah ${nama}`}
        className="icon-button"
      >
        <Icon name="plus" />
      </button>
    </div>
  );
}
export default function SupplierClient() {
  const [cart, setCart] = useState<Cart>({});
  const [ready, setReady] = useState(false);
  const [storageUnavailable, setStorageUnavailable] = useState(false);
  const [category, setCategory] = useState("semua");
  const [query, setQuery] = useState("");
  const [focusProduct, setFocusProduct] = useState<string | null>(null);
  const [cartStatus, setCartStatus] = useState("");
  useEffect(() => {
    if (focusProduct) {
      document.getElementById(`qty-${focusProduct}`)?.focus();
      setFocusProduct(null);
    }
  }, [cart, focusProduct]);
  useEffect(() => {
    try {
      setCart(validCart(JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")));
    } catch {
      setStorageUnavailable(true);
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
      } catch {
        setStorageUnavailable(true);
      }
  }, [cart, ready]);
  function chooseCategory(id: string) {
    setCategory(id);
    const url = new URL(location.href);
    if (id === "semua") url.searchParams.delete("kategori");
    else url.searchParams.set("kategori", id);
    history.pushState({}, "", url.pathname + url.search);
  }
  function change(id: string, qty: number) {
    const product = PRODUK.find((p) => p.id === id);
    if (product) {
      setCartStatus(
        qty <= 0
          ? `${product.nama} dihapus dari daftar.`
          : `${product.nama}: ${Math.min(999, qty)} ${product.satuan} dalam daftar kebutuhan.`,
      );
    }
    setCart((c) => {
      const next = { ...c };
      if (qty <= 0) delete next[id];
      else next[id] = Math.min(999, qty);
      return next;
    });
  }
  const filtered = useMemo(() => {
    const q = normalisasiCari(query);
    return PRODUK.filter(
      (p) =>
        (category === "semua" || p.kategoriId === category) &&
        (!q ||
          normalisasiCari(
            [p.nama, p.kategori, ...(p.alias || [])].join(" "),
          ).includes(q)),
    );
  }, [category, query]);
  const selected = PRODUK.filter((p) => cart[p.id] > 0).map((p) => ({
    ...p,
    qty: cart[p.id],
  }));
  const message = `Halo ${BISNIS.nama}, saya ingin meminta penawaran untuk:\n\n${selected.map((p) => `• ${p.nama}: ${p.qty} ${p.satuan}`).join("\n")}\n\nMohon konfirmasi stok, varian/ukuran kemasan, harga, dan total pesanan.\nLokasi pengiriman: \nJadwal yang diinginkan: \nTerima kasih.`;
  return (
    <>
      <Suspense fallback={null}>
        <CategoryQuerySync onChange={setCategory} />
      </Suspense>
      <p className="sr-only" role="status" aria-live="polite">
        {cartStatus}
      </p>
      <section className="catalog-hero">
        <div className="site-container">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Beranda</Link>
            <Icon name="chevron" />
            <span aria-current="page">Katalog</span>
          </nav>
          <p className="eyebrow">KATALOG BUMBU PAWON</p>
          <h1>
            Daftar belanja dapur,
            <br />
            <em>lebih mudah disiapkan.</em>
          </h1>
          <p>
            Pilih bahan dan jumlah yang Anda butuhkan. Kirim daftarnya lewat
            WhatsApp untuk konfirmasi stok, harga, dan pengiriman.
          </p>
          <div className="catalog-facts">
            <span>{PRODUK.length} pilihan produk</span>
            <span>{KATALOG.length} kategori</span>
            <span>Grosir & eceran</span>
          </div>
        </div>
      </section>
      <div className="site-container catalog-body">
        <div className="catalog-tools">
          <div className="catalog-search">
            <label htmlFor="product-search">Cari bahan dapur</label>
            <div>
              <Icon name="search" />
              <input
                id="product-search"
                type="search"
                placeholder="Coba: wortel, beras, santan…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <button
                  className="icon-button"
                  aria-label="Hapus pencarian"
                  onClick={() => setQuery("")}
                >
                  <Icon name="close" />
                </button>
              )}
            </div>
          </div>
          <a href="#daftar-pesanan" className="request-summary">
            <Icon name="bag" />
            <span>
              Daftar kebutuhan<strong>{selected.length} produk dipilih</strong>
            </span>
            <Icon name="arrow" />
          </a>
        </div>
        <div
          className="category-filters"
          role="group"
          aria-label="Filter kategori"
        >
          <button
            aria-pressed={category === "semua"}
            onClick={() => chooseCategory("semua")}
          >
            Semua produk
          </button>
          {KATALOG.map((k) => (
            <button
              key={k.id}
              aria-pressed={category === k.id}
              onClick={() => chooseCategory(k.id)}
            >
              {k.kategori}
            </button>
          ))}
        </div>
        <div className="catalog-results">
          <p role="status" aria-live="polite">
            Menampilkan <strong>{filtered.length}</strong> produk
            {query && <> untuk “{query}”</>}
          </p>
          <span>Foto ilustrasi · stok dan harga dikonfirmasi</span>
        </div>
        {filtered.length === 0 ? (
          <section className="empty-state">
            <Icon name="search" />
            <h2>Bahan belum ditemukan.</h2>
            <p>
              Coba kata lain atau tanyakan kebutuhan Anda langsung kepada kami.
            </p>
            <button
              className="button button-secondary"
              onClick={() => {
                setQuery("");
                chooseCategory("semua");
              }}
            >
              Tampilkan semua produk
            </button>
          </section>
        ) : (
          <div className="product-grid">
            {filtered.map((p, i) => (
              <article className="product-card" key={p.id}>
                <Link
                  href={`/supplier/${p.id}`}
                  aria-label={`Lihat rincian ${p.nama}`}
                >
                  <ProductPhoto nama={p.nama} src={p.gambar} priority={i < 4} />
                </Link>
                <div className="product-card-content">
                  <p className="product-category">{p.kategori}</p>
                  <h2>
                    <Link href={`/supplier/${p.id}`}>{p.nama}</Link>
                  </h2>
                  <p className="product-description">{p.deskripsi}</p>
                  <div className="product-card-order">
                    <span>
                      Per {p.satuan}
                      <small>Minta harga</small>
                    </span>
                    {cart[p.id] > 0 ? (
                      <Quantity
                        id={p.id}
                        nama={p.nama}
                        qty={cart[p.id]}
                        onChange={(n) => change(p.id, n)}
                      />
                    ) : (
                      <button
                        className="add-button"
                        onClick={(event) => {
                          change(p.id, 1);
                          if (event.detail === 0) setFocusProduct(p.id);
                        }}
                        disabled={!ready}
                        aria-label={`Pilih ${p.nama} untuk daftar kebutuhan`}
                      >
                        <Icon name="plus" />
                        Pilih
                      </button>
                    )}
                  </div>
                  {p.fotoCatatan && (
                    <p className="photo-caption">{p.fotoCatatan}</p>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
        <section className="request-panel" id="daftar-pesanan" tabIndex={-1}>
          <div className="request-heading">
            <div>
              <p className="eyebrow">LANJUTKAN LEWAT WHATSAPP</p>
              <h2>Daftar kebutuhan Anda.</h2>
              <p>
                Jumlah di bawah adalah permintaan awal. Stok, harga, kemasan,
                dan biaya kirim dikonfirmasi sebelum pembelian.
              </p>
            </div>
            <Icon name="bag" />
          </div>
          {selected.length ? (
            <>
              <ul className="request-items">
                {selected.map((p) => (
                  <li key={p.id}>
                    <div>
                      <strong>{p.nama}</strong>
                      <span>
                        {p.qty} {p.satuan}
                      </span>
                    </div>
                    <div className="request-item-actions">
                      <Quantity
                        id={`pesanan-${p.id}`}
                        nama={p.nama}
                        qty={p.qty}
                        onChange={(n) => change(p.id, n)}
                      />
                      <button
                        className="icon-button"
                        aria-label={`Hapus ${p.nama} dari daftar`}
                        onClick={() => change(p.id, 0)}
                      >
                        <Icon name="close" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="request-bottom">
                <p>
                  {selected.length} jenis bahan ·{" "}
                  {storageUnavailable
                    ? "Penyimpanan perangkat tidak tersedia; daftar tetap dapat dikirim selama halaman terbuka."
                    : "Daftar tersimpan di perangkat ini."}
                </p>
                <a
                  href={waLink(message)}
                  className="button button-primary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon name="chat" />
                  Minta penawaran ({selected.length})<Icon name="arrow" />
                </a>
              </div>
            </>
          ) : (
            <div className="request-empty">
              <p>
                Belum ada bahan yang dipilih. Tambahkan produk dari katalog
                untuk menyusun daftar kebutuhan.
              </p>
              <a
                href={waLink(
                  `Halo ${BISNIS.nama}, saya ingin bertanya tentang stok dan harga bahan dapur.`,
                )}
                className="button button-secondary"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon name="chat" />
                Tanyakan kebutuhan lain
              </a>
            </div>
          )}
        </section>
        <aside className="catalog-special">
          <Icon name="info" />
          <p>
            <strong>Mencari bahan lainnya?</strong> Kami menerima pertanyaan
            untuk segala jenis jamur, buah, cabai, polo pendem, dan bahan toko.
            Jenis produk serta ketersediaannya dikonfirmasi saat pemesanan.
          </p>
        </aside>
      </div>
      {selected.length > 0 && (
        <div className="request-bar">
          <div className="site-container">
            <span>
              <strong>{selected.length} produk</strong> dalam daftar kebutuhan
            </span>
            <a href="#daftar-pesanan" className="button button-primary">
              Periksa daftar <Icon name="arrow" />
            </a>
          </div>
        </div>
      )}
    </>
  );
}
