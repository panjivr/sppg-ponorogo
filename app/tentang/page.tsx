import Link from "next/link";
import { NavSpacer } from "@/components/Nav";
import { Card, SectionTitle } from "@/components/ui";
import { SPPG_SEED, daftarKecamatan, ringkasStatus } from "@/lib/data";
import { ASUMSI, BISNIS } from "@/lib/config";
import { num, persen, rupiah } from "@/lib/format";

export const metadata = {
  title: "Metodologi, Sumber Data & Batasan",
  description:
    "Dari mana data 85 dapur SPPG Ponorogo berasal, bagaimana koordinat diperoleh, asumsi ekonomi yang dipakai, dan batasan yang harus Anda tahu sebelum mengambil keputusan.",
  alternates: { canonical: "/tentang" },
};

export default function Tentang() {
  const list = SPPG_SEED;
  const pasti = list.filter((s) => !s.perkiraan).length;
  const perkiraan = list.length - pasti;
  const status = ringkasStatus(list);
  const jumlahKec = daftarKecamatan(list).length;

  return (
    <div className="safe-x mx-auto max-w-3xl px-4 py-6 sm:py-8">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        Metodologi, sumber data &amp; batasan
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-ink2">
        Halaman ini menjelaskan bagaimana setiap angka di web ini dihasilkan,
        supaya Anda bisa menilai sendiri keandalannya — dan tahu di mana data
        ini masih lemah.
      </p>

      {/* ---------------- Sumber ---------------- */}
      <section className="mt-8">
        <SectionTitle>1. Sumber data</SectionTitle>
        <Card>
          <p className="text-sm leading-relaxed text-ink2">
            Sumber utama adalah{" "}
            <strong className="text-ink">
              Database SPPG Kabupaten Ponorogo
            </strong>{" "}
            — berkas kerja pengelola program yang memuat {list.length} unit
            beserta nama, desa, alamat, status operasional, jumlah penerima
            manfaat, dan tautan Google Maps.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-ink2">
            Sebelum berkas itu tersedia, data dirakit dari penelusuran sumber
            publik dan tetap dipakai sebagai pembanding:
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-ink2">
            <li>Bagian Prokopim &amp; Dinas Kesehatan Kab. Ponorogo</li>
            <li>Tribratanews Polres Ponorogo</li>
            <li>Direktori operasional SPPG (auditsppg.id, sertifikasichef.com)</li>
            <li>RRI, JTV Madiun, Radar Madiun</li>
            <li>Portal geospasial Badan Gizi Nasional (gina.bgn.go.id)</li>
          </ul>
        </Card>
      </section>

      {/* ---------------- Koordinat ---------------- */}
      <section className="mt-8">
        <SectionTitle>2. Bagaimana koordinat diperoleh</SectionTitle>
        <Card>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="font-semibold">
                {pasti} dari {list.length} titik — koordinat GPS asli
              </dt>
              <dd className="mt-0.5 leading-relaxed text-ink2">
                Diambil dari nilai <code>Lat/Lon</code> yang tertulis di kolom
                alamat pada database resmi. Ini titik yang paling bisa
                dipercaya.
              </dd>
            </div>
            <div>
              <dt className="font-semibold">
                {perkiraan} titik — koordinat perkiraan
              </dt>
              <dd className="mt-0.5 leading-relaxed text-ink2">
                Database tidak mencantumkan koordinatnya, jadi titik ditempatkan
                di sekitar rata-rata koordinat kecamatannya. Titik seperti ini
                <strong className="text-ink"> ditandai jelas</strong> di peta
                dan tabel dengan label “perkiraan”, dan tiap titik tetap
                menyimpan tautan Google Maps resmi supaya lokasi pastinya bisa
                dibuka sekali ketuk.
              </dd>
            </div>
          </dl>
          <p className="mt-3 rounded-lg bg-surface2 p-3 text-xs leading-relaxed text-ink2">
            <strong className="text-ink">Catatan jujur:</strong> tautan pendek
            Google Maps tidak bisa dibuka otomatis dari lingkungan kami, jadi
            koordinatnya tidak dapat diekstrak massal. Perbaikan paling akurat
            adalah membuka tautan tiap unit lalu menyalin koordinatnya — bisa
            dilakukan bertahap lewat form koreksi di halaman peta.
          </p>
        </Card>
      </section>

      {/* ---------------- Asumsi ---------------- */}
      <section className="mt-8">
        <SectionTitle sub="Semua angka rupiah di web ini turunan dari lima asumsi ini. Ubah di lib/config.ts dan seluruh halaman ikut berubah.">
          3. Asumsi ekonomi
        </SectionTitle>
        <Card>
          <ul className="space-y-3 text-sm">
            {[
              [
                `Anggaran bahan ${rupiah(ASUMSI.hargaPerPorsi)} per porsi`,
                "Mengikuti kisaran anggaran satuan program MBG. Bila anggaran riil berbeda, seluruh proyeksi bergerak proporsional.",
              ],
              [
                `${persen(ASUMSI.porsiBelanjaBahan)} belanja adalah bahan pangan`,
                "Sisanya tenaga kerja, gas/energi, kemasan, transport, dan penyusutan alat — bukan porsi yang dilayani supplier bahan.",
              ],
              [
                `${ASUMSI.hariPerTahun} hari operasional per tahun`,
                "Perkiraan hari sekolah efektif. Libur semester dan hari besar mengurangi angka ini.",
              ],
              [
                `Margin kotor ${persen(ASUMSI.marginKotor)}`,
                "Kisaran umum usaha distribusi bahan pangan. Dipakai untuk menghitung berapa pangsa pasar yang perlu direbut agar sewa ruko tertutup.",
              ],
              [
                `Target pangsa pasar ${persen(ASUMSI.targetPangsaPasar)}`,
                "Skenario konservatif untuk pemain baru, bukan target yang dijanjikan.",
              ],
            ].map(([judul, isi]) => (
              <li key={judul}>
                <div className="font-semibold">{judul}</div>
                <div className="mt-0.5 leading-relaxed text-ink2">{isi}</div>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      {/* ---------------- Cara analisis lokasi ---------------- */}
      <section className="mt-8">
        <SectionTitle>4. Cara kerja rekomendasi lokasi</SectionTitle>
        <Card>
          <ol className="space-y-3 text-sm">
            <li>
              <span className="font-semibold">Pusat gravitasi (⭐)</span>
              <p className="mt-0.5 leading-relaxed text-ink2">
                Rata-rata koordinat seluruh dapur, dibobot status operasional
                dan jumlah penerima manfaat. Dapur yang sudah jalan dan besar
                menarik titik lebih kuat.
              </p>
            </li>
            <li>
              <span className="font-semibold">Skoring kisi (🟠)</span>
              <p className="mt-0.5 leading-relaxed text-ink2">
                Wilayah dibagi menjadi kisi 28×28. Tiap sel dinilai dari jumlah
                dan besarnya dapur yang bisa dijangkau dalam radius pilihan
                Anda. Tiga sel skor tertinggi ditampilkan, disebar minimal 4 km
                agar tidak menumpuk di satu tempat.
              </p>
            </li>
            <li>
              <span className="font-semibold">Jarak</span>
              <p className="mt-0.5 leading-relaxed text-ink2">
                Dihitung haversine (garis lurus). Untuk perkiraan jarak tempuh
                nyata, dikalikan faktor belok 1,35 — jalan tidak pernah lurus.
                Ini <em>bukan</em> hasil perhitungan rute jalan sebenarnya.
              </p>
            </li>
          </ol>
        </Card>
      </section>

      {/* ---------------- Batasan ---------------- */}
      <section className="mt-8">
        <SectionTitle>5. Batasan yang harus Anda tahu</SectionTitle>
        <Card className="border-serious/40">
          <ul className="space-y-2.5 text-sm leading-relaxed text-ink2">
            <li>
              <strong className="text-ink">Data bisa kedaluwarsa.</strong>{" "}
              Program MBG berkembang cepat; dapur baru dibuka dan status berubah.
              Angka di sini foto sesaat, bukan umpan langsung.
            </li>
            <li>
              <strong className="text-ink">
                {perkiraan} titik koordinatnya perkiraan.
              </strong>{" "}
              Jangan pakai untuk survei lapangan tanpa membuka tautan Maps-nya
              lebih dulu.
            </li>
            <li>
              <strong className="text-ink">
                Belum ada data pesaing dan harga riil.
              </strong>{" "}
              Web ini memetakan permintaan, belum memetakan siapa yang sudah
              memasok dan pada harga berapa.
            </li>
            <li>
              <strong className="text-ink">
                Perubahan Anda tersimpan di perangkat ini saja.
              </strong>{" "}
              Koreksi data dan calon ruko disimpan di penyimpanan browser
              (localStorage), belum di database bersama — jadi belum bisa dilihat
              rekan kerja di perangkat lain.
            </li>
            <li>
              <strong className="text-ink">Independen.</strong> Web ini alat
              bantu perencanaan dan tidak berafiliasi dengan Badan Gizi Nasional
              maupun Pemerintah Kabupaten Ponorogo.
            </li>
          </ul>
        </Card>
      </section>

      {/* ---------------- Privasi ---------------- */}
      <section className="mt-8">
        <SectionTitle>6. Privasi</SectionTitle>
        <Card>
          <p className="text-sm leading-relaxed text-ink2">
            Database sumber memuat data pribadi: nama dan nomor telepon kepala
            SPPG, PIC yayasan, nama bank/rekening, serta dokumen perizinan.
            Semua itu{" "}
            <strong className="text-ink">sengaja tidak dipublikasikan</strong> di
            web ini. Yang ditampilkan hanya informasi kelembagaan: nama unit,
            desa, kecamatan, status, jumlah penerima manfaat, alamat, dan
            koordinat.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-ink2">
            Web ini tidak memakai pelacak pihak ketiga. Tidak ada data Anda yang
            dikirim ke server kami — keranjang katalog dan catatan calon ruko
            hanya tersimpan di browser Anda.
          </p>
        </Card>
      </section>

      {/* ---------------- Ringkasan cakupan ---------------- */}
      <section className="mt-8">
        <SectionTitle>7. Ringkasan cakupan</SectionTitle>
        <Card>
          <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            {[
              ["Dapur terdata", num(list.length)],
              ["Kecamatan", num(jumlahKec)],
              [
                "Operasional",
                num(status.find((s) => s.status === "operasional")!.jumlah),
              ],
              ["Koordinat GPS asli", `${pasti}/${list.length}`],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs uppercase tracking-wide text-muted">
                  {k}
                </dt>
                <dd className="mt-0.5 text-xl font-bold">{v}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/direktori"
          className="tap inline-flex items-center gap-2 rounded-lg border border-hairline px-4 py-2.5 text-sm font-semibold hover:bg-surface2"
        >
          📋 Periksa sendiri datanya
        </Link>
        <Link
          href="/peta"
          className="tap inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          🗺️ Buka peta
        </Link>
      </div>

      <p className="mt-8 text-xs leading-relaxed text-muted">
        Pertanyaan atau koreksi data? Hubungi {BISNIS.nama} lewat tombol
        WhatsApp di halaman katalog.
      </p>

      <NavSpacer />
    </div>
  );
}
