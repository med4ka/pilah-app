-- 0001_add_pickup_status_index.sql
-- Index komposit untuk query radar/pending (status, created_at).
-- Dijalankan manual oleh Ghif, tidak otomatis dari kode Go.

CREATE INDEX IF NOT EXISTS idx_pickups_status_created_at ON pickups (status, created_at);