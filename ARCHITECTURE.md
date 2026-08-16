# ARCHITECTURE.md — Pilah Rework

## 1. Stack (tetap, tidak ganti)

| Layer | Tech |
|---|---|
| Frontend | Next.js (App Router), React, TypeScript, Tailwind CSS, Zustand, PWA (`@ducanh2912/next-pwa`) |
| Backend | Go, Fiber v2, GORM, PostgreSQL |
| Auth | JWT, disimpan di **httpOnly cookie** (bukan localStorage) |
| Storage foto | tetap via mekanisme existing; hash bukti transaksi tetap ke IPFS (Pinata) |

## 2. Backend — Struktur Wajib

```
backend/internal/
├── config/       # DB connection, env loader (fail-fast jika env wajib kosong)
├── handlers/     # HTTP layer murni: parse request, panggil service, format response
├── middleware/   # auth guard, role guard
├── models/       # GORM models
├── repository/   # SEMUA query DB ada di sini, tidak di tempat lain
├── services/     # business logic + authorization checks + transaction orchestration
└── utils/        # IPFS pin, helper lain
```

**Aturan keras:** handler tidak boleh import `gorm.io/gorm` untuk query langsung. Semua yang saat ini bocor di `pickup.go`/`collector.go` (`config.DB.Where(...)`) dipindah ke repository.

## 3. Auth Redesign

- Login/register tetap menghasilkan JWT, tapi dikirim via `Set-Cookie` dengan `HttpOnly`, `Secure` (di prod), `SameSite=Lax`.
- Middleware `Protected()` membaca dari cookie, bukan `Authorization` header (atau dukung dua-duanya sementara masa transisi, cookie sebagai default).
- **JWT_SECRET wajib** dari env, tidak ada fallback string hardcoded — server panic/exit saat startup jika kosong.
- Tambahan: middleware `RequireRole(role string)` untuk endpoint yang harus dibatasi per role (mis. endpoint kolektor tidak bisa diakses role warga dan sebaliknya) — ini belum ada sama sekali di versi lama.

## 4. Authorization Model (perbaikan inti dari audit)

Setiap operasi mutasi terhadap `Pickup` harus melalui pengecekan kepemilikan di **service layer**, bukan diasumsikan dari middleware saja:

| Endpoint | Ownership check yang wajib ditambahkan |
|---|---|
| `PATCH /collector/pickups/:id/complete` | `pickup.CollectorID == current_user_id` |
| `PATCH /pickups/:id/confirm` | `pickup.UserID == current_user_id` |
| `PATCH /collector/pickups/:id/accept` | pickup masih `status = PENDING` (row lock `FOR UPDATE` untuk cegah race dua kolektor accept bersamaan) |
| `GET /collector/pending` | tetap bisa publik-list, tapi field sensitif (koordinat presisi tinggi) boleh di-generalize/dibulatkan sebelum accept |

## 5. Transaction & Concurrency

`UserConfirmPickup` harus jadi satu transaksi utuh:
```
tx.Begin()
  -> lock pickup row (FOR UPDATE), pastikan status masih VERIFYING
  -> update pickup.status = COMPLETED
  -> update user.karma_points += calculated
tx.Commit()
```
Jika salah satu gagal → `tx.Rollback()`. IPFS pinning tetap async (goroutine) karena itu bukan bagian kritikal transaksi finansial/data, hanya bukti tambahan — tapi kegagalannya harus di-log dengan jelas, bukan diam.

## 6. Database Schema — Perubahan

- Tambah index komposit pada `pickups(status, created_at)` untuk query radar/pending yang lebih cepat.
- Tambah kolom `role` enum-checked di level aplikasi (`user` | `collector`) — saat ini string bebas tanpa constraint.
- Pertimbangkan soft constraint: `collector_id` tidak boleh sama dengan `user_id` pemilik pickup (mencegah orang accept order sendiri, edge case yang belum ditangani).

## 7. Frontend Architecture

- State Zustand dipecah jadi slice terpisah: `useAuthStore`, `useUIStore` (semua `isXSheetOpen`), `usePickupStore` — store lama mencampur semuanya jadi satu file besar.
- Auth token TIDAK disimpan di state/localStorage — deteksi login status dari hasil `GET /users/me` (cookie otomatis terkirim), bukan dari client-side token.
- API client (`lib/api.ts`) di-refactor jadi thin wrapper `fetch` dengan `credentials: "include"` di setiap request.

## 8. PWA

- `manifest.json` lengkap (nama, ikon multi-resolusi, theme-color mengikuti palet hijau di DESIGN.md)
- Service worker: cache app shell + static asset, network-first untuk API call (bukan cache-first, karena data real-time)
- Target Lighthouse PWA score ≥ 90

## 9. Deployment (portofolio-friendly)

- Backend: Fly.io/Railway (gratis tier cukup untuk demo)
- Frontend: Vercel
- DB: Neon/Supabase Postgres
- Environment variables didokumentasikan lengkap di `.env.example`, tanpa nilai default yang unsafe
