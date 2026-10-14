# Perbaikan keamanan dan SEO — 14 Oktober 2026

## Perubahan

- Password hardcoded dan autentikasi sessionStorage dihapus dari dua lokasi. Login diverifikasi server menggunakan hash scrypt; cookie sesi HMAC berumur satu jam memakai HttpOnly, Secure di produksi, dan SameSite Strict. Middleware dan layout server memeriksa sesi secara terpisah. Halaman privat tidak diprerender sebagai HTML publik.
- Modul seed SPPG hanya dapat diimpor server (`server-only`). Browser meminta 85 entri melalui `/api/admin/sppg`, yang memverifikasi sesi dan mengirim `private, no-store`. Dataset tidak lagi masuk bundle JavaScript publik. Tidak ada CORS wildcard pada API tersebut.
- Koreksi SPPG disimpan dalam memori sesi, bukan localStorage. Koreksi SPPG lama dimigrasikan ke memori setelah login, kemudian salinan localStorage dihapus. Banner meminta ekspor cadangan sebelum reload/logout; logout membersihkan sesi, cache dan data SPPG lokal, tanpa menghapus daftar belanja publik. Koreksi baru hilang ketika reload/logout; penyimpanan bersama masih memerlukan database terpisah.
- Login/logout memeriksa origin dan host. Lima percobaan login per 15 menit dibatasi per alamat IP dan per instance. Batas ini bukan pembatas terdistribusi; gunakan aturan rate limit Vercel Firewall pada `/api/auth/login` untuk produksi dengan beberapa instance.
- CSP memakai nonce unik per request, tanpa unsafe-inline untuk skrip. Skrip luar, object dan iframe embedding dibatasi. Style inline diperlukan Leaflet. Header DENY, nosniff, Referrer-Policy dan Permissions-Policy ditambahkan. Nonce memerlukan rendering server dinamis, sehingga skor Lighthouse sebelumnya tidak dianggap hasil versi baru.
- Domain SEO default kini `https://sppg-ponorogo-web.vercel.app`, dikonfirmasi pemilik. `NEXT_PUBLIC_SITE_URL` dapat menimpanya. Robots tidak lagi mencantumkan rute admin; noindex tetap ada pada respons privat/login/API.
- Favicon ICO tersedia. Label tombol Pilih menyertakan teks yang terlihat. `labu-siam-manisa` dipertahankan: “manisa” adalah alias labu siam dalam katalog, bukan typo.
- Hero memakai hijau gelap, aksen hangat untuk pemesanan dan tombol “Pesan via WhatsApp”. Tidak ada harga, pelanggan, pengiriman harian, foto gudang, mitra atau testimoni yang dikarang. Footer menjelaskan usaha supplier independen, bukan situs resmi SPPG/BGN.

## Konfigurasi admin dari repository

Login tidak lagi memerlukan `ADMIN_PASSWORD_HASH` atau `ADMIN_SESSION_SECRET` di Vercel. Variabel lama diabaikan. Password yang dipilih pemilik diperiksa server terhadap hash scrypt dalam `lib/server/admin-config.ts` (ditandai server-only); password plaintext tidak berada di repository atau bundle publik.

`npm run build` menjalankan prebuild untuk membuat kunci sesi acak 48 byte dalam `lib/server/session-secret.generated.ts`. File ini diabaikan Git dan tidak masuk client bundle. Kunci yang sama dibundel pada fungsi server dan middleware dalam satu deployment sehingga sesi tetap bekerja antar-instance. Build berikutnya membuat kunci baru, mencabut sesi deployment sebelumnya pada versi baru. `npm run dev` mempersiapkan kunci lokal melalui predev. Gunakan build script repository, bukan memanggil next build langsung pada checkout yang belum dipersiapkan.

Mengganti password: jalankan `python scripts/change-admin-password.py` pada perangkat tepercaya, commit hanya perubahan hash server, lalu deploy melalui branch produksi. Jangan commit file kunci yang dihasilkan atau membuka akses ke build artifact privat. Tidak diperlukan salin Environment Variables Vercel.

## Penutupan kebocoran historis

Kode baru mencegah pengiriman data tanpa sesi. Ini tidak dapat menarik kembali salinan yang sudah diunduh. Pemilik perlu membatasi/menghapus **deployment Vercel lama**, memastikan repository beserta akses histori Git privat, dan meninjau akses/cadangan data. Status privasi repository serta deployment lama belum bisa diperiksa karena akses API GitHub/Vercel tidak tersedia di environment ini. Jangan membuat repository publik selama seed pribadi masih berada pada file server dan histori Git. Tidak dilakukan rewrite histori atau penghapusan deployment tanpa akses yang dapat diverifikasi.

## Validasi

`npm run build` dan `python tests/security.py` menguji versi produksi dengan password pengujian yang dimasukkan lewat prompt atau SECURITY_TEST_PASSWORD dan tidak dicetak: semua tujuh halaman privat dan request RSC ditolak tanpa sesi; API menolak sesi palsu; password lama ditolak; login sah dan database 85 entri bekerja; cookie aman; login tanpa variabel Vercel dan dengan variabel lama yang salah; sesi tetap valid setelah proses server restart; sesi diubah/kedaluwarsa ditolak; CSRF login/logout ditolak; logout menghilangkan akses; batas percobaan aktif; bundle publik tidak memuat nama seed, password, hash verifier atau kunci sesi; CSP dan interaksi katalog mobile berjalan; favicon tersedia; robots tidak membeberkan rute privat. Pengujian ini tidak menyatakan deployment live atau Lighthouse terbaru sudah diverifikasi.
