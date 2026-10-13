import Link from "next/link";
import Brand from "@/components/Brand";
import Icon from "@/components/Icon";
import { ALAMAT, TELEPON, waLink } from "@/lib/config";
export default function PublicFooter() {
  return (
    <footer className="public-footer">
      <div className="site-container footer-grid">
        <div>
          <Link href="/">
            <Brand />
          </Link>
          <p>
            Teman belanja kebutuhan dapur.
            <br />
            Untuk rumah, usaha, dan pengadaan.
          </p>
        </div>
        <div>
          <h2>Jelajahi</h2>
          <Link href="/supplier">Katalog produk</Link>
          <Link href="/#layanan">Layanan pengadaan</Link>
          <Link href="/#kontak">Cara memesan</Link>
          <Link href="/kredit-foto">Sumber & kredit foto</Link>
        </div>
        <div>
          <h2>Temui kami</h2>
          <p className="footer-contact">
            <Icon name="location" />
            {ALAMAT}
          </p>
          <a
            href={waLink("Halo Bumbu Pawon Mas Dhoo, saya ingin memesan.")}
            target="_blank"
            rel="noopener noreferrer"
            className="footer-contact"
          >
            <Icon name="chat" />
            {TELEPON}
          </a>
          <p className="footer-note">
            Foto merupakan ilustrasi. Stok, harga, dan jadwal pengiriman
            dikonfirmasi saat pemesanan.
          </p>
        </div>
      </div>
      <div className="site-container footer-bottom">
        <span>Bumbu Pawon Mas Dhoo · Ponorogo</span>
        <Link href="/ringkasan">
          Area pengelola <Icon name="arrow" />
        </Link>
      </div>
    </footer>
  );
}
