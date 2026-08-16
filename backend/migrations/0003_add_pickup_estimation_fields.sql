-- Kolom estimasi berat oleh warga (opsional, referensi untuk kolektor di radar).
-- Bukan sumber karma — karma tetap dihitung dari berat aktual yang disubmit
-- kolektor (plastic_weight/cardboard_weight/glass_weight) saat fase VERIFYING.
ALTER TABLE pickups
  ADD COLUMN IF NOT EXISTS est_plastic_weight double precision NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS est_cardboard_weight double precision NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS est_glass_weight double precision NOT NULL DEFAULT 0;