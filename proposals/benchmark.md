# Benchmark spec: ACS endurance run (north-star) and mini run (per-proposal)

Status: spec only. Nothing here has been run. Every number a proposal quotes later must come from a run of this spec; no figures in this file are results.

Frozen on 2026-10-01. Runs on a real machine with vendor CLIs and credentials, never in a web session.

## What it measures and why

MANIFESTO: research comes first, the result must be reviewable, autonomy stays accountable, scale must not break coordination. The benchmark therefore scores (1) whether unattended work is accepted by a reviewer who is not the author, (2) how much human attention and waiting it costs, (3) what it costs in money, and (4) for research tasks, whether claims carry evidence. It also tests the proposed thesis (GOAL.md): *cross-family review makes accepted work more trustworthy*. That is a hypothesis; arm B below exists to test it, and the result may be negative.

## Two sizes

| Run | Tasks | Wall clock | Used for |
|---|---|---|---|
| **Endurance** (north-star) | N = 20 (14 implementation, 6 research) | >= 8 h unattended | The headline comparison; run at milestones |
| **Mini** | N = 8 (subset marked `M` below: 5 implementation, 3 research) | <= 2 h | The before/after every picked proposal carries in its PR |

Both use the same task files, validators and metric extraction.

## Fixed inputs

- **Target repo state:** `anon5376/agent-communication-system` at a frozen commit, recorded in `bench/MANIFEST.json` as `base_sha`. Candidate: the merge commit of PR #17 (worktrees) on `main`, because every arm needs isolation to be fair. Do not move the base once a run series starts; a new base is a new series.
- **Task set:** the 20 tasks below, stored verbatim as files under `bench/tasks/NN-slug.md` in ACS with `base_sha` pinned. Each task file holds the brief, the acceptance statement and the validator command. Task text is never edited between arms.
- **Roster (2 vendors minimum):** one manager/planner and four workers drawn from at least two model families, plus one reviewer slot per family. Default: Anthropic (Claude Code harness) and OpenAI (Codex harness); optional third: Google (Gemini CLI). The exact model ids, harness versions, effort settings and CLI versions are recorded in `MANIFEST.json`. The roster is identical across arms; only the policy under test changes.
- **Budgets:** per-run hard cap in USD (operator sets, recorded; suggested default 60 USD for endurance, 12 USD for mini) and a per-task wall-clock cap of 45 min. A run that hits the cap stops and is scored as-is with the cause recorded; it is not re-run.
- **Operator:** one human, on call but not intervening unless the system asks (an `escalate` message, a permission prompt). Every touch is logged (metric 5).
- **Repetitions:** endurance: 1 run per arm minimum, 3 preferred; mini: 3 per arm. Report each run; report the median and the range, never a best run. Two vendors' sampling makes single runs noisy; with 1 run per arm differences under 10 points of acceptance rate are not claims.

## Arms

- **A. Baseline (today):** ACS `main` + PR #17, review gate as shipped (blocks only assignee == reviewer, `src/core/bus.ts:982`), reviewer chosen by the manager as today.
- **B. Cross-family enforced:** same code plus the review invariant (proposal P03) in `enforce` mode, same roster.
- **C. (optional, external reference) Hermes Kanban:** the same task briefs entered into Hermes's board with profiles mapped to the same models, default review settings. Run only if Hermes is installable on the machine; record its commit and config. This is a reference point, not a contest of equals (different tools, different harness), so report it separately and never fold it into A/B deltas.
- Proposals under test add arms (`B+P04`, etc.); a proposal PR reports A vs its arm on the mini run.

Baseline procedure for every arm: fresh bus (`QAGENT_HOME` temp dir), fresh clone at `base_sha`, `qagent init`, add agents from the roster, create the 20 (or 8) tasks with the declared dependencies, start `qagent supervise --roster`, start the clock. The human does nothing except what is logged. Stop when all tasks are terminal (`accepted`, `failed`, `cancelled`) or the cap hits.

## Task list (N = 20; `M` = in the mini subset)

Implementation tasks. Each is a real item from ACS's backlog or from this proposal set, sized to one agent for 20-45 min, with a validator that a script can run at the base commit (red) and after a correct change (green).

