# Peta SPPG Ponorogo — Intelijen Pasar Supplier MBG

Basis data dan alat analisis **85 dapur SPPG** (Satuan Pelayanan Pemenuhan Gizi,
program Makan Bergizi Gratis) di **21 kecamatan Kabupaten Ponorogo**, dibangun
untuk satu tujuan: membantu menentukan **lokasi ruko supplier bahan pangan**
yang paling strategis, dan mengukur besarnya pasar yang diperebutkan.

> Dapur MBG memasak pada malam hari. Supplier yang buka 24 jam di titik yang
> tepat punya keunggulan struktural — web ini menghitung di mana titik itu.

---

## Ringkasan aset data

| Metrik | Nilai |
|---|---|
| Dapur terdata | **85** |
| Kecamatan tercakup | **21** (seluruh kabupaten) |
| Dapur operasional | **72** |
| Penerima manfaat/hari | **173.506** porsi |
| Koordinat GPS asli | **63 / 85** (sisanya perkiraan, ditandai) |
| Belanja pangan/tahun | **± Rp 451 M** |
| Pasar bahan/tahun (60%) | **± Rp 271 M** |

Semua angka rupiah diturunkan dari asumsi terbuka di `lib/config.ts` dan
dijelaskan di halaman `/tentang`.

---

## Halaman

| Rute | Isi |
|---|---|
| `/` | Landing: proposisi nilai, angka kunci, ukuran peluang |
| `/peta` | Peta interaktif: cari, filter, heatmap, simulasi calon ruko |
| `/dashboard` | Analisis pasar: TAM, sebaran per kecamatan, peringkat peluang |
| `/direktori` | Tabel lengkap + ekspor **CSV** & **GeoJSON** |
| `/supplier` | Katalog bahan + keranjang → checkout WhatsApp terperinci |
| `/tentang` | Metodologi, sumber data, asumsi, batasan, privasi |
| `/admin` | Editor data SPPG & pasar (koreksi, impor massal) |
| `/blast` | Penyusun pesan WhatsApp massal untuk prospek dapur |

Plus `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest`.

---

## Fitur analisis

- **Simulasi calon ruko** — taruh titik di peta, atur radius antar, lalu web
  menghitung: jumlah dapur terjangkau, nilai belanja bahan per tahun, dan
  **berapa persen pasar yang perlu direbut agar sewa tertutup** (memakai asumsi
  margin kotor).
- **Rekomendasi lokasi** — pusat gravitasi permintaan (dibobot status & porsi)
  plus skoring kisi 28×28; tiga kandidat terbaik disebar minimal 4 km agar tidak
  menumpuk.
- **Heatmap permintaan** — kepadatan penerima manfaat.
- **Daftar dapur terdekat** dari tiap calon ruko, lengkap dengan jaraknya.

---

## Kualitas teknis

**Responsif & lintas perangkat** — diuji nyata dengan Chromium pada 4 ukuran:
iPhone (390×844), Android (412×915), iPad (820×1180), desktop (1440×900).
Nol overflow horizontal di seluruh halaman.

- Layout mobile-first: di HP peta tampil lebih dulu dengan tinggi lega
  (`48dvh`, sebelumnya dipatok 288 px) lalu panel mengalir di bawahnya;
  sidebar tetap di samping pada tablet & desktop.
- **Safe-area iOS** (`env(safe-area-inset-*)` + `viewport-fit=cover`) sehingga
  aman dari notch dan home indicator.
- `100dvh` agar tinggi layar tidak salah saat toolbar Safari muncul/hilang.
- Target sentuh ≥ 44px (WCAG 2.5.5). Zoom pengguna **tidak** dikunci.
- Peta otomatis merapat ke seluruh titik saat dibuka (`fitBounds`), jadi
  85 dapur langsung terlihat tanpa zoom manual.

**Aksesibilitas** — HTML semantik, `aria-current`/`aria-sort`/`role="tab"`,
skip-link, fokus keyboard terlihat, `prefers-reduced-motion` dihormati.
Warna status **selalu** ditemani ikon dan label teks — tidak pernah warna saja.

**Visualisasi data** — palet tervalidasi (bukan tebakan). Grafik satu-seri
memakai satu hue (biru = jumlah, oranye = permintaan); status memakai status
palette. Rincian status dirender sebagai **baris terpisah**, bukan stacked bar,
karena validator menunjukkan warna "akan operasional" dan "berhenti sementara"
hanya berjarak ΔE 13,6 — terlalu dekat untuk bersebelahan.

**Tema** — terang / gelap / ikut sistem, tanpa kedip saat muat.

**PWA** — bisa dipasang ke layar utama Android & iOS, terbuka layar penuh.

**SEO** — metadata per halaman, canonical, Open Graph, sitemap, robots, dan
JSON-LD `Dataset`.

**Performa** — seluruh 6 halaman **statis** (SSG); bundle bersama 87 KB;
Leaflet dimuat dinamis (`ssr: false`) hanya di halaman peta.

---

## Arsitektur

