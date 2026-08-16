# Pilah

**A two-sided waste pickup and eco-reward platform connecting households with waste collectors.**

Pilah addresses a coordination problem: households have recyclable waste (plastic, cardboard, glass) but no easy way to connect with collectors, and collectors have no organized way to find pickup requests. Pilah is a two-sided app — **Warga** (users) request pickups, **Mitra** (collectors) fulfill them — with a two-step confirmation handshake, a weight-based karma reward system for users, and a Rupiah earnings system for collectors.

---

## Features

**Implemented and working:**

- JWT-based auth with role separation (user / collector), delivered via an httpOnly cookie (not localStorage)
- Pickup requests with geolocation (latitude/longitude), estimated weight by material, and an actual weight breakdown (plastic, cardboard, glass)
- Resident weight estimate step + a required collector weight form — the real measured weights drive all rewards
- Two-step handshake: collector marks a pickup accepted → submitting weight/photo moves it to verifying, user confirms it to finalize — both sides must agree
- **Karma engine** for users: `plastic×60 + cardboard×24 + glass×6` per kg, awarded atomically on confirmation
- **Earnings engine** for collectors: `plastic×3000 + cardboard×1200 + glass×300` per kg (Rp), equivalent to Rp50 per karma, also awarded atomically
- **Tukar Cuan**: users redeem karma for simulated Rupiah at `1 karma = Rp50` (real DB balance deduction, simulated payout)
- **Collector earnings withdrawal**: collectors redeem Rupiah (simulated payout, real DB balance deduction)
- Photo evidence field attached to each pickup
- IPFS evidence: transaction proof is pinned to IPFS after a confirmed pickup and surfaced as a "verified" badge in history
- Auto-cancel of pickups left `PENDING` for 3 minutes
- Pickup history, separately queryable from the user side and the collector side
- PWA (installable, manifest, service worker), in-app notification center, help center

**Simulated / not real money:**
- All payouts (Tukar Cuan and collector earnings withdrawal) are **simulated** — the balance is genuinely decremented in the database, but no real payment gateway is wired up

**Not yet implemented** (being upfront rather than overselling):
- No AI assistant is wired up in the backend — only a static recycling-guide sheet on the frontend
- No live map/radar tracking service in the backend — the collector "radar" is a static list of pending orders, not a real-time map feed
- No blockchain or smart contract layer — karma and earnings are plain integer/bigint columns in Postgres, not on-chain tokens

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS v4, Zustand, framer-motion, PWA (`@ducanh2912/next-pwa`) |
| Backend | Go, Fiber v2, GORM, PostgreSQL |
| Auth | JWT (`golang-jwt/jwt`), bcrypt, httpOnly cookie |

## API Reference

| Endpoint | Method | Access | Purpose |
|---|---|---|---|
| `/api/v1/auth/register` | `POST` | Public | Create account (`role`: user / collector) |
| `/api/v1/auth/login` | `POST` | Public | Login (sets httpOnly cookie) |
| `/api/v1/auth/logout` | `POST` | Authenticated | Clear session cookie |
| `/api/v1/users/me` | `GET` | Authenticated | Current user profile (karma, earnings, profile fields) |
| `/api/v1/users/me` | `PATCH` | Authenticated | Update own profile (name, vehicle type, service area, bank) |
| `/api/v1/karma/redeem` | `POST` | Authenticated | Redeem karma → simulated Rupiah |
| `/api/v1/earnings/redeem` | `POST` | Authenticated (collector) | Withdraw collector earnings (simulated) |
| `/api/v1/pickups` | `POST` | Authenticated | Create a pickup request |
| `/api/v1/pickups/history` | `GET` | Authenticated | User's own pickup history |
| `/api/v1/pickups/collector-history` | `GET` | Authenticated (collector) | Collector's pickup history |
| `/api/v1/pickups/:id/confirm` | `PATCH` | Authenticated (owner) | User confirms a completed pickup |
| `/api/v1/collector/pending` | `GET` | Public* | List pending pickup requests |
| `/api/v1/collector/pickups/:id/accept` | `PATCH` | Authenticated (collector) | Collector accepts a request |
| `/api/v1/collector/pickups/:id/complete` | `PATCH` | Authenticated (owner) | Collector submits weight/photo (→ verifying) |

*The `pending` list endpoint isn't currently behind auth middleware — pickup coordinates and estimates are publicly readable. Worth revisiting before any real deployment.

