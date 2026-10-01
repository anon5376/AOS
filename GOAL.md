# GOAL

Paste the block below into `/goal` to start a working session. Context is in `AGENTS.md`.

## Goal (paste this)

```
Work in ACS ($ACS_DIR, anon5376/agent-communication-system), guided by AOS (AGENTS.md, README.md,
MANIFESTO.md; its principles bind). Read CHANGELOG [Unreleased], branch rust-port and PR #17 first: much
of what looks missing already exists.

THESIS: no model grades its own work. ACS is the control plane where agents from different
vendors do prolonged autonomous work, every result is reviewed by a different model family, and
the system learns whom to trust from those cross-vendor verdicts, with receipts you can replay.
Hermes improves one agent inside one loop; ACS makes the whole fleet trustworthy and better over
time. Build everything below as a consequence of that thesis, not as a feature list.

DONE-CONDITION (the endurance benchmark). Pin one fixed run: >=8 hours unattended, >=2 vendors,
a fixed task set of N real tasks on a real repo. Measure: cross-family acceptance rate, minutes
tasks sat stuck, human touches, cost. Every claim of "better" is a before/after on this run.
Define the harness in Phase 1; it is the first deliverable of Phase 2.

PHASE 1, scan and propose (read-only). Write ranked proposals to AOS proposals/ (problem,
evidence file:line, change, cost, risk, how verified). Cover correctness, startup time and idle
cost, the items below, the TS/Rust split, and what to delete. Source the Hermes comparison from
its repo and docs, with dates. Stop and wait for my pick.

PHASE 2, build what I pick: one PR per item, real execution evidence, npm test green (and
cargo test for Rust), UI PRs with a recording.

ITEMS (the real gaps; stall detection, requeue and `qagent trace` already ship):
1. Trust you can see. Stalls surface in `qagent status`, the dashboard and the TUI; a kill -9
   test proves a dead worker never leaves a task "running"; `trace` works by thread; one
   bus-wide export (JSON and self-contained HTML).
2. Verdict-weighted trust with receipts. Build on independentFamilyReview and observedSuccess
   (src/router.ts, src/provider-catalog.ts): per-model, per-task-type accuracy from reviewer
   verdicts, shown to the operator, used for routing, and explainable ("routed to X because 14/16
   accepted by a different family on refactors"). Self-improvement lives here: proposals to
   change presets, routing weights or skills land as reviewed tasks with a diff and evidence from
   past runs, and are kept only if the endurance benchmark improves. Per the manifesto: only with
   the operator's agreement or an explicitly enabled policy, every change versioned and
   reversible, and an agent proposing an improvement never gains authority to expand its own.
   Every run ends with a retrospective (what worked, what failed, why, what to change) stored on
   the bus. Read and write agentskills.io SKILL.md for interop, but do not make skill editing
   the centre.
3. Self-organizing hierarchy (manifesto: "the swarm organizes itself") on top of presets.
   Given a goal and its documents, a planner proposes roles, prompts and a hierarchy, including
   per-task roles that disappear after the task, and asks the human when consequential
   uncertainty remains. The operator can accept, edit or replace the proposal. Underneath:
   hierarchy presets (AOS). The hierarchy exists in config (allowedChildAgentIds, role and
   authority, RolePolicy, BusConstraints.maxDelegationDepth). Missing: prompts and packaging. A
   preset is one versioned file (roles, authority, spawn lists, constraints, prompts), applied
   with `qagent preset apply`, shareable, with outcomes attributed to each preset version.
   Operator-defined; never a stock roster.
4. Scale without collisions. Clear ownership so workers never overwrite, interrupt or silently
   invalidate each other (leases, worktrees, per-task ownership); no arbitrary agent ceiling in
   the design, only budgets and provider limits; aggregation, search and drill-down so a human
   can follow goal, task tree, dependencies, evidence and timeline without reading every
   conversation. Measure coordination cost as agents grow (2, 8, 32), and add agents only where
   results improve.
5. Enforced limits. optionalTokenBudget and optionalApiCostBudgetUSD exist in config but nothing
   enforces them. Enforce per-task and per-run budgets, loop guards and depth limits in the
   supervisor; show cost on the main screen.
6. Continuous operation. Scheduled and recurring tasks, per-task worktree isolation (finish
   PR #17), an approval queue that can reach the operator outside the terminal.
7. Surfaces on one state (manifesto: CLI and dashboard agree). CLI for scripting, `acs` TUI for
   live operation, web dashboard for a glance and structure (task tree, dependency graph, board,
   timeline); inspect, redirect, pause and resume from either. Bars:
   one screen shows what is stuck, what needs me, what it costs; install to first accepted task
   under 5 minutes; usable at 80x24 keyboard-only; zero redraws when idle, measured; every
   on-screen state links to an event sequence number.
8. Research-grade provenance and customizability. Tasks carry evidence and keep observation,
   assumption and conclusion distinct; unresolved questions stay visible; memory is inspectable,
   attributable and scoped per project. Everything the manifesto lists (roles, prompts, models,
   harnesses, routing, tools, skills, MCP servers, budgets, memory, approval rules) is
   configurable with useful defaults. Propose the interfaces, and cut configuration for its own
   sake. Evaluate (do not assume) small local models for suitable subtasks against quality,
   time and cost.

Constraints: keep zero-daemon coordination; schema changes are migrations that keep the TS and
Rust implementations compatible; no new dependencies without asking; follow DESIGN.md (see
AGENTS.md on the PRODUCT.md conflict); no invented benchmarks; no README claim the code does
not back; never merge, publish or release without my word.
```

