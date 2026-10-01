# P12: Consented self-improvement: retrospectives, reviewed changes, versioned and reversible

- **Edge or parity:** partly PARITY. Hermes agents create and patch skills, and a Curator prunes and consolidates agent-made skills, never auto-deletes, and supports rollback (`hermes-delta.md` row 9). The part Hermes does not show: improvements gated by a benchmark delta and a cross-family review, under a written consent policy, with a denylist that stops an agent expanding its own authority (not verified as absent in Hermes; unread parts listed in the delta).
- **Cost:** L.
- **Risk:** high (changes agent behaviour; easy to ship something that looks self-improving and is not).
- **Targets:** TypeScript (policy, versioning, tasks); Rust reads the same files for presets later.
- **Status:** proposed. Do last among the core ones.
- **Depends on:** P01 (the benchmark that decides), P03 (independent review of the change), P06 (versioned presets are the first target), P08 (accountability), P11 (retrospectives stored as memory).

## Problem

MANIFESTO: at the end of a run record what worked, what failed, why, and what could improve; turn proposed improvements into concrete evaluated changes; run only with the user's agreement or an explicit policy; version, evaluate, and allow rollback; and an agent proposing an improvement does not gain permission to expand its own authority. ACS has none of this: no retrospective, no versioned artifact an agent could improve, no policy file, no rollback.

## Evidence

- Nothing versioned exists to improve. Preset charters are constants in the Rust TUI (`rust/src/app.rs:179-258`) and `protocol/PROTOCOL.md` is a static block copied into agents' instruction files (`docs/FULL-GUIDE.md:327-337` per the delta); routing weights are config (`agent-bus.config.json` routing.weights) read only by the dead router (`src/router.ts:295`).
- The raw material for a retrospective is present: `trace` assembles a task's causal chain (`src/core/bus.ts:744`), review rounds and feedback are stored (`review_json`, `round`, `attempts`: `src/core/db.ts:36-50`), failures carry reasons (`src/core/bus.ts:1000`, `:1108`).
- Authority is a first-class concept the policy can protect: `operator|manager|worker` (`src/core/identity.ts`), permission booleans (`:97-125`), review policy (P03), budgets (P07), none of which an agent can change today because only the operator creates agents (`src/core/bus.ts:231-232`).
- The decision needs a measure: the benchmark spec (`benchmark.md`, P01) provides acceptance, defect escape, stuck minutes and cost for a before/after.

## Change

1. **Retrospective task.** At run end (all tasks terminal, or `qagent retro`), the bus creates a task of role `retro` for an agent whose family differs from the run's main implementers (P03). Input: the trace export (P05), review feedback, failures. Output: a structured note (worked, failed and why, suspected causes with evidence links to event seqs, and zero or more *change proposals*), written to memory (P11, scope project).
2. **Change proposal = reviewed task.** A proposal names a target artifact and carries a unified diff plus evidence. Allowed targets: preset charters (P06), the protocol block, routing/advisory settings (P04), a skills directory if one exists. **Denied by code, not by prompt:** permissions and authority, `review_policy`, budgets and caps, token files, the policy file itself, anything under `src/`.
3. **Consent policy** in `<home>/improvement.json`: `mode: off | ask | auto-within-policy` (default `ask`), allowed targets, `requireBenchmark` (default true) with a minimum improvement threshold, a limit on changes per week, and the review rule (cross-family required by default). `ask` means each change waits for the operator's `qagent improve accept <id>`. `auto-within-policy` applies a change only when every condition holds and still records an event with the policy version used.
4. **Evaluation:** `qagent improve eval <id>` runs the mini benchmark (P01) for the baseline artifact version and the candidate, in a scratch home. A change is kept only if the stated metric improves by the threshold and the defect-escape rate does not worsen. One run is not a result: require the benchmark's repetition rule or mark the decision "inconclusive, not applied".
5. **Versioning and rollback:** artifacts live at `<home>/versions/<kind>/<id>/vN.json` with a `current` pointer file; applying moves the pointer, writes an event, and records `preset: id@version` on later task outcomes (P06). `qagent improve rollback <kind> <id> [--to N]` moves the pointer back and writes an event. Old versions are never deleted.
6. **Visibility:** `status` shows pending proposals (needs-me), and each applied change links to its evidence and benchmark report.

## Cost

Large: about 600 lines TS (policy, versions, retro task, eval driver), a retro charter, tests, and benchmark time for evaluations. Needs P01 and P03 to exist or the evaluation and independence claims are empty.

## Risk

- **Looks like self-improvement but is noise.** With few tasks and two vendors, benchmark deltas are within run-to-run variance. The threshold, repetition and "inconclusive" outcome exist for this; expect most changes to be inconclusive and say so.
- **Goodhart on the benchmark:** charters tuned to the 20 tasks. Use the held-out set (P01) for the decision.
- **Authority creep:** the denylist is the key control. It needs a test that enumerates every writable path an improvement can touch and fails if a new path is added without an explicit decision.
- **Cost:** an evaluation run costs real money. `eval` shows the estimate from earlier runs and requires a budget (P07).
- **Consent drift:** `auto-within-policy` is a standing permission; policy edits are operator-only and logged.

## How it is verified

- Unit tests: a proposal touching a denied target is refused; `ask` mode never applies without accept; `auto-within-policy` applies only when all conditions hold; rollback restores the previous bytes exactly.
- Authority test: an improvement task run by a worker cannot modify permissions, policy, budgets or review policy through any CLI, MCP or file path.
- Eval test with the fake harness: a candidate that is better on the fixture task set is kept, one that is worse is not, one within noise is "inconclusive".
- End to end on the owner's machine: one real retro on a finished benchmark run, one change proposed, accepted by the operator, evaluated, and rolled back, with the event trail attached to the PR.
