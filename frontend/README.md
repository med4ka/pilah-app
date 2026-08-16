# Pilah — Penjemputan Sampah Daur Ulang Jadi Berkah

Pilah adalah platform dua sisi (**Warga** ↔ **Mitra/Kolektor**) untuk penjemputan sampah daur ulang (plastik, kardus, kaca) dengan sistem reward **Karma**. Warga membuat permintaan jemput, kolektor menerima & menyelesaikannya, dan setiap transaksi diverifikasi dua arah (handshake) sebelum dianggap selesai — dengan bukti transaksi yang dicatat ke IPFS.

Dibangun sebagai **PWA** (Next.js) yang dapat diinstal di Android/desktop, dengan backend Go yang mengikuti pola **Handler → Service → Repository** dan auth berbasis **httpOnly cookie**.

## Stack

| Layer | Teknologi |
|---|---|
| Frontend | Next.js (App Router), React, TypeScript, Tailwind CSS, Zustand, PWA (`@ducanh2912/next-pwa`) |
| Backend | Go, Fiber v2, GORM, PostgreSQL |
| Auth | JWT di httpOnly cookie (bukan localStorage) |
| Bukti transaksi | IPFS via Pinata |

## Menjalankan Lokal

### Prasyarat

- Node.js & npm (untuk frontend)
- Go 1.2x (untuk backend)
- PostgreSQL berjalan lokal (atau pakai Neon/Supabase)

### 1. Backend

```bash
cd backend
cp .env.example .env
# isi semua nilai di .env — tanpa isi, server tidak akan start (fail-fast)
go run ./cmd/api
```

Backend berjalan di `http://localhost:8080` (ubah via `PORT` di `.env`).

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Frontend berjalan di `http://localhost:3000`. Buka dengan browser, swap ke DevTools → device emulation untuk melihat layout mobile (max-width 500px).

### Environment Variables

Dokumentasi lengkap ada di `.env.example` masing-masing folder:

- **`backend/.env`** — `JWT_SECRET`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `PORT`, `APP_ENV`, `ALLOWED_ORIGINS`, `PINATA_JWT`.
- **`frontend/.env.local`** — `NEXT_PUBLIC_API_URL` (default `http://localhost:8081/api/v1`).

## Script Berguna

```bash
# Frontend
npm run dev     # development server
npm run build   # production build (PWA sw.js turut digenerate)
npm run lint    # ESLint check

# Backend
go build ./...  # kompilasi
go vet ./...    # static analysis
```

Lihat `ARCHITECTURE.md` untuk struktur backend, `DESIGN.md` untuk identitas visual, dan `PROGRESS.md` untuk status pengerjaan.