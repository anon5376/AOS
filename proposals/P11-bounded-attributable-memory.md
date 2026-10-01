# P11: Inspectable, attributable, bounded memory per project and per conversation

- **Edge or parity:** PARITY, a gap. Hermes ships bounded, agent-editable memory frozen into the prompt, session search and pluggable providers (`hermes-delta.md` row 8). ACS has none: continuity is whatever each vendor CLI keeps. The manifesto asks for memory that is inspectable, attributable, configurable and bounded per project and per conversation; the attribution and explicit boundaries are where ACS can differ.
- **Cost:** M.
- **Risk:** medium-high: injected memory is a prompt-injection and bloat channel.
- **Targets:** both (shared table via migration); TypeScript supervisor injects into briefs first.
- **Status:** proposed.
- **Depends on:** P02 (new table), P08 (attribution of writes). P12 writes retrospectives here.

## Problem

Findings survive agents only if someone posts them as messages or task notes. A fresh agent on the same project starts without what the last one learned, and there is no boundary between what one conversation (thread) may carry into another. The manifesto: "Context and findings should survive individual agents. Memory should be inspectable, attributable, and configurable, with explicit boundaries between projects and conversations."

## Evidence

- No memory in the schema: tables are `meta`, `agents`, `identities`, `messages`, `cursors`, `acks`, `tasks`, `task_deps`, `task_notes`, `leases`, `events`, `usage` (`src/core/db.ts:14-63`).
- Conversation boundary already exists as a concept: `messages.thread` and `tasks` thread names `task-<N>` (`src/core/db.ts:25-33`, `src/core/bus.ts:986`); project boundary as `tasks.project` (`src/core/db.ts:37`).
- Continuity is delegated: the Hermes adapter pins sessions with `--resume` (`src/adapters.ts:512-516`); worktree turns in PR #17 start cold (review finding 7, `src/supervisor.ts:420,450`).
- Briefs are built in one place, `buildBrief` in the supervisor (`src/supervisor.ts:206`, called at `:395`), the natural injection point; MCP render text is in `src/mcp/render.ts`.
- Hermes limits its built-in memory to a few thousand characters and documents one writer per home (`memory.md:11-24`, per `hermes-delta.md`), which shows bounding is needed, not optional.

## Change

1. **Table (migration, P02):** `memory(id, scope, scope_key, author, ts_ms, body, source_seq, supersedes, state)`. `scope` is `project`, `thread` or `agent`; `scope_key` is the project path, thread name or agent id. `source_seq` links to the event or note the entry came from. `state` is `active` or `retired`. Never edited in place: a correction is a new row with `supersedes`.
2. **Commands:** `qagent memory add --scope project|thread|agent --text ... [--from-seq N]`, `list`, `show`, `retire`, `search`. Agents can add through an MCP tool `bus_memory_add`; only the operator or the author can retire.
3. **Bounds:** per scope key a character budget (defaults: project 6,000, thread 3,000, agent 2,000) enforced on write; over budget requires retiring or consolidating (a `qagent memory consolidate` task for an agent, reviewed like any task).
4. **Injection with a boundary:** the supervisor adds to each brief the active project entries for the task's project, the active entries for the current thread, and the agent's own entries; never entries of other threads. The brief frames them as untrusted notes ("recorded by X at T: ..."), not instructions.
5. **Attribution:** every entry has `author`, `ts_ms`, `source_seq`; `qagent memory show` prints them; every write is an event (P08).
6. **Operator visibility:** `status` lists memory size per scope and the last write; the dashboard timeline (P10) shows memory events.

## Cost

About 250 lines TS (core, CLI, MCP tool, brief injection), 150 lines Rust for the same table and CLI, migration, tests. The Rust TUI needs no change initially.

## Risk

- **Prompt injection / poisoning:** a bad entry steers every later agent. Mitigations: frame as data; author-attributed; operator can retire; thread memory does not cross threads; consolidation goes through review (cross-family if P03 is on).
- **Bloat and cost:** injected text is paid for on every turn. Hard budgets and a visible size in `status`.
- **Staleness:** old entries mislead. `ts_ms` and `source_seq` are shown to the agent; retire on contradiction.
- **Duplicate of vendor memory:** each CLI has its own memory; this one is bus-level and vendor-neutral. Say which wins on conflict (the task brief and acceptance text always do).
- **Scope creep:** no vector search, no embedding dependency. `search` is `LIKE`/FTS5 if the bundled SQLite has it, otherwise substring.

## How it is verified

- Boundary test: an entry in thread A never appears in the brief for thread B; project entries appear only for tasks in that project.
- Budget test: a write over the scope budget is refused with a message naming the scope and size.
- Attribution test: an agent cannot write as another agent; retire by non-author, non-operator refused.
- Injection test: an entry containing "ignore previous instructions" appears inside the data frame in the brief, and a snapshot test pins the framing.
- Benchmark: repeat-run delta on research tasks R01-R06: run, record a retrospective into memory, run again on a fresh agent; report minutes, tokens and claims-with-evidence (`benchmark.md` metric 8). A positive delta is the evidence for "knowledge left behind"; no delta means memory is overhead.
