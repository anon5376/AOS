# D01: One console for AOS, on Accelerate

- **Kind:** design spec (no code in ACS). It ties P05, P06, P07, P08, P09, P10, P11 and P15 into one read model, one verb set and one command grammar, rendered by three surfaces: the command line, the terminal console and the dashboard.
- **Replaces:** the earlier D01 on PR #3. That version had five lenses, left agents, memory and config as "not yet", and drew the terminal in generic box-art. This one is rebuilt on the owner's Accelerate design system and covers all eight lenses.
- **Companions:** D02 (the terminal on Accelerate) and D03 (the dashboard on Accelerate).
- **Prototype:** https://claude.ai/artifact/JKLMqiCekJFcktsit2kcMw (private to the owner). Source in `assets/D01-prototype/`; open `index.html` locally, no build. Both surfaces in the prototype share one state, so an action in one shows in the other. **The data is a fixture shaped like the ACS bus, not a run.**
- **Status:** proposed. Section 9 lists the decisions only the owner can make.

Facts about ACS are read from `anon5376/agent-communication-system` `main` at `9691f55` (2026-10-01) with `file:line`. Anything not shipped in ACS is marked **proposed** and names the proposal that would ship it.

## 1. What exists today

- **CLI** (`src/cli/main.ts`): `status`, `agent list|add` (`main.ts:284-301`, add takes `--role --model --harness --parent --authority`), `task add|list|show|claim|note|submit|review|cancel|stalled|requeue`, `trace`, `send`, `inbox`, `wait`, `log`. `task review` needs `--accept|--revise` and `--feedback` (`main.ts:434-442`); `cancel` and `requeue` take `--reason`. There is no `task assign`, no `agent remove|pause`, no memory command, no config command.
- **Dashboard** (`src/dashboard/`): one page on `127.0.0.1:11511` (`server.ts:23`), SSE updates, nonce CSP with `default-src 'none'` (`server.ts:256`). Its only write is `POST /api/send` (`server.ts:383-392`). Captured state: `assets/D01-acs-dashboard-today.png`.
- **Terminal** (`rust/` on `rust-port`): three panes, task rows cut off at 80 columns. Captured: `assets/D01-acs-tui-today-80x24.txt`.
- **Agents**: `addAgent` exists (`bus.ts:231`), nothing removes or edits one. Status is derived on read: a stored `working` agent not seen for 15 minutes reads `offline` (`bus.ts:284-292`, `STALE_AGENT_MS` at `types.ts:33`).
- **Memory**: there is none. P11 proposes it.
- **Config**: `agent-bus.config.json`, validated by hand (`config.ts:215-285`), read once at start. Several keys are accepted and never read: for example `maxRetries` is hard-coded `?? 2` at `bus.ts:794`. P15 proposes the audit that labels each key.

## 2. Thesis

The event log is the interface. Every surface renders one `Frame` computed by the core, every operator action is one core verb that appends exactly one event carrying the operator's reason, and every row on every surface ends in the `#seq` that produced it. A surface may offer a verb only if the other two offer it. Drift between surfaces is then a test failure, not a design review.

The screen answers in this order: **what needs you, what is stuck, what it costs**, then who is working and what they know.

## 3. The read model: `Frame`

One function, `frame(bus, {run, since})`, returned by `qagent status --json`, streamed over the dashboard's SSE channel, read by the Rust console through the same queries (schema-guarded by P02). The prototype's version is `assets/D01-prototype/model.js`.

```ts
Frame = {
  seq, run: { id, goal, state: 'live'|'paused', budgetUsd? },
  needs:  Item[],     // review addressed to the operator, unanswered questions,
                      // proposed memory, tasks no agent can take
  stuck:  Item[],     // claimed and idle >= threshold, with minutes
  cost:   { usd: number|null, tokens, unknownAgents: string[] },  // null = not reported, never 0
  tasks:  Task[],     // parent_id + deps; state from TaskState
  agents: Agent[],    // id, role, harness, model, parent, authority, derived status, task, spend
  memory: { entries: Mem[], budgets: {project, thread, agent}, used },   // proposed (P11)
  config: { version, keys: Key[], staged, history },                     // proposed (P15)
  log:    Event[]     // tail, for the timeline
}
Item = { kind, ref, title, why, seq }   // seq is mandatory; why is one generated line
```

`why` is what lets a person triage without opening anything: "rev-1 (gemini) ready, author impl-b (codex)". Cost is `null` when a harness does not report it (codex and hermes in the fixture), and the count of agents with unknown cost is always shown next to the total.

