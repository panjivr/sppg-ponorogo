import Link from "next/link";
import { NavSpacer } from "@/components/Nav";
import { Card, Stat, StatusBreakdown } from "@/components/ui";
import {
  SPPG_SEED,
  daftarKecamatan,
  hitungPasar,
  ringkasKecamatan,
  ringkasStatus,
} from "@/lib/data";
import { ASUMSI, BISNIS, waLink } from "@/lib/config";
import { num, persen, rupiahRingkas } from "@/lib/format";

export const metadata = {
  title:
    "Peta SPPG Ponorogo — 85 Dapur MBG, Analisis Lokasi Ruko Supplier",
  description:
    "Basis data 85 dapur SPPG (Makan Bergizi Gratis) di 21 kecamatan Kabupaten Ponorogo: status, penerima manfaat, koordinat. Lengkap dengan analisis lokasi ruko supplier & ukuran pasar.",
};

export default function Beranda() {
  const list = SPPG_SEED;
  const pasar = hitungPasar(list);
  const status = ringkasStatus(list);
  const kec = ringkasKecamatan(list);
  const jumlahKec = daftarKecamatan(list).length;
  const operasional = status.find((s) => s.status === "operasional")!;
  const koordinatPasti = list.filter((s) => !s.perkiraan).length;

  return (
    <>
      {/* ---------------- Hero ---------------- */}
      <section className="safe-x border-b border-hairline bg-surface">
        <div className="mx-auto max-w-content px-4 py-10 sm:py-14 lg:py-20">
          <p className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand">
            <span aria-hidden="true">📍</span> Kabupaten Ponorogo · 21 kecamatan
          </p>

          <h1 className="mt-4 max-w-3xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            {num(pasar.porsiHarian)} porsi makan dimasak tiap hari di Ponorogo.
            <span className="block text-brand">
              Siapa yang memasok bahannya?
            </span>
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink2 sm:text-lg">
            Program Makan Bergizi Gratis menjalankan{" "}
            <strong className="text-ink">{operasional.jumlah} dapur SPPG</strong>{" "}
            yang beroperasi di Ponorogo. Web ini memetakan seluruhnya,
            menghitung ukuran pasarnya, dan membantu Anda menentukan{" "}
            <strong className="text-ink">titik ruko supplier</strong> yang
            paling strategis — termasuk keunggulan buka 24 jam, karena dapur MBG
            bekerja pada malam hari.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/peta"
              className="tap inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
            >
              🗺️ Buka peta &amp; cari lokasi ruko
            </Link>
            <Link
              href="/dashboard"
              className="tap inline-flex items-center gap-2 rounded-lg border border-hairline px-5 py-3 text-sm font-semibold hover:bg-surface2"
            >
              📊 Lihat ukuran pasar
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- Angka kunci ---------------- */}
      <section className="safe-x mx-auto max-w-content px-4 py-8 sm:py-10">
        <h2 className="sr-only">Angka kunci</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat
            label="Dapur SPPG"
            value={num(list.length)}
            hint={`${operasional.jumlah} operasional · ${jumlahKec} kecamatan`}
            tone="brand"
          />
          <Stat
            label="Penerima manfaat"
            value={num(pasar.porsiHarian)}
            hint="porsi per hari dari dapur operasional"
            tone="seqA"
          />
          <Stat
            label="Belanja pangan"
            value={rupiahRingkas(pasar.belanjaHarian)}
            hint="per hari, asumsi Rp 10.000/porsi"
            tone="seqB"
          />
          <Stat
            label="Pasar bahan / tahun"
            value={rupiahRingkas(pasar.pasarBahanTahunan)}
            hint={`${persen(ASUMSI.porsiBelanjaBahan)} dari belanja, ${ASUMSI.hariPerTahun} hari`}
          />
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted">
          Semua angka dihitung dari data resmi dan asumsi yang terbuka — rumus
          lengkapnya ada di{" "}
          <Link href="/tentang" className="underline hover:text-ink2">
            halaman metodologi
          </Link>
          . Angka ini perkiraan perencanaan, bukan jaminan pendapatan.
        </p>
      </section>

      {/* ---------------- Peluang ---------------- */}
      <section className="safe-x mx-auto max-w-content px-4 pb-8">
        <Card className="border-brand/30 bg-brand-soft">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                Kalau Anda merebut {persen(ASUMSI.targetPangsaPasar)} pasar ini
              </h2>
              <p className="mt-1 text-sm text-ink2">
                Potensi omzet ≈{" "}
                <strong className="text-ink">
                  {rupiahRingkas(pasar.proyeksiOmzet)}
                </strong>{" "}
                per tahun. Itu setara{" "}
                {rupiahRingkas(pasar.proyeksiOmzet / 12)} per bulan.
              </p>
            </div>
            <a
              href={waLink(
                `Halo ${BISNIS.nama}, saya ingin diskusi kerja sama pasokan bahan untuk dapur MBG di Ponorogo.`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="tap inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
            >
              💬 Diskusi via WhatsApp
            </a>
          </div>
        </Card>
      </section>

      {/* ---------------- Status + kecamatan teratas ---------------- */}
      <section className="safe-x mx-auto max-w-content px-4 pb-8">
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <h2 className="text-base font-semibold">Status {list.length} dapur</h2>
            <p className="mb-4 mt-1 text-sm text-ink2">
              Hanya dapur operasional yang menghasilkan order hari ini.
            </p>
            <StatusBreakdown rows={status} total={list.length} />
          </Card>

          <Card>
            <h2 className="text-base font-semibold">
              5 kecamatan permintaan terbesar
            </h2>
            <p className="mb-4 mt-1 text-sm text-ink2">
              Diurutkan dari jumlah penerima manfaat per hari.
            </p>
            <ol className="space-y-2.5">
              {kec.slice(0, 5).map((k, i) => (
                <li
                  key={k.kecamatan}
                  className="flex items-baseline justify-between gap-3 border-b border-hairline pb-2 last:border-0 last:pb-0"
                >
                  <span className="flex min-w-0 items-baseline gap-2">
                    <span className="tabular-nums text-xs text-muted">
                      {i + 1}.
                    </span>
                    <span className="truncate font-medium">{k.kecamatan}</span>
                  </span>
                  <span className="shrink-0 text-right text-sm">
                    <span className="font-semibold tabular-nums">
                      {num(k.porsi)}
                    </span>
                    <span className="block text-xs text-muted">
                      {k.jumlah} dapur
                    </span>
                  </span>
                </li>
              ))}
            </ol>
            <Link
              href="/dashboard"
              className="mt-4 inline-block text-sm font-semibold text-brand hover:underline"
            >
              Lihat semua {jumlahKec} kecamatan →
            </Link>
          </Card>
        </div>
      </section>

      {/* ---------------- Fitur ---------------- */}
      <section className="safe-x mx-auto max-w-content px-4 pb-10">
        <h2 className="mb-4 text-lg font-semibold">Isi web ini</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              href: "/peta",
              icon: "🗺️",
              judul: "Peta interaktif",
              teks: "85 titik berwarna per status, pencarian, filter kecamatan, heatmap permintaan, dan tautan Google Maps ke titik pasti.",
            },
            {
              href: "/peta",
              icon: "🏪",
              judul: "Simulasi calon ruko",
              teks: "Taruh titik ruko di peta, atur radius antar, langsung lihat berapa dapur terjangkau dan nilai belanjanya per tahun.",
            },
            {
              href: "/dashboard",
              icon: "📊",
              judul: "Analisis pasar",
              teks: "Ukuran pasar, sebaran per kecamatan, peringkat peluang, dan kandidat lokasi terbaik hasil skoring kisi.",
            },
            {
              href: "/direktori",
              icon: "📋",
              judul: "Direktori & ekspor",
              teks: "Tabel lengkap yang bisa dicari dan diurutkan, plus ekspor CSV dan GeoJSON untuk diolah di Excel atau QGIS.",
            },
          ].map((f) => (
            <Link
              key={f.judul}
              href={f.href}
              className="group rounded-xl border border-hairline bg-surface p-4 transition hover:border-brand/40 hover:bg-surface2"
            >
              <div aria-hidden="true" className="text-2xl">
                {f.icon}
              </div>
              <h3 className="mt-2 font-semibold group-hover:text-brand">
                {f.judul}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-ink2">{f.teks}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------------- Kredibilitas data ---------------- */}
      <section className="safe-x border-t border-hairline bg-surface">
        <div className="mx-auto max-w-content px-4 py-8">
          <h2 className="text-lg font-semibold">Dari mana datanya?</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink2">
            Sumber utama adalah <strong>Database SPPG Kabupaten Ponorogo</strong>{" "}
            (data resmi pengelola program), dilengkapi penelusuran sumber publik
            Pemkab Ponorogo, Polres, dan direktori SPPG.{" "}
            <strong className="text-ink">{koordinatPasti} dari {list.length}</strong>{" "}
            titik memakai koordinat GPS asli dari database; sisanya perkiraan
            pusat wilayah dan ditandai jelas di peta.
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink2">
            Data pribadi pengelola (nomor telepon kepala SPPG, PIC yayasan,
            rekening) <strong>tidak dipublikasikan</strong> di web ini.
          </p>
          <Link
            href="/tentang"
            className="mt-4 inline-block text-sm font-semibold text-brand hover:underline"
          >
            Baca metodologi &amp; batasan data →
          </Link>
        </div>
      </section>

      <footer className="safe-x safe-b mx-auto max-w-content px-4 py-8 text-xs leading-relaxed text-muted">
        <p>
          {BISNIS.nama} · Data SPPG Kab. Ponorogo · Peta ©{" "}
          <a
            href="https://www.openstreetmap.org/copyright"
            className="underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            kontributor OpenStreetMap
          </a>
          .
        </p>
        <p className="mt-1">
          Web ini alat bantu perencanaan independen, tidak berafiliasi dengan
          Badan Gizi Nasional maupun Pemerintah Kabupaten Ponorogo.
        </p>
      </footer>

      <NavSpacer />
    </>
  );
}
