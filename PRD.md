# PRD — Pilah (Rework)

## 1. Ringkasan

Pilah adalah platform dua sisi (**Warga** ↔ **Mitra/Kolektor**) untuk penjemputan sampah daur ulang dengan sistem reward karma. Rework ini bertujuan mengubah Pilah dari prototipe fungsional menjadi **portofolio showcase kelas production**: aman, konsisten secara arsitektur, dan punya identitas visual yang matang — sekelas NusaPath/Selaras.

**Target:** Portofolio showcase. Bukan produk yang akan dijalankan operasional riil, tapi harus terasa dan bekerja *seolah-olah* siap produksi (auth benar, tidak ada IDOR, transaksi konsisten, PWA installable).

**Platform:** Tetap web, dibangun sebagai **PWA** (Next.js `@ducanh2912/next-pwa`, sudah ada di stack). Alasan: PWA menutup sebagian besar gap terhadap native app (kamera via `<input capture>`, push notification di Android/desktop, installable, offline shell) dengan effort jauh lebih kecil, dan API tetap bersih sehingga bisa dikonsumsi Flutter/RN kalau suatu saat mau app native beneran.

## 2. Masalah yang Diselesaikan

Rumah tangga (Warga) punya sampah bernilai daur ulang (plastik, kardus, kaca) tapi tidak ada jalur terorganisir ke kolektor informal (Mitra). Mitra tidak punya cara sistematis menemukan permintaan penjemputan. Pilah menjembatani lewat request-based matching + verifikasi dua arah (handshake) supaya kedua pihak saling percaya sebelum transaksi dianggap selesai.

## 3. Persona

- **Warga** — pengguna rumahan, request pickup, dapat karma point sebagai insentif, ingin transparansi (tahu status pickup-nya, riwayat, poin).
- **Mitra (Kolektor)** — pekerja informal daur ulang, butuh daftar order yang jelas & real-time-ish, ingin proses accept→complete simpel dari HP.

## 4. Scope MVP (Rework)

### In-scope
| Area | Deskripsi |
|---|---|
| Auth | Register/login role-based (Warga/Mitra), **httpOnly cookie**, bukan localStorage |
| Pickup lifecycle | Create → Pending → Accepted → Verifying (kolektor input berat+foto) → Completed (konfirmasi warga) — dengan **ownership check di setiap step** |
| Karma system | Perhitungan poin berbasis berat per material, transaksi atomik (row lock / DB transaction) |
| Riwayat | Riwayat pickup warga & kolektor, terpisah, dengan pagination |
| Profil | Lihat profil, karma total, riwayat ringkas |
| PWA | Installable, app icon, splash, offline shell minimal (bukan offline-first penuh — itu di luar scope) |
| IPFS evidence (ringan) | Tetap ada, dipicu otomatis setelah handshake selesai, ditampilkan sebagai "bukti transaksi terverifikasi" di riwayat — murni scaffolding yang dirapikan, bukan fitur berat |

### Out of scope (Phase 2 roadmap, didokumentasikan tapi tidak dikerjakan sekarang)
- AI assistant / chatbot ("Pilah Pintar") — perlu integrasi LLM sungguhan, bukan placeholder UI
- Live map/radar real-time kolektor
- Sistem poin berbasis on-chain/token sungguhan
- Payment/monetisasi apa pun

## 5. User Flow Utama

**Warga:** Login → Buat pickup (pilih lokasi via geolocation) → Menunggu (status PENDING) → Notifikasi/lihat status ACCEPTED → Kolektor selesai timbang (VERIFYING) → Warga review & confirm → Karma bertambah, riwayat tercatat.

**Mitra:** Login → Lihat daftar pending pickup terdekat (radar sederhana, list bukan peta) → Accept salah satu → Datang, timbang, foto bukti, submit → Menunggu konfirmasi warga → Selesai, masuk riwayat kolektor.

## 6. Kriteria Sukses (Portofolio Context)

- Tidak ada celah IDOR/authz yang ditemukan saat review manual
- Skor Lighthouse PWA ≥ 90, installable di Android/desktop
- Flow lengkap end-to-end bisa didemokan tanpa error dalam <2 menit
- Kode konsisten Handler→Service→Repository di seluruh backend (tanpa exception)
- README + demo video/GIF layak ditaruh di portofolio/LinkedIn

## 7. Non-Goals

- Skalabilitas ribuan concurrent user (bukan tujuan portofolio)
- Kepatuhan regulasi limbah B3/pengelolaan sampah formal
- Sistem pembayaran nyata