**Parity test.** A fixture bus is rendered by `status --json`, the console's `--dump` and the dashboard's DOM; a script compares the `(ref, seq)` pairs and fails if they differ. It ships with the first build PR.

## 4. Eight lenses

Same names, numbers and order on every surface. Operate lenses act on a run; system lenses act on the setup that runs it.

| # | Lens | Answers | Built from | State in ACS |
|---|---|---|---|---|
| 1 | now | what needs me, what is stuck, what it costs, who is working | needs, stuck, cost, agents | data exists; P05 adds usage |
| 2 | tree | how the goal is broken down | tasks by `parent_id`, shown as paths `/1/3` | exists |
| 3 | board | where each task is in its life | tasks by state | exists |
| 4 | graph | what blocks what | task deps | exists |
| 5 | timeline | what happened, in order, and why | events | exists |
| 6 | agents | who exists, under whom, on which harness and model, doing what, at what cost | agents, identities | data exists; pause is P07 |
| 7 | memory | what the agents will be told, who wrote it, how much room is left | memory table | **proposed** (P11) |
| 8 | config | how the system runs, which layer set each value, and whether anything reads it | config + audit | **proposed** (P15) |

Detail for any row is the **card**: an aside on the dashboard and in a wide terminal, a full pane at 80 columns. A card shows what the row is, its provenance (`#seq`, author, layer), and the one primary action for it.

### 4.1 Agents

The hierarchy is drawn from `parent_id` (manager above workers), with the roster beside it: id, role, harness, model, derived status, current task, spend, last seen. Status is the bus's derived status, so an agent whose stored state is `idle` but was last seen 22 minutes ago shows **offline**, with "stored idle, last seen 22 min" on its card. The card's actions: pause the agent (proposed, P07: it refuses new claims; a running turn finishes), open its tasks, trace its last events. **Add agent** is a form with the exact fields `qagent agent add` takes and shows the command it is equivalent to. Removing or editing an agent is left out: the bus has no verb for it, and inventing one in the UI first would break the one-verb-set rule.

### 4.2 Memory (proposed, P11)

