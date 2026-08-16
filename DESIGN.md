# DESIGN.md — Identitas Visual Pilah

## 1. Prinsip Utama

**Tanpa stiker, tanpa ilustrasi kartun.** Pilah bukan aplikasi "gamifikasi anak muda" bergaya playful-cute — ini platform civic/eco-utility yang harus terasa **tepercaya, bersih, dan serius** tapi tetap hangat (bukan dingin/korporat). Referensi rasa: Linear, Vercel, Apple Health — bukan Duolingo.

Semua elemen visual berbasis: **tipografi kuat + whitespace + ikon garis (Lucide) + warna solid**. Tidak ada mascot, tidak ada flat-illustration orang-orang membuang sampah, tidak ada emoji sebagai elemen desain (emoji di teks/toast masih boleh dalam batas wajar).

## 2. Palet Warna

Tema: hijau (eco) dikombinasikan netral gelap untuk kesan tepercaya, bukan hijau-pastel-childish.

- **Primary:** hijau tua/forest (bukan hijau terang neon) — untuk aksi utama, brand mark
- **Accent:** satu warna sekunder untuk status (mis. amber untuk "pending/verifying", biru untuk "accepted", hijau untuk "completed", merah untuk error)
- **Neutral:** skala abu-abu netral (bukan abu kebiruan) untuk teks & background, dominan di UI
- **Background:** putih/near-white di light mode; dark mode opsional Phase 2

Gunakan warna status secara **konsisten sebagai tag/badge**, bukan sebagai background besar — supaya tetap minimalis.

## 3. Tipografi

- Satu typeface sans-serif modern (Inter, Geist, atau sejenis) — jangan campur lebih dari 1 keluarga font
- Hierarki tegas: hero/heading besar & bold, body medium, caption kecil dengan warna abu redup
- Angka (karma points, berat kg, harga) pakai tabular numbers supaya rapi saat berubah/animasi

## 4. Komponen & Layout

- **Card-based**, radius konsisten (pilih satu nilai radius dan pakai di semua card/button/input — jangan campur)
- **Soft shadow tipis**, bukan shadow tebal/neumorphism
- Status pickup ditampilkan sebagai **stepper/timeline horizontal atau vertikal** (Pending → Accepted → Verifying → Completed), bukan badge teks polos — ini titik interaksi paling penting di app, layak effort visual lebih
- Ikon: Lucide React murni, ukuran konsisten (misal 20px untuk inline, 24px untuk nav)
- Empty states (riwayat kosong, radar kosong): teks + 1 ikon garis besar, TIDAK pakai ilustrasi — ini yang paling sering jadi tempat "stiker" menyelinap masuk

## 5. Motion

- Transisi halus (150–250ms ease-out) untuk sheet/modal, bukan bounce/spring berlebihan
- Skeleton loading untuk list (riwayat, radar) — bukan spinner generik di semua tempat
- Micro-interaction hanya di titik penting: konfirmasi karma bertambah boleh sedikit animasi angka naik (count-up), tapi tetap subtle

## 6. Mode Warga vs Mitra

Dua peran punya tujuan berbeda (Warga = menunggu & percaya, Mitra = kerja cepat & efisien). UI boleh punya nuansa berbeda:
- **Warga:** lebih tenang, informatif, banyak white space, fokus status & transparansi
- **Mitra:** lebih dense/functional, list-based, aksi cepat (accept dalam 1 tap), minim scroll — ini dipakai sambil kerja di lapangan

## 7. Checklist Anti-"Sticker"

Sebelum commit UI baru, cek:
- [ ] Tidak ada flat-illustration/mascot
- [ ] Tidak ada emoji sebagai elemen visual utama (badge, empty state, dsb)
- [ ] Warna dipakai fungsional (status), bukan dekoratif
- [ ] Radius & shadow konsisten dengan komponen lain
- [ ] Ikon dari satu sumber (Lucide) saja
