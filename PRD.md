# PRD — Pilah (Rework)

## 1. Summary

Pilah is a two-sided platform (**Warga** ↔ **Mitra/Collector**) for recyclable waste pickup with a karma reward system. This rework aims to turn Pilah from a functional prototype into a **production-grade portfolio showcase**: secure, architecturally consistent, and with a mature visual identity — at the level of NusaPath/Selaras.

**Target:** Portfolio showcase. Not a product that will run real operations, but it must feel and work *as if* production-ready (correct auth, no IDOR, consistent transactions, installable PWA).

**Platform:** Still web, built as a **PWA** (Next.js `@ducanh2912/next-pwa`, already in the stack). Reason: PWA closes most of the gap against a native app (camera via `<input capture>`, push notification on Android/desktop, installable, offline shell) with far less effort, and the API stays clean so it can be consumed by Flutter/RN if a real native app is ever wanted.

## 2. Problem Being Solved

Households (Warga) have recyclable waste of value (plastic, cardboard, glass) but no organized channel to informal collectors (Mitra). Mitra have no systematic way to find pickup requests. Pilah bridges this via request-based matching + two-way verification (handshake) so both sides trust each other before a transaction is considered complete.

## 3. Personas

- **Warga** — residential user, requests pickup, earns karma points as incentive, wants transparency (knows pickup status, history, points).
- **Mitra (Collector)** — informal recycling worker, needs a clear & near-real-time order list, wants a simple accept→complete flow from their phone.

## 4. MVP Scope (Rework)

### In-scope
| Area | Description |
|---|---|
| Auth | Role-based register/login (Warga/Mitra), **httpOnly cookie**, not localStorage |
| Pickup lifecycle | Create → Pending → Accepted → Verifying (collector inputs weight+photo) → Completed (resident confirms) — with **ownership check at every step** |
| Karma system | Point calculation based on weight per material, atomic transaction (row lock / DB transaction) |
| History | Resident & collector pickup history, separate, with pagination |
| Profile | View profile, total karma, brief history |
| PWA | Installable, app icon, splash, minimal offline shell (not full offline-first — that's out of scope) |
| IPFS evidence (light) | Still present, triggered automatically after handshake completes, shown as "verified transaction proof" in history — purely tidied-up scaffolding, not a heavy feature |

### Out of scope (Phase 2 roadmap, documented but not worked on now)
- AI assistant / chatbot ("Pilah Pintar") — needs a real LLM integration, not a placeholder UI
- Live real-time collector map/radar
- Real on-chain/token-based point system
- Any payment/monetization

## 5. Main User Flows

**Warga:** Login → Create pickup (choose location via geolocation) → Wait (PENDING status) → Notification/see ACCEPTED status → Collector finishes weighing (VERIFYING) → Warga reviews & confirms → Karma increases, history recorded.

**Mitra:** Login → See nearest pending pickups list (simple radar, list not map) → Accept one → Arrive, weigh, photo evidence, submit → Wait for resident confirmation → Done, enters collector history.

## 6. Success Criteria (Portfolio Context)

- No IDOR/authz gaps found during manual review
- Lighthouse PWA score ≥ 90, installable on Android/desktop
- Full end-to-end flow demonstrable without errors in <2 minutes
- Consistent Handler→Service→Repository code across the entire backend (no exceptions)
- README + demo video/GIF suitable for a portfolio/LinkedIn

## 7. Non-Goals

- Scalability for thousands of concurrent users (not a portfolio goal)
- Hazardous-waste (B3) regulatory compliance / formal waste management compliance
- Real payment system
