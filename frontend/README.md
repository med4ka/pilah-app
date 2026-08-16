# Pilah — Recyclable Waste Pickup That Becomes a Blessing

Pilah is a two-sided platform (**Warga** ↔ **Mitra/Collector**) for recyclable waste pickup (plastic, cardboard, glass) with a **Karma** reward system. Warga create pickup requests, collectors accept & complete them, and every transaction is two-way verified (handshake) before being considered complete — with transaction proof recorded to IPFS.

Built as an installable **PWA** (Next.js) for Android/desktop, with a Go backend following the **Handler → Service → Repository** pattern and **httpOnly cookie**-based auth.

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router), React, TypeScript, Tailwind CSS, Zustand, PWA (`@ducanh2912/next-pwa`) |
| Backend | Go, Fiber v2, GORM, PostgreSQL |
| Auth | JWT in httpOnly cookie (not localStorage) |
| Transaction proof | IPFS via Pinata |

## Running Locally

### Prerequisites

- Node.js & npm (for frontend)
- Go 1.2x (for backend)
- PostgreSQL running locally (or use Neon/Supabase)

### 1. Backend

```bash
cd backend
cp .env.example .env
# fill in every value in .env — without them, the server won't start (fail-fast)
go run ./cmd/api
```

Backend runs at `http://localhost:8080` (change via `PORT` in `.env`).

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Frontend runs at `http://localhost:3000`. Open it in a browser, switch to DevTools → device emulation to see the mobile layout (max-width 500px).

### Environment Variables

Full documentation is in each folder's `.env.example`:

- **`backend/.env`** — `JWT_SECRET`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `PORT`, `APP_ENV`, `ALLOWED_ORIGINS`, `PINATA_JWT`.
- **`frontend/.env.local`** — `NEXT_PUBLIC_API_URL` (default `http://localhost:8081/api/v1`).

## Useful Scripts

```bash
# Frontend
npm run dev     # development server
npm run build   # production build (PWA sw.js also generated)
npm run lint    # ESLint check

# Backend
go build ./...  # compile
go vet ./...    # static analysis
```

See `ARCHITECTURE.md` for the backend structure, `DESIGN.md` for the visual identity, and `PROGRESS.md` for the work status.
