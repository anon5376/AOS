# P07: Enforced budgets, loop guards and pause/resume

- **Edge or parity:** PARITY on loop and failure guards (Hermes `failure_limit`, circuit breakers, iteration caps; `hermes-delta.md` row 7). On hard money caps neither product enforces one (row 6, grep-based for Hermes), so a working per-run USD cap is a small differentiator, not a proven one.
- **Cost:** M.
- **Risk:** medium (stopping agents mid-work is a consequential action; wrong cost data causes wrong stops).
- **Targets:** TypeScript supervisor and core meta; Rust supervisor reads the same meta and events (the Rust supervisor is a single-agent loop today).
- **Status:** proposed.
- **Depends on:** P05 (`turn_usage` events). Pause/resume is used by P10.

## Problem

`optionalTokenBudget` and `optionalApiCostBudgetUSD` are accepted in config and do nothing. The only loop protection is retry backoff after a failed turn. A harness that "succeeds" every turn without making progress, or a manager that keeps spawning review rounds, runs until the operator notices. There is also no pause: the operator can only kill supervisors.

## Evidence

- Budgets declared, never read: `src/config.ts:152-153`; default `null` in `src/provider-catalog.ts:318-319`; no other consumer (grep over `src/`).
- Spend is observed but not acted on: the supervisor adds `costUSD` and tokens to a session file after each turn (`src/supervisor.ts:421-428`) and loops again.
- The only guards in the loop: exponential backoff after failed turns, `retryDelayMs` (`src/supervisor.ts:49-50`, `:433-452`), harness timeout, and review `maxRetries` (rounds, `src/core/bus.ts:995-1006`) plus failure retries (`:1088-1108`). Nothing detects repeated no-progress turns, and `constraints.maxRetries` itself is never read: `createTask` uses `input.maxRetries ?? 2` (`src/core/bus.ts:794`).
- `maxDelegationDepth` and `maxConcurrentTasks` are covered in P06.
- No pause concept: `meta` is a key-value table (`src/core/db.ts:14`) but only `schema_version` and operator-token outcome are stored.

## Change

1. **Budget as bus state.** `qagent budget set --run-usd 60 --run-tokens 5000000 --task-usd 8` writes `meta` keys and an event; `qagent budget show`. Per-task caps are also accepted at `task add --budget-usd`, stored in the task brief header and an event (no schema change; P02 can add a column later if needed).
2. **Enforcement point = where spend happens.** The supervisor checks cumulative `turn_usage` (P05) before starting each turn. Over a cap, it does not start the turn, writes `budget_exceeded` (scope, cap, spent, taskId), sets the run to `paused`, and leaves the claim to expire normally. Tokens are always enforced; USD only on turns whose cost was reported (a run with unreported cost cannot honour a USD cap, so `status` says "USD cap not enforceable: cost not reported by <harness>").
3. **Loop guard.** If an agent completes N consecutive turns (default 3) on the same task with no new note, no changed files in the submission, and no state change, write `loop_suspected` and stop waking it for that task; the task appears under stuck (P05). The window is configurable and defaults conservative.
4. **Pause/resume.** `qagent pause [--agent A | --task N | --all]` and `qagent resume`. `meta.paused` (or a per-agent/per-task flag) is read by the supervisor before each turn and by `claimTask`, which refuses new claims while paused. The dashboard and TUI call the same functions (P09, P10). Every pause/resume writes an event with the operator's `--why` (P08).
5. **Cost on the main screen** is P05's `status` block; this proposal supplies the caps shown beside it ("$41.2 of $60").
6. Wire `constraints.maxRetries` into task creation, or remove the field (P15 decides).

## Cost

About 200 lines in `supervisor.ts` and core meta helpers, CLI commands, tests; Rust supervisor changes (about 120 lines) can follow once the TS design settles.

## Risk

- **Wrong stops:** a bad cost parse stops a good run. Mitigation: stop only on adapter-reported cost, tokens as the fallback, and always show why.
- **Stopping mid-turn:** the cap is checked between turns, so one turn can overshoot (a long turn may cost more than the remaining budget). State that the cap is a floor on the next-turn check, not a hard ceiling, unless a per-turn timeout and a per-turn token flag exist for the harness.
- **Pause scope:** pausing must not strand claims; leases remain, and expire through the normal path. Document that `resume` is the way out and that long pauses will see claims expire.
- **False positives on the loop guard:** research tasks may legitimately produce notes rarely. The guard counts turns without any observable change, and the threshold is per task type, default off for `research`.

## How it is verified

- Fake-harness test: a harness reporting $0.50 per turn with a $1.20 run cap stops after the third turn, writes `budget_exceeded`, status shows `paused`, and `resume` after `budget set --run-usd 5` continues.
- Test that with no cost reported and only a USD cap set, the UI states the cap is unenforceable rather than silently never firing.
- Loop-guard test: a fake harness that returns success with no change for 3 turns triggers `loop_suspected` and stops waking.
- Pause test: `claimTask` refuses while paused; `resume` restores it; events carry the reason.
- Benchmark: I12 is a slice; the benchmark runs with budgets set (a run that hits its cap is scored as-is), and metric 5 compares spend per accepted task between arms.
