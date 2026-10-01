# P01: Benchmark runner (`bench/`) and frozen task set

- **Edge or parity:** neither. It is the measuring instrument every other proposal needs for its before/after.
- **Cost:** M for the runner; the real cost is authoring 20 tasks, their validators and truth files.
- **Risk:** low for the code, medium for the numbers (validator leakage, vendor noise, run cost).
- **Targets:** TypeScript (`bench/` in ACS, plain Node, no dependency). Reads the shared SQLite file, so it measures a TS or a Rust bus alike.
- **Status:** proposed. Recommended first.
- **Depends on:** nothing. P05 improves the cost metric but is not required.

## Problem

Each picked proposal must ship "a green PR plus a before/after on the benchmark" (GOAL.md). No such benchmark exists in ACS. The only measuring code is a micro-probe that counts prepared statements (`scripts/v2-perf-probe.mjs:1-30`), and the smoke scripts assert behaviour, not outcomes (`scripts/v2-cli-smoke.mjs`, `scripts/v2-dashboard-smoke.mjs`). Without a runner, "cross-family review improves trust" and "budgets save money" stay opinions, and the thesis in GOAL.md cannot be tested.

## Evidence

- `scripts/` holds `init-workdir.sh`, `public-release-audit.mjs`, `v2-cli-smoke.mjs`, `v2-dashboard-smoke.mjs`, `v2-perf-probe.mjs`, and nothing that creates a roster, runs a task set or extracts outcome metrics (listing at ACS `6180f2d`).
- A deterministic stand-in agent exists: `src/fake-harness.ts` (86 lines) with a `fake` adapter (`src/adapters.ts`, `fake` entry), used by `tests/supervisor-v2.test.ts`. A runner can therefore test itself without vendor credentials.
- Everything the metrics need is already in the bus: `events` (actor, kind, entity, `data_json`, `ts_ms`; `src/core/db.ts:59-62`), task rows with `round`, `attempts`, `result_json`, `review_json` (`src/core/db.ts:36-50`).
- Cost is not task-level today: the `usage` table is never written (`src/core/db.ts:63`), and cumulative per-agent totals live in `<home>/sessions/<agent>.json` (`src/supervisor.ts:421-428`). P05 fixes that; until then the runner reports agent-level cost and says so.

## Change

Implement `proposals/benchmark.md` as code, in ACS:

1. `bench/MANIFEST.json`: `base_sha`, roster (model ids, harness and CLI versions, effort), arms, budgets, seed.
2. `bench/tasks/NN-slug.md`: the 20 tasks, verbatim from the spec, each with brief, acceptance, validator command, declared dependencies.
3. `bench/truth/`: the reconciled ground truth for the research tasks, kept outside any agent workdir.
4. `bench/run.mjs <arm> [--mini] [--fake]`: fresh `QAGENT_HOME`, fresh clone at `base_sha`, `qagent init`, agents from the roster, tasks and deps created, `qagent supervise --roster`, stop on all-terminal or cap, write `run.json` (start/end, caps, invalid-run reason).
5. `bench/extract.mjs <run>`: metrics 1-10 from the DB and git into `metrics.json` plus a one-screen `report.md` (medians and ranges across repetitions).
6. `bench/validate/`: frozen validators run in a clean checkout after the run.

No new dependency. The `--fake` mode swaps every harness for the fake adapter so CI can run the whole pipeline in under a minute and catch extractor regressions.

## Cost

About 600 lines of JavaScript plus the task and truth files. Authoring and cross-checking truth for R01-R06 is a day of human review; validators for I01-I14 are small scripts. One endurance run costs vendor money that is unknown until the first mini run measures tokens per task (benchmark spec says do not quote an estimate before then).

## Risk

- **Leaked validators:** if agents can read `bench/validate` or `bench/truth` the run is meaningless. The runner mounts only `bench/tasks/*.md` into the agents' workdir.
- **Noise:** two vendors, one run per arm. The spec requires reporting ranges and treating sub-10-point differences as noise at one repetition.
- **Staleness:** a task set pinned to `base_sha` ages. A new base starts a new series; old results stay.
- **Overfitting:** if proposals are tuned to these 20 tasks, results mislead. Keep a held-out set of 5 tasks, revealed only for milestone runs.

## How it is verified

- `node bench/run.mjs baseline --fake --mini` completes with all tasks accepted, and `extract.mjs` output equals a checked-in fixture (`bench/fixtures/fake-mini.metrics.json`).
- A mutation check: break one validator and one truth entry on purpose; the report must show the defect-escape rate and recall move.
- Dry-run extraction against a hand-built fixture bus where every metric has a known value.
- The first real mini run on the owner's machine is the acceptance test for the pipeline; its report is attached to the PR. Not runnable in a web session.
