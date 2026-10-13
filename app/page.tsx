import Link from "next/link";
import Icon from "@/components/Icon";
import ProductPhoto from "@/components/ProductPhoto";
import { ALAMAT, TELEPON, WA_NUMBER, waLink } from "@/lib/config";
import { KATALOG, PRODUK } from "@/lib/catalog";
export const metadata = {
  title: {
    absolute: "Bumbu Pawon — Supplier Sayur & Sembako Ponorogo",
  },
  description:
    "Belanja sayur segar, jamur, polo pendem, buah, bumbu dan sembako di Bumbu Pawon, Lor Prapatan Jetis, Ponorogo. Grosir dan eceran, pesan via WhatsApp.",
  alternates: { canonical: "/" },
};
const featuredIds = ["kubis", "wortel", "brokoli", "kentang"];
const faq = [
  {
    q: "Apakah bisa belanja eceran dan grosir?",
    a: "Bisa. Sampaikan daftar barang dan jumlah yang dibutuhkan agar kami dapat menyiapkan penawaran untuk belanja rumah tangga maupun kebutuhan usaha.",
  },
  {
    q: "Bagaimana cara mengetahui harga dan stok?",
    a: "Pilih produk dari katalog lalu kirim daftar kebutuhan lewat WhatsApp. Harga, stok, ukuran kemasan, dan total pesanan akan dikonfirmasi sebelum Anda menyetujui pembelian.",
  },
  {
    q: "Bisa meminta produk yang belum ada di katalog?",
    a: "Bisa ditanyakan. Kami menerima permintaan jenis jamur, buah, cabai, dan bahan toko lainnya. Ketersediaannya akan diperiksa terlebih dahulu.",
  },
  {
    q: "Apakah melayani kebutuhan katering dan dapur SPPG?",
    a: "Silakan kirim menu, jumlah kebutuhan, lokasi, dan jadwal. Tim kami akan mendiskusikan ketersediaan bahan serta penawaran pengadaan sesuai kebutuhan.",
  },
  {
    q: "Di mana lokasi Bumbu Pawon?",
    a: `Kami berada di ${ALAMAT}. Hubungi WhatsApp ${TELEPON} untuk petunjuk lokasi dan konfirmasi sebelum berkunjung.`,
  },
];
export default function Home() {
  return (
    <>
      <section className="hero-section">
        <div className="site-container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="eyebrow-dot" />
              GROSIR & SUPPLIER · PONOROGO
            </p>
            <h1>
              Dari dapur rumah
              <br />
              sampai <em>dapur usaha.</em>
            </h1>
            <p className="hero-description">
              Sayur segar, bumbu, buah, hingga sembako. Temukan kebutuhan dapur
              Anda di <strong>Bumbu Pawon</strong>, lalu pesan dengan
              mudah lewat WhatsApp.
            </p>
            <div className="hero-actions">
              <Link href="/supplier" className="button button-secondary">
                Jelajahi katalog <Icon name="arrow" />
              </Link>
              <a
                href={waLink(
                  "Halo Bumbu Pawon, saya ingin meminta penawaran kebutuhan dapur.",
                )}
                className="button button-accent"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon name="chat" />
                Pesan via WhatsApp
              </a>
            </div>
            <div className="hero-location">
              <Icon name="location" />
              <span>Lor Prapatan Jetis, Ponorogo</span>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-visual-label">
              <Icon name="leaf" />
              <span>DAPUR TERISI, MASAK LEBIH MUDAH</span>
            </div>
            <div className="hero-products">
              {featuredIds.map((id, index) => {
                const p = PRODUK.find((x) => x.id === id)!;
                return (
                  <Link
                    href={`/supplier/${p.id}`}
                    key={id}
                    className={`hero-product hero-product-${index}`}
                  >
                    <ProductPhoto
                      nama={p.nama}
                      src={p.gambar}
                      priority={index < 2}
                    />
                    <span>
                      {p.nama}
                      <Icon name="arrow" />
                    </span>
                  </Link>
                );
              })}
            </div>
            <div className="hero-visual-footer">
              <span>
                <strong>{PRODUK.length}</strong> pilihan produk
              </span>
              <span>
                <Icon name="check" />
                Grosir & eceran
              </span>
            </div>
          </div>
        </div>
      </section>
      <section className="benefit-strip" aria-label="Layanan belanja">
        <div className="site-container benefit-grid">
          {[
            {
              icon: "bag",
              title: "Belanja sesuai kebutuhan",
              text: "Jumlah fleksibel untuk rumah dan usaha.",
            },
            {
              icon: "box",
              title: "Satu daftar, beragam bahan",
              text: "Kebutuhan dapur dalam satu katalog.",
            },
            {
              icon: "chat",
              title: "Penawaran lewat WhatsApp",
              text: "Konfirmasi harga dan stok sebelum pesan.",
            },
          ].map((b) => (
            <div className="benefit" key={b.title}>
              <Icon name={b.icon as "bag" | "box" | "chat"} />
              <div>
                <h2>{b.title}</h2>
                <p>{b.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section id="produk" className="section-space site-container">
        <div className="section-heading">
          <div>
            <p className="eyebrow">ISI DAFTAR BELANJA ANDA</p>
            <h2>
              Semua kebutuhan.
              <br />
              Satu tujuan.
            </h2>
          </div>
          <Link href="/supplier" className="text-link">
            Lihat seluruh katalog <Icon name="arrow" />
          </Link>
        </div>
        <div className="category-grid">
          {KATALOG.map((c, i) => (
            <Link
              href={`/supplier?kategori=${c.id}`}
              className="category-card"
              key={c.id}
            >
              <span className="category-number">0{i + 1}</span>
              <Icon name="leaf" />
              <h3>{c.kategori}</h3>
              <p>{c.deskripsi}</p>
              <span className="category-bottom">
                {c.items.length} produk <Icon name="arrow" />
              </span>
            </Link>
          ))}
        </div>
        <p className="section-note">
          Butuh jenis jamur, buah, cabai, atau bahan toko lainnya?{" "}
          <a
            href={waLink(
              "Halo Bumbu Pawon, saya mencari bahan di luar katalog. Berikut kebutuhannya:",
            )}
            target="_blank"
            rel="noopener noreferrer"
          >
            Tanyakan langsung kepada kami.
          </a>
        </p>
      </section>
      <section id="layanan" className="supply-section">
        <div className="site-container supply-grid">
          <div>
            <p className="eyebrow">UNTUK DAPUR YANG TERUS BERJALAN</p>
            <h2>
              Belanja harian.
              <br />
              Pasokan untuk usaha.
            </h2>
            <p>
              Untuk pedagang, rumah makan, katering, serta pengadaan dapur
              SPPG/MBG. Kirim kebutuhan dan jadwal Anda; kami bantu menyusun
              penawarannya.
            </p>
            <a
              href={waLink(
                "Halo Bumbu Pawon, saya ingin membahas pengadaan bahan untuk usaha/SPPG. Kebutuhan dan jadwal saya:",
              )}
              className="button button-accent"
              target="_blank"
              rel="noopener noreferrer"
            >
              Diskusikan kebutuhan usaha <Icon name="arrow" />
            </a>
          </div>
          <ol className="order-steps">
            {[
              {
                title: "Kirim daftar kebutuhan",
                text: "Pilih bahan, jumlah, lokasi, dan jadwal yang Anda inginkan.",
              },
              {
                title: "Konfirmasi penawaran",
                text: "Periksa stok, harga, kemasan, dan rencana pengiriman.",
              },
              {
                title: "Sepakati pesanan",
                text: "Barang disiapkan sesuai penawaran yang disetujui bersama.",
              },
            ].map((s, i) => (
              <li key={s.title}>
                <span>0{i + 1}</span>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section
        id="kontak"
        className="section-space site-container contact-grid"
      >
        <div className="contact-card">
          <p className="eyebrow">MULAI DARI PERCAKAPAN</p>
          <h2>
            Apa yang ingin
            <br />
            Anda masak hari ini?
          </h2>
          <p>
            Kirim daftar belanja Anda. Kami bantu cek bahan, jumlah, dan
            penawarannya.
          </p>
          <address>
            <span>
              <Icon name="location" />
              {ALAMAT}
            </span>
            <a href={`tel:+${WA_NUMBER}`}>
              <Icon name="phone" />
              {TELEPON}
            </a>
          </address>
          <a
            className="button button-primary"
            href={waLink(
              "Halo Bumbu Pawon, saya ingin memesan. Berikut daftar belanja saya:",
            )}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon name="chat" />
            Mulai chat WhatsApp
          </a>
        </div>
        <div className="faq">
          <p className="eyebrow">SEBELUM ANDA MEMESAN</p>
          <h2>Hal yang sering ditanyakan.</h2>
          {faq.map((f) => (
            <details key={f.q}>
              <summary>
                {f.q}
                <Icon name="plus" />
              </summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
