# P05: Stalls, needs-me and cost on one screen; usage recorded; kill -9 test; bus-wide export

- **Edge or parity:** PARITY with Hermes Kanban (dispatcher, stale and crash reclaim, per-attempt runs, dashboard analytics; `hermes-delta.md` rows 2, 6, 17). Do not market it as edge. Two narrow places ACS can be better: one command exports a causal chain that includes inter-agent mail, and the bus works with any vendor's CLI.
- **Cost:** M.
- **Risk:** low.
- **Targets:** TypeScript first; Rust gets the same queries for the TUI in P09. No schema change.
- **Status:** proposed.
- **Depends on:** nothing. P09 and P10 render what this computes.

## Problem

The detection pieces exist (`stalledTasks`, `deadClaims`, `trace`) but the operator has to know to ask. `qagent status` shows agents, counts by state and open tasks; it does not say what is stuck, what needs the operator, or what the run has cost. Cost cannot be shown because it is never written to the database. The crash-recovery story ("a worker dies and the work is not lost") is argued in docs but not tested.

## Evidence

- `qagent status` prints `Bus.status()`: db path, latest seq, agents, counts by state and the first 200 open tasks (`src/core/bus.ts:1144-1148`, `src/cli/main.ts:277-281`). No stall, no needs-me, no cost. The 200 is a silent cap, not reported as one.
- Stall detection exists and is CLI-only: `stalledTasks` (`src/core/bus.ts:718`), `deadClaims` (`:728`), `qagent task stalled` (`src/cli/main.ts:435-444`), `--auto-requeue-min` (supervisor). Listed as unreleased in `CHANGELOG.md` `[Unreleased]`.
- Cost: the `usage` table is declared and never written (`src/core/db.ts:63`; `docs/architecture.md:19`). The supervisor sums tokens and `costUSD` per agent into `<home>/sessions/<agent>.json` (`src/supervisor.ts:421-428`), so there is no per-task or per-run total and nothing the dashboard or TUI can read.
- Adapters already parse usage per turn (`src/adapters.ts:148-162`, `:255-261`, `:410-420`, `:443-449`, `:554-562`), so the data is available at the right moment. But an adapter that cannot see cost reports `costUSD: 0` (`EMPTY_USAGE`, `src/adapters.ts:69`; the Hermes adapter reports only a regex-scraped token count, `:520-529`), so "unknown" and "free" are indistinguishable today.
- Trace exists per task, not per thread or bus: `traceTask(id)` (`src/core/bus.ts:744`), `qagent trace <task-N>` (`src/cli/main.ts:336-351`). `docs/standout-features.md` recommended a bus-wide `export` and a kill-9 demo; neither exists (`grep -rn "SIGKILL\|kill -9" tests scripts` is empty).
- The TUI shows nothing on any of this (`rust/src/app.rs:45-94` loads agents, tasks and messages only; scan notes, section 1).

## Change

1. **Record usage as events, not a table.** After each supervised turn, `bus.recordUsage(actor, { taskIds, inputTokens, outputTokens, costUsd | null, durationMs, model })` writes one `turn_usage` event (`data_json`). Adapters change to return `costUSD: null` when they cannot report cost (today they return 0); the event keeps `null`, and the UI prints "cost n/a", never 0. Using `events` means no migration and one history (`docs/architecture.md:21`). Leave the `usage` table alone or retire it in a later cleanup.
2. **`status` answers three questions** at the top, before the lists:
   - *Stuck:* claimed tasks with no note or event from the assignee for N minutes (`stalledTasks`), plus `review_unroutable` and expired claims, each with task id, assignee, minutes, and the event seq it is derived from.
   - *Needs me:* tasks `submitted` where the operator is the reviewer or no reviewer is routable; `failed`/escalated tasks; mail to the operator with `requiresAck`; unresolved `needs_decision` items (P13).
   - *Costs:* total and per-agent tokens and USD from `turn_usage` for the current run window (default last 24 h; `--since`), with a count of turns whose cost was not reported.
   `status` also reports the true number of open tasks when the list is truncated.
3. **`qagent trace --thread <id>`** merges all messages and events of a thread (a task thread is `task-<N>`; other threads work the same), and **`qagent export --format json|html`** writes the whole bus (agents, tasks, notes, events, usage) as one JSON file or one self-contained HTML (no external URL), reusing `renderTraceHtml`.
4. **`kill -9` test** (`tests/lifecycle-kill.test.ts`): start a supervisor with the fake harness on a task, `SIGKILL` the supervisor and the harness process group mid-turn, assert the task shows as stalled after the window, `--auto-requeue-min` requeues it, a second supervisor completes it, and no message or note is lost.
5. Every line `status` prints about a state carries `#seq` of the event that last changed it, which satisfies the "links to an event sequence number" bar for the CLI and gives P09/P10 the same pointer.

## Cost

About 250 lines TS (core queries, CLI output, export), 80 lines of tests; the kill-9 test needs a process-group helper that already exists for the supervisor stop path (`src/supervisor.ts` `stopChild`). Rust needs the same three queries for the TUI (P09), roughly 150 lines.

## Risk

- **Event volume:** one extra event per turn. Small next to message and note events, and bounded by the supervisor's turn rate; `qagent log` can hide `turn_usage` by default.
- **Cost accuracy:** adapters estimate differently, and subscription-backed CLIs report no dollar cost. Show tokens always and dollars only when reported; label "reported by harness".
- **Stall thresholds** are heuristics: a task legitimately thinking for 40 minutes looks stalled. Default to the existing `--stall-min 60` and show the minutes, not a verdict.
- The kill-9 test must not be timing-flaky (the repo already has a flaky timing test, see Q03): drive time with an injected clock and short windows, not wall-clock sleeps.

## How it is verified

- Unit tests with a fixture bus: `status --format json` contains `stuck`, `needsMe`, `cost` with expected members; truncated list reports its true count.
- `turn_usage` test: a fake-harness turn with usage writes exactly one event; a harness with no usage writes `costUsd: null` and `status` prints "cost n/a".
- The kill-9 test above, run 20 times in a loop with no failure before merge.
- Export test: the HTML contains every task id and no `http://` or `https://` string except the inert text of task content.
- Benchmark: metrics 3 (minutes stuck), 4 (human touches) and 5 (cost) become task-level and extractable (P01).
- UI bar: one screen answers stuck, needs-me and cost. `qagent status` fits 80x24 for a bus with up to ~6 stalled tasks; longer lists truncate with a count.
