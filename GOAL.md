# GOAL

Paste the block below into `/goal` to start a session. Context is in `AGENTS.md` and `MANIFESTO.md`.

## Goal (paste this)

```
Work from AOS on ACS ($ACS_DIR, anon5376/agent-communication-system). Read AGENTS.md and
MANIFESTO.md (its principles bind), then ACS main (CHANGELOG [Unreleased]), branch rust-port and
PR #17 (fetch them; clones are shallow).

THIS GOAL IS DONE WHEN all of the following are committed to a claude/proposals-* branch of AOS
and a draft PR is open there:
 1. proposals/README.md: a ranked index (id, title, edge or parity, cost, risk, status) and at
    least 8 proposal files, each with problem, file:line evidence, change, cost, risk, how it is
    verified, and for any change to the review gate or router: why V2 removed the router.
 2. proposals/benchmark.md: the benchmark spec (below), complete enough to run later.
 3. proposals/hermes-delta.md: a dated comparison with Hermes Agent built from a git clone of
    its repo (commit hash recorded, docs under website/docs/ read), not from search snippets.
 4. Quick-fix proposals for claims the code doesn't back (see "State of ACS").
Then stop; the owner picks proposals by commenting on the PR. Each picked proposal gets its own
/goal: a green PR in ACS plus a before/after on the benchmark.

NORTH-STAR METRIC (long-range, run on a real machine with vendor credentials, not in a web
session): a fixed run of ~20 tasks from ACS's own backlog, mixing implementation and research
tasks, >=8 hours unattended, >=2 vendors. Specify N, the task list, the vendors, the baseline
procedure and the metrics: acceptance rate (and cross-family acceptance rate where enforced),
minutes tasks sat stuck, human touches, cost; for research tasks, claims with evidence links,
unresolved questions left visible, and failures explained.

PROPOSED THESIS (owner to confirm): the result of autonomous work must be reviewable
(MANIFESTO: accountable autonomy, evidence), and review has teeth only if no model grades its own
work. Cross-family review is the mechanism. Treat it as a hypothesis to test against the
benchmark, not as a given.

SCAN AREAS (items marked PARITY exist in Hermes Kanban today; do them for table stakes, do not
sell them as edge):
 1. Make cross-family review a core invariant, enforced in createTask/reviewTask in both
    implementations (today only self-review is blocked, bus.ts:982; routeTask is test-only).
    Verdicts feed per-model, per-task-type trust shown to the operator and used for routing, with
    explanations ("routed to X: 14/16 accepted by a different family on refactors"). EDGE.
 2. Trust you can see. Stalls in `qagent status`, dashboard and TUI; a kill -9 test; `trace` by
    thread; a bus-wide export (JSON, self-contained HTML). PARITY.
 3. Consented self-improvement: run retrospectives (worked, failed, why) on the bus; proposals
    to change presets, routing weights or skills land as reviewed tasks with a diff and evidence,
    kept only if the benchmark improves; versioned, reversible, only with operator agreement or an
    explicit policy; an agent never expands its own authority.
 4. Self-organizing hierarchy: from a goal and its documents, a planner proposes roles, prompts
    and a hierarchy (persistent and per-task roles), asks the human on consequential uncertainty.
    Underneath, presets: allowedChildAgentIds, maxDelegationDepth and maxConcurrentTasks are
    declared in src/config.ts but not enforced in core; the Rust TUI hard-codes preset charters
    (rust/src/app.rs); TS has no equivalent. Enforce in core, port presets to TS, package and
    version them, attribute outcomes to preset versions. Ship default presets; no fake agents in
    production config.
 5. Scale without collisions: ownership so workers never overwrite or silently invalidate each
    other, no fixed agent ceiling in the design, aggregation and drill-down for humans, measured
    coordination cost at 2, 8 and 32 agents. Worktrees (PR #17) and scheduling are PARITY.
 6. Enforced limits: optionalTokenBudget and optionalApiCostBudgetUSD exist but nothing enforces
    them; add per-task and per-run budgets, loop guards, depth and concurrency limits, cost on the
    main screen.
 7. Surfaces on one state (MANIFESTO): CLI for scripting, `acs` TUI for live operation, dashboard
    for task tree, graph, board and timeline plus inspect, redirect, pause, resume. Bars: one
    screen shows what is stuck, what needs me, what it costs; install to first accepted task under
    5 minutes; usable at 80x24 keyboard-only; zero redraws when idle, measured; every on-screen
    state links to an event sequence number. Propose the DESIGN.md amendment this needs.
 8. Accountability and customization: every consequential action records actor, purpose,
    authority and result (the event log has actor and kind, not purpose); memory is inspectable,
    attributable and bounded per project and per conversation; configurable roles, prompts,
    models, harnesses, routing, tools, skills, plugins, MCP servers, budgets, memory and approval
    rules; supported authentication methods and room for a native harness. Every knob has a
    default and a documented interface; no knob without a consumer. Evaluate small local models
    for suitable subtasks against quality, time and cost.

Constraints: keep zero-daemon coordination; schema changes are migrations that keep TS and Rust
compatible (node scripts/v2-interop-smoke.mjs); no new dependencies without asking; no invented
benchmarks; no README claim the code doesn't back; never merge, publish or release without the
owner's word.
```

