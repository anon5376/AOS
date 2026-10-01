# P14: Scale without collisions: ownership beyond path leases, aggregation, measured coordination cost

- **Edge or parity:** worktrees and scheduling are PARITY (Hermes `worktree` workspaces and dispatcher, `hermes-delta.md` rows 3, 16; PR #17 brings worktrees to ACS). Two narrow candidates for edge: collision *prevention* at claim time (Hermes reconciles after the fact with `hotspot:` comments and a reconciliation card; `kanban.md:1194-1227`) and a coordination-cost measurement at 2, 8 and 32 agents, which the Hermes docs do not publish (not verified). Both are hypotheses.
- **Cost:** L.
- **Risk:** medium.
- **Targets:** both for the core change; TypeScript for the stress run.
- **Status:** proposed. Builds on worktrees landing (PR #17, handled by another thread); this proposal does not propose worktrees.
- **Depends on:** P02 (new columns), P01 (scale sub-benchmark), P05 (aggregated status).

## Problem

MANIFESTO: workers must not "overwrite, interrupt, or silently invalidate each other's work"; growth needs "aggregation, search, and drill-down"; no arbitrary fixed ceiling on the number of agents. ACS prevents two tasks from holding overlapping *write* scopes in one project. It does not detect that task Y built on files task X then changed (silent invalidation), has no read declaration, shows the first 200 open tasks flat, and has never been measured above a handful of agents.

## Evidence

- Ownership is write-path leases only: `leases(project, path, task_id)` with conflict check at claim (`src/core/db.ts:56-58`, `leaseConflicts` at `src/core/bus.ts:904`, used at `:860`). Tasks declare `path_scopes_json` only (`src/core/db.ts:44`); there is no read scope. Leases are cooperative, not enforced at the filesystem (`docs/security.md:26-28`).
- Silent invalidation: on accept, `unblockDependents` only unblocks tasks that *depend* on it (`src/core/bus.ts:1017-1035`); a sibling task already claimed, which read the files X changed, is not told. The submission records `changedFiles` (`src/core/bus.ts:933-972`, `result_json`) but nothing compares it with other open claims.
- Visibility ceilings: `Bus.status()` returns the first 200 open tasks (`src/core/bus.ts:1147`); `listTasks` clamps at 1000 (`:709`); dashboard keeps 32 streams and 1000 delta events (`src/dashboard/server.ts:36`, `:35`). None of these is reported as truncation in the UI.
- Write amplification: every bus operation calls `touch()`, an `UPDATE agents` inside the same `BEGIN IMMEDIATE` (`src/core/bus.ts:168-178`, called from `createTask`, `submitTask`, `reviewTask`), so each agent action serialises on the single SQLite writer (`write()` at `:147`; busy timeout 5 s, `src/core/db.ts:11`).
- Contention is tested at 20 processes claiming one task (`tests/core-claim.test.ts:12`, `PROCESSES = 20`), not at scale with real task flow, and `v2-perf-probe.mjs` counts statements, not contention.
- Aggregation: there is no tree or subtree rollup; `parent_id` exists (`src/core/db.ts:38`) but `status` and the dashboard ignore it.

## Change

1. **Read scopes and invalidation.** Migration (P02): `tasks.read_scopes_json` (default `[]`). When a task is accepted, for every *claimed or submitted* task in the same project whose read scope or write scope intersects the accepted task's `changedFiles`, write a `input_changed` event and a note on that task, set a `stale_input` marker (derived from events, no column) shown in status under stuck/needs-me. The owner of the stale task can acknowledge or revise; the bus never edits their work. Worktree isolation (PR #17) reduces overlap; this tells you when isolated work no longer matches the base.
2. **Subtree aggregation.** `qagent status --tree [--depth N]` collapses by `parent_id` with counts by state, stuck and cost per subtree; `qagent task tree <N>` drills in. The same endpoints feed P09/P10.
3. **Truncation is explicit.** Every list capped for size reports its true count and offers `--all` or paging. Remove silent caps from `status`.
4. **Reduce write amplification:** make `touch()` cheaper by skipping the `UPDATE` when `last_seen_ms` is under a few seconds old and the status is unchanged, and measure that it does not break wait/online semantics (P05 liveness uses `last_seen_ms`).
5. **Coordination-cost harness** (the benchmark's scale sub-benchmark): fake-harness agents at 2, 8, 32 on one machine, reporting wall clock, claims lost to contention, `SQLITE_BUSY` retries, lease conflicts, messages per task, p95 `task_created` to `task_claimed`. Run as a nightly trend job, not a CI gate. If 32 agents on one SQLite writer hits a ceiling, report where; that result either justifies the single-file design or motivates sharding by project (a separate proposal, not assumed).

## Cost

About 300 lines TS and 200 Rust for read scopes, event emission and tree queries; the harness reuses `bench/` (P01). The measurement itself is cheap because it uses fake agents.

## Risk

- **False invalidation:** coarse scopes ("." or a whole package) mark everything stale and train people to ignore the marker. Stale detection must use declared read scopes and actual `changedFiles` intersection with path-level matching, and report the matching paths.
- **Declared scopes are honest-system only:** an agent can omit them. The marker is a prompt to check, not a guarantee.
- **`touch` change** can alter online/offline display and liveness-based requeue (`deadClaims`, `src/core/bus.ts:728`); keep it behind a test that replays an offline/online sequence.
- **Over-claiming:** do not state "scales to N agents" without the measured table; the manifesto's "no fixed ceiling" means no designed-in limit, not an untested promise.

## How it is verified

- Unit tests: accepting X with `changedFiles` intersecting Y's read scope writes `input_changed` for Y only; unrelated task untouched; accept without overlap writes nothing.
- `status` test: with 250 open tasks, output and JSON report 250 and show truncation honestly.
- `touch` test: online/offline and dead-claim logic unchanged over a recorded sequence.
- Scale run: the table of results at 2, 8, 32 attached to the PR, with machine specs; no figure quoted before it exists.
- Benchmark: metric 10 (collisions: out-of-scope edits, integration conflicts, invalidated tasks) before and after, endurance run on the owner's machine.