| # | Task | Validator (red at base) | M |
|---|---|---|---|
| I01 | Fix README install line so it does not point at an unpublished package (Q01) | `scripts/check-readme-install.mjs` fails while README contains `npm install -g agent-communication-system` and the package 404s | M |
| I02 | Replace hard `<500 ms` latency asserts in `tests/wait-notify.test.ts` with a bounded-retry measurement (Q03) | test passes 20x in a row under `taskset -c 0` load; no skipped test | |
| I03 | `qagent status` lists stalled claims and unread-by-operator count (P05 slice) | `status --format json` has `stalled` array; red: key absent | M |
| I04 | Write the `usage` table from supervisor turns (P05 slice) | after a fake-harness turn `SELECT count(*) FROM usage` is 1; red: 0 | |
| I05 | Enforce `maxConcurrentTasks` in `claimTask` (P06 slice) | claiming a 5th task as one agent with limit 4 throws `conflict`; red: succeeds | M |
| I06 | Enforce `canDelegate=false` in `createTask` for workers with a clear error (P06 slice) | test; red: succeeds | |
| I07 | `qagent log --task N --format json` includes `purpose` and `authority` fields on every task event (P08 slice) | schema check on output; red: fields absent | |
| I08 | Add `kill -9` supervisor+worker recovery test (P05) | test exists and passes; red: no such test | |
| I09 | Port the Rust PRESETS charters (`rust/src/app.rs`) to a TS `presets.ts` with a loader (P06 slice) | `qagent preset list` prints 4 presets; red: unknown command | |
| I10 | `qagent status` reports every open task, not a silent first 200 (`src/core/bus.ts:1147`) (P14 slice) | bus with 250 open tasks: `status --format json` `openTasks` + `openTaskCount` agree on 250; red: array length 200 and no count | M |
| I11 | Add `qagent export --format html` bus-wide self-contained report (P05 slice) | file opens, contains all task ids, no external URL (grep) | |
| I12 | Add a run budget and a refusal path: the supervisor refuses to start a turn when the run cost cap is exceeded (P07 slice) | fake-harness run with cap 0.01 stops with a `budget_exceeded` event; red: never stops | M |
| I13 | `qagent trust` prints accepted/total per (model family, task type) from review events (P04 slice) | output matches a hand-computed fixture bus; red: unknown command | |
| I14 | Dashboard: add `/api/tasks/tree` JSON (parent_id tree with states) and a text rendering test (P10 slice) | schema test; red: 404 | M |

Research tasks. Ground truth is checkable in the repo at `base_sha`, so scoring does not depend on a model's opinion. Each answer is a short report with claims; each claim needs an evidence link (file:line, command output, or a primary-source URL for external facts).

| # | Question | Checkable ground truth | M |
|---|---|---|---|
| R01 | Which declared config fields are never read outside `validateConfig`? | list from `grep` across `src/`; includes `maxConcurrentTasks`, `allowedChildAgentIds`, `optionalTokenBudget`, `optionalApiCostBudgetUSD` | M |
| R02 | What breaks if `agents` gets a `family` column: which code paths in TS and Rust read `agents` rows? | list of SELECT/INSERT sites in `src/core/bus.ts`, `rust/src/*.rs` | M |
| R03 | Per `qagent` CLI command and MCP tool: which are missing in the Rust port? | diff of command tables; verified by running both binaries' `--help` | |
| R04 | Where does the dashboard re-query while idle, and how often? (measure) | measured read count over 60 s with no writes matches `DashboardStats` | |
| R05 | Which of the 12 findings in the PR #17 review still reproduce on the merged code? | reproduce each with a script; reviewer checks scripts | M |
| R06 | Which public claims in README/docs are not backed by the code at `base_sha`? | seeded list of known items (Q01 to Q05 in `proposals/`); score recall and precision | |

Authoring rule: before the first run a second person (or a different model family than any roster agent) re-derives the ground truth for R01-R06 independently and the two lists are reconciled; the reconciled list is frozen in `bench/truth/`.

## Metrics (all extracted from `bus.db` and git after the run; no self-reports)

