# P04: Verdict ledger and explained, advisory routing

- **Edge or parity:** EDGE candidate, conditional on P03. Hermes does not weight review verdicts or learn routing from them (`hermes-delta.md` row 4a: no verdict aggregation, one reviewer's verdict is final).
- **Cost:** M.
- **Risk:** medium-high for validity (small samples, feedback loops, acceptance is not correctness).
- **Targets:** TypeScript first (`qagent trust`, advisory routing in supervisor/CLI), Rust reads the same events for the TUI later (P09).
- **Status:** proposed.
- **Depends on:** P03 (families recorded on events), P01 (calibration against validator results).

## Problem

AGENTS.md item 1 asks for verdicts to feed per-model, per-task-type trust that the operator sees and that routing uses, with explanations such as "routed to X: 14/16 accepted by a different family on refactors". Verdicts exist but nothing aggregates them, and the scoring code that could consume them is not in the shipped path.

## Evidence

- Verdicts are already persisted: accept/revise events and `tasks.review_json` with reviewer, `accepted`, feedback (`src/core/bus.ts:979-1005`; event kinds `task_accepted`, `task_changes_requested`, `task_failed`).
- The events carry only `{ round }` (`src/core/bus.ts:990`, `:1000`, `:1006`). They omit reviewer family, assignee family and task role, so no per-family statistic can be computed from the log after the fact.
- The router already has the right shape of input and is unused: `observedSuccess`, `observedLatency`, `familyDiversity` weights (`agent-bus.config.json` routing.weights) and `reviewRejectedCount` telemetry (`src/router.ts:33`, `:221`), fed by a `telemetry` table that V2 dropped (`docs/V2-DESIGN.md:118`). `routeTask` is called only from tests (`src/router.ts:295`).
- `qagent status` shows counts by state and open tasks only (`src/core/bus.ts:1144-1148`); there is no per-model view.

## Why V2 removed the router, and what is different here

See P03 for the reasons (broker-era in-memory state, `routing_decisions` and `telemetry` tables, weights that the event log cannot explain). Here nothing is stored outside `events`. The ledger is a read-only aggregation over events (P03 adds family and role to the event data). Routing stays out of the coordination path: it is a suggestion computed on demand (`qagent route suggest <task>`) and, only if the operator sets `routing.mode=auto`, used by the supervisor when it picks which idle agent to wake for an unassigned task. `claimTask` and `reviewTask` in core never consult it.

## Change

1. Enrich review events (no schema change): add `reviewer`, `assignee`, `reviewerFamily`, `assigneeFamily`, `role`, `round` to `task_accepted`, `task_changes_requested`, `task_failed` data (`src/core/bus.ts` and `rust/src/bus.rs`).
2. `qagent trust [--by family|model|role] [--since D] [--format json]` aggregates: for each (assignee model, task role) the accepted/total, the same restricted to different-family reviewers, first-round acceptance, mean rounds, with n and a Wilson interval. A cell with n < 10 is shown as "insufficient data" and never used for routing.
3. Calibration: `qagent trust --calibrate <bench run>` joins acceptance with the benchmark's frozen validator results (P01 metric 6) so the operator sees acceptance rate next to defect-escape rate. This is the guard against "reviewers accept things that fail".
4. `qagent route suggest <task-id>`: reuse `routeTask` scoring from `src/router.ts` with `telemetry` built from the ledger instead of the dropped table; print the reason string with evidence, e.g. "claude-code: 14/16 accepted by a different family on refactors (88%, CI 64-97%), median 2.0 rounds". Keep a fixed exploration share (default 10%) so a model with no history still gets work.
5. Explanation is part of the output, not a log line: every routed decision writes a `route_decision` event with the evidence snapshot, so the operator can audit it (P08).

## Cost

Event enrichment is a few lines on each side; the aggregation is one SQL query with `json_extract`; the CLI view and `route suggest` reuse `router.ts`. No new table, no new process, no dependency (the interval is 6 lines of arithmetic).

## Risk

- **Acceptance is not correctness.** A lenient reviewer inflates trust. The calibration column and the benchmark's hidden validators are the check; without them the numbers must carry a warning.
- **Small n.** Per-model, per-task-type cells fill slowly. Hence the n threshold and the interval; do not route on thin cells.
- **Feedback loop:** routing to whoever has the best record starves others of data. Exploration share is mandatory.
- **Goodhart:** agents that see their own trust score may optimise for acceptance. Do not put the score in the agent brief.
- **Config sprawl:** this must not revive the ten-weight vector. Start with one signal (cross-family acceptance); add others only when the benchmark shows they help.

## How it is verified

- Unit test with a hand-built bus (fixture of 40 reviews across two families and three roles): `qagent trust` equals precomputed values; cells under n=10 print "insufficient data".
- Test that `route suggest` never selects on an insufficient cell and honours the exploration share (seeded).
- Core purity: grep test that `src/core/` does not import `router.ts`.
- Benchmark: arm `B+P04` against arm B on the mini run; report acceptance, defect escape, and cost. If routing by ledger does not beat manager-chosen routing, drop `routing.mode=auto` and keep the read-only ledger.
