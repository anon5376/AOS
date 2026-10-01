# Proposals: Phase 1 scan of ACS against the manifesto

Written 2026-10-01 from ACS `main` at `6180f2d`, `rust-port` at `c6df26b`, PR #17 at `4bef680`, and Hermes Agent at `e8c97320`. Nothing here was built or run; every claim is read from code or docs, with `file:line` in each proposal. Where a claim rests on a grep for absence, the proposal says so.

**Pick by commenting on the PR (or this file), for example "P03 and P05, in that order". Each picked proposal then gets its own `/goal`: a green PR in ACS plus a before/after on `benchmark.md`.**

## Quick fixes (claims the code does not back; text-only, do together)

| Id | Title | Edge or parity | Cost | Risk | Status |
|---|---|---|---|---|---|
| [Q01](Q01-readme-install-and-first-release-claim.md) | README installs a package that is not on npm; CHANGELOG calls 0.2.0 a public release | n/a (claim) | S | low | proposed |
| [Q02](Q02-independent-review-wording.md) | "Independent review" wording while the gate blocks only self-review | n/a (claim) | S | low | proposed |
| [Q03](Q03-wait-notify-timing-flake.md) | Hard `<500 ms` asserts in `tests/wait-notify.test.ts` | n/a (reliability) | S | low | proposed |
| [Q04](Q04-readme-tui-and-adapter-claims.md) | README on `main` shows a TUI that exists only on `rust-port`; adapter list is wrong | n/a (claim) | S | low | proposed |
| [Q05](Q05-competitive-analysis-refresh.md) | Competitive analysis has no Hermes and quotes stale figures | n/a (stale) | S | low | proposed |

## Ranked proposals

Order is the recommended build order (value toward the goal, then dependencies). Ids are stable names, not ranks. Cost: S under about 100 changed lines, M about 100 to 800, L more than 800 or several PRs. Edge means a hypothesis to be tested on the benchmark, never a shipped claim; PARITY means Hermes Kanban has it today and it is table stakes.

| Rank | Id | Title | Edge or parity | Cost | Risk | Status | Needs |
|---|---|---|---|---|---|---|---|
| 1 | [P01](P01-benchmark-runner.md) | Benchmark runner and frozen task set | enabler | M | low | proposed | none |
| 2 | [P02](P02-schema-migrations-and-guard.md) | Numbered migrations; TS/Rust schema guard; merge `main` into `rust-port` | enabler | M | medium | proposed | none |
| 3 | [P03](P03-cross-family-review-invariant.md) | Cross-family review as a core invariant | EDGE (hypothesis) | M | medium | proposed | P02 |
| 4 | [P05](P05-trust-you-can-see.md) | Stuck, needs-me and cost on one screen; usage recorded; kill -9 test; export | PARITY | M | low | proposed | none |
| 5 | [P06](P06-enforced-hierarchy-and-presets.md) | Enforce delegation limits in core; versioned presets in TS | PARITY (foundation) | M | medium | proposed | none |
| 6 | [P07](P07-budgets-loop-guards-pause.md) | Enforced budgets, loop guards, pause/resume | PARITY on guards; USD cap unproven edge | M | medium | proposed | P05 |
| 7 | [P04](P04-verdict-ledger-and-trust.md) | Verdict ledger and explained, advisory routing | EDGE (hypothesis) | M | medium-high | proposed | P03, P01 |
| 8 | [P08](P08-accountable-actions.md) | Actor, purpose, authority, result on every consequential action | manifesto gap | M | low-medium | proposed | none |
| 9 | [P09](P09-tui-to-the-bars.md) | `acs` TUI to the UX bars (stuck/needs-me/cost, 80x24, idle redraw, seq links) | PARITY | M | medium | proposed | P02, P05 |
| 10 | [P10](P10-dashboard-views-and-design-amendment.md) | Dashboard tree, board, timeline, controls; DESIGN.md amendment | PARITY on board | L | medium-high | proposed | P05, P07, P08 |
| 11 | [P15](P15-configuration-surface-and-harness-slot.md) | Knob audit, approval posture, auth statement, native-harness contract | PARITY on breadth | M | low-medium | proposed | P06, P07 |
| 12 | [P14](P14-scale-ownership-aggregation.md) | Read scopes and stale-input detection, subtree aggregation, coordination cost at 2/8/32 | PARITY (worktrees); two narrow hypotheses | L | medium | proposed | P02, P01, P05 |
| 13 | [P11](P11-bounded-attributable-memory.md) | Inspectable, attributable, bounded memory per project and thread | PARITY (gap) | M | medium-high | proposed | P02, P08 |
| 14 | [P12](P12-consented-self-improvement.md) | Retrospectives and reviewed, versioned, reversible improvements under a consent policy | partly PARITY; gate by benchmark is the difference | L | high | proposed | P01, P03, P06, P08, P11 |
| 15 | [P13](P13-self-organizing-planner.md) | Planner proposes roles, prompts and hierarchy; asks the human | PARITY (decomposer) | L | high | proposed | P06, P03, P07 |
| 16 | [P16](P16-small-local-models-evaluation.md) | Evaluate small local models on bounded subtasks | unknown | S | low | proposed | P01, P05 |

