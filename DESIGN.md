# DESIGN.md — Pilah Visual Identity

## 1. Core Principles

**No stickers, no cartoon illustrations.** Pilah isn't a "youth gamification" app with a playful-cute style — it's a civic/eco-utility platform that must feel **trustworthy, clean, and serious** yet still warm (not cold/corporate). Reference feel: Linear, Vercel, Apple Health — not Duolingo.

All visual elements are based on: **strong typography + whitespace + line icons (Lucide) + solid colors**. No mascots, no flat illustrations of people throwing away trash, no emoji as a design element (emoji in text/toasts are still fine within reasonable bounds).

## 2. Color Palette

Theme: green (eco) combined with dark neutrals for a trustworthy feel, not childish pastel green.

- **Primary:** dark green/forest (not bright neon green) — for primary actions, brand mark
- **Accent:** one secondary color for status (e.g. amber for "pending/verifying", blue for "accepted", green for "completed", red for errors)
- **Neutral:** neutral gray scale (not bluish-gray) for text & backgrounds, dominant in the UI
- **Background:** white/near-white in light mode; dark mode optional in Phase 2

Use status colors **consistently as tags/badges**, not as large backgrounds — to stay minimalist.

## 3. Typography

- One modern sans-serif typeface (Inter, Geist, or similar) — don't mix more than 1 font family
- Firm hierarchy: large & bold hero/headings, medium body, small captions in muted gray
- Numbers (karma points, kg weight, prices) use tabular numbers so they align cleanly when changing/animating

## 4. Components & Layout

- **Card-based**, consistent radius (pick one radius value and use it across all cards/buttons/inputs — don't mix)
- **Thin soft shadow**, not heavy shadow/neumorphism
- Pickup status shown as a **horizontal or vertical stepper/timeline** (Pending → Accepted → Verifying → Completed), not a plain text badge — this is the most important interaction point in the app and deserves more visual effort
- Icons: pure Lucide React, consistent size (e.g. 20px for inline, 24px for nav)
- Empty states (empty history, empty radar): text + 1 large line icon, NO illustration — this is the most common place "stickers" sneak in

## 5. Motion

- Smooth transitions (150–250ms ease-out) for sheets/modals, not excessive bounce/spring
- Skeleton loading for lists (history, radar) — not a generic spinner everywhere
- Micro-interactions only at important points: a small count-up animation for karma gained confirmation is okay, but keep it subtle

## 6. Warga vs Mitra Modes

The two roles have different goals (Warga = wait & trust, Mitra = work fast & efficiently). The UI may have different nuances:
- **Warga:** calmer, more informative, lots of white space, focused on status & transparency
- **Mitra:** denser/more functional, list-based, fast actions (accept in 1 tap), minimal scrolling — used while working in the field

## 7. Anti-"Sticker" Checklist

Before committing any new UI, check:
- [ ] No flat-illustration/mascot
- [ ] No emoji as a primary visual element (badge, empty state, etc.)
- [ ] Colors used functionally (status), not decoratively
- [ ] Radius & shadow consistent with other components
- [ ] Icons from one source (Lucide) only
