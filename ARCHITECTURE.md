# ARCHITECTURE.md — Pilah Rework

## 1. Stack (fixed, not changing)

| Layer | Tech |
|---|---|
| Frontend | Next.js (App Router), React, TypeScript, Tailwind CSS, Zustand, PWA (`@ducanh2912/next-pwa`) |
| Backend | Go, Fiber v2, GORM, PostgreSQL |
| Auth | JWT, stored in an **httpOnly cookie** (not localStorage) |
| Photo storage | still via the existing mechanism; transaction proof hash still pinned to IPFS (Pinata) |

## 2. Backend — Required Structure

```
backend/internal/
├── config/       # DB connection, env loader (fail-fast if required env empty)
├── handlers/     # pure HTTP layer: parse request, call service, format response
├── middleware/   # auth guard, role guard
├── models/       # GORM models
├── repository/   # ALL DB queries live here, nowhere else
├── services/     # business logic + authorization checks + transaction orchestration
└── utils/        # IPFS pin, other helpers
```

**Hard rule:** handlers must not import `gorm.io/gorm` for direct queries. Everything currently leaking in `pickup.go`/`collector.go` (`config.DB.Where(...)`) moves to the repository.

## 3. Auth Redesign

- Login/register still produce a JWT, but sent via `Set-Cookie` with `HttpOnly`, `Secure` (in prod), `SameSite=Lax`.
- Middleware `Protected()` reads from the cookie, not the `Authorization` header (or support both during the transition period, cookie as default).
- **JWT_SECRET required** from env, no hardcoded string fallback — server panics/exits at startup if empty.
- Addition: middleware `RequireRole(role string)` for endpoints that must be restricted per role (e.g. collector endpoints inaccessible to the warga role and vice versa) — this doesn't exist at all in the old version.

## 4. Authorization Model (core fix from the audit)

Every mutating operation on `Pickup` must go through an ownership check in the **service layer**, not assumed from middleware alone:

| Endpoint | Mandatory ownership check to add |
|---|---|
| `PATCH /collector/pickups/:id/complete` | `pickup.CollectorID == current_user_id` |
| `PATCH /pickups/:id/confirm` | `pickup.UserID == current_user_id` |
| `PATCH /collector/pickups/:id/accept` | pickup still `status = PENDING` (row lock `FOR UPDATE` to prevent race of two collectors accepting simultaneously) |
| `GET /collector/pending` | can stay a public list, but sensitive fields (high-precision coordinates) may be generalized/rounded before accept |

## 5. Transaction & Concurrency

`UserConfirmPickup` must be one complete transaction:
```
tx.Begin()
  -> lock pickup row (FOR UPDATE), ensure status still VERIFYING
  -> update pickup.status = COMPLETED
  -> update user.karma_points += calculated
tx.Commit()
```
If any step fails → `tx.Rollback()`. IPFS pinning stays async (goroutine) because it isn't a critical part of the financial/data transaction, only supplementary evidence — but its failures must be logged clearly, not silently.

## 6. Database Schema — Changes

- Add a composite index on `pickups(status, created_at)` for faster radar/pending queries.
- Add a `role` column enum-checked at the application level (`user` | `collector`) — currently a free string without a constraint.
- Consider a soft constraint: `collector_id` must not equal the pickup owner's `user_id` (prevents accepting your own order, an edge case not yet handled).

## 7. Frontend Architecture

- Zustand state split into separate slices: `useAuthStore`, `useUIStore` (all `isXSheetOpen`), `usePickupStore` — the old store mixed everything into one big file.
- Auth token NOT stored in state/localStorage — detect login status from the result of `GET /users/me` (cookie sent automatically), not from a client-side token.
- The API client (`lib/api.ts`) refactored into a thin `fetch` wrapper with `credentials: "include"` on every request.

## 8. PWA

- Full `manifest.json` (name, multi-resolution icons, theme-color following the green palette in DESIGN.md)
- Service worker: cache app shell + static assets, network-first for API calls (not cache-first, because data is real-time)
- Target Lighthouse PWA score ≥ 90

## 9. Deployment (portfolio-friendly)

- Backend: Fly.io/Railway (free tier is enough for a demo)
- Frontend: Vercel
- DB: Neon/Supabase Postgres
- Environment variables fully documented in `.env.example`, without unsafe default values
