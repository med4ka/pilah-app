# RULES.md — Aturan Eksekusi (untuk AI Executor & Ghif)

## Alur Kerja Standar

1. **Claude** (arsitek/reviewer): menyusun spec detail per fitur/task, mereview hasil kode dari executor, memvalidasi terhadap ARCHITECTURE.md & RULES.md.
2. **DeepSeek v4 Flash via OpenCode** (executor): menulis kode sesuai prompt/spec dari Claude, tidak mengambil keputusan arsitektur sendiri.
3. **Ghif**: verifikasi manual (Thunder Client untuk API, pgAdmin untuk cek data, DevTools untuk cek network/cookie), lalu commit manual per perubahan logis. **Git tidak pernah diserahkan ke AI.**

## Checklist Sebelum Commit (wajib dicentang manual)

- [ ] Endpoint yang dimodifikasi punya ownership check (kalau relevan)
- [ ] Tidak ada query DB langsung di handler
- [ ] Tidak ada secret/credential hardcoded
- [ ] Error di-log dengan konteks, tidak fail silent
- [ ] Tidak ada fitur lama yang rusak (regresi) — dites manual
- [ ] Kode sudah lolos `go vet`/`golangci-lint` (backend) atau `eslint` (frontend)
- [ ] Tidak ada elemen UI baru yang melanggar DESIGN.md (stiker/ilustrasi/mascot)

## Batasan Ukuran Perubahan

- Satu task = satu concern (mis. "tambah ownership check di confirm endpoint" bukan digabung dengan "redesign halaman riwayat"). Commit kecil, mudah di-review, mudah di-rollback.
- Kalau sebuah task ternyata menyentuh >3 file sekaligus tanpa direncanakan di spec, berhenti dan konfirmasi ke Ghif dulu sebelum lanjut.

## Larangan

- Dilarang menambah library/dependency baru tanpa alasan tertulis di commit message.
- Dilarang mengubah skema database tanpa migration yang eksplisit dan reversible.
- Dilarang menyentuh fitur di luar scope PRD.md (AI assistant, live map, dsb) kecuali diminta eksplisit.
- Dilarang meninggalkan `console.log`/`fmt.Println` debug di kode final.
- Dilarang membuat endpoint baru yang tidak didaftarkan/didokumentasikan di ARCHITECTURE.md atau README API reference.

## Definisi "Selesai" untuk Setiap Fase (lihat PROGRESS.md)

Sebuah fase tidak dianggap selesai hanya karena kode "jalan" — harus lolos checklist di atas DAN diverifikasi manual oleh Ghif.
