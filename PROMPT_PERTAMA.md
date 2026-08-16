First read SYSTEM.md, ARCHITECTURE.md, and RULES.md in this project's root as your working instructions.

TASK (Phase 1, first item): fix the authorization gap in two pickup endpoints.

1. In `backend/internal/handlers/pickup.go`, function `UserConfirmPickup`:
   - Currently the query is only `WHERE id = ? AND status = ?`, it does NOT check whether this pickup belongs to the currently logged-in user.
   - Add a filter `AND user_id = ?` using `user_id` from `c.Locals("user_id")`, same pattern used in `GetUserHistory`.
   - If the pickup isn't found (including because it isn't this user's), return 404 with the same message as now (don't leak that the pickup actually exists but belongs to someone else).
   - Wrap the pickup status update + user karma_points update in ONE database transaction (`config.DB.Begin()` ... `Commit()`/`Rollback()`) — currently there's a `tx := config.DB.Begin()` that's created but never used; it must actually be used for these two updates.

2. In `backend/internal/handlers/collector.go`, function `CompletePickup` (note: this function actually lives in `pickup.go`, check its definition) — ensure only the collector who accepted that pickup (`collector_id` matching `user_id` from the token) can call this endpoint. The query must be `WHERE id = ? AND collector_id = ?`.

3. Move the database queries currently done directly in handlers (`config.DB.Where(...)`) to the repository layer (`backend/internal/repository/pickup_repo.go`), per the Handler→Service→Repository structure in ARCHITECTURE.md. Handlers may only parse requests & call the service.

Don't change the behavior of other working features. Provide complete code for every file you change. Don't run any git commands — I'll commit manually after I verify.

When done, write a brief summary: which files changed, and what I need to manually test to verify (scenario: user A tries to confirm user B's pickup, must fail with 404).
