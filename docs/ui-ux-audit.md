# Audit Bumbu Pawon

## Tujuan dan panduan

Audit seluruh sembilan halaman awal: `/`, `/supplier`, `/peta`, `/dashboard`, `/direktori`, `/tentang`, `/admin`, `/blast`, dan `/ringkasan`.

Panduan: [UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill), dibaca dari `.claude/skills/ui-ux-pro-max/SKILL.md` pada commit `7246805992a42b7bba37d4cac83b01416f0c6c44`. Rekomendasi katalog makanan dan panduan Next.js disesuaikan dengan Next.js 14 serta identitas hijau/krem bisnis. Hasil pencarian sistem desain tersimpan dalam `design-system/bumbu-pawon/MASTER.md`; keputusan implementasi di bawah mengutamakan logo dan kebutuhan pengguna.

## Temuan dan perbaikan

| Temuan awal | Perubahan |
|---|---|
| Katalog supplier ikut terkunci di area pengelola | Landing, katalog, rincian produk, dan kredit foto dapat diakses publik |
| Nama toko, nomor WhatsApp, dan informasi landing berbeda | Nama Bumbu Pawon dan nomor `0878-9261-4999` konsisten; keputusan nomor dikonfirmasi pengguna |
| Katalog 31 item tidak sesuai daftar pengguna | 61 produk dalam 7 kategori; istilah lokal disimpan, duplikasi dibersihkan, permintaan bahan lain disediakan |
| Harga contoh dan klaim buka 24 jam belum terkonfirmasi | Alur permintaan penawaran: konfirmasi stok, varian, ukuran, harga, dan pengiriman; tidak ada harga atau jam buka rekaan |
| Landing memakai dua `<main>`; beberapa halaman internal juga bertumpuk | Satu landmark utama per halaman dan tautan lewati konten |
| Banyak tombol berada di bawah 44px | Ukuran minimum kontrol, fokus keyboard, dan navigasi ponsel diperbaiki |
| Navigasi ponsel enam tab | Empat tab utama dan satu menu “Lainnya”, termasuk akses kelola data dan metodologi |
| Gaya internal memiliki warna tetap yang tidak sesuai tema gelap | Token warna dan komponen bersama dipakai; kontras teks sekunder diperbaiki |
| Katalog belum memiliki foto | Jalur aset lokal, alt teks, ukuran gambar terpesan, dan atribusi foto disediakan; hanya foto terverifikasi yang digunakan |
| SEO utama menggambarkan basis data SPPG, bukan usaha | Metadata toko, GroceryStore, katalog ItemList, URL produk, breadcrumb, sitemap publik, dan gambar berbagi sosial |
| Sitemap dan robots mencakup halaman pengelola | Halaman pengelola dikeluarkan dari sitemap dan diberi noindex melalui metadata serta header |
| Kesalahan login hanya alert browser | Label kata sandi, autocomplete, dan pesan kesalahan inline yang dapat dibaca pembaca layar |

## Isi katalog dan batas informasi

- Harga belum diberikan: produk menggunakan permintaan penawaran tanpa harga nol, diskon, ulasan, rating, atau ketersediaan yang dibuat-buat.
- Pilihan “semua jenis jamur/buah/bahan toko” menjadi layanan permintaan, bukan janji semua stok tersedia.
- Foto kemasan menunjukkan contoh; ukuran dan varian dikonfirmasi. Foto bahan umum tidak boleh dianggap foto kemasan merek tertentu.
- Lokasi mengikuti informasi pengguna: Lor Prapatan Jetis, Ponorogo. Tidak menambahkan titik koordinat, kode pos, jam buka, atau sertifikasi tanpa konfirmasi.
- Gate sisi browser yang sudah ada tetap merupakan pembatas antarmuka, bukan pengganti autentikasi server. `noindex` bukan kontrol keamanan.
- Logo asli membutuhkan berkas unggahan yang dapat diakses workspace. Tanda daun pada tahap ini adalah penanda antarmuka sementara, bukan reproduksi logo pengguna.

## Validasi

