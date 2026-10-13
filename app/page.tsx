import Link from "next/link";

export const metadata = {
  title: "Bumbu Pawon — Supplier Sayur, Sembako & Kebutuhan Dapur Ponorogo",
  description:
    "Grosir & supplier sayur, sembako, tahu tempe, bumbu dan bahan pangan di Ponorogo. Melayani rumah tangga, pedagang, rumah makan, katering, hotel, serta pengadaan dapur SPPG/MBG.",
  alternates: { canonical: "/" },
};

const WA = "https://wa.me/6287892614999";
const waText = (msg: string) => `${WA}?text=${encodeURIComponent(msg)}`;

const KATEGORI = [
  { emoji: "🥬", nama: "Sayuran Segar", contoh: "Kubis, sawi, pakcoy, wortel, buncis, bayam, kangkung" },
  { emoji: "🍄", nama: "Jamur", contoh: "Tiram, kuping, kancing, shiitake" },
  { emoji: "🍠", nama: "Polo Pendem / Umbi", contoh: "Ubi ungu, Cilembu, singkong, talas, mbote" },
  { emoji: "🍊", nama: "Buah-buahan", contoh: "Nanas, jeruk peras, pisang, pepaya, semangka" },
  { emoji: "🌶️", nama: "Bumbu & Rempah", contoh: "Bawang, cabai, kemiri, jahe, kunyit, serai" },
  { emoji: "🧈", nama: "Tahu & Tempe", contoh: "Tahu putih/kuning, tempe papan, custom order" },
  { emoji: "🍚", nama: "Beras & Sembako", contoh: "Beras, telur, minyak, gula, garam, kecap" },
  { emoji: "🌾", nama: "Tepung & Bahan Toko", contoh: "Terigu, tapioka, maizena, panir, santan" },
];

const LAYANAN = [
  { emoji: "🛒", judul: "Retail / Eceran", desc: "Belanja kebutuhan dapur harian untuk rumah tangga, dalam jumlah fleksibel." },
  { emoji: "📦", judul: "Grosir", desc: "Harga grosir untuk pedagang, warung, rumah makan, katering, dan hotel." },
  { emoji: "🏢", judul: "Pengadaan B2B / SPPG", desc: "Pasokan rutin berbasis menu untuk dapur SPPG/MBG & institusi, dengan penawaran (RFQ)." },
];

const CARA = [
  { n: 1, judul: "Hubungi via WhatsApp", desc: "Kirim daftar kebutuhan, jumlah, dan jadwal yang diinginkan." },
  { n: 2, judul: "Terima penawaran", desc: "Kami cek stok & jaringan pemasok, lalu kirim penawaran harga." },
  { n: 3, judul: "Kirim & terima barang", desc: "Barang disiapkan dan diantar sesuai kesepakatan." },
];

const FAQ = [
  { q: "Apakah melayani grosir dan eceran?", a: "Ya. Kami melayani pembelian eceran untuk rumah tangga maupun grosir untuk pedagang, rumah makan, katering, dan institusi." },
  { q: "Apakah bisa suplai rutin untuk dapur SPPG/MBG?", a: "Bisa. Kami melayani pengadaan berbasis menu dengan pasokan berulang. Hubungi kami untuk pembahasan kebutuhan dan penawaran." },
  { q: "Produk apa saja yang tersedia?", a: "Sayur, umbi, buah, jamur, bumbu & rempah, tahu & tempe, beras & sembako, serta tepung dan bahan toko. Sebagian item dari stok inti kami, sebagian dari jaringan pemasok." },
  { q: "Bagaimana cara memesan?", a: "Pemesanan lewat WhatsApp. Kirim daftar kebutuhan, kami balas dengan penawaran dan jadwal pengiriman." },
  { q: "Area pengiriman?", a: "Ponorogo dan sekitarnya. Area dan ongkos kirim dikonfirmasi saat pemesanan." },
];