Entries are grouped by scope: project, thread, agent. Each has a kind taken from the manifesto (observation, assumption, conclusion, decision), an author, the `#seq` that wrote it, a use count, and a state: active, proposed, retired. Each scope shows a budget meter (P11's 6000 / 3000 / 2000 tokens). Rules the UI makes visible:

- An agent may propose a project-scope entry; it waits in **needs you** until the operator approves it with a reason.
- Editing never rewrites history: **supersede** writes a new entry and retires the old one, both with events.
- **What a brief reads**: pick a thread and an agent and the panel shows exactly which entries would be injected and their token total. Other threads' memory is never included, and the panel says so.

### 4.3 Config (proposed, P15)

Each key shows its effective value and the layer that won (default › preset › file › env › run), drawn as a five-cell strip with the winning cell filled. Each key also shows its **reader status** from the P15 audit: `read` (with the `file:line` that reads it), `no reader` (accepted and ignored, for example `constraints.maxRetries`, hard-coded at `bus.ts:794`), or `proposed` (a key a proposal adds). Changes are **staged** into a diff, then **applied** as one numbered version with a required reason, and any version can be **rolled back** the same way. Keys that hold commands or secrets (`harnesses.*.command`, `env.*`) are locked in the dashboard and editable only in the file. Staging a `no reader` key is allowed and says plainly that it records intent only.

## 5. Verbs

Each verb is one core function, appends one event, and returns its `#seq`. `why` is required where marked; the CLI flag is `--why`, kept as an alias of the existing `--feedback` and `--reason`.

| Verb | Why | CLI | Key | Event | Ships in |
|---|---|---|---|---|---|
| accept | yes | `task review N --accept --why …` | `a` | `task_accepted` | exists |
| request changes | yes | `task review N --revise --why …` | `r` | `task_changes_requested` | exists |
| requeue | no | `task requeue N` | `u` | `task_released` | exists |
| assign | no | `task assign N AGENT` | `g` | `task_claimed` | **proposed** (P08) |
| cancel | yes | `task cancel N --why …` | `x` | `task_cancelled` | exists |
| answer | yes | `ask answer Q --why …` | `y` | `message` (type answer) | exists as send |
| pause / resume run | no | `pause`, `resume` | `p` | `run_paused*` `run_resumed*` | **proposed** (P07) |
| pause agent | yes | `agent pause ID --why …` | `p` in agents | `agent_paused*` `agent_resumed*` | **proposed** (P07) |
| add agent | no | `agent add ID --role --harness --model --parent` | form | `agent_added` | exists |
| approve memory | yes | `memory approve M --why …` | `A` | `memory_approved*` | **proposed** (P11) |
| retire memory | yes | `memory retire M --why …` | `x` | `memory_retired*` | **proposed** (P11) |
| supersede memory | no | `memory edit M` | `e` | `memory_added*` | **proposed** (P11) |
| stage config | no | `config set KEY VALUE` | `e` | none (local until applied) | **proposed** (P15) |
| apply config | yes | `config apply --why …` | `A` | `config_changed*` | **proposed** (P15) |
| roll back config | yes | `config rollback vN --why …` | `R` | `config_changed*` | **proposed** (P15) |
| trace | no | `trace N` | `t` | none (read) | exists |

`*` marks event kinds ACS does not have yet. P08 adds actor, purpose and authority to every one of these events; until then `why` is stored in the event payload.

## 6. Command grammar

The console's `:` line and the dashboard's command palette accept the CLI's grammar verbatim, minus the binary name. One muscle memory covers all three. The prototype's parser is `command()` in `model.js`.

```
qagent status [--json]          needs, stuck, cost, agents
qagent needs                    exit 0 if empty, 3 if not  (qagent needs || notify-send …)
qagent stuck [--min N]          alias of task stalled; default 30 min (task stalled defaults to 60)
qagent cost [--since 24h]       tokens and usd, unknown counted, never zero
qagent tree [N]                 paths, /1/3
qagent trace N
qagent task accept|revise|requeue|cancel N [--why …]     short forms of task review
qagent task assign N AGENT
qagent ask answer Q --why …
qagent pause | resume
qagent agent list | add ID … | pause ID --why … | resume ID
qagent memory list [--scope project|thread|agent] | show M | approve M --why … | retire M --why … | edit M
qagent config show [KEY] | set KEY VALUE | diff | apply --why … | rollback vN --why … | history
```

Every command has `--json` (the `Frame` slice it prints). Human output is plain text with stable columns and no colour required; the same lowercase, `/`-separated, numbered-section voice as the other two surfaces (D02 section 6).

## 7. Build order

Each step is one PR in ACS with its own before and after on `benchmark.md`. Nothing here starts without the owner picking it.

1. `frame()` in core and `qagent status --json` on it, plus the parity test harness (P05).
2. Dashboard on Accelerate: tokens, self-hosted fonts, now / tree / board / timeline lenses, read only (D03, P10).
3. Console on Accelerate in `rust/`: grid renderer, layouts, same four lenses, idle redraw (D02, P09).
4. Verbs that already exist in core, wired to all three surfaces with `--why` (P08 for the event fields).
5. Agents lens; pause run and pause agent once P07 lands.
6. Config lens read only on the P15 audit; stage, apply and roll back after it.
7. Memory lens once P11's table exists.

## 8. How we judge it

- Parity test green: the three surfaces show the same `(ref, seq)` set for the fixture bus.
- At 80x24 the operator can see needs, stuck and cost without scrolling, on every lens (D02 mockups prove the layout, not the use).
- **[hypothesis]** Operators clear a needs-you queue faster with the card and required reason than with today's CLI. Test: the five-item fixture queue, timed, three runs per surface.
- **[hypothesis]** Showing reader status stops people setting keys that nothing reads. Test: count `no reader` keys in real configs before and after the config lens.

## 9. Decisions for the owner

1. **Binary names.** Keep `qagent` and `acs`, or rename to `aos`. The prototype says `aos.` in the brand mark only.
2. **Canonical console.** Rust `acs` on `rust-port` (P09) or a TypeScript console in `src/`. The design does not depend on it; the parity test does.
3. **Where Accelerate lives in ACS.** Proposed: `design/accelerate/` holding the tokens, the bundle and the fonts, with ACS's current `DESIGN.md`, `.impeccable/` and `design.json` retired in the same PR. Recommended, because two design systems in one repo is the drift this spec exists to prevent.
4. **Config editing scope in the dashboard.** Proposed: stage, apply and roll back for non-secret keys; commands and env stay file only. Recommended.
5. **Memory approval policy.** Proposed: agents write thread and agent scope freely, project scope waits for the operator. Recommended.
6. **Font subset.** Accelerate's IBM Plex Mono subset has no box-drawing, arrows or block glyphs (U+2190–21FF, U+2500–259F, U+25A0–25FF). The prototype draws them in CSS; extending the subset by about 10 KB is simpler. Recommended.

## 10. Left out on purpose

KPI tiles without a list behind them, charts of activity over time, a chat pane, removing or editing agents, editing harness commands from a browser, a theme picker beyond Void and Paper, animation beyond the one live pulse. Each either has no verb behind it or adds noise without answering one of the three questions.
