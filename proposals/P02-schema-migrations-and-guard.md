# P02: Numbered schema migrations and a TS/Rust schema guard

- **Edge or parity:** neither. It is the precondition for every proposal that changes the schema (P03, P04, P06, P07, P11, P14).
- **Cost:** M.
- **Risk:** medium. It changes what happens when two binaries meet a database of a different version, and it touches both implementations.
- **Targets:** both, with a shared schema directory.
- **Status:** proposed. Recommended before any schema change.

## Problem

AOS requires schema changes to be "migrations that keep TS and Rust compatible". Neither implementation has a migration mechanism. Each carries a hand-copied `SCHEMA_SQL` string and one constant, `schema_version = "1"`. Opening a database with any other version re-applies `CREATE TABLE IF NOT EXISTS` and overwrites the version number instead of refusing. So a newer binary can silently downgrade the marker, an older binary can run against columns it does not know, and nothing in CI notices when the two SQL strings drift. The Rust branch is also 60 commits behind `main`, so drift is already a live risk.

## Evidence

- TS: `src/core/db.ts:10` (`SCHEMA_VERSION = "1"`), `:13-65` (`SCHEMA_SQL`), `:99-100` (`schemaReady` is true only for version `"1"`), `:129-131` (on not-ready, run the SQL and upsert the version).
- Rust: `rust/src/db.rs:10` (same constant), `:13-53` (copy of the SQL; lines 14-52 diff clean against TS in the scan of `rust-port` `c6df26b`), `:176-195` (same upsert).
- No equality check: CI on `rust-port` runs `cargo build`, the interop smoke and `cargo test` (`.github/workflows/universal-harness-ci.yml` on that branch), none of which compares the two schemas.
- Interop smoke covers mail both ways, a TS-created task claimed by Rust, and `wait` wake-ups. It does not cover review, submit, leases, cancel, trace, supervise or a version mismatch (`scripts/v2-interop-smoke.mjs`).
- `rust-port` is 60 commits behind `main` and 21 ahead (merge-base `ebfc5ef`); its TS tree lacks main's urgent-first claim ordering (rust-port `src/core/bus.ts:720-745` vs main `bus.ts:828-842`).
- `usage` is declared "reserved" (`docs/architecture.md:19`), which shows additive columns are already how the schema evolves, with no process around it.

## Change

1. A `schema/` directory at the repo root holding ordered files `001-baseline.sql` (today's schema, byte for byte), `002-...sql` and so on, plus `schema/families.json` later (P03). `meta.schema_version` becomes the highest applied number.
2. TS applies pending files in one `BEGIN IMMEDIATE`; Rust embeds the same files with `include_str!`. `package.json` `files` and the Rust build both include `schema/`.
3. **Refuse, do not overwrite:** a database whose version is higher than the binary knows opens read-only for `status`/`log`/`trace` and fails writes with a message naming the version and which binary to upgrade. A lower version is migrated forward.
4. Additive-only rule: migrations add tables or nullable/defaulted columns; no drops or renames. Both implementations ignore columns they do not read.
5. CI job `schema-guard`: create a database with TS, another with Rust, dump `sqlite_master` (normalised) and diff; also run each binary against a database migrated by the other.
6. Extend `scripts/v2-interop-smoke.mjs` to submit, review (accept and revise), lease conflict, cancel, `trace`, and an intentional version mismatch.
7. Merge `main` into `rust-port` first (the step that makes the rest checkable), resolving per `docs/architecture.md`.

## Cost

Roughly 150 lines TS, 150 lines Rust, one CI job, a longer interop script, and the merge of 60 commits (mostly mechanical; the schema files were identical on both sides when diffed). Without the merge the guard cannot be proven on current code.

## Risk

- Existing buses are at version `"1"`; `001-baseline` must equal what `SCHEMA_SQL` creates now so existing databases migrate as a no-op. A test creates a database with the old binary and opens it with the new one.
- Refusing newer versions is a behaviour change: a user running an old `qagent` against a bus touched by a newer one now gets an error instead of undefined behaviour. That is the point; document it in CHANGELOG.
- Windows path/line-ending differences in `schema/*.sql`: normalise to LF in the dump comparison.

## How it is verified

- Unit tests (both): fresh create equals baseline; v1 database migrates and keeps rows; newer-than-known version refuses writes.
- `schema-guard` CI job green; deliberately editing one side's schema makes it red.
- Extended interop smoke passes (`node scripts/v2-interop-smoke.mjs`) on the merged `rust-port`.
- Benchmark relevance: none directly. This unblocks the arms in `benchmark.md` that need new columns.
