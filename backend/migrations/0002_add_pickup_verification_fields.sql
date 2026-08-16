-- 0002_add_pickup_verification_fields.sql
-- Kolom data verifikasi kolektor (berat per material + foto bukti) untuk fase VERIFYING.
-- Dijalankan manual oleh Ghif, tidak otomatis dari kode Go.

ALTER TABLE pickups
  ADD COLUMN IF NOT EXISTS plastic_weight double precision NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cardboard_weight double precision NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS glass_weight double precision NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS photo_url varchar(500) NOT NULL DEFAULT '';