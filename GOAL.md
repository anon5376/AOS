# GOAL

Paste the block below into `/goal` to start a working session. Context for it is in `AGENTS.md`.

## Goal (paste this)

```
Work in the ACS repo ($ACS_DIR, anon5376/agent-communication-system), guided by AOS's concept
(AGENTS.md, README.md). Goal: turn ACS from "a durable message bus between agent CLIs" into the
harness-neutral control plane for prolonged, autonomous, self-improving multi-agent work, good
enough that people seriously choose it next to Hermes Agent, Claude Code and OpenHands.

Phase 1, scan and propose (read-only). Read src/, tests/, docs/, the open PR #17 and CI history.
Return a ranked proposal list (problem, evidence with file:line, change, cost, risk, how it is
verified) covering: correctness and flaky tests; performance and startup time; the five
capabilities below; and what to delete. Check Hermes Agent's current docs first; do not rely on
docs/competitive-analysis.md alone. Stop and wait for my pick.

Phase 2, build what I pick, one PR per capability, each verified end to end with real
execution (npm test green, plus a demo that kills a worker mid-run where relevant).

Capabilities, in priority order:
1. Liveness you can trust. Heartbeats and lease expiry that mark tasks stalled, surface them in
   `qagent status` and the dashboard, and optionally requeue. A killed agent never leaves a task
   "running" forever. Crash-resume is a tested guarantee, not a claim.
2. The bus is the trace. `qagent trace <task|thread>` renders the causal chain from the events
   table; `qagent export` writes JSON or one self-contained HTML timeline. Replay without any
   server, SaaS or telemetry.
3. Hierarchy presets (from AOS). Named, versionable role and hierarchy presets (director, lead,
   worker, reviewer): prompts, spawn lists, budgets, review rules. Load one with a command; share
   as a file. Operator-defined, never a stock roster (PRODUCT.md principle 1).
4. Self-improvement, with receipts. Agents propose changes to presets and to skills
   (agentskills.io SKILL.md format, so Hermes and Claude Code skills are readable). A proposal
   lands as a task with a diff and evidence from past runs; a reviewer accepts or rejects it.
   Nothing rewrites itself silently. Include a measurable before/after on a fixed task set.
5. Continuous operation. Scheduled and recurring tasks enqueued to any agent, per-task worktree
   isolation (finish PR #17), budget and loop guards in the supervisor, and a human-approval
   queue that can reach the operator outside the dashboard.

Constraints: keep zero-daemon coordination and the SQLite schema compatible (migrations, not
rewrites); no new dependencies without asking; follow DESIGN.md and PRODUCT.md; startup time and
dashboard quietness are features (Hermes users complain about slow starts and flicker); no
invented benchmarks; no README claim the code doesn't back. Never merge, publish or release
without my word.
```

## Why this goal

**North star (AOS):** ultra-customizable, self-improving harness for prolonged autonomous work with hierarchy presets. ACS today covers the plumbing: durable bus, claims, leases, review gates, supervisor, adapters. It lacks the parts that make long autonomous runs trustworthy and improving.

**Where ACS can beat Hermes Agent** (Hermes: ~250k stars reported, closed learning loop, skills, FTS5 memory, messaging gateway, cron, subagents; reported complaints: slow startup, flickering CLI, verbose and hard-to-steer models; research was secondary-source, so re-verify in Phase 1):

| Hermes is | ACS can be |
|---|---|
| One agent loop that spawns its own subagents | The neutral plane where Claude Code, Codex, opencode and Hermes itself coordinate |
| Self-improvement inside one agent, opaque | Self-improvement as reviewed tasks with diffs and evidence, auditable in the event log |
| Per-agent memory | One inspectable SQLite file; the event table is the history |
| Liveness left to the user | A supervisor that owns heartbeats, requeue, budgets |

**Do not do** (slop traps): a chat-wrapper TUI, a gateway to ten messengers before liveness works, A2A/ACP transports before anyone needs them (a small `POST /tasks` bridge is the likely first step), a plugin marketplace, a landing-page rewrite.

## Known loose ends to fold into Phase 1

- Flaky CI: claim-race EPIPE in `core-claim`, hard `<500 ms` asserts in `tests/wait-notify.test.ts`.
- v0.2.0 never published to npm.
- Gaps from `docs/competitive-analysis.md`: no A2A/ACP interop, single-machine scope.
- That doc and `docs/standout-features.md` mention a Rust binary and TUI; the ACS tree has no Rust source or Cargo files (checked), so treat those claims as stale and fix or remove them.
- Draft PR #17 (per-task git worktrees).
