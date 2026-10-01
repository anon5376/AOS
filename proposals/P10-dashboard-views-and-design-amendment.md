# P10: Dashboard task tree, board and timeline with operator controls, plus the DESIGN.md amendment

- **Edge or parity:** PARITY on the board (Hermes's dashboard has a Kanban tab with drag-drop, a drawer and bulk operations; `hermes-delta.md` row 12). The manifesto asks for task trees, node graphs, boards and timelines on the same state as the CLI. The visual language (flat, no ornament, no external assets, CSP nonce) is ACS's own and is not Hermes's.
- **Cost:** L.
- **Risk:** medium-high (scope creep into an ornamental dashboard; widening the write surface of a localhost server).
- **Targets:** TypeScript dashboard (`src/dashboard/`); the Rust dashboard (`rust/src/dashboard.rs`, `dashboard_page.rs`) follows from shared JSON endpoints.
- **Status:** proposed.
- **Depends on:** P05 (stuck, needs-me, cost), P07 (pause/resume), P08 (why on actions).

## Problem

`DESIGN.md` describes a page that "does one thing: send a message as the operator", with one reading column and no charts, counters or icons. `MANIFESTO.md` requires task trees, node graphs, boards and timelines, plus inspect, redirect, pause and resume from the dashboard. The two cannot both hold. AOS's AGENTS.md says to propose an amendment rather than silently break `DESIGN.md`.

## Evidence

- `DESIGN.md:41`: the dashboard "does one thing: send a message as the operator. Review, cancel, start and stop live in the CLI." `:46`: one reading column up to 960 px. `:51`: "No badges, pills, rings, dots, icons, KPI tiles, charts or counters." Layout: title and status line, agents, open tasks, recent messages (`DESIGN.md` Layout, items 1-4).
- Server surface: `GET /api/state`, `GET /api/events`, and one write, `POST /api/send` (`src/dashboard/server.ts:367-383`), with loopback host check, same-origin check, session and single-use ticket (`src/dashboard/session.ts`). Stream limit `MAX_STREAMS = 32` (`src/dashboard/server.ts:36`, `:370`).
- Idle cost is deliberately minimal and tested: one connection, one watcher, a 10 s safety poll, no work with no tabs (`src/dashboard/server.ts:1-20`, `DashboardStats`).
- `docs/architecture.md:53` lists "configuration editing from the browser" as removed; V2 deleted the React dashboard and about 10,500 lines of web code (`docs/V2-DESIGN.md:7`). Any new view must not rebuild that stack.
- The tree data exists: `tasks.parent_id` and `task_deps` (`src/core/db.ts:38`, `:51`).

## Change

1. **Amend `DESIGN.md`** (the intended text, as bullets; the actual diff is written in the build PR):
   - Keep: flat page, hairline rules, system font, one accent for links/focus, no external assets, CSP nonce, loopback only.
   - Replace "does one thing" with: *the page reads the bus and offers operator actions; each action is exactly one bus call, appends exactly one event, and is available from the CLI too*.
   - Replace the blanket "no charts or counters" with: *no decorative numbers; a number is allowed when it answers what is stuck, what needs the operator, or what it costs, and links to the list behind it. Structure is drawn as text first; a dependency graph is allowed as server-rendered inline SVG with hairline strokes, word labels and keyboard focus; no chart library, no gradients, no icons.*
   - Widen the column for the tree and board views to the viewport; keep 960 px for prose.
2. **Four views on one page, each answering one question:**
   - *Now* (default): the stuck / needs-me / cost block from P05, then agents.
   - *Tree*: indented task tree by `parent_id`, with state and assignee words, collapsible by keyboard; drill into a task for brief, notes, review rounds, result and its trace.
   - *Board*: columns by state, flat lists, one line per task, no drag-drop (moving cards is done by explicit actions below).
   - *Timeline*: the event list with seq, actor, kind and purpose (P08), filterable by task, agent and kind.
3. **Operator actions** (each a `POST`, same-origin, session-bound): review accept/revise with `why`, requeue, cancel, reassign (redirect), pause and resume (P07). `POST /api/send` stays. Config editing stays out.
4. **Shared read model:** the new endpoints (`/api/tasks/tree`, `/api/timeline`) are plain JSON built from the same core queries as the CLI, so the TUI (P09) and the dashboard cannot disagree.
5. **No new dependency;** keep the server-rendered page and the SSE delta stream. Views are reachable by URL fragment, so no client router.

## Cost

About 800 lines TS across `page.ts`, `server.ts` and `assets.ts`, DESIGN.md diff, extended `scripts/v2-dashboard-smoke.mjs`, and screenshots. The Rust dashboard port is a separate follow-up.

## Risk

- **Becoming the thing it replaced.** The React dashboard was removed on purpose. Hold the line with a budget: four views, no client framework, `assets.ts` size cap checked in tests.
- **Write surface:** each action widens what a stolen session can do. Keep loopback-only, same-origin and the single-use ticket; log every action as an event with its session identity (P08); no action that edits config or spawns processes.
- **Amendment taste:** the owner owns `DESIGN.md`. The amendment text here is a proposal; do not apply it without their word.
- **Idle regression:** more views must not add polling. Keep the one delta stream and re-run the idle-cost test.

## How it is verified

- Browser smoke (`npm run test:browser`, `scripts/v2-dashboard-smoke.mjs`) extended: each view renders from a fixture bus, each action produces one event, a missing session is refused, a cross-origin POST is refused.
- Idle test: with no writes and no tabs the server makes no queries; with tabs open, one safety read per interval (existing `DashboardStats`).
- CSP test: no inline script without nonce, no external URL in any view (grep of rendered HTML).
- Keyboard test: every view and action reachable without a pointer; usable at 80 columns in a narrow viewport.
- Screenshots of the four views in the PR (UI PR bar).
- Benchmark: operator minutes to answer "what is stuck, what needs me, what does it cost" from a finished run, measured with and without the views (a stopwatch task for the human audit step).