function Btn({ href, children, variant = "primary" }: { href: string; children: React.ReactNode; variant?: "primary" | "ghost" | "light" }) {
  const base = "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition";
  const styles = {
    primary: "bg-bumbu-green text-white hover:bg-bumbu-forest shadow-lg shadow-bumbu-green/20",
    ghost: "border border-bumbu-forest/20 bg-white text-bumbu-forest hover:bg-bumbu-cream",
    light: "bg-bumbu-lime text-bumbu-forest hover:bg-bumbu-yellow",
  }[variant];
  return (
    <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className={`${base} ${styles}`}>
      {children}
    </a>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-bumbu-cream font-sans text-bumbu-dark">
      <header className="sticky top-0 z-50 border-b border-bumbu-forest/10 bg-bumbu-cream/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <a href="#top" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-bumbu-forest text-lg">🌿</span>
            <span className="font-display text-lg font-extrabold tracking-tight text-bumbu-forest">Bumbu Pawon</span>
          </a>
          <nav className="hidden items-center gap-6 text-sm font-medium text-bumbu-dark/70 md:flex">
            <a href="#produk" className="hover:text-bumbu-forest">Produk</a>
            <a href="#layanan" className="hover:text-bumbu-forest">Layanan</a>
            <a href="#sppg" className="hover:text-bumbu-forest">Pengadaan SPPG</a>
            <a href="#kontak" className="hover:text-bumbu-forest">Kontak</a>
          </nav>
          <Btn href={waText("Halo Bumbu Pawon, saya ingin bertanya.")}>💬 WhatsApp</Btn>
        </div>
      </header>

      <main id="top">
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-bumbu-lime/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-bumbu-green/20 blur-3xl" />
          <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:grid-cols-2 md:py-20">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-bumbu-forest/10 px-3 py-1 text-xs font-semibold text-bumbu-forest">
                📍 Melayani Ponorogo &amp; sekitarnya
              </span>
              <h1 className="mt-4 font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-bumbu-forest md:text-5xl">
                Supplier Sayur, Sembako &amp; Kebutuhan Dapur Terpercaya di Ponorogo
              </h1>
              <p className="mt-4 text-lg text-bumbu-dark/70">
                <strong className="text-bumbu-dark">Kebutuhan Dapur, Kami Siapkan.</strong>{" "}
                Grosir &amp; supplier sayur, bumbu, tahu tempe, dan bahan pangan untuk rumah tangga,
                pedagang, katering, hingga dapur SPPG/MBG.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Btn href={waText("Halo Bumbu Pawon, saya mau belanja kebutuhan dapur. Berikut daftarnya:")}>🛒 Belanja Sekarang</Btn>
                <Btn href="#sppg" variant="ghost">🏢 Konsultasi Pengadaan SPPG</Btn>
              </div>
              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-bumbu-dark/70">
                <span>✅ Grosir &amp; eceran</span>
                <span>✅ Jaringan pemasok luas</span>
                <span>✅ Bisa diantar</span>
              </div>
            </div>
            <div className="rounded-3xl border border-bumbu-forest/10 bg-white p-6 shadow-xl">
              <div className="grid grid-cols-2 gap-3">
                {KATEGORI.slice(0, 4).map((k) => (
                  <div key={k.nama} className="rounded-2xl bg-bumbu-cream p-4">
                    <div className="text-3xl">{k.emoji}</div>
                    <div className="mt-1 font-display text-sm font-bold text-bumbu-forest">{k.nama}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-2xl bg-bumbu-forest p-4 text-bumbu-cream">
                <div className="text-xs uppercase tracking-wide text-bumbu-lime">Pesan cepat</div>
                <div className="mt-1 text-sm">WhatsApp <strong>0878-9261-4999</strong></div>
              </div>
            </div>
          </div>
        </section>

        <section id="produk" className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="font-display text-2xl font-extrabold text-bumbu-forest md:text-3xl">Kategori Produk</h2>
          <p className="mt-1 text-bumbu-dark/60">Beragam kebutuhan dapur dalam satu supplier.</p>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            {KATEGORI.map((k) => (
              <div key={k.nama} className="rounded-2xl border border-bumbu-forest/10 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
                <div className="text-3xl">{k.emoji}</div>
                <div className="mt-2 font-display font-bold text-bumbu-forest">{k.nama}</div>
                <div className="mt-1 text-xs leading-relaxed text-bumbu-dark/60">{k.contoh}</div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-bumbu-dark/60">
            Daftar lengkap &amp; ketersediaan dikonfirmasi saat pemesanan.{" "}
            <a href={waText("Halo Bumbu Pawon, boleh minta daftar produk & harga?")} target="_blank" rel="noopener noreferrer" className="font-semibold text-bumbu-green underline">
              Minta daftar via WhatsApp →
            </a>
          </p>
        </section>

        <section id="layanan" className="bg-white py-12">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="font-display text-2xl font-extrabold text-bumbu-forest md:text-3xl">Layanan Kami</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {LAYANAN.map((l) => (
                <div key={l.judul} className="rounded-2xl border border-bumbu-forest/10 bg-bumbu-cream p-6">
                  <div className="text-3xl">{l.emoji}</div>
                  <h3 className="mt-2 font-display text-lg font-bold text-bumbu-forest">{l.judul}</h3>
                  <p className="mt-1 text-sm text-bumbu-dark/70">{l.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="sppg" className="bg-bumbu-forest py-14 text-bumbu-cream">
          <div className="mx-auto max-w-6xl px-4">
            <div className="grid items-center gap-8 md:grid-cols-2">
              <div>
                <span className="inline-flex rounded-full bg-bumbu-lime/20 px-3 py-1 text-xs font-semibold text-bumbu-lime">Khusus B2B</span>
                <h2 className="mt-3 font-display text-2xl font-extrabold md:text-3xl">Pengadaan Bahan untuk Dapur SPPG / MBG</h2>
                <p className="mt-3 text-bumbu-cream/80">
                  Pasokan sayur, bumbu, tahu tempe, dan sembako secara rutin &amp; berbasis menu untuk
                  dapur SPPG serta institusi. Penawaran transparan, kualitas terjaga, dan pengiriman terjadwal.
                </p>
                <div className="mt-5">
                  <Btn href={waText("Halo Bumbu Pawon, saya dari SPPG/institusi dan ingin konsultasi pengadaan bahan.")} variant="light">Konsultasi Pengadaan →</Btn>
                </div>
              </div>
              <ol className="grid gap-3 text-sm">
                {["Kirim kebutuhan / menu (RFQ)", "Cek stok & penawaran pemasok", "Quotation & persetujuan", "Pengiriman terjadwal & bukti terima"].map((s, i) => (
                  <li key={i} className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-bumbu-lime font-bold text-bumbu-forest">{i + 1}</span>
                    {s}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="font-display text-2xl font-extrabold text-bumbu-forest md:text-3xl">Cara Pesan</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {CARA.map((c) => (
              <div key={c.n} className="rounded-2xl border border-bumbu-forest/10 bg-white p-6">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-bumbu-green text-lg font-bold text-white">{c.n}</div>
                <h3 className="mt-3 font-display font-bold text-bumbu-forest">{c.judul}</h3>
                <p className="mt-1 text-sm text-bumbu-dark/70">{c.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="kontak" className="bg-white py-12">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 md:grid-cols-2">
            <div className="rounded-2xl border border-bumbu-forest/10 bg-bumbu-cream p-6">
              <h2 className="font-display text-xl font-extrabold text-bumbu-forest">Hubungi Kami</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div><dt className="text-bumbu-dark/50">WhatsApp</dt><dd className="font-semibold text-bumbu-dark">0878-9261-4999</dd></div>
                <div><dt className="text-bumbu-dark/50">Alamat</dt><dd className="font-semibold text-bumbu-dark">Lor Prapatan, Wonoketro, Jetis, Kab. Ponorogo, Jawa Timur</dd></div>
                <div><dt className="text-bumbu-dark/50">Melayani</dt><dd className="text-bumbu-dark/80">Rumah tangga, pedagang, rumah makan, katering, hotel, SPPG/MBG &amp; institusi</dd></div>
              </dl>
              <div className="mt-5"><Btn href={waText("Halo Bumbu Pawon, saya ingin memesan.")}>💬 Chat WhatsApp</Btn></div>
            </div>
            <div className="rounded-2xl border border-bumbu-forest/10 bg-bumbu-cream p-6">
              <h2 className="font-display text-xl font-extrabold text-bumbu-forest">Pertanyaan Umum</h2>
              <div className="mt-3 divide-y divide-bumbu-forest/10">
                {FAQ.map((f) => (
                  <details key={f.q} className="group py-2">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-2 font-medium text-bumbu-dark">
                      {f.q}<span className="text-bumbu-green transition group-open:rotate-45">＋</span>
                    </summary>
                    <p className="mt-1 text-sm text-bumbu-dark/70">{f.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-bumbu-dark py-8 text-bumbu-cream/70">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2 font-display text-lg font-extrabold text-bumbu-cream"><span>🌿</span> Bumbu Pawon</div>
            <p className="mt-1 text-sm">Kebutuhan Dapur, Kami Siapkan. · Jetis, Ponorogo</p>
          </div>
          <Link href="/ringkasan" className="text-xs text-bumbu-cream/50 hover:text-bumbu-lime">Area Admin</Link>
        </div>
        <p className="mx-auto mt-4 max-w-6xl px-4 text-[11px] text-bumbu-cream/40">© {new Date().getFullYear()} Bumbu Pawon. Bukan afiliasi resmi BGN.</p>
      </footer>

      <a href={waText("Halo Bumbu Pawon 🙏")} target="_blank" rel="noopener noreferrer" className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-bumbu-green px-5 py-3 font-semibold text-white shadow-xl shadow-bumbu-green/30 hover:bg-bumbu-forest">
        💬 Pesan Sekarang
      </a>
    </div>
  );
}
