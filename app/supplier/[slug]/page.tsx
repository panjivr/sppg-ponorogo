import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Icon from "@/components/Icon";
import ProductPhoto from "@/components/ProductPhoto";
import { cariProduk, PRODUK } from "@/lib/catalog";
import { BISNIS, SITE, waLink } from "@/lib/config";
export const dynamicParams = false;
export function generateStaticParams() {
  return PRODUK.map((p) => ({ slug: p.id }));
}
export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const p = cariProduk(params.slug);
  if (!p) return {};
  return {
    title: `${p.nama} di Ponorogo`,
    description: `${p.deskripsi} Minta harga ${p.nama.toLowerCase()} di Bumbu Pawon, Ponorogo.`,
    alternates: { canonical: `/supplier/${p.id}` },
    openGraph: {
      title: `${p.nama} — Bumbu Pawon`,
      description: p.deskripsi,
      url: `/supplier/${p.id}`,
      ...(p.gambar ? { images: [{ url: p.gambar, alt: p.nama }] } : {}),
    },
  };
}
export default function ProductPage({ params }: { params: { slug: string } }) {
  const p = cariProduk(params.slug);
  if (!p) notFound();
  const related = PRODUK.filter(
    (x) => x.kategoriId === p.kategoriId && x.id !== p.id,
  ).slice(0, 4);
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${p.nama} — ${BISNIS.nama}`,
    url: `${SITE.url}/supplier/${p.id}`,
    description: p.deskripsi,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Beranda", item: SITE.url },
        {
          "@type": "ListItem",
          position: 2,
          name: "Katalog",
          item: `${SITE.url}/supplier`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: p.nama,
          item: `${SITE.url}/supplier/${p.id}`,
        },
      ],
    },
    mainEntity: {
      "@type": "Product",
      name: p.nama,
      description: p.deskripsi,
      category: p.kategori,
      ...(p.gambar ? { image: `${SITE.url}${p.gambar}` } : {}),
    },
  };
  return (
    <div className="site-container product-detail">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
        }}
      />
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Beranda</Link>
        <Icon name="chevron" />
        <Link href="/supplier">Katalog</Link>
        <Icon name="chevron" />
        <span aria-current="page">{p.nama}</span>
      </nav>
      <div className="product-detail-grid">
        <div>
          <ProductPhoto
            nama={p.nama}
            src={p.gambar}
            priority
            sizes="(max-width: 768px) 90vw, 550px"
          />
          {p.fotoCatatan && <p className="photo-caption">{p.fotoCatatan}</p>}
        </div>
        <div className="product-detail-copy">
          <Link href={`/supplier?kategori=${p.kategoriId}`} className="eyebrow">
            {p.kategori}
          </Link>
          <h1>{p.nama}</h1>
          <p>{p.deskripsi}</p>
          <dl>
            <div>
              <dt>Satuan permintaan</dt>
              <dd>{p.satuan}</dd>
            </div>
            <div>
              <dt>Harga & ketersediaan</dt>
              <dd>Dikonfirmasi melalui WhatsApp</dd>
            </div>
            <div>
              <dt>Pembelian</dt>
              <dd>Eceran dan grosir sesuai kebutuhan</dd>
            </div>
          </dl>
          <a
            href={waLink(
              `Halo ${BISNIS.nama}, saya ingin menanyakan ${p.nama}.\nJumlah: ... ${p.satuan}\nMohon konfirmasi stok, jenis/ukuran kemasan, harga, dan pengiriman. Terima kasih.`,
            )}
            className="button button-primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon name="chat" />
            Tanyakan harga & stok
            <Icon name="arrow" />
          </a>
          <Link href="/supplier" className="text-link">
            Susun daftar beberapa produk <Icon name="arrow" />
          </Link>
          <p className="detail-note">
            Harga, varian, ukuran kemasan, dan jadwal pengiriman mengikuti
            penawaran yang disepakati. Daftar katalog bukan jaminan stok
            langsung tersedia.
          </p>
        </div>
      </div>
      <section className="related-products">
        <div className="section-heading">
          <h2>Lengkapi kebutuhan Anda.</h2>
          <Link
            href={`/supplier?kategori=${p.kategoriId}`}
            className="text-link"
          >
            Lihat kategori <Icon name="arrow" />
          </Link>
        </div>
        <div className="product-grid">
          {related.map((r) => (
            <Link
              key={r.id}
              href={`/supplier/${r.id}`}
              className="product-card"
            >
              <ProductPhoto nama={r.nama} src={r.gambar} />
              <div className="product-card-content">
                <p className="product-category">{r.kategori}</p>
                <h3>{r.nama}</h3>
                <p className="text-link">
                  Lihat produk <Icon name="arrow" />
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
