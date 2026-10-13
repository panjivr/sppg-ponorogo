import Link from "next/link";
import raw from "@/data/photo-sources.json";
import { PRODUK } from "@/lib/catalog";
import Icon from "@/components/Icon";
interface PhotoSource {
  productId: string;
  file: string;
  source: string;
  sourcePage: string;
  author: string;
  license: string;
  licenseUrl: string;
  changes: string;
  title?: string;
}
const sources: PhotoSource[] = raw;
export const metadata = {
  title: "Sumber & Kredit Foto Produk",
  description:
    "Sumber, pembuat, dan lisensi foto produk yang ditampilkan dalam katalog Bumbu Pawon Mas Dhoo.",
  alternates: { canonical: "/kredit-foto" },
};
export default function PhotoCredits() {
  return (
    <div className="site-container credits-page">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Beranda</Link>
        <Icon name="chevron" />
        <span aria-current="page">Kredit foto</span>
      </nav>
      <p className="eyebrow">SUMBER GAMBAR</p>
      <h1>Kredit foto produk.</h1>
      <p>
        Foto katalog merupakan foto ilustrasi bahan atau contoh kemasan dari
        sumber di bawah. Foto tidak menunjukkan stok aktual toko. Varian, ukuran
        kemasan, dan kondisi barang dikonfirmasi saat pemesanan.
      </p>
      <p>
        Gambar disimpan secara lokal dan ditampilkan dengan ukuran responsif.
        Watermark tidak dihapus. Lisensi berlaku untuk masing-masing foto;
        kredit tidak menyiratkan dukungan pembuat foto terhadap bisnis ini.
      </p>
      <ul className="credit-list">
        {sources.map((s) => (
          <li key={s.productId}>
            <h2>
              <Link href={`/supplier/${s.productId}`}>
                {PRODUK.find((p) => p.id === s.productId)?.nama || s.productId}
              </Link>
            </h2>
            <p>
              Foto: {s.author || "Lihat pembuat di halaman sumber"} ·{" "}
              <a href={s.licenseUrl} target="_blank" rel="noopener noreferrer">
                {s.license}
              </a>
            </p>
            <a
              href={s.sourcePage}
              target="_blank"
              rel="noopener noreferrer"
              className="text-link"
            >
              Lihat sumber dan atribusi asli <Icon name="arrow" />
            </a>
            <p>
              Penggunaan: ukuran tampilan disesuaikan untuk web; tidak ada
              penghapusan watermark atau perubahan objek.
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
