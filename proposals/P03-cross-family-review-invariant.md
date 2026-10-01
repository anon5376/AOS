# P03: Cross-family review as a core invariant

- **Edge or parity:** EDGE, as a hypothesis. Hermes Kanban defaults to re-running the implementing profile as reviewer and has no family rule (`hermes-delta.md` row 4a, re-checked). No data in either repo yet shows that cross-family review catches more defects. The benchmark decides.
- **Cost:** M.
- **Risk:** medium. A single-vendor user can be blocked; "family" is a proxy for independence, not a guarantee.
- **Targets:** both implementations (core review path in `src/core/bus.ts` and `rust/src/bus.rs`).
- **Status:** proposed.
- **Depends on:** P02 (schema change). Pairs with P04. Measured by P01 arm B.

## Problem

AGENTS.md says "no model grades its own work" is the thesis. Today the bus does not enforce it. The gate stops only the assignee's own agent id from reviewing. Two Claude agents can review each other, and the operator can bypass the gate silently. Family-diverse routing exists, but only tests reach it.

## Evidence

- Review gate: `src/core/bus.ts:979-982`. Line 981 allows review only by the task's reviewer or the operator; line 982 blocks only `actor.agentId === task.assignee`, and both checks are skipped for `actor.authority === "operator"`. Rust is the same: `rust/src/bus.rs:1883-1888`, test `rust/tests/bus_tests.rs:239-242`.
- The reviewer defaults to the task creator (`src/core/bus.ts:957` and `:979`, `task.reviewer ?? task.creator`), so a manager of the same family as the worker reviews by default.
- The bus does not know an agent's family. `agents` has `model` and `harness` as free text (`src/core/db.ts:15-19`); `addAgent` stores whatever string is given (`src/core/bus.ts:231-259`). The only family data is the config's `ModelDefinition.family` (`src/config.ts:81`) and import metadata (`src/core/import.ts:243`).
- The policy code exists and is dead in production: `independentFamilyReview` on role `reviewer` (`src/provider-catalog.ts:300`), enforced only inside `routeTask` (`src/router.ts:262-266`, `:295`), which is imported only by `tests/router.test.ts` and `tests/discover.test.ts`. `permittedFamilies` is likewise router-only (`src/router.ts:179`).
- Rust has no router at all and no family concept (scan of `rust-port` `c6df26b`).

## Why V2 removed the router, and what is different here

V2 made the coordination path a small library over one SQLite file with no process whose absence stops agents from talking (`docs/architecture.md:3`). The router was part of the old broker: it scored candidates with ten weights using in-memory state plus `runs`, `routing_decisions` and `telemetry` tables, all dropped (`docs/V2-DESIGN.md:7`, `:118`, "routing moves to the supervisor"; `docs/architecture.md:53`, "the router in the coordination path"). Scoring was hard to explain from the event log and tied core to supervisor-side configuration.

This proposal does not bring the router back. It adds one boolean predicate over two strings already in the database (reviewer family differs from assignee family), evaluated inside the existing `BEGIN IMMEDIATE` write transaction, with no weights, no telemetry table and no new process. Routing by observed results is separate, advisory and outside core (P04).

## Change

1. Migration 002 (P02): `agents.family TEXT NOT NULL DEFAULT ''`. `qagent agent add --model M [--family F]` fills it: explicit `--family` wins, else a prefix lookup in `schema/families.json` (plain data shared by both implementations: `claude*`→anthropic, `gpt*`/`o*`/`codex*`→openai, `gemini*`→google, `kimi*`→moonshot, `grok*`→xai, `qwen*`, `llama*`, `mistral*`, `deepseek*`). Unknown stays empty and is flagged by `qagent doctor`.
2. `meta.review_policy` in {`off`, `warn`, `enforce`}; default `warn` until the benchmark supports flipping the default. Per task, `--independent` forces enforcement for that task.
3. `reviewTask`: under `enforce`, refuse when reviewer family equals assignee family or either is unknown (`forbidden`, message says which and how to fix). Under `warn`, accept and record `family_match: true` in the event data.
4. Reviewer selection at submit (`submitTask`, `src/core/bus.ts:933-972`): when the default reviewer (the creator) shares the assignee's family and policy is `enforce`, choose another agent with `canReview` and a different family (least recently assigned, ties by id) and send the `[DONE]` message there. None eligible: the task stays `submitted`, an event `review_unroutable` is written, and P05 shows it under needs-me.
5. Operator override stays, but loud: `qagent task review --override-reason "..."` is required to bypass `enforce`, and writes a `review_override` event carrying the reason. This also serves P08.
6. `qagent doctor` warns when the roster has fewer than two families while policy is `enforce`.
7. Mirror in Rust `bus.rs` and `cli.rs`; keep both on `schema/families.json`.

## Cost

About 120 lines of core TS, 120 lines Rust, a CLI flag each, migration, shared JSON, tests, CHANGELOG. Extra CI minutes from the interop script cases.

## Risk

- **Single-family teams are blocked.** Mitigated by `warn` default, the `doctor` warning, and the `off` setting. Document it: on a one-vendor roster this feature does nothing useful.
- **Family is a proxy.** Two vendors can serve the same base model (for example through a router service); one family can contain very different models. State this limit in docs. Do not claim "independent" beyond "different family label".
- **Reviewer scarcity:** with one reviewer of the other family, work queues. The benchmark records minutes stuck; if enforce raises it, the policy is not free.
- **Theatre risk:** a different family may rubber-stamp. P04 and the defect-escape metric (benchmark metric 6) exist to detect that.

## How it is verified

- Unit tests (TS `tests/core-bus.test.ts`, Rust `rust/tests/bus_tests.rs`): same family refused under enforce, allowed under warn with `family_match` recorded, unknown family refused, override requires a reason and writes `review_override`, `review_unroutable` when no eligible reviewer, self-review still blocked.
- Interop: TS submits, Rust reviews with a same-family agent: refused; and the reverse (`scripts/v2-interop-smoke.mjs`, extended per P02).
- Benchmark (P01): arm B vs arm A on the mini run, then the endurance run. Report acceptance rate, cross-family acceptance rate, minutes stuck, and defect escape rate. If B does not lower defect escape or raises minutes stuck without payoff, the thesis is not supported and P04's routing claims are re-ranked.
