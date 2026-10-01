# P08: Every consequential action records actor, purpose, authority and result

- **Edge or parity:** neither established. It is a manifesto gap ("every consequential action should have an identifiable actor, purpose, authority, and result"). Hermes records task events and per-attempt runs but I did not verify that it records purpose or authority (`hermes-delta.md` row 17, not verified). Treat as a possible edge only after P03 and P05 give it something to attribute.
- **Cost:** M.
- **Risk:** low-medium (event noise, privacy of reasons).
- **Targets:** both (`events` data shape and CLI flags); TypeScript first.
- **Status:** proposed.
- **Depends on:** nothing. P03 override reasons and P07 pause reasons use it.

## Problem

The event log has an actor and a kind but no purpose, no statement of what authority allowed the act, and no result for acts that failed. Refusals leave no trace at all: `write()` rolls back on a thrown `BusError`, so a denied review, a refused claim, or a rejected delegation is invisible afterwards. The manifesto asks that failed tools, stalled work and uncertain capabilities be visible.

## Evidence

- Schema: `events(seq, ts_ms, actor, kind, entity, entity_id, data_json, source)` (`src/core/db.ts:59-62`). No purpose, authority or result columns.
- Call sites record minimal data: `task_accepted` `{ round }` (`src/core/bus.ts:990`), `task_changes_requested` `{ round }` (`:1006`), `task_failed` `{ attempts, reason }` (`:1108`), `agent_added` `{ role, model, harness, parent, authority }` (`:259`). The event kinds written by core are about 20 (grep of `this.event(`).
- Authority exists on the actor (`actor.authority` is `operator`, `manager` or `worker`, `src/core/identity.ts`), and decisions branch on it (`src/core/bus.ts:980`, `:1042`, `:1072`, `:1093`, `:1127`), but the event does not say which branch allowed the act, for example "operator bypass".
- Denials: every `throw new BusError("forbidden"...)` path (for example `src/core/bus.ts:981-982`) happens inside `this.write(...)`, which rolls back, so no event survives.
- `trace` shows what happened, not why (`src/core/bus.ts:744`).

## Change

1. **Event envelope** (no schema change, stored in `data_json`): every mutating call may carry `purpose` (free text, bounded, from `--why` on the CLI and a `purpose` argument on the MCP tools), and core always adds `authority` (the actor's authority) and `basis` (a short code: `assignee`, `reviewer`, `creator`, `operator`, `operator_override`, `policy:<name>`). Operator actions that bypass a gate (review override P03, requeue, cancel of someone else's task, pause) require `--why`.
2. **Result:** successful acts already write their event; add `denied` events for refusals, written in a separate small transaction after the failed one rolls back: kind `denied`, data `{ attempted: <op>, code, message, taskId?, purpose? }`. Rate-limited per actor (for example 20 per minute) so a looping agent cannot flood the log.
3. **Uncertain or failed capability** (supervisor side): `harness_failed`, `budget_exceeded` and `loop_suspected` (P07), adapter parse failures (`malformed`) become events instead of log lines, carrying the harness id and exit code.
4. `qagent log --why` and `trace` show purpose, authority and result inline, one line per act; `qagent log --denied` lists refusals.
5. A test enumerates every `this.event(` kind and asserts the envelope contains `authority` and `basis`, so new code cannot skip it.

## Cost

About 150 lines TS: an `event()` wrapper that fills authority/basis, a `denied()` helper, flag plumbing in the CLI and MCP tools, rendering. Rust mirrors the data shape (about 150 lines). No migration.

## Risk

- **Purpose is self-reported.** An agent can write a false reason. It is attribution, not verification; do not present it as proof. The authority and basis fields are computed by the bus and are reliable.
- **Log growth and privacy:** purposes may contain sensitive text. Bound length (the existing `LIMITS` pattern) and keep the log local, as today.
- **Denial spam** is handled by the rate limit; also cap stored message length.
- **Behavioural friction:** making `--why` mandatory for operator overrides slows scripts. Limit it to the override cases listed.

## How it is verified

- Unit tests: a forbidden review leaves a `denied` event with code `forbidden`; an operator override without `--why` is refused; accepted review has `authority` and `basis`.
- Enumeration test over all event kinds (step 5).
- Denial rate limit test: 100 denied calls in a loop write at most 20 events.
- `trace` snapshot test includes purpose and result lines.
- Benchmark: I07 is a slice; the human audit sample (metric 7) grades whether a reviewer could reconstruct why each override and denial happened from the log alone.