### Why this order

- **P01 first** because every other item must show a before/after, and the thesis in GOAL.md ("review has teeth only if no model grades its own work") is only a hypothesis until a run can reject it.
- **P02 before anything that touches the schema.** Neither implementation can migrate or refuse a newer database today (`src/core/db.ts:99-131`, `rust/src/db.rs:176-195`), and `rust-port` is 60 commits behind `main`.
- **P03 is the one place a differentiated edge is plausible and untested.** Hermes defaults to re-running the implementing profile as reviewer and has no family rule (`hermes-delta.md`, row 4a). The same Hermes docs say non-Hermes CLI lanes are "not yet a paved path", which is why a bus under mixed vendors is where cross-family review is natural. P04 builds on it and is the most speculative of the edge items.
- **P05, P06, P07 are parity work** and are labelled so. They are cheap relative to value because the pieces (stall detection, usage parsing, declared limits) already exist and are not wired.
- **P12 and P13 last among the core items:** they rely on the benchmark, review independence, versioned presets and accountability being in place, and they are where "self-improving" can become a slogan without evidence.

### Suggested first goals

1. Q01-Q05 as one text-only PR.
2. P01 (benchmark) and P02 (schema guard), in parallel; they touch different files.
3. P03 then P05, then run the mini benchmark: arm A vs arm B.

## Companion documents

- [`benchmark.md`](benchmark.md): the endurance (N = 20) and mini (N = 8) specs, arms, metrics, scoring and guards. Spec only; no results.
- [`hermes-delta.md`](hermes-delta.md): dated comparison with Hermes Agent from a git clone (commit hash recorded), with a re-check log.

## Defaults I assumed (reversible; say if wrong)

- TypeScript is canonical; Rust on `rust-port` stays schema-compatible and is never proposed for deletion. Each proposal says which implementation it targets.
- The owner's other two orchestration repos are not prior art.
- `MANIFESTO.md` governs what the surfaces must show and do; `DESIGN.md` governs visual language only (P10 proposes the amendment, it does not apply it).
- PR #17 (worktrees) is treated as landing; no proposal proposes worktrees, and P14 builds on top of them.
- Cross-family review is a hypothesis to test. If arm B in the benchmark does not beat arm A on defect escape, P03 stays optional and P04 is demoted.

## Design

How the operator sees and drives AOS. Specs only; each names the proposals that would ship its parts. Prototype: https://claude.ai/artifact/JKLMqiCekJFcktsit2kcMw (fixture data, source in `assets/D01-prototype/`).

| Id | Title | Builds on | Status |
|---|---|---|---|
| [D01](D01-cli-tui-dashboard-design.md) | One console for AOS on Accelerate: one read model, eight lenses (now, tree, board, graph, timeline, agents, memory, config), one verb set, one command grammar | P05, P06, P07, P08, P09, P10, P11, P15 | proposed |
| [D02](D02-terminal-on-accelerate.md) | The terminal console on Accelerate: colour roles and tiers, lime budget, layouts from 80x24, glyphs, keys, idle redraw | D01, P09 | proposed |
| [D03](D03-dashboard-on-accelerate.md) | The dashboard on Accelerate: shell, lens components, inspector, palette, one verb endpoint, self-hosted fonts under the CSP | D01, P10 | proposed |

## Considered and not proposed

- A chat-wrapper TUI, KPI tiles, gradients, ornamental dashboards (AGENTS.md "slop traps"). P09 and P10 keep every number tied to a list and a seq.
- A messaging gateway before trust works; a plugin marketplace; a landing-page rewrite; SKILL.md editing that only mirrors Hermes.
- A2A or ACP transports now. If interop is wanted, a localhost `POST /tasks` bridge is the likely first step; nobody has asked for it, and it belongs after P03 and P05.
- Sharding the bus by project. P14 measures the single-writer ceiling first; if it binds, that becomes its own proposal.
- Anything that adds a dependency. None of these needs one; adding one needs the owner's word.

## What this scan did not do

- No code was run in ACS or Hermes. Rust behaviour on review/claim was compared by reading, not diffing, for the claim code beyond the gate lines cited.
- Hermes absence claims (no cross-family rule, no USD budget cap, no `reviewer != assignee` check) are repo-wide greps, not proofs.
- No install weight, cold start or memory figures were measured for either product.
- No competitor star counts were re-fetched; the one figure in `hermes-delta.md` comes from the AOS PR #1 review.
- Web access: no approval prompt appeared during this run. Hermes and ACS were read from git clones; the npm registry check (404) was a single HTTPS request.
