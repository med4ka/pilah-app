# RULES.md — Execution Rules (for AI Executor & Ghif)

## Standard Workflow

1. **Claude** (architect/reviewer): writes detailed spec per feature/task, reviews the executor's code output, validates against ARCHITECTURE.md & RULES.md.
2. **DeepSeek v4 Flash via OpenCode** (executor): writes code per the prompt/spec from Claude, doesn't make architecture decisions itself.
3. **Ghif**: manual verification (Thunder Client for API, pgAdmin to inspect data, DevTools to check network/cookie), then commits manually per logical change. **Git is never handed to the AI.**

## Pre-Commit Checklist (must be ticked manually)

- [ ] Modified endpoints have an ownership check (where relevant)
- [ ] No direct DB query in handlers
- [ ] No hardcoded secrets/credentials
- [ ] Errors logged with context, no silent failures
- [ ] No old feature broken (regression) — tested manually
- [ ] Code passes `go vet`/`golangci-lint` (backend) or `eslint` (frontend)
- [ ] No new UI element violating DESIGN.md (sticker/illustration/mascot)

## Change Size Limits

- One task = one concern (e.g. "add ownership check on confirm endpoint" not combined with "redesign the history page"). Small commits, easy to review, easy to rollback.
- If a task ends up touching >3 files at once without being planned in the spec, stop and confirm with Ghif before continuing.

## Prohibitions

- Forbidden to add new libraries/dependencies without a written reason in the commit message.
- Forbidden to change the database schema without an explicit, reversible migration.
- Forbidden to touch features out of PRD.md scope (AI assistant, live map, etc.) unless explicitly requested.
- Forbidden to leave `console.log`/`fmt.Println` debug statements in the final code.
- Forbidden to create new endpoints that aren't registered/documented in ARCHITECTURE.md or the README API reference.

## Definition of "Done" for Each Phase (see PROGRESS.md)

A phase is not considered done just because the code "runs" — it must pass the checklist above AND be manually verified by Ghif.
