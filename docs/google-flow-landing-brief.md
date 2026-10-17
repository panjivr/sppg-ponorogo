# Bumbu Pawon — Google Flow untuk landing page

## Lingkup yang disetujui

Ubah hanya landing page `/`. Katalog `/supplier` beserta rincian produk, data produk, foto produk, pencarian, filter, daftar kebutuhan dan fungsi WhatsApp tidak boleh berubah. Navigasi/footer bersama dan CSS global yang memengaruhi katalog harus dipertahankan; gunakan CSS module atau selector khusus landing. Akses admin tiga ketukan pada logo tetap bekerja.

## Instruksi untuk chat desktop yang memiliki akses Flow

Buat aset Google Flow untuk landing page Bumbu Pawon, grosir dan supplier sayur, bumbu, buah dan sembako di Ponorogo. Fokus hero editorial yang hangat dan profesional: sayuran segar Indonesia, kubis, wortel, brokoli, cabai, bawang dan keranjang anyaman. Palet hijau hutan, krem hangat, aksen kuning kunyit. Gunakan komposisi lebar dengan ruang tenang di kiri untuk judul dan tombol HTML, bahan segar dominan di kanan. Cahaya pagi alami, detail fotorealistis, tidak ada tulisan, logo, label merek, harga, testimoni, orang, atau bangunan yang menyiratkan gudang milik toko. Aset adalah ilustrasi, bukan dokumentasi tempat usaha.

Mulai dari gambar hero 16:9 resolusi 1920×1080, dengan komposisi yang tetap baik ketika dipotong di layar ponsel. Jika membuat versi ponsel terpisah, gunakan 4:5. Pertahankan file asli dan beri nama hero-desktop serta hero-mobile. Jangan mengubah atau membuat ulang foto pada katalog.

Opsional hanya jika video dipilih: gerak kamera sangat halus pada susunan bahan, tanpa perpindahan adegan, tanpa audio, loop pendek. Sediakan poster diam agar situs tetap cepat dan dapat menghormati reduced-motion. Kredit/biaya aktual harus terlihat sebelum menjalankan generasi; jangan mengasumsikan layanan gratis.

## Fakta bisnis yang dipertahankan saat implementasi

- Nama: Bumbu Pawon.
- WhatsApp: 0878-9261-4999; tautan tujuan 6287892614999.
- Alamat: Lor Prapatan Jetis, Ponorogo, Jawa Timur.
- Grosir dan eceran untuk rumah, usaha dan pengadaan.
- Harga, stok dan pengiriman dikonfirmasi lewat WhatsApp; tidak membuat harga, jumlah pelanggan, atau jam operasional baru.
- Website: https://sppg-ponorogo-web.vercel.app.
- CTA utama: Pesan via WhatsApp; CTA pendamping: Jelajahi katalog.

## Integrasi setelah aset tersedia

Simpan aset khusus landing di public/landing/, optimalkan gambar untuk web, pertahankan salinan asli di luar public bila besar. Ubah app/page.tsx dan komponen/style khusus landing saja. Pertahankan canonical, judul/deskripsi SEO, satu h1, label aksesibel, dimensi gambar dan ukuran responsif. Verifikasi landing ponsel/desktop serta katalog tetap sama. Repository: panjivr/sppg-ponorogo, branch produksi claude/sppg-supplier-mapping-ponorogo-i1simo.

## Status

Lampiran hero pengguna berhasil diambil dari percakapan dan dipasang khusus pada landing. Sumber: hero-desktop.jpg, 1376×768, 827.560 byte. Versi WebP tanpa perubahan komposisi: public/landing/hero-desktop.webp, 162.894 byte. Tidak ada generasi ulang gambar atau pemakaian kredit Flow pada sesi ini. Hero menggunakan komponen dan CSS module khusus landing; komponen, data, foto dan style katalog dipertahankan.

## Verifikasi implementasi

Build produksi lulus. Screenshot katalog sebelum/sesudah identik secara piksel pada viewport 375, 768 dan 1440 px (area tangkapan tinggi 900 px); seluruh file route/data/foto/style katalog tetap tidak berubah. Hero diperiksa di ponsel, tablet dan desktop, tanpa overflow horizontal. Axe WCAG 2A/AA dan 2.1AA pada landing menghasilkan nol pelanggaran dalam empat keadaan (375/1440 px × tema terang/gelap). Canonical, CTA katalog/WhatsApp, serta tiga ketukan logo menuju login admin tetap bekerja. Artefak lokal tersedia di work/ui-audit/landing-flow/.