## Why this goal

**North star (AOS README and MANIFESTO.md):** an ultra-customizable, self-improving harness for prolonged autonomous research and engineering work, where a swarm organizes itself around a goal, scales without colliding, leaves knowledge behind, and stays accountable to a human who sets the boundaries.

### Hermes Agent today (read from source, 2026-10-01)

Cloned `NousResearch/hermes-agent` at commit `e8c97320` (shallow, `main`, committed 2026-10-01). GitHub showed 250.4k stars and 53.6k forks, MIT. Facts below are from `website/docs/user-guide/features/kanban.md` and the tree:

- **Kanban is a multi-agent SQLite board.** "A durable task board, shared across all your Hermes profiles" in `~/.hermes/kanban.db`; statuses `triage | todo | ready | running | blocked | review | done | archived`.
- **Liveness:** a dispatcher reclaims stale claims, reclaims crashed workers (PID gone), reaps workers that outlived their budget; workers call `kanban_heartbeat`; a circuit breaker bounds retries.
- **Workspaces:** `scratch`, or a git `worktree` per coding task.
- **Review:** `kanban_request_review` / `kanban_request_changes`. By default (`review_dispatch: true`) the review spawns the assigned profile with the bundled `sdlc-review` skill; a separate reviewer profile is optional. No cross-family rule and no routing learned from verdicts was found.
- **Also:** Mixture-of-Agents (`agent/moa_loop.py`), ACP transport in delegation (`tools/delegate_tool_config.py`), a dashboard, scheduled automations, a messaging gateway, skills that self-improve, FTS5 memory, MCP.

So "Hermes is one loop spawning subagents with liveness left to the user" is **wrong now**. ACS's stall detection, worktrees and scheduling are parity. The unverified opening is the one in item 1: review that is independent by construction, and trust learned from verdicts. Anecdotal UX complaints (slow TUI first start, flicker fixed in 0.10.0) come from secondary sources ([release recap](https://hermesagents.net/vi/blog/hermes-agent-v0-10-0-nous-tool-gateway), [Level1Techs thread](https://forum.level1techs.com/t/llms-and-hermes-agent/250694?page=2)); measure, don't assume.

**Do not do** (slop traps): a chat-wrapper TUI, a messenger gateway before trust works, A2A/ACP transports before anyone needs them (a small `POST /tasks` bridge is the likely first step), a plugin marketplace, a landing-page rewrite, SKILL.md editing that just mirrors Hermes.

## State of ACS this goal is based on (checked 2026-10-01)

- Unreleased on `main` (npm has no such package): stalled-task detection, `qagent task stalled|requeue`, `--auto-requeue-min`, `qagent trace` (text, json, html), `supervise --roster`.
- Rust port on `rust-port`: `rust/` crate with `acs` TUI, `acs-app`, `qagent`; shares `bus.db` with TS; CI runs an interop smoke test. README hero GIF comes from it.
- Router: `routeTask` is reached only by tests; V2 removed it from the coordination path.
- Not enforced: `optionalTokenBudget`, `optionalApiCostBudgetUSD`, `allowedChildAgentIds`, `maxDelegationDepth`, `maxConcurrentTasks`.
- Claims the code doesn't back (quick-fix proposals): `README.md` tells users `npm install -g agent-communication-system`, which returns 404 (v0.2.0 is only a GitHub tag, though `CHANGELOG.md` calls it the first public release).
- Flaky: hard `<500 ms` asserts in `tests/wait-notify.test.ts` (claim-race EPIPE already fixed).
- Gaps from `docs/competitive-analysis.md` (which doesn't cover Hermes): no A2A/ACP interop, single-machine scope.
- Draft PR #17: per-task git worktrees.
