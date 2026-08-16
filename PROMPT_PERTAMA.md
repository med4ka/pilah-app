Baca dulu file SYSTEM.md, ARCHITECTURE.md, dan RULES.md di root proyek ini sebagai instruksi kerja kamu.

TASK (Phase 1, item pertama): perbaiki celah authorization di dua endpoint pickup.

1. Di `backend/internal/handlers/pickup.go`, fungsi `UserConfirmPickup`:
   - Saat ini query hanya `WHERE id = ? AND status = ?`, TIDAK mengecek apakah pickup ini milik user yang sedang login.
   - Tambahkan filter `AND user_id = ?` menggunakan `user_id` dari `c.Locals("user_id")`, sama seperti pola yang dipakai di `GetUserHistory`.
   - Jika pickup tidak ditemukan (termasuk karena bukan milik user ini), balikan 404 dengan pesan yang sama seperti sekarang (jangan bocorkan bahwa pickup itu sebenarnya ada tapi milik orang lain).
   - Bungkus update status pickup + update karma_points user dalam SATU database transaction (`config.DB.Begin()` ... `Commit()`/`Rollback()`) — saat ini ada `tx := config.DB.Begin()` yang dibuat tapi tidak pernah dipakai, itu harus benar-benar dipakai untuk kedua update ini.

2. Di `backend/internal/handlers/collector.go`, fungsi `CompletePickup` (perhatikan: fungsi ini sebenarnya ada di `pickup.go`, cek definisinya) — pastikan hanya kolektor yang accept pickup tersebut (`collector_id` sesuai `user_id` dari token) yang bisa memanggil endpoint ini. Query harus `WHERE id = ? AND collector_id = ?`.

3. Pindahkan query database yang saat ini langsung ada di handler (`config.DB.Where(...)`) ke repository layer (`backend/internal/repository/pickup_repo.go`), sesuai struktur Handler→Service→Repository di ARCHITECTURE.md. Handler hanya boleh parse request & panggil service.

Jangan ubah behavior fitur lain yang sudah jalan. Berikan kode utuh untuk setiap file yang kamu ubah. Jangan jalankan git command apa pun — saya yang akan commit manual setelah saya verifikasi.

Setelah selesai, tulis ringkas: file apa saja yang berubah, dan apa yang perlu saya tes manual untuk verifikasi (skenario: user A coba confirm pickup milik user B, harus gagal 404).