## Getting Started

> **Port note:** the frontend contacts the API at `http://localhost:8081/api/v1`. Run the backend with `PORT=8081` so the two line up.

### Prerequisites
- Go 1.25+
- Node.js 18+
- PostgreSQL

### Backend

The backend reads everything from environment variables (it does **not** auto-load a `.env` file), so export the required values before running:

```bash
cd backend

# Windows PowerShell
$env:PORT="8081"
$env:DB_HOST="localhost"; $env:DB_PORT="5432"
$env:DB_USER="postgres"; $env:DB_PASSWORD="postgres"; $env:DB_NAME="pilah_db"
$env:JWT_SECRET="your-long-random-secret"
$env:ALLOWED_ORIGINS="http://localhost:3000"

go mod tidy
go run ./cmd/api
```

`PORT`, `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`, and `JWT_SECRET` are required — the server fails fast (refuses to start) if any is empty. `ALLOWED_ORIGINS` and `PINATA_JWT` are optional (the former defaults to localhost in dev; the latter only disables IPFS pinning when missing).

### Frontend

```bash
cd frontend
cp .env.example .env.local   # NEXT_PUBLIC_API_URL defaults to http://localhost:8081/api/v1
npm install
npm run dev
```

Open `http://localhost:3000`. Next.js 16 uses Turbopack by default, which conflicts with the PWA webpack config — the build script already passes `--webpack`. If the dev server shows a Turbopack warning, start it with `npm run dev -- --webpack`.

## Demo Guide (end-to-end)

1. **Register two accounts** (Auth modal → "Daftar"):
   - One **Warga** (role user) — e.g. `warga@test.dev` / `password123`
   - One **Mitra** (role collector) — e.g. `mitra@test.dev` / `password123`
2. **Warga** (resident side, `http://localhost:3000`): tap **Jemput Sampah**, optionally add an estimated weight, allow GPS, and submit the request.
3. **Mitra** (collector side, `http://localhost:3000/collector`): **Scan Area** to list pending pickups, then **Ambil Tugas Ini** to accept.
4. **Mitra**: on the active-order card tap **Konfirmasi Selesai** → a weight form appears (required, at least one material > 0). Enter e.g. `1 / 1 / 1` kg and **Kirim & Selesaikan**. The pickup now sits in `VERIFYING`.
5. **Warga**: the active pickup shows the real weight breakdown (e.g. `1kg / 1kg / 1kg`), then tap **Konfirmasi Selesai**. Karma is awarded — `1×60 + 1×24 + 1×6 = 90 Karma`.
6. **Verify rewards**:
   - Warga: Karma wallet shows `90`, and history shows `+90 Karma` for that order.
   - Mitra: profile shows **Rp 4.500** earnings for the same order.
7. **Tukar Cuan** (Warga): open **Tukar Cuan**, pick a payout method, **Tarik Semua Karma** — confirmed by the `1 Karma = Rp50` rate.
8. **Withdraw earnings** (Mitra): open **Saldo Pendapatan → Tarik**.
9. **Bonus checks**: pending orders auto-cancel after 3 minutes if unclaimed; completed orders carry an IPFS **Terverifikasi** badge.

## Project Structure

```
pilah-app/
├── backend/
│   └── internal/
│       ├── config/       # DB connection, env fail-fast
│       ├── handlers/     # Fiber route handlers (HTTP layer only)
│       ├── middleware/   # JWT auth guard + role guard
│       ├── models/       # GORM models (User, Pickup)
│       ├── repository/   # all DB queries
│       ├── services/     # business logic + transactions (auth, pickup, karma/earnings)
│       └── utils/        # IPFS pinning
│   └── cmd/api/          # entrypoint
│
└── frontend/
    ├── app/              # Next.js App Router pages (/, /collector)
    ├── components/       # UI (Dialog, PaymentMethodEditor) + dashboard feature components
    ├── lib/              # api client, help content, motion constants
    └── store/            # Zustand stores (auth, ui, payment methods, notifications)
```

## Status

Production-styled portfolio showcase. Core auth, the full pickup handshake, weight-driven karma + earnings, simulated payouts, IPFS evidence, and PWA all work end-to-end. Payment integration and live map tracking remain simulated/absent, and the public `pending` endpoint should be secured before any real deployment.

---

*Built with Go, Fiber, Next.js, and PostgreSQL.*
