# D01: Design of the AOS command line, terminal console and dashboard

- **Kind:** design spec (no code). It ties P05, P09 and P10 into one model and adds the pieces they leave open.
- **Edge or parity:** the three-question screen, board and timeline are PARITY (`hermes-delta.md` rows 2, 12). The candidate edges are marked **[hypothesis]** below and are tested in section 11, not claimed.
- **Cost:** L in total, staged in section 10. **Risk:** medium; the main risk is drifting into an ornamental dashboard (section 9).
- **Targets:** TypeScript core and dashboard (`src/core/`, `src/cli/`, `src/dashboard/`), Rust TUI (`rust/src/app.rs` on `rust-port`).
- **Status:** proposed. Needs the owner's word on the open decisions in section 12 before any build.
- **Companion prototype:** a clickable console built from fixture data (https://claude.ai/artifact/JKLMqiCekJFcktsit2kcMw, private to the owner). The fixture is illustrative; it contains no real run.

## 1. What exists today

`codex/cli-foundation` holds only `MANIFESTO.md` and the README (2 commits, checked 2026-10-01). There is no AOS CLI to design against, so this spec designs for the code AOS grows from: the `qagent` CLI (`src/cli/`), the localhost dashboard (`src/dashboard/`) and the `acs` ratatui TUI (`rust-port`). Names below use `qagent` and `acs`; renaming is an owner decision (section 12).

Captured by running them on 2026-10-01 against a 4-agent, 3-task bus (files in `assets/`):

- **Dashboard**, `assets/D01-acs-dashboard-today.png`: a single column of Agents, Open tasks, Recent messages. No stuck, needs-you, cost, tree or timeline; no task detail.
- **TUI**, `assets/D01-acs-tui-today-80x24.txt`: three panes at 80x24. The task rows are cut off after the title (`#1   Add stall detection im`), so the task state is not visible; the messages pane is cut at `[TASK`, and nothing shows stuck, needs-you or cost. Matches P09's reading of `rust/src/app.rs`.
- **CLI**, `qagent status`: agents table and open tasks. Same gap.

All three disagree on nothing today because none of them says much. They will disagree as soon as each grows its own queries, which is the failure this spec exists to prevent.

## 2. Thesis: the event log is the interface

The bus already has an append-only `events` table with a sequence number. Every surface becomes a *view of that log*, and every fact on screen carries the `#seq` that produced it. Three consequences drive everything below:

1. **One read model.** The core computes one `Frame` (section 3). CLI, TUI and dashboard render it; none runs its own SQL for display.
2. **One verb set.** Operator actions (section 5) are core functions. Each appends exactly one event with a `why`. A surface may expose a verb only if the other two do.
3. **Nothing is anonymous.** A number answers a question and links to the list behind it. An item without a `#seq` is a bug.

The screen answers, in this order and in words: *what is stuck, what needs you, what it costs*, then the open questions the agents could not resolve (MANIFESTO: "An unresolved question must remain visible").

## 3. Shared state model: `Frame`

Produced by one core function, `frame(bus, {scope, since})`, returned as JSON by `qagent status --json`, streamed by the dashboard's existing SSE delta channel, and read by the Rust TUI through the same queries (ported, schema-guarded by P02). Shape (names are proposals):

```ts
Frame = {
  seq: number,                       // bus head when computed
  run: { id, goal, state: 'live'|'paused'|'idle', pausedBy?: seq },
  attention: {
    needsMe: Item[],                 // submitted for me, escalations, unroutable review, acks, open decisions
    stuck:   Item[],                 // from stalledTasks/deadClaims, with minutes
    questions: Item[],               // unresolved, from agents or planner
  },
  cost: { usd: number|null, tokens: number, budgetUsd?: number,
          unreportedTurns: number, byAgent: {...} },   // null means "not reported", never 0
  tree:   Task[],                    // parent_id + task_deps
  agents: Agent[],                   // state, family, last seq, spend
  recent: Event[]                    // tail of the log for the timeline lens
}
Item = { id, kind, taskId?, title, why, seq, since }   // seq is mandatory
```

`why` is a generated one-line reason ("reviewer rev-1 (google) ready; author impl-a (anthropic)"). It is what lets a person triage without opening anything. Cost fields follow P05: `turn_usage` events, `null` when a harness does not report.

**Parity test (the guard against drift):** a fixture bus renders through all three surfaces; a script extracts the set of `(id, seq)` pairs from `status --json`, the TUI's `--dump` mode and the dashboard's DOM, and fails if they differ. This test is part of the first build PR.

## 4. Information architecture

Five lenses, identical names and numbers on every surface. Each answers one question.

| # | Lens | Question | Built from |
|---|---|---|---|
| 1 | **Now** | what is stuck, what needs me, what does it cost, what is unresolved | `attention`, `cost`, agents |
| 2 | **Tree** | how is the goal broken down, who owns what | `tree` (parent_id) |
| 3 | **Board** | where is each task in its life | `tree` grouped by state |
| 4 | **Graph** | what blocks what | `task_deps` (dashboard only; TUI shows blockers in Tree) |
| 5 | **Timeline** | what happened, in order, and why | `recent` / `events` |

Detail for any task is a drawer (dashboard) or a card (TUI): state, assignee, reviewer and whether the reviewer is a different model family, dependencies, result, open questions, last events with `#seq`. Agents, Memory and Config are deliberately absent until P11 and P15 give them something true to show; the prototype greys them out and says "Not yet".

Two details no other surface in this repo has:

- **Reviewer family is shown on every review item** ("rev-1 gemini ≠ claude"). It is only meaningful once P03 enforces it; until then the line reads "same family" when it is, honestly. **[hypothesis]** that operators triage faster and trust reviews more when this is visible; tested in section 11.
- **Unknown cost is a state, not zero.** "cost n/a" with a count of unreported turns.

## 5. Verbs (one set, three surfaces)

| Verb | CLI | TUI key | Dashboard | Event |
|---|---|---|---|---|
| accept | `task review N --accept --why …` | `a` | Accept | `review_accepted` |
| request changes | `task review N --revise --why …` | `r` | Request changes | `changes_requested` |
| requeue | `task requeue N` (exists) | `u` | Requeue | `task_requeued` |
| reassign | `task assign N <agent>` | `g` | Assign | `task_assigned` |
| cancel | `task cancel N --why …` | `x` | Cancel | `task_cancelled` |
| answer | `ask answer Q --why …` | `y` | answer box | `question_answered` |
| pause / resume | `pause`, `resume` | `p` | Pause run | `run_paused` / `run_resumed` |
| open trace | `trace N` | `Enter` on `#seq` | Show events | none (read) |

In the TUI, a verb key on the selected row opens the card with the `why` prompt focused; Ctrl+letter commits (section 8). `--why` is required for accept, revise, cancel and answer (the P08 "purpose" field). Pause and resume are P07; if P07 is not built, the keys are absent, not stubbed. The command line (`:` in TUI and dashboard) accepts the CLI's grammar verbatim, so one muscle memory covers all three.

## 6. CLI

Scriptable, boring, composable. Rules: every command has `--json` (the `Frame` slice it prints); human output is plain text, no colour required, stable column order; exit codes are meaningful (`wait` already uses 0/2).

```
qagent status                 three answers + agents (below)
qagent needs                  just the needs-you list (exit 0 if empty, 3 if not)
qagent stuck [--min N]        stalled list (exists as `task stalled`)
qagent cost [--since 24h]     tokens and USD, n/a counted
qagent tree [N]               indented subtree
qagent trace N | --thread T   causal chain with seq (P05)
qagent export --format json|html   whole bus, self-contained
```

`needs` exiting non-zero is the scriptability hook: `qagent needs || notify-send …` works without a daemon.

Target `status` output at 80x24 (mock, not current behaviour):

```text
bus ~/.agent-bus/bus.db  run r-0412 live  seq #412  5 agents (3 working)

NEEDS YOU 3
  #7  submitted  Hard USD cap per run          rev-1 gemini ≠ codex      #411
  #3  submitted  Add per-task token cap in…    rev-1 gemini ≠ claude     #409
  #6  unrouted   Cost on status screen         no agent can take it      #360
STUCK 2
  #4  47m  impl-b  Loop guard: same tool call 5x                          #371
  #8  60m  impl-a  Docs: budgets and limits                               #402
QUESTIONS 1
  #7  USD cap vs unknown cost (codex, hermes)?                            #407
COST   $5.20 of $60.00 · 1.13M tokens · 2 agents report no cost (n/a)
```

## 7. Terminal console (`acs`)

One screen, three zones, keyboard only. Usable at 80x24; wider terminals add a right-hand card, never different content.

Rules from AGENTS.md bars: redraw only on change (blocking wait on the watcher, wake for the next time-based change only; P09); every row ends in `#seq`; minimum size message below 80x24 instead of clipping.

### 7.1 Now (default)

```text
AOS r-0412 budget enforcement   stuck 2 · needs you 3 · $5.20 of $60 · live #412
────────────────────────────────────────────────────────────────────────────────
NEEDS YOU 3
> #7  submitted  Hard USD cap per run           rev-1 gemini ≠ codex       #411
  #3  submitted  Add per-task token cap in…     rev-1 gemini ≠ claude      #409
  #6  unrouted   Cost on status screen          no agent can take it       #360
STUCK 2
  #4  47m  impl-b  Loop guard: same tool call 5x                           #371
  #8  60m  impl-a  Docs: budgets and limits                                #402
QUESTIONS 1
  #7  USD cap vs unknown cost (codex, hermes)?                             #407
AGENTS
  lead ● claude   impl-a ● claude   impl-b ● codex   rev-1 ○ gemini
  scout · hermes (offline)                                1.13M tok · 2 cost n/a
                                                                                
                                                                                
                                                                                
                                                                                
                                                                                
                                                                                
────────────────────────────────────────────────────────────────────────────────
 j/k move  Enter open  a accept  r revise  p pause  : command  ? keys   1-5 lens
```

Header words are the three answers. Pressing `Tab` jumps between the NEEDS YOU, STUCK and QUESTIONS groups; `Enter` opens the card for the selected row. Unused rows stay blank: the screen does not fill space with decoration.

### 7.2 Review card (Enter on #7)

```text
#7 Hard USD cap per run                                    submitted · round 1
────────────────────────────────────────────────────────────────────────────────
author    impl-b  codex (openai)
reviewer  rev-1   gemini (google)   different family
depends   #3 submitted
result    cap checked before each turn; cost unknown for codex turns, tokens
          used instead
question  #407 USD cap vs unknown cost (codex, hermes)? unanswered

EVENTS
  #411 impl-b   task_submitted   USD cap, round 1
  #407 impl-b   question         USD cap vs unknown cost
  #371 lead     task_created     #7 Hard USD cap per run

why> _
                                                                                
                                                                                
                                                                                
                                                                                
                                                                                
────────────────────────────────────────────────────────────────────────────────
 Ctrl-A accept  Ctrl-R request changes  y answer question  Esc back  t trace
```

A reason is typed first; the verb key then commits. Accepting with an unanswered question shows a one-line warning, not a block (the operator's authority is theirs).

### 7.3 Tree

```text
AOS r-0412 budget enforcement   stuck 2 · needs you 3 · $5.20 of $60 · live #412
────────────────────────────────────────────────────────────────────────────────
TREE                                                    state            owner
[-] #1 Ship budget enforcement for runs                 working          lead
    #2 Research budget prior art                        accepted         scout
  > #3 Add per-task token cap in core                   submitted        impl-a
    #4 Loop guard: same tool call 5x                    working 47m!     impl-b
    #5 Pause and resume from CLI                        changes req.     impl-a
    #6 Cost on status screen                            open             -
    #7 Hard USD cap per run                             submitted        impl-b
    #8 Docs: budgets and limits                         working 60m!     impl-a
                                                                                
                                                                                
                                                                                
                                                                                
                                                                                
                                                                                
                                                                                
                                                                                
────────────────────────────────────────────────────────────────────────────────
 j/k move  h/l fold  Enter open  / filter  1-5 lens  : command  ? keys
```

`!` marks stuck in text; there is no status colour (DESIGN.md). Colour, where a terminal has it, only dims the secondary columns and marks the selected row.

### 7.4 Timeline and trace

```text
TIMELINE  task #7                                      filter: / · clear: Esc
────────────────────────────────────────────────────────────────────────────────
#412  rev-1    review_started     #3   reviewing impl-a (anthropic) as google
#411  impl-b   task_submitted     #7   USD cap, round 1
#409  impl-a   task_submitted     #3   token cap in core, round 1
#407  impl-b   question           #7   USD cap vs unknown cost
#405  rev-1    changes_requested  #5   resume does not restore claimed tasks
#402  impl-a   task_note          #8   drafting section on limits
#398  lead     task_note          #1   plan: caps first, then guards, then UI
#371  impl-b   task_note          #4   tool call repeated; trying alt regex
                                                                                
                                                                                
                                                                                
                                                                                
                                                                                
                                                                                
                                                                                
                                                                                
                                                                                
────────────────────────────────────────────────────────────────────────────────
 j/k move  Enter jump to task  f filter kind  t this task only  Esc back
```

### 7.5 States that must be designed, not left to chance

```text
FIRST RUN (no bus yet)
  No agents yet. Add one with  qagent agent add <id> --role <role>
  or press  a  here. Then press  t  to give it a task.      (about 2 minutes)

NOTHING NEEDS YOU
  NEEDS YOU 0   Nothing is waiting on you. Next check happens when a task is
  submitted or an agent asks a question.

PAUSED
  header: ... · PAUSED by operator #413 · press p to resume
  new claims are refused; running turns finish; the list below is unchanged.

BUS UNREADABLE OR NEWER SCHEMA (P02 guard)
  Cannot read bus: schema 7 is newer than this build (6). Nothing was changed.

TERMINAL TOO SMALL
  needs 80x24, this is 62x20
```

## 8. Keyboard model

Modeless navigation, one prompt, no chords beyond Ctrl for destructive commits.

- **Move:** `j/k` or arrows; `h/l` fold; `g/G` first/last; `Tab` next group.
- **Lens:** `1`-`5`. **Open:** `Enter`. **Back:** `Esc`.
- **Act:** verb keys from section 5 operate on the selected row. Verbs that change state ask for a `why` first and commit with Ctrl+letter, so a stray `a` never accepts anything.
- **Command line:** `:` (or `/` to filter). Grammar is the CLI's: `:accept 7 --why …`, `:pause`, `:trace 7`, `:goto 3`.
- **Everything is reachable without a pointer**; mouse is optional in the TUI and standard in the dashboard. The dashboard binds the same keys when focus is not in a field; `?` lists them.

## 9. Dashboard

Same five lenses, same words, same keys. It adds only what a terminal cannot do well: the dependency graph as server-rendered SVG, simultaneous list and detail (right-hand drawer), and links you can share within the machine.

- **Layout:** top strip with the three answers as buttons that jump to their lists; lens rail; one reading pane; drawer for the selected item; command line at the bottom. At phone width the rail becomes a row and the drawer stacks.
- **Visual language:** `DESIGN.md` as amended by P10: flat, hairlines, system fonts, one accent for links and focus, no icons, no gradients, no external assets, CSP nonce. State is a word. "Needs you" is distinguished by position and weight, not colour. Both themes, because the artifact page must follow the viewer's theme; the product default stays the dark palette in `DESIGN.md`.
- **Writes:** the verbs in section 5, each one POST, same-origin, session-bound, one event with `why`. No config editing, no process spawning (P10 risk list).
- **Idle:** one SSE connection, no polling beyond the existing 10 s safety read; unchanged from `src/dashboard/server.ts`.
- **Budget against becoming the removed React dashboard:** no client framework, no router (URL fragments pick the lens), asset size cap asserted in a test.

The prototype implements Now, Tree, Board, Graph and Timeline, the drawer, `why`-required actions that append events, pause/resume, the command line and the keys above, on fixture data.

## 10. Build order (maps to existing proposals)

1. **P05** computes attention and cost; extend it to emit the `Frame` and `status --json` (new: `needs`, `tree`, `cost` commands, `why` strings). This is the core of D01.
2. **P09** renders Now, the review card and the 80x24 layout; add Tree and Timeline lenses and the parity test.
3. **P10** adds the dashboard views and the amendment. Reuse the `Frame`; the dashboard's `/api/state` becomes `/api/frame`.
4. **P08** supplies `why`; without it, section 5 cannot hold. **P07** supplies pause/resume. **P03** makes the reviewer-family line enforceable rather than merely shown.

New work this spec adds beyond those proposals: the `Frame` contract and parity test, the `needs`/`tree`/`cost` commands, the question list as a first-class item (needs a `question` event kind; P13 defines `needs_decision`), and the Graph lens.

## 11. How the design is judged

- **Bars (AGENTS.md):** 80x24 render tests per screen (assert properties, not snapshots); idle draw count 0 over 60 s with an injected clock; every row has `#seq` (checked by the parity script); recording per UI PR.
- **Parity test:** section 3.
- **Triage time:** a stopwatch task on a finished fixture run: "name what is stuck, what needs you, what it cost, and accept one review". Measure with today's `status` and with the new screen. Target to be set after the baseline, not before.
- **Reviewer-family hypothesis:** after P03, with the benchmark's review tasks, compare operator accept/revise reversal rate with and without the family line. If there is no difference, remove the line.
- **First-run bar:** fresh install to first accepted task under 5 minutes, on a real machine; not measurable in a web session.

## 12. Open decisions for the owner

1. **Names.** Keep `qagent` and `acs`, or ship one `aos` binary with the TUI as `aos` (no argument) and the CLI as `aos <noun> <verb>`? Recommendation: one binary named by the owner, since two names for one state is the thing the manifesto argues against. AGENTS.md says not to call ACS "AOS" until it is; the rename is the owner's call.
2. **Canonical TUI implementation.** The console needs the `Frame` queries in both TS and Rust. Until the canonical implementation is decided (AGENTS.md "Two implementations"), the spec assumes TS is the schema reference and Rust is the live-operation surface.
3. **Replay.** Replaying the board "as of seq N" would be distinctive, but it only works if events carry full transitions. Not verified; this spec does not depend on it. Check `events.data_json` coverage before promising it.
4. **Colour.** DESIGN.md has no status colour. The spec keeps that. Say if a single alert tone is wanted for "needs you".

## 13. Considered and rejected

- A chat pane as the primary surface. Messages are an event kind inside the Timeline lens; AOS is not a chat client.
- KPI tiles, sparklines and spend charts. "Spent $5.20 of $60" is a sentence with a link to the table behind it.
- A separate terminal-only and web-only vocabulary. One verb set, one lens list.
- Drag and drop on the board. Moving work is an explicit action with a reason.
- Animated or streaming token output in the console. The console reports state; transcripts stay in the trace.
