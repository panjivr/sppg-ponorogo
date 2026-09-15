import Link from "next/link";
import { NavSpacer } from "@/components/Nav";
import { BarList, Card, SectionTitle, Stat, StatusBreakdown } from "@/components/ui";
import {
  SPPG_SEED,
  daftarKecamatan,
  hitungPasar,
  nilaiBahanTahunan,
  ringkasKecamatan,
  ringkasStatus,
} from "@/lib/data";
import { ASUMSI } from "@/lib/config";
import { num, persen, rupiah, rupiahRingkas } from "@/lib/format";

export const metadata = {
  title: "Analisis Pasar Supplier MBG Ponorogo",
  description:
    "Ukuran pasar belanja bahan pangan program MBG di Kabupaten Ponorogo, sebaran permintaan per kecamatan, dan peringkat peluang untuk supplier.",
  alternates: { canonical: "/dashboard" },
};

export default function Dashboard() {
  const list = SPPG_SEED;
  const pasar = hitungPasar(list);
  const status = ringkasStatus(list);
  const kec = ringkasKecamatan(list);
  const jumlahKec = daftarKecamatan(list).length;

  const barPermintaan = kec.map((k) => ({
    label: k.kecamatan,
    value: k.porsi,
    note: `${k.jumlah} dapur`,
  }));
  const barJumlah = [...kec]
    .sort((a, b) => b.jumlah - a.jumlah)
    .map((k) => ({
      label: k.kecamatan,
      value: k.jumlah,
      note: `${num(k.porsi)} penerima manfaat`,
    }));

  // Peluang = permintaan operasional terbesar yang belum tentu terlayani baik
  const peluang = kec
    .map((k) => ({
      ...k,
      nilaiTahunan: nilaiBahanTahunan(
        list
          .filter(
            (s) => s.kecamatan === k.kecamatan && s.status === "operasional"
          )
          .reduce((a, s) => a + s.porsi, 0)
      ),
    }))
    .filter((k) => k.nilaiTahunan > 0)
    .sort((a, b) => b.nilaiTahunan - a.nilaiTahunan);

  return (
    <div className="safe-x mx-auto max-w-content px-4 py-6 sm:py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Analisis pasar supplier MBG
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink2">
          Seberapa besar uang yang berputar untuk belanja bahan pangan program
          MBG di Ponorogo, dan di mana permintaan itu terkumpul. Semua angka
          diturunkan dari {list.length} dapur pada basis data dan asumsi terbuka
          di bawah.
        </p>
      </header>

      {/* ---------------- Ukuran pasar ---------------- */}
      <section className="mb-8">
        <SectionTitle sub="Dihitung hanya dari dapur berstatus operasional — dapur yang belum jalan tidak menghasilkan order.">
          Ukuran pasar
        </SectionTitle>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat
            label="Penerima manfaat"
            value={num(pasar.porsiHarian)}
            hint="porsi per hari"
            tone="seqA"
          />
          <Stat
            label="Belanja pangan / hari"
            value={rupiahRingkas(pasar.belanjaHarian)}
            hint={`${rupiah(ASUMSI.hargaPerPorsi)} per porsi`}
          />
          <Stat
            label="Belanja pangan / tahun"
            value={rupiahRingkas(pasar.belanjaTahunan)}
            hint={`${ASUMSI.hariPerTahun} hari operasional`}
          />
          <Stat
            label="Pasar bahan / tahun"
            value={rupiahRingkas(pasar.pasarBahanTahunan)}
            hint={`${persen(ASUMSI.porsiBelanjaBahan)} bagian supplier bahan`}
            tone="seqB"
          />
        </div>

        <Card className="mt-3 border-brand/30 bg-brand-soft">
          <h3 className="text-sm font-semibold">Cara membaca angka ini</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-ink2">
            Dari {rupiahRingkas(pasar.pasarBahanTahunan)} belanja bahan per
            tahun, merebut {persen(ASUMSI.targetPangsaPasar)} berarti omzet{" "}
            <strong className="text-ink">
              {rupiahRingkas(pasar.proyeksiOmzet)}
            </strong>
            /tahun (± {rupiahRingkas(pasar.proyeksiOmzet / 12)}/bulan). Dengan
            margin kotor {persen(ASUMSI.marginKotor)}, laba kotornya ±{" "}
            {rupiahRingkas(pasar.proyeksiOmzet * ASUMSI.marginKotor)}/tahun.
            Angka ini perkiraan perencanaan — bukan jaminan.
          </p>
        </Card>
      </section>

      {/* ---------------- Status ---------------- */}
      <section className="mb-8 grid gap-4 lg:grid-cols-2">
        <Card>
          <SectionTitle sub={`Total ${list.length} dapur di ${jumlahKec} kecamatan.`}>
            Status operasional
          </SectionTitle>
          <StatusBreakdown rows={status} total={list.length} />
          <p className="mt-3 text-xs leading-relaxed text-muted">
            Warna status selalu ditemani ikon dan label, jadi maknanya tidak
            bergantung pada warna saja.
          </p>
        </Card>

        <Card>
          <SectionTitle sub="Nilai belanja bahan per tahun dari dapur operasional di kecamatan tersebut.">
            Peringkat peluang
          </SectionTitle>
          <ol className="space-y-2">
            {peluang.slice(0, 8).map((k, i) => (
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
                <span className="shrink-0 text-right">
                  <span className="block text-sm font-semibold tabular-nums text-seqB">
                    {rupiahRingkas(k.nilaiTahunan)}
                  </span>
                  <span className="block text-xs text-muted">
                    {k.operasional} dapur aktif
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </Card>
      </section>

      {/* ---------------- Grafik permintaan (oranye) ---------------- */}
      <section className="mb-8">
        <Card>
          <SectionTitle sub="Penerima manfaat per hari, seluruh status. Arahkan kursor/ketuk baris untuk rinciannya.">
            Sebaran permintaan per kecamatan
          </SectionTitle>
          <BarList rows={barPermintaan} color="var(--seq-b)" unit=" pm/hari" />
        </Card>
      </section>

      {/* ---------------- Grafik jumlah dapur (biru) ---------------- */}
      <section className="mb-8">
        <Card>
          <SectionTitle sub="Banyaknya dapur tidak selalu sejalan dengan besarnya permintaan — Mlarak punya banyak dapur kecil, Jenangan sedikit tapi besar.">
            Jumlah dapur per kecamatan
          </SectionTitle>
          <BarList rows={barJumlah} color="var(--seq-a)" unit=" dapur" />
          <p className="mt-4 text-sm text-ink2">
            Butuh angka mentahnya?{" "}
            <Link
              href="/direktori"
              className="font-semibold text-brand hover:underline"
            >
              Lihat tabel lengkap &amp; ekspor data →
            </Link>
          </p>
        </Card>
      </section>

      {/* ---------------- Asumsi ---------------- */}
      <section className="mb-8">
        <Card>
          <SectionTitle>Asumsi yang dipakai</SectionTitle>
          <div className="table-wrap">
            <table className="w-full min-w-[30rem] text-sm">
              <caption className="sr-only">
                Daftar asumsi perhitungan ukuran pasar
              </caption>
              <thead>
                <tr className="border-b border-hairline text-left text-xs uppercase tracking-wide text-muted">
                  <th scope="col" className="py-2 pr-3 font-medium">
                    Asumsi
                  </th>
                  <th scope="col" className="py-2 pr-3 font-medium">
                    Nilai
                  </th>
                  <th scope="col" className="py-2 font-medium">
                    Dasar
                  </th>
                </tr>
              </thead>
              <tbody className="text-ink2">
                {[
                  [
                    "Anggaran bahan per porsi",
                    rupiah(ASUMSI.hargaPerPorsi),
                    "Kisaran anggaran satuan program MBG",
                  ],
                  [
                    "Bagian supplier bahan",
                    persen(ASUMSI.porsiBelanjaBahan),
                    "Sisanya tenaga kerja, energi, kemasan, penyusutan",
                  ],
                  [
                    "Hari operasional",
                    `${ASUMSI.hariPerTahun} hari/tahun`,
                    "Mengikuti hari sekolah efektif",
                  ],
                  [
                    "Margin kotor distribusi",
                    persen(ASUMSI.marginKotor),
                    "Kisaran umum usaha distribusi bahan pangan",
                  ],
                  [
                    "Target pangsa pasar",
                    persen(ASUMSI.targetPangsaPasar),
                    "Skenario konservatif pemain baru",
                  ],
                ].map(([a, b, c]) => (
                  <tr key={a} className="border-b border-hairline last:border-0">
                    <th
                      scope="row"
                      className="py-2 pr-3 text-left font-medium text-ink"
                    >
                      {a}
                    </th>
                    <td className="py-2 pr-3 tabular-nums">{b}</td>
                    <td className="py-2 text-xs leading-relaxed">{c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted">
            Ubah angka asumsi di <code>lib/config.ts</code> — seluruh
            perhitungan di web ini mengikuti otomatis.
          </p>
        </Card>
      </section>

      <NavSpacer />
    </div>
  );
}
