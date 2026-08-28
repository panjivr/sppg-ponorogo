# Peta SPPG Ponorogo — Analisis Lokasi Ruko Supplier MBG

Web untuk **memetakan lokasi dapur SPPG / Makan Bergizi Gratis (MBG) di Kabupaten Ponorogo** dan
memakai sebaran titik itu untuk **menentukan lokasi ruko supplier** (sayur, buah, kebutuhan dapur)
yang paling strategis — dekat dengan banyak dapur sekaligus. Karena dapur MBG bekerja malam hari,
ruko supplier yang buka 24 jam di titik ramai punya keunggulan.

## Fitur

- **Peta interaktif** (Leaflet + OpenStreetMap, gratis tanpa API key) dengan marker tiap dapur SPPG,
  diwarnai per status (operasional / pembangunan / rencana).
- **Radius jangkauan** — atur radius layanan tiap calon ruko dan lihat berapa dapur yang masuk.
- **Kelola calon ruko** — klik peta untuk menaruh calon ruko, beri nama/catatan (mis. "buka 24 jam"),
  langsung terlihat jumlah dapur & estimasi total porsi/hari dalam jangkauannya.
- **Rekomendasi titik terbaik** — hitung titik pusat berbobot (⭐) dan 3 area dengan konsentrasi
  dapur tertinggi (🔴) sebagai kandidat lokasi ruko.
- **Heatmap kepadatan** permintaan untuk melihat area terpadat.
- **Kelola data SPPG** — tambah/edit titik dapur (koordinat bisa dipilih dengan klik peta).

Data dapur & calon ruko yang Anda ubah/tambah disimpan di **localStorage browser** (tanpa server/DB).

## Menjalankan lokal

```bash
npm install
npm run dev      # buka http://localhost:3000
```

Build produksi:

```bash
npm run build
npm run start
```

## Deploy ke Vercel

1. Push repo ini ke GitHub.
2. Di Vercel: **New Project → Import** repo ini. Framework terdeteksi otomatis sebagai Next.js.
   Tidak ada environment variable yang wajib diisi.
3. Deploy. Selesai.

## Struktur

| Path | Isi |
|------|-----|
| `app/page.tsx` | Halaman utama, mengelola state & tab (Analisis / Calon Ruko / Data SPPG) |
| `components/MapView.tsx` | Peta Leaflet: marker, radius, heatmap, rekomendasi (client, `ssr:false`) |
| `components/ControlPanel.tsx` | Ringkasan, toggle heatmap/rekomendasi, radius analisis |
| `components/RukoManager.tsx` | Kelola calon ruko + hitung dapur dalam jangkauan |
| `components/SppgForm.tsx` | Form tambah/edit titik SPPG |
| `lib/geo.ts` | Haversine, centroid berbobot, skor grid |
| `lib/storage.ts` | Baca/tulis localStorage + gabung dengan seed |
| `data/sppg.json` | Data awal SPPG hasil riset sumber publik |

## Catatan data

Data awal dikumpulkan dari sumber publik (Prokopim & DPPKB Ponorogo, auditsppg.id, sppgpskl.org,
mbgponorogo.com, radarmadiun) dan **sebagian koordinatnya masih perkiraan** (ditandai di popup peta).
Titik pasti dapat dilihat/dikoreksi lewat portal geospasial `gina.bgn.go.id`. Koreksi koordinat bisa
dilakukan langsung lewat tab **Data SPPG**.

## Lisensi & atribusi peta

Peta menggunakan tile OpenStreetMap — © kontributor OpenStreetMap.
