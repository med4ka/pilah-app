-- Profil mitra (kolektor): jenis kendaraan, area operasional, dan rekening
-- pencairan. Kolom default kosong agar warga (role user) tidak terpengaruh.
-- Di dev, kolom ditambahkan otomatis oleh AutoMigrate (config/database.go);
-- file ini menjadi acuan untuk environment production.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS vehicle_type varchar(50) NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS service_area varchar(100) NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS bank_name varchar(50) NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS bank_account_number varchar(50) NOT NULL DEFAULT '';