## Why this goal

**North star (AOS README and MANIFESTO.md):** an ultra-customizable, self-improving harness for prolonged autonomous research and engineering work, where a swarm organizes itself around a goal, scales without colliding, leaves knowledge behind, and stays accountable to a human who sets the boundaries. ACS already has the plumbing: durable bus, claims, leases, review gates, supervisor, adapters, stall detection, trace. What it lacks is the part that makes long autonomous runs *trustworthy and improving*, which is where it can beat Hermes rather than imitate it.

**Hermes Agent** (sources checked 2026-10-01: [GitHub repo](https://github.com/NousResearch/hermes-agent) showed 250.4k stars, 53.6k forks, MIT; features quoted from its README):

- agent-curated memory, autonomous skill creation after complex tasks, skills that "self-improve during use";
- FTS5 session search, isolated subagents, natural-language scheduled automations, a messaging gateway, MCP integration;
- a TUI with multiline editing, slash-command autocomplete, interrupt-and-redirect and streaming tool output.

Complaints are anecdotal and secondary-source: slow first start of the TUI and spinner flicker (fixed in 0.10.0 per a [release recap](https://hermesagents.net/vi/blog/hermes-agent-v0-10-0-nous-tool-gateway)), slower TUI gateway in recent updates ([Level1Techs thread](https://forum.level1techs.com/t/llms-and-hermes-agent/250694?page=2)). Treat as hints to measure, not facts. Official docs were not readable from this environment.

| Hermes | ACS can be |
|---|---|
| One agent loop spawning its own subagents | The neutral plane where Claude Code, Codex, opencode and Hermes (via ACS's own adapter) coordinate |
| Self-improvement inside one agent, grading itself | Self-improvement gated by cross-family review and the endurance benchmark |
| Per-agent memory | One inspectable SQLite file; the event log is the history |
| Liveness left to the user | A supervisor that owns heartbeats, requeue, budgets |

**Do not do** (slop traps): a chat-wrapper TUI, a gateway to ten messengers before trust works, A2A/ACP transports before anyone needs them (a small `POST /tasks` bridge is the likely first step), a plugin marketplace, a landing-page rewrite, SKILL.md editing that just mirrors Hermes.

## State of ACS this goal is based on (checked 2026-10-01)

- Already in `[Unreleased]`: stalled-task detection, `qagent task stalled|requeue`, `--auto-requeue-min`, `qagent trace` (text, json, html), `supervise --roster`.
- Rust port on `rust-port`: `rust/` crate with `acs` TUI, `acs-app`, `qagent`; shares `bus.db` with TS. README hero GIF comes from it. Its docs (`docs/competitive-analysis.md`, `docs/standout-features.md`) describe it correctly; `main` simply doesn't contain it.
- Not enforced: `optionalTokenBudget`, `optionalApiCostBudgetUSD`.
- Not on npm: the registry has no `agent-communication-system` package (checked), though `CHANGELOG.md` calls v0.2.0 the first public release (a GitHub tag exists). Reconcile before any release work.
- Flaky: hard `<500 ms` asserts in `tests/wait-notify.test.ts` (claim-race EPIPE is already fixed).
- Gaps from `docs/competitive-analysis.md`: no A2A/ACP interop, single-machine scope.
- Draft PR #17: per-task git worktrees.
