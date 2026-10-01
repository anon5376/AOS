# P13: Planner that proposes roles, prompts and a hierarchy from a goal and its documents

- **Edge or parity:** PARITY at the decomposition level, EDGE only if proven. Hermes has a triage decomposer that fans a card into a child graph and routes by profile descriptions through an auxiliary model (`hermes-delta.md` row 1, row 5; `kanban.md:800-808`). The manifesto's version goes further: propose the *roles and hierarchy themselves*, mix persistent and per-task roles, and ask the human on consequential uncertainty. Whether that beats a fixed roster is unmeasured; the benchmark decides.
- **Cost:** L.
- **Risk:** high (an LLM-designed org can be worse than a fixed four-preset roster, and it can spend money creating agents).
- **Targets:** TypeScript (`qagent plan`); the Rust TUI wizard can consume the same plan file.
- **Status:** proposed.
- **Depends on:** P06 (enforced hierarchy and presets are what a plan is applied through), P03 (the plan itself gets reviewed by another family), P07 (a plan has a budget).

## Problem

MANIFESTO: "The system should analyze the goal and its context before distributing work. It should decide which roles are needed, give each agent a useful prompt, and organize those agents into a hierarchy that fits the problem. Some roles can persist across a project. Others should exist only for a particular task... When rethinking cannot resolve a consequential uncertainty, the system should ask the human." Today a human writes the roster by hand or takes the TUI wizard's four fixed presets. Nothing reads a goal and its documents and proposes structure.

## Evidence

- Roster creation is manual: `qagent agent add` (`src/cli/main.ts:288-296`) and the Rust first-run wizard applying four hard-coded presets (`rust/src/app.rs:179-258`, `apply_presets` at `:378`).
- Hierarchy is stored but unused: `agents.parent_id` and `tasks.parent_id` exist (`src/core/db.ts:18`, `:38`); limits are declared and unenforced (P06 evidence).
- Per-task (ephemeral) roles have no representation: every agent row is persistent, `status` defaults `offline` (`src/core/db.ts:19`), and there is no expiry or reaper.
- Asking the human has no first-class form: messages to the operator exist (`bus_send`), but nothing marks a message as a blocking decision and no screen lists them (P05 adds needs-me).
- Hermes's decomposer is the nearest shipping behaviour and is described in docs only for the parts read (`hermes-delta.md` §6: `kanban_decompose.py` was not read).

## Change

1. **`qagent plan <goal-file> [--docs DIR] [--budget-usd N]`** creates a *planning task* assigned to a planner agent. Input: the goal, the documents (as references, not pasted), the machine's available harnesses/models (from `qagent doctor`), and current limits. Output: `plan.json` (schema-validated, stored as the task result and in memory scope project):
   - `roles[]`: id, purpose, charter text, persistence (`project` or `task`), suggested harness/model tag, permissions (P06 fields), budget share.
   - `hierarchy[]`: parent/child edges with `allowedChildAgentIds` and depth.
   - `tasks[]`: an initial task graph (titles, briefs, roles, dependencies, acceptance).
   - `open_questions[]`: items marked `consequential: true|false`, each with options and the planner's recommendation.
2. **Review before effect.** The plan goes through the normal review gate; with P03 enforced a different-family agent reviews it. Nothing is created until the operator runs `qagent plan apply <task-id>`, which shows the diff against the current roster (agents to add, permissions, budgets) and requires confirmation. Plan apply uses the preset machinery (P06), so every agent is disabled if its harness is unavailable.
3. **Ask the human:** every `open_questions` item with `consequential: true` becomes a `needs_decision` message to the operator (shown under needs-me, P05) and blocks `plan apply` until answered. The planner may continue on its recommended option for reversible parts, as the AOS working rules do.
4. **Per-task roles:** `persistence: "task"` roles are created as ephemeral agents `<role>-t<N>` with a TTL, reaped (retired, tokens deleted) when their task goes terminal. Persistent roles survive.
5. **Replan:** `qagent plan revise <plan-id> --why` runs the planner again with the trace so far; revisions are new versioned plans, never in-place edits (P12 versioning).

## Cost

About 400 lines TS (plan schema and validator, `plan`/`apply`/`revise`, ephemeral agent lifecycle, needs-decision message type), a planner charter, tests with the fake harness. Real planners cost real tokens; each plan carries a budget cap (P07).

## Risk

- **Worse than a fixed roster.** Treat the plan as a hypothesis: the benchmark includes an arm `fixed-preset` vs `planned` on the same goal (`benchmark.md` arms are extensible), and the plan feature ships only if it matches or beats the preset roster on acceptance and cost.
- **Cost blow-up:** a planner that proposes 12 agents multiplies spend. A plan must declare a budget per role; `apply` refuses a plan whose roles exceed the run budget.
- **Authority expansion:** a plan proposes permissions, so a plan can grant itself power. `apply` is operator-only and the plan cannot assign `operator` authority; `manager` authority is shown in the diff in plain words.
- **Prompt quality is unverifiable offline.** The only check is the benchmark and review; do not claim charters are "good" from reading them.
- **Ephemeral agents and audit:** reaped agents must stay visible in history (events, task authorship); retire, do not delete rows.

## How it is verified

- Schema test: invalid plans (missing parent, depth over limit, permission outside policy) are rejected with the field named.
- Apply test: `plan apply` on a fake plan creates exactly the diffed agents, disabled where a harness is missing; refuses when a consequential question is unanswered.
- Ephemeral lifecycle test: a per-task role is created for task N and retired when N is accepted; its past events remain.
- Golden-goal test with the fake harness: a fixed goal and documents produce a plan whose structure matches a checked-in fixture (structure, not prose).
- Benchmark: arm `planned` vs `fixed-preset` on the mini run, same roster of models; metrics 1, 3, 5, 9 (coordination overhead). Not runnable in a web session.