- Sebelum dan sesudah: sembilan halaman pada 375×812, 768×1024, dan 1440×900.
- Sesudah perbaikan: satu `<h1>`, satu `<main>`, tidak ada scroll horizontal, dan tidak ada tombol yang ukurannya di bawah 44px dalam kondisi halaman awal.
- Browser: katalog publik, 61 produk, pencarian alias “slada”, filter kategori, URL kategori dan navigasi kembali, jumlah bahan, reload/persistensi, penghapusan, tujuan nomor WhatsApp, keadaan hasil kosong, navigasi ponsel, canonical dan structured data rincian produk, umpan balik login, serta 85 marker peta.
- Pesan WhatsApp hanya diuji sebagai tautan; tidak dikirim.
- Pemeriksaan aksesibilitas tambahan, build akhir, dan status foto dicatat setelah validasi akhir.


## Hasil akhir

- Build produksi Next.js berhasil dan menghasilkan 79 keluaran statis, termasuk 61 halaman rincian produk. Pemeriksaan TypeScript mandiri berhasil. Tidak ada konfigurasi ESLint atau suite unit test bawaan; tidak mengklaim keduanya telah dijalankan.
- Pemeriksaan HTTP/HTML untuk seluruh 61 halaman produk berhasil: judul, heading, canonical, deskripsi, gambar, breadcrumb, dan structured data sesuai katalog. HTML server katalog sudah berisi seluruh 61 kartu produk.
- Sitemap berisi 64 URL publik. Tujuh rute internal memiliki metadata serta header `noindex`; URL tidak dikenal mengembalikan 404 dengan tautan pemulihan berbahasa Indonesia.
- Semua 61 foto berhasil dirender dan didekode browser dalam mode produksi. Ada 57 berkas foto berbeda dengan atribusi. Checksum berkas lokal cocok dengan manifest. WebP maksimum 1200px mengurangi ukuran dari 115,36 MiB menjadi 4,86 MiB (95,8%); rasio dan orientasi kamera dipertahankan, tanpa retouching atau penghapusan watermark.
- Pemeriksaan otomatis axe-core WCAG 2 A/AA dan 2.1 AA pada 11 halaman dalam dua tema tidak menemukan pelanggaran pada keadaan yang diaudit. Ini bukan sertifikasi aksesibilitas lengkap; interaksi keyboard utama dan tata letak juga diperiksa secara langsung.
- Label aksesibilitas ditambahkan pada marker SPPG, pasar, calon ruko, titik pusat permintaan, dan pemilih koordinat. Kontras atribusi peta diperiksa setelah marker benar-benar selesai dimuat.
- Alur browser berhasil: pencarian/alias, filter, deep link kategori, tombol kembali, kembali ke katalog melalui navigasi tanpa reload, jumlah, persistensi, penghapusan, nomor WhatsApp, feedback login, ekspor 85 fitur GeoJSON, 85 marker Leaflet, navigasi ponsel, dan fokus keyboard saat memilih produk.
- Pemeriksaan viewport 375, 768, 1024, dan 1440 piksel serta landscape 812×375 tidak menemukan overflow halaman. Tabel lebar internal memiliki area scroll dan petunjuk yang jelas.
- Screenshot dan skrip pemeriksaan lokal disimpan di direktori ignored `work/ui-audit/`. Tidak ada pesan WhatsApp yang dikirim, dan tidak ada deployment produksi jarak jauh dilakukan.

## Sisa pekerjaan yang membutuhkan masukan

Hanya logo asli: gambar terlihat dalam percakapan, tetapi tidak ada berkas sumbernya di workspace atau resource unggahan yang dapat dibaca. Unggah berkas PNG atau berikan URL gambar untuk memasang logo yang sama pada header, ikon, dan metadata bisnis. Tidak membuat ulang logo dengan AI karena pengguna meminta aset asli.


## Browser cloud dan TLS peta

Browser Chromium dalam sandbox awal gagal mengakses/menyiapkan database kepercayaan NSS dan melaporkan `ERR_CERT_AUTHORITY_INVALID`. CA proxy yang disediakan lingkungan diperiksa terhadap koneksi HTTPS yang terverifikasi. Import sertifikat publik ke store NSS menggunakan jalur yang disediakan platform dan pemeriksaan browser dengan akses filesystem normal berhasil memuat tile peta. Tidak memakai `ignore_https_errors`, `--ignore-certificate-errors`, atau menonaktifkan verifikasi TLS. Langkah ini disimpan dalam `start_skill` lingkungan; aplikasi sendiri memakai HTTPS OpenStreetMap biasa.
