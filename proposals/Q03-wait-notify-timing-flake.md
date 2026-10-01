# Q03: Hard latency asserts make `tests/wait-notify.test.ts` flaky

- **Edge or parity:** neither. Test reliability.
- **Cost:** S.
- **Risk:** low.
- **Targets:** TypeScript tests (`tests/wait-notify.test.ts`).
- **Status:** proposed quick fix. AGENTS.md says to fix the timing rather than re-run until green.

## Problem

Two tests assert that a wake-up arrives in under 500 ms of a send. Under CI load (shared runner, a docs-only commit) they fail without any relevant code change, and the project's answer was to retrigger CI. A red check on a timing test then stops meaning anything, which hides real regressions in the wait path that the whole "no daemon, wake on write" design relies on.

## Evidence

- `tests/wait-notify.test.ts:82-99` ("bus_wait returns within 500 ms of a send from the CLI"): three rounds, then `assert.ok(latency < 500, ...)` for each (`:98`). The measured interval includes the CLI process spawn and the MCP client round trip (`:90-92`).
- `tests/wait-notify.test.ts:162-171`: a second hard bound, `assert.ok(at - sent.tsMs < 500, ...)` (`:170`).
- Flake history: commit `168730d` "ci: retrigger (wait-notify latency flake on docs-only change)" (2026-09-30), an empty commit whose only purpose was to re-run CI. AGENTS.md ("Flakiness") names the hard `<500 ms` asserts as the remaining risk.
- The behaviour under test has a design bound that is not 500 ms of wall clock: `core/changes.ts` polls `PRAGMA data_version` backing off 10 to 100 ms with an `fs.watch` wake, long-lived waiters up to 1 s (`docs/architecture.md:37-41`).

## Change

- Keep the assertion that matters (a wake-up happens promptly, not at the poll ceiling) but stop measuring process-spawn noise: measure from the moment the message row is committed to the moment the waiter's promise resolves, in-process, and assert against a bound derived from the configured poll interval plus a generous constant (for example `maxPollMs * 2 + 250`).
- For the cross-process case, retry the measurement up to 5 times and assert that the *best* of N meets the bound (a single slow run is noise; consistently slow is a regression), and print all samples with `t.diagnostic` as the test already does.
- Pin the property explicitly in a separate deterministic test: with `fsWatch: false` and a fake clock, the waiter wakes within one poll interval of a write (no wall-clock sleeps).
- Do not skip, disable or quarantine the tests.

## Cost

A small edit to two tests and one new deterministic test.

## Risk

Loosening a bound can hide a real slowdown; the deterministic poll-interval test and the diagnostic print of samples keep a regression visible. The best-of-N rule is not a fix for a machine that is always slow; the suite records samples so that case is noticed.

## How it is verified

- Reproduce first: run the two tests 50 times under load (`stress`-style CPU hogs or `taskset -c 0` plus a busy loop) on `main` and record the failure count in the PR.
- After the change: the same 50 runs pass. Report both counts.
- `npm run test:unit` green; no test skipped or removed (benchmark task I02 uses this fix and its validator, `benchmark.md`).
