# Pilah

**A two-sided waste pickup and eco-reward platform connecting households with waste collectors.**

Pilah addresses a coordination problem: households have recyclable waste (plastic, cardboard, glass) but no easy way to connect with collectors, and collectors have no organized way to find pickup requests. Pilah is a two-sided app — **Warga** (users) request pickups, **Mitra** (collectors) fulfill them — with a two-step confirmation handshake and a karma-points reward system for users.

---

## Features

**Implemented and working:**
- JWT-based auth with role separation (user / collector)
- Pickup requests with geolocation (latitude/longitude) and a weight breakdown by material (plastic, cardboard, glass)
- Two-step handshake: collector marks a pickup accepted → completed, user confirms it — both sides have to agree before it's finalized
- Photo evidence field attached to each pickup
- Karma points tracked per user (`karma_points` field)
- Pickup history, separately queryable from the user side and the collector side

**Planned / not yet implemented** (being upfront about this rather than overselling it):
- No AI assistant is currently wired up in the backend — this may be a frontend-only UI placeholder for now
- No live map/radar tracking service exists yet in the backend
- There's an `ipfs_hash` field on the pickup model, suggesting an intent to store photo evidence on IPFS — but no upload/pinning logic is implemented yet, so treat this as scaffolding rather than a working feature
- No blockchain or smart contract layer exists — karma points are a plain integer column in Postgres, not an on-chain token

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS v4, Zustand, PWA support (`@ducanh2912/next-pwa`) |
| Backend | Go, Fiber v2, GORM, PostgreSQL |
| Auth | JWT (`golang-jwt/jwt`), bcrypt |

## API Reference

| Endpoint | Method | Access | Purpose |
|---|---|---|---|
| `/api/v1/auth/register` | `POST` | Public | Create account |
| `/api/v1/auth/login` | `POST` | Public | Login |
| `/api/v1/users/me` | `GET` | Authenticated | Current user profile |
| `/api/v1/pickups` | `POST` | Authenticated | Create a pickup request |
| `/api/v1/pickups/history` | `GET` | Authenticated | User's own pickup history |
| `/api/v1/pickups/collector-history` | `GET` | Authenticated | Collector's completed pickups |
| `/api/v1/pickups/:id/confirm` | `PATCH` | Authenticated | User confirms a completed pickup |
| `/api/v1/collector/pending` | `GET` | Public* | List pending pickup requests |
| `/api/v1/collector/pickups/:id/accept` | `PATCH` | Authenticated | Collector accepts a request |
| `/api/v1/collector/pickups/:id/complete` | `PATCH` | Authenticated | Collector marks complete |

*The `pending` list endpoint isn't currently behind auth middleware — worth revisiting before any real deployment, since it means pickup request details are publicly readable.

## Getting Started

### Prerequisites
- Go 1.25+
- Node.js 18+
- PostgreSQL

### Backend

```bash
cd backend
cp .env.example .env
go mod tidy
go run cmd/api/main.go
```

Runs on `:8080` by default.

### Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

## Project Structure

```
pilah-app/
├── backend/
│   └── internal/
│       ├── config/       # DB connection
│       ├── handlers/     # Fiber route handlers
│       ├── middleware/   # JWT auth guard
│       ├── models/       # GORM models (User, Pickup)
│       ├── repository/   # DB queries
│       └── services/     # business logic (auth, pickup)
│
└── frontend/
    └── src/
        └── app/          # Next.js App Router pages
```

## Status

Early-stage / prototype. Core auth and pickup request flow work end-to-end. The reward economy (karma points beyond the raw counter), photo/IPFS evidence storage, and collector-side map view are the next pieces to build out.

---

*Built with Go, Fiber, and Next.js.*
