-- Pendapatan kolektor (hasil pickup) dalam Rupiah. Kolom default 0 agar warga
-- (role user) tidak terpengaruh. Di dev, kolom ditambahkan otomatis oleh
-- AutoMigrate (config/database.go); file ini menjadi acuan untuk production.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS collector_earnings bigint NOT NULL DEFAULT 0;