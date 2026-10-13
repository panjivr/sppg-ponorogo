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

## Konfigurasi admin wajib

Tidak ada password produksi atau kunci sesi di repository. Jika konfigurasi belum tersedia, login ditolak dan semua data privat tetap tertutup.

1. Pada komputer tepercaya, jalankan `python scripts/create-admin-env.py`. Masukkan password baru minimal 16 karakter. Alat menghasilkan `.env.admin.local` dengan izin 0600 dan tidak mencetak nilai kredensial; file diabaikan Git.
2. Masukkan `ADMIN_PASSWORD_HASH` dan `ADMIN_SESSION_SECRET` dari file tersebut melalui **Vercel Project → Settings → Environment Variables → Production**, kemudian redeploy. Jangan menaruh nilai di chat, kode, atau GitHub Actions log. Simpan password baru di pengelola password.
3. Pastikan `NEXT_PUBLIC_SITE_URL=https://sppg-ponorogo-web.vercel.app` jika variabel itu sudah dikonfigurasi dengan domain lama.
4. Untuk mengganti password atau mencabut seluruh sesi, ganti kedua nilai dan redeploy.

Persyaratan nama variabel juga disimpan pada draft cloud environment; ini **tidak** mengubah konfigurasi Vercel. Review/save dan publish draft hanya mengaktifkan konfigurasi cloud tersebut.

## Penutupan kebocoran historis

Kode baru mencegah pengiriman data tanpa sesi. Ini tidak dapat menarik kembali salinan yang sudah diunduh. Pemilik perlu membatasi/menghapus **deployment Vercel lama**, memastikan repository beserta akses histori Git privat, dan meninjau akses/cadangan data. Status privasi repository serta deployment lama belum bisa diperiksa karena akses API GitHub/Vercel tidak tersedia di environment ini. Jangan membuat repository publik selama seed pribadi masih berada pada file server dan histori Git. Tidak dilakukan rewrite histori atau penghapusan deployment tanpa akses yang dapat diverifikasi.

## Validasi

`npm run build` dan `python tests/security.py` menguji versi produksi dengan kredensial acak sementara yang tidak dicetak: semua tujuh halaman privat dan request RSC ditolak tanpa sesi; API menolak sesi palsu; password lama ditolak; login sah dan database 85 entri bekerja; cookie aman; sesi diubah/kedaluwarsa ditolak; CSRF login/logout ditolak; logout menghilangkan akses; batas percobaan aktif; bundle publik tidak memuat nama seed/password lama; CSP dan interaksi katalog mobile berjalan; favicon tersedia; robots tidak membeberkan rute privat. Pengujian ini tidak menyatakan deployment live atau Lighthouse terbaru sudah diverifikasi.
