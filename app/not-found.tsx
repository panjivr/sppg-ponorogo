import Link from "next/link";
import Icon from "@/components/Icon";
export default function NotFound() {
  return (
    <div className="site-container not-found-page">
      <p className="eyebrow">404 · HALAMAN TIDAK DITEMUKAN</p>
      <h1>
        Belum menemukan
        <br />
        yang Anda cari?
      </h1>
      <p>
        Halaman ini tidak tersedia. Kembali ke katalog untuk menemukan bahan
        dapur dan menyusun daftar kebutuhan Anda.
      </p>
      <div className="hero-actions">
        <Link className="button button-primary" href="/supplier">
          Jelajahi katalog <Icon name="arrow" />
        </Link>
        <Link className="button button-secondary" href="/">
          Kembali ke beranda
        </Link>
      </div>
    </div>
  );
}