1. **Acceptance rate** = tasks in `accepted` / N. Also first-round acceptance (accepted at `round = 1`).
2. **Cross-family acceptance rate** = accepted tasks whose accepting reviewer's family differs from the assignee's, / N. In arm A this is whatever happened by chance; in arm B it equals the acceptance rate by construction, so report arm A's value as the baseline, not a comparison. Also **independent-check yield**: of tasks the reviewer rejected in arm B that arm A's reviewer had accepted (matched by task id and similar diff), how many a human later judges as truly defective (see 7).
3. **Minutes stuck** = for each task, the sum of time in `claimed` with no `task_note`/event from its assignee for >= 10 min, plus time in `open` with a runnable agent idle. Computed from `events` timestamps (`task_claimed`, `task_note`, `claim_expired`, `task_retry`). Report total and the longest single stall.
4. **Human touches** = count of operator-authored events (`actor = operator`) after the start event, plus every manual terminal action recorded in the run log. Zero is the target.
5. **Cost** = USD and tokens. Today usage is not in the DB (the `usage` table in `src/core/db.ts:63` is never written; cumulative per-agent totals are only in `<home>/sessions/<agent>.json`, `src/supervisor.ts:421-424`). Until P05 lands, extract from those files and report as agent-level, not task-level, with that limitation stated.
6. **Defect escape rate (implementation)** = accepted tasks whose validator (frozen, hidden from agents) fails on the merged result / accepted tasks. This is the check that acceptance means something. Validators run after the run on the final integrated branch, in a clean checkout.
7. **Human audit sample:** after the run a human grades 8 randomly chosen accepted tasks (seeded, same seed per series) as correct / partly / wrong, blind to arm. Report agreement with the validator.
8. **Research tasks:** per task, (a) claims with a working evidence link / total claims, (b) factual precision and recall against `bench/truth/`, (c) unresolved questions listed explicitly (count, and whether each is genuinely unresolved per the grader), (d) for failed tasks, whether the failure reason in the task record matches the true cause.
9. **Coordination overhead:** messages and turns per accepted task; share of tokens spent on coordination (manager, review, mail) vs. work.
10. **Collisions:** tasks that touched files outside their declared scope, merge conflicts at integration, tasks invalidated by another's accepted change.

Headline table: A vs B (and each proposal arm) for metrics 1-6, medians over repetitions, with the ranges.

## Scoring rules and guards against self-deception

- Validators and truth files live outside the agents' reach (a separate checkout the roster cannot read); the supervisor workdir has only `bench/tasks/*.md`.
- No task is retried by the operator. Stuck work stays stuck and is scored.
- A run with an infrastructure fault (network down, vendor outage > 10 min, host reboot) is marked `invalid` with the reason and repeated; it is never dropped silently and invalid runs are listed in the report.
- Compare arms only within the same series: same `base_sha`, same task set, same roster and CLI versions, interleaved in time where possible (A, B, A, B) to spread vendor drift.
- Report negative results. If arm B does not beat arm A on metric 6, the thesis is not supported by this run, and the proposals that rely on it get re-ranked.

## Scale sub-benchmark (for proposal P14)

Same mini task set replicated with the fake harness (`src/fake-harness.ts`, no vendor cost) at 2, 8 and 32 agents on one machine. Measure: wall clock to all-terminal, claims lost to contention, `SQLITE_BUSY` retries, lease conflicts, messages per task, p95 time from `task_created` to `task_claimed`. This needs no credentials and can run in CI as a trend check; it measures coordination cost only, not model quality.

## Local small model sub-benchmark (for proposal P16)

Take the research tasks R01-R06 and the three cheapest implementation tasks (I01, I02, I09). Run each with a small local model (via Ollama or the OpenAI-compatible harness already in `src/openai-compatible-harness.ts`) as the worker and a frontier model as the reviewer, versus frontier-only. Report accepted/N, minutes, and cost (local = 0 USD but record wall clock and GPU/CPU hardware). Candidate subtasks to carve out later (not part of the first run): summarising logs, drafting commit messages, running the validator and reporting its output.

## What must be built before the first run

1. `bench/` in ACS: `MANIFEST.json`, `tasks/`, `truth/`, `run.mjs` (create bus, tasks, roster; start supervisors; stop on terminal or cap), `extract.mjs` (metrics 1-10 from the DB and git), `validate/` (frozen validators). Dependency-free Node, like the rest of ACS.
2. A fake-harness mode that makes `run.mjs` testable without credentials (it already exists for the supervisor tests).
3. The first run happens on the owner's machine; the session that prepares it states what was not run.

Estimated cost of one endurance run per arm: unknown until the first mini run measures tokens per task. Do not quote an estimate before then.
