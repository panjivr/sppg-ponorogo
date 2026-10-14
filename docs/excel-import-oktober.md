# Impor database SPPG — 14 Oktober 2026

Sumber: LAPORAN HARIAN BULAN OKTOBER.xlsx dan DATA PM KABUPATEN PONOROGO.xlsx. Fingerprint sumber, cutoff dan statistik tersimpan di `data/sppg-import-summary.json`.

- Seluruh 85 dapur cocok berdasarkan nama yang dinormalisasi; ID, koordinat, alamat, kontak dan perizinan lama dipertahankan. Status terbaru: 72 operasional, 8 akan operasional, 2 berhenti, 3 suspend.
- Angka PM terakhir yang positif sampai 14 Oktober memperbarui 50 dapur. 35 dapur tetap menggunakan sumber sebelumnya. Angka nol bawaan/kosong tidak menghapus angka sebelumnya. Analisis memakai data terakhir per dapur, bukan total distribusi serentak satu tanggal.
- Disimpan 1.189 baris laporan bertanggal 1–14 Oktober. Isian 15–31 Oktober tidak dianggap realisasi pada cutoff ini. Ada 19 laporan dengan total berbeda dari jumlah rincian; total sumber tidak diubah untuk memaksakan kecocokan.
- Disimpan 832 baris sekolah/posyandu termasuk baris bernama yang nomor urutnya kosong. Template dan baris contoh dikeluarkan. 20 baris berpotensi duplikat dan 37 total tidak cocok dengan subtotal, ditandai untuk verifikasi. Tidak dibuat relasi ke dapur hanya berdasarkan kecamatan. NIK serta kontak PIC sekolah tidak disalin karena tidak diperlukan untuk analisis ini.
- Data baru tersedia pada `/laporan`, hanya setelah autentikasi server. Tabel harian dapat diganti tanggal; kelompok PM dapat dicari dan dipaginasi. Sumber JSON hanya diimpor modul `server-only`, tidak ada salinan dalam public atau bundle klien.
- Empat perubahan nama kepala terhadap database sebelumnya diberi penanda bahwa nomor kontak masih berasal dari sumber lama dan perlu diverifikasi.

Importer: `python scripts/import-sppg-excel.py DAILY.xlsx PM.xlsx --as-of 2026-10-14` (memerlukan openpyxl pada alat impor, bukan runtime aplikasi). Verifikasi: `python tests/database-import.py`, kemudian build dan `python tests/security.py`.

Konfigurasi login kini berasal dari hash server-only di repository. Kunci sesi acak dihasilkan otomatis saat prebuild, tidak masuk Git dan tidak dikirim ke browser. Variabel autentikasi Vercel lama tidak lagi digunakan; untuk mengganti password, gunakan `scripts/change-admin-password.py` dan deploy perubahan hash. Data laporan tetap membutuhkan sesi yang diverifikasi server.