```
app/
  layout.tsx          metadata, tema, nav, JSON-LD
  page.tsx            landing (server, statis)
  peta/               PetaApp.tsx — peta + panel (analisis/ruko/data)
  admin/              editor data SPPG & pasar
  blast/              blast WhatsApp
  dashboard/          analisis pasar (server, statis)
  direktori/          DirektoriClient.tsx — tabel + ekspor
  supplier/           SupplierClient.tsx — katalog + keranjang
  tentang/            metodologi
  sitemap.ts robots.ts manifest.ts icon.svg apple-icon.svg
components/
  MapView.tsx         Leaflet: marker, radius, heatmap, rekomendasi,
                      lapisan pasar, pewarnaan yayasan, auto-fit
  ControlPanel.tsx    filter, lapisan, pencarian
  DataPanel.tsx       ringkasan data per kecamatan/status
  SppgDetailCard.tsx  kartu rincian penerima manfaat & perizinan
  AdminEditor.tsx     form koreksi data
  PasarEditor.tsx     kelola titik pasar
  CoordPicker.tsx     ambil koordinat dari klik peta
  RukoManager.tsx     kelola calon ruko
  SppgForm.tsx        tambah/ubah dapur
  Nav.tsx             top bar desktop / bottom tab bar mobile
  ui.tsx              Card, Stat, StatusBadge, BarList, StatusBreakdown, Btn
lib/
  types.ts            tipe Sppg/Pasar/CandidateRuko + rincian PM & perizinan
  sppgMeta.ts         STATUS_META (label, warna, ikon), format, grup yayasan
  marketing.ts        templat pesan & pemilihan target blast
  storage.ts          localStorage: SPPG, pasar, override, impor/reset
  data.ts             agregasi, ukuran pasar, filter, ekspor CSV/GeoJSON
  geo.ts              haversine, centroid berbobot, skoring kisi
  store.ts            repository async di atas storage.ts (siap tukar ke DB)
  config.ts           konfigurasi bisnis + asumsi ekonomi
  format.ts           format angka & rupiah Indonesia
data/
  sppg.json           85 dapur SPPG (+ rincian PM & perizinan)
  pasar.json          titik pasar tradisional
  produk.json         katalog bahan (harga numerik)
```

### Menjalankan

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm run start
```

---

## Menyesuaikan untuk usaha Anda

Semua yang perlu diubah ada di **satu berkas**: `lib/config.ts`

```ts
BISNIS.nama          // nama usaha
BISNIS.waNumber      // nomor WhatsApp (format 62…, tanpa + atau 0)
ASUMSI.hargaPerPorsi // anggaran bahan per porsi
ASUMSI.marginKotor   // margin distribusi
SITE.url             // domain untuk SEO
```

Harga & produk katalog: `data/produk.json`.

---

## Batas yang diketahui (jujur)

- **Penyimpanan masih lokal.** Koreksi data dan calon ruko disimpan di
  `localStorage` — per-perangkat, belum dibagi antar pengguna.
  Jalur migrasinya sudah disiapkan: seluruh akses data melewati antarmuka
  `SppgRepo` / `RukoRepo` di `lib/store.ts`. Untuk multi-pengguna, buat API
  route + Postgres/Supabase, tulis adapter dengan bentuk yang sama, lalu tukar
  nilai ekspor `sppgRepo`/`rukoRepo`. **Tidak ada komponen UI yang perlu diubah.**
- **22 titik koordinatnya perkiraan** pusat wilayah, ditandai jelas; tautan
  Google Maps resmi tetap tersimpan per titik.
- **Belum ada data pesaing & harga riil** — web ini memetakan permintaan, belum
  memetakan siapa yang sudah memasok dan pada harga berapa.
- **Jarak adalah garis lurus** × faktor belok 1,35, bukan rute jalan sebenarnya.

---

## Halaman operasional (data & pemasaran)

| Rute | Isi |
|---|---|
| `/admin` | Editor data: koreksi koordinat & atribut SPPG, impor massal titik pasar, kelola pasar tradisional. Perubahan disimpan sebagai *override* sehingga data resmi selalu bisa dipulihkan. |
| `/blast` | Penyusun pesan WhatsApp massal untuk prospek dapur — pilih target per kecamatan/status, susun templat, salin daftar nomor. |

### Lapisan peta tambahan

- **Pasar tradisional** (`data/pasar.json`) — memetakan sumber pasokan /
  pesaing di sekitar dapur.
- **Pewarnaan per yayasan** — dapur yang dikelola yayasan yang sama diberi
  warna dan dihubungkan garis, untuk melihat kelompok pengelola sekaligus.
- **Rincian penerima manfaat** — kartu detail per dapur: siswa, guru & tendik,
  balita, ibu hamil, ibu menyusui, jenjang sekolah, status perizinan (SLHS,
  halal, HACCP, BPJS), dan tanggal operasional.

### Penyebaran otomatis

`.github/workflows/deploy.yml` men-deploy production ke Vercel pada setiap push
ke branch produksi (atau manual via *workflow_dispatch*). Aman bila secret
belum diisi — langkah deploy dilewati, bukan gagal.

---

## Data & privasi

Sumber utama: **Database SPPG Kabupaten Ponorogo**, dilengkapi sumber publik
Prokopim & Dinkes Ponorogo, Tribratanews Polres, RRI, JTV Madiun, dan direktori
SPPG. Rincian di `/tentang`.

Data pribadi pada berkas sumber — nama & nomor telepon kepala SPPG, PIC
yayasan, rekening bank, dokumen perizinan — **sengaja tidak dipublikasikan**.
Yang ditampilkan hanya informasi kelembagaan.

Web ini alat bantu perencanaan independen, **tidak berafiliasi** dengan Badan
Gizi Nasional maupun Pemerintah Kabupaten Ponorogo.

Peta © kontributor [OpenStreetMap](https://www.openstreetmap.org/copyright).
