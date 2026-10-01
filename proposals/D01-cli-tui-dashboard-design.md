# D01: Design of the AOS command line, terminal console and dashboard

- **Kind:** design spec (no code). It ties P05, P09 and P10 into one model and adds the pieces they leave open.
- **Edge or parity:** the three-question screen, board and timeline are PARITY (`hermes-delta.md` rows 2, 12). The candidate edges are marked **[hypothesis]** below and are tested in section 11, not claimed.
- **Cost:** L in total, staged in section 10. **Risk:** medium; the main risk is drifting into an ornamental dashboard (section 9.2 lists what is left out on purpose).
- **Targets:** TypeScript core and dashboard (`src/core/`, `src/cli/`, `src/dashboard/`), Rust TUI (`rust/src/app.rs` on `rust-port`).
- **Status:** proposed. Needs the owner's word on the open decisions in section 12 before any build.
- **Design system:** Accelerate (owner-supplied, section 9.1) for the dashboard, adapted to the terminal in section 7.6.
- **Companion prototype:** a clickable console on Accelerate, built from fixture data (https://claude.ai/artifact/JKLMqiCekJFcktsit2kcMw, private to the owner). The fixture is illustrative; it contains no real run. Screenshots: `assets/D01-prototype-now-void.png`, `assets/D01-prototype-timeline-void.png`.

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

Scriptable, boring, composable, and in the same Accelerate voice as the other two surfaces (lowercase, `/` separators, numbered sections). Rules: every command has `--json` (the `Frame` slice it prints); human output is plain text, no colour required, stable column order; exit codes are meaningful (`wait` already uses 0/2).

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
bus ~/.agent-bus/bus.db / run r-0412 live / seq #412 / 5 agents (3 working)

■ 01 / needs you  03
  #7  submitted  hard usd cap per run          rev-1 gemini ≠ codex      #411
  #3  submitted  add per-task token cap        rev-1 gemini ≠ claude     #409
  #6  unrouted   cost on the status screen     no agent can take it      #360
■ 02 / stuck  02
  #4  47 min  impl-b  loop guard: same call 5x                           #371
  #8  60 min  impl-a  docs: budgets and limits                           #402
■ 03 / open questions  01
  #7  usd cap vs unknown cost (codex, hermes)?                           #407
■ 04 / cost
  $5.20 of $60.00 / 1.13M tokens / 2 agents report no cost (—)
```

## 7. Terminal console (`acs`)

One screen, three zones, keyboard only, in the Accelerate voice (section 9.1): lowercase, `/` separators, numbered eyebrows, `[ ok ]` status codes, one lime thing per screen. Usable at 80x24. Wider terminals add the rail and the card as columns, never different content. The adaptation of the design system to a terminal is in section 7.6.

Bars from AGENTS.md: redraw only on change (blocking wait on the watcher, wake for the next time-based change only; P09); every row ends in `#seq`; a "needs 80x24" message instead of clipping.

### 7.1 Now (80x24, default)

The tab line is the rail collapsed to one row; the current lens is lime and underlined. `>` marks the selected row. The first eyebrow is the only lime one.

```text
aos. / r-0412 / now                                                    live #412
[1] now  [2] tree  [3] board  [4] graph  [5] timeline
────────────────────────────────────────────────────────────────────────────────
stuck 02   needs you 03   open questions 02                   spent $5.20 of $60
────────────────────────────────────────────────────────────────────────────────
■ 01 / needs you
> #7   hard usd cap per run         submitted  rev-1 gemini ≠ codex         #411
  #3   add per-task token cap       submitted  rev-1 gemini ≠ claude        #409
  #6   cost on the status screen    open       no agent can take it         #360
■ 02 / stuck
  #4   loop guard: same call 5x     47 min     impl-b                       #371
  #8   docs: budgets and limits     60 min     impl-a                       #402
■ 03 / open questions
  #7   usd cap vs unknown cost (codex, hermes)?                             #407
■ 04 / agents
  lead ■  impl-a ■  impl-b ■  rev-1 ◇  scout ·          1.13M tok / 2 cost —





────────────────────────────────────────────────────────────────────────────────
 j/k move / enter open / a accept / r revise / p pause / : command / ? keys
```

`Tab` jumps between the needs-you, stuck and questions groups; `Enter` opens the card. Unused rows stay blank: the screen does not fill space with decoration.

### 7.2 Review card (Enter on #7)

```text
aos. / r-0412 / now / #7                                               live #412
────────────────────────────────────────────────────────────────────────────────
hard usd cap per run.                                        submitted / round 1
────────────────────────────────────────────────────────────────────────────────
author     impl-b / codex (openai)
reviewer   rev-1 / gemini (google)     ■ different family
depends    #3 submitted
result     cap checked before each turn. cost unknown for codex turns,
           tokens used instead
question   #407 usd cap vs unknown cost (codex, hermes)? unanswered

■ last events
  #411  impl-b   task_submitted   usd cap, round 1
  #407  impl-b   question         usd cap vs unknown cost
  #371  lead     task_created     hard usd cap per run

why  _
[ -- ] a reason is required. it is stored on the event



────────────────────────────────────────────────────────────────────────────────
 ctrl+a accept → / ctrl+r request changes / y answer / t trace / esc back
```

A reason is typed first; the verb key then commits. The accept line is the single lime item. Accepting with an unanswered question shows a one-line `[ !  ]` warning, not a block.

### 7.3 Tree

Paths replace indentation (Accelerate shows routes as paths): `/1/3` is task 3 under task 1.

```text
aos. / r-0412 / tree                                                   live #412
[1] now  [2] tree  [3] board  [4] graph  [5] timeline
────────────────────────────────────────────────────────────────────────────────
stuck 02   needs you 03   open questions 02                   spent $5.20 of $60
────────────────────────────────────────────────────────────────────────────────
■ 01 / 8 tasks
  /1          − ship budget enforcement for runs   working                  lead
  /1/2          research budget prior art          accepted                scout
> /1/3          add per-task token cap in core     submitted              impl-a
  /1/4          loop guard: same call 5x           stuck 47 min           impl-b
  /1/5          pause and resume from the cli      changes requested      impl-a
  /1/6          cost on the status screen          open                        —
  /1/7          hard usd cap per run               submitted              impl-b
  /8            docs: budgets and limits           stuck 60 min           impl-a





────────────────────────────────────────────────────────────────────────────────
 j/k move / h/l fold / enter open / / filter / 1-5 lens / : command
```

`stuck 47 min` is text in `heat`; there is no colour-only state.

### 7.4 Timeline and trace

The log is the one instrument panel on the screen, so it carries the corner ticks (`┌ ┐ └ ┘`) and ends in the cursor. Event kinds that mean trouble (`changes_requested`, `task_cancelled`) take `heat`; failures take `danger`.

```text
aos. / r-0412 / timeline                                               live #412
[1] now  [2] tree  [3] board  [4] graph  [5] timeline
────────────────────────────────────────────────────────────────────────────────
stuck 02   needs you 03   open questions 02                   spent $5.20 of $60
────────────────────────────────────────────────────────────────────────────────
┌ events.log / r-0412 ─────────────────────────────────────newest first / #412 ┐
│ #412  rev-1   review_started     #3  reviewing impl-a (anthropic) as google  │
│ #411  impl-b  task_submitted     #7  usd cap, round 1                        │
│ #409  impl-a  task_submitted     #3  token cap in core, round 1              │
│ #407  impl-b  question           #7  usd cap vs unknown cost                 │
│ #405  rev-1   changes_requested  #5  resume does not restore claimed tasks   │
│ #402  impl-a  task_note          #8  drafting section on limits              │
│ #398  lead    task_note          #1  plan: caps first, then guards, then ui  │
│ #371  impl-b  task_note          #4  tool call repeated; trying new regex    │
│ #360  lead    task_created       #6  show cost next to stuck and needs you   │
│ #341  scout   task_accepted      #2  rev-1 (google) accepted scout (nous)    │
│ ▍                                                                            │
└──────────────────────────────────────────────────────────────────────────────┘
────────────────────────────────────────────────────────────────────────────────
 j/k move / enter jump to task / f filter kind / t this task / esc back
```

### 7.5 States that must be designed, not left to chance

```text
first run (no bus yet)
  [ -- ] no agents yet. add one: qagent agent add <id> --role <role>
         or press a here, then t to give it a task

nothing needs you
  ■ 01 / needs you
  nothing is waiting on you. next check: a submission or a question

paused
  header: aos. / r-0412 / now        paused by operator #413 / p resumes
  [ !  ] new claims are refused. running turns finish

bus unreadable or newer schema (p02 guard)
  [ !! ] cannot read bus: schema 7 is newer than this build (6)
         nothing was changed

terminal too small
  [ !  ] needs 80x24, this is 62x20
```

### 7.6 Accelerate in a terminal

Accelerate (`accelerate-design-system`, supplied by the owner) is a web system: tokens, four type voices, hairline grids, one lime signal, fast mechanical motion. A terminal keeps the ideas and drops what it cannot render. Mapping:

**Colour.** Same tokens, three tiers chosen at start from `COLORTERM` and `TERM`: truecolor uses the token hex; 256-colour uses the nearest xterm index (below); 16-colour uses the ANSI approximation. Void is the default; Paper is used when the terminal reports a light background (OSC 11 reply, else `COLORFGBG`), and `AOS_THEME=void|paper` overrides.

| Token | Void hex | 256 | 16-colour | Use in the TUI |
|---|---|---|---|---|
| `ink-100` | #eeefe7 | 255 | bright white | primary text, selected row text |
| `ink-200` | #a9ada1 | 248 | white | secondary text, `why` lines |
| `ink-300` | #868b80 | 102 | bright black | meta, `#seq`, paths, labels |
| `line-100` | #2a2e27 | 235 | bright black | rules, box edges |
| `line-200` | #697163 | 242 | bright black | corner ticks, the operated-input border |
| `bg-200` / `bg-300` | #1b1e1a / #252923 | 234 / 235 | none | title bar, selected row (truecolor only) |
| `signal` | #d9ff6c | 191 | bright green | the one lime thing per screen |
| `heat` | #ff9654 | 209 | yellow | stuck, changes requested, `[ !  ]` |
| `danger` | #ff6b81 | 204 | red | failures, `[ !! ]` |
| `steel` | #86b9dc | 110 | cyan | submitted, info |

Paper swaps to the Paper hexes (`signal-ink` becomes olive #4a6400, 256: 58; `heat` #a84000, 256: 130; `danger` #b0153f, 256: 125; `steel` #2a6890, 256: 24). Lime is never used as text on a light terminal, the system's own rule. The terminal's own background is not painted: only `bg-200`/`bg-300` surfaces (title bar, selected row) are, and only in truecolor. In 256 and 16 colours the selected row is reverse video and the title bar is a rule. Status always carries a word or a code, so a 16-colour or monochrome terminal loses nothing.

**Type.** One monospace face replaces the four voices, so hierarchy comes from weight, dim and case, not size. Lens titles and eyebrows are bold lowercase; the accent period after a title (`needs you.`) is lime and is the only lime besides the focus item. Display type and the big Antonio readout digits are dropped; the readout becomes the header strip `stuck 02   needs you 03   ...` (two rows, label over value, from 100 columns). Numbers use fixed width and fixed precision per column, and `—` for a missing value, exactly as the system specifies. Casing is lowercase everywhere except proper nouns and code.

**Layout.** The Shell becomes a column budget, mirroring `rail` / main / aside:

| Terminal | Layout |
|---|---|
| under 80x24 | `[ !  ] needs 80x24` and nothing else |
| 80 to 99 columns | tab line (rail collapsed to one row); main; card replaces main on `Enter` |
| 100 to 139 | 24-column rail with dotted leaders and `[1]` to `[5]` indexes; main |
| 140 and wider, or 120x30 with the card | rail (24), main, card (about 34); the card is the aside |

At 120x30 with the card open the same content looks like this (excerpt, truncated rows kept so widths are real):

```text
aos. / r-0412 / now                                                                                            live #412
────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
│ aos.                   │ stuck 02  needs you 03  questions 02  spent $5.20 of $60         │ task / #7
│                        │ ────────────────────────────────────────────────────────────     │ hard usd cap per run.
│ run r-0412             │ ■ 01 / needs you                                                 │ submitted / round 1
│                        │ > #7  hard usd cap per run      submitted        #411            │
│ ■ now ········ [1]     │   #3  add per-task token cap    submitted        #409            │ reviewer rev-1 gemini
│ ▤ tree ······· [2]     │   #6  cost on the status screen open              #360           │ ■ different family
│ ◇ board ······ [3]     │ ■ 02 / stuck                                                     │ depends #3
│ § graph ······ [4]     │   #4  loop guard: same call 5x  47 min           #371            │
│ ▍ timeline ··· [5]     │   #8  docs: budgets and limits  60 min           #402            │ why  _
│                        │ ■ 03 / open questions                                            │ [ -- ] reason required
│ not yet                │   #7  usd cap vs unknown cost?                   #407            │
│ ? agents ····· [–]     │                                                                  │ accept → / request changes
│ ? memory ····· [–]     │                                                                  │
│ ? config ····· [–]     │                                                                  │
│                        │                                                                  │
│                        │                                                                  │
│                        │                                                                  │
│                        │                                                                  │
│                        │                                                                  │
│                        │                                                                  │
│                        │                                                                  │
│                        │                                                                  │
│                        │                                                                  │
│                        │                                                                  │
│                        │                                                                  │
│                        │                                                                  │
────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
 j/k move / enter open / a accept / r revise / p pause / : command / ? keys
```

**Lines and glyphs.** Hairlines are light box-drawing (`─ │`), square corners only (`┌ ┐ └ ┘`, never `╭`). Corner ticks mark the single instrument panel (the log, or the card), at most twice per screen. Rail items use the system's glyphs `■ ▤ ◇ § ? ▍`, a dotted leader `····` and a bracketed index that doubles as the shortcut. Status codes are the system's: `[ -- ]` idle, `[ .. ]` busy, `[ ok ]`, `[ !  ]`, `[ !! ]`. Tags are `■ word`, colour repeating the word. If `LANG` is not UTF-8 the glyphs fall back to ASCII: `# = o s ? |` for `■ ▤ ◇ § ? ▍`, `-` for `─`, `+` for corners.

**Motion.** The system's motion is mechanical and small; the TUI has less. Hover steps, 120/200 ms transitions and the 2 px nudge do not exist. The two allowed loops are handled so they cost no redraw: the block cursor is the terminal's own blinking cursor (DECSCUSR), set once; the pulsing live mark on working tasks is a static `●` (working) versus `○` (idle), because a pulse needs a timer and would break the zero-redraws-when-idle bar. The ticker is not ported: the system says use it only for real current values, and nothing in the console needs to scroll.

**Voice.** Copy follows the system's rules: terse, declarative, scoped, lowercase, third person for the system, "you" only in instructions; numbers two-digit and zero-padded in eyebrows; metadata separated by ` / `, never bullets or pipes; no exclamation marks, no emoji. Example: `[ ok ] recorded as event #413`, not "Success! Your review was saved."

**What is not borrowed.** The imagery treatments (duotone, dither, orbits), the wordmark in Archivo and the `ax-frame` border do not exist in a terminal. The wordmark is the text `aos.` with a lime period.


## 8. Keyboard model

Modeless navigation, one prompt, no chords beyond Ctrl for destructive commits.

- **Move:** `j/k` or arrows; `h/l` fold; `g/G` first/last; `Tab` next group.
- **Lens:** `1`-`5`. **Open:** `Enter`. **Back:** `Esc`.
- **Act:** verb keys from section 5 operate on the selected row. Verbs that change state ask for a `why` first and commit with Ctrl+letter, so a stray `a` never accepts anything.
- **Command line:** `:` (or `/` to filter). Grammar is the CLI's: `:accept 7 --why …`, `:pause`, `:trace 7`, `:goto 3`.
- **Everything is reachable without a pointer**; mouse is optional in the TUI and standard in the dashboard. The dashboard binds the same keys when focus is not in a field; `?` lists them.

## 9. Dashboard

### 9.1 Design system: Accelerate

The owner supplied Accelerate as the design system for the dashboard. It replaces two earlier visual references: `DESIGN.md` (flat, no status colour, one reading column, now superseded; P10's "amendment" becomes "adopt Accelerate") and `.impeccable/design.json` ("night sector console"). Both stay in ACS until the owner retires them. What the system asks of this product:

- **Instrument, not ornament.** Structure from hairline rules and numbered grids, no shadows at rest, square corners.
- **One signal.** Lime marks the single thing that matters on a screen. In the console that is the primary action (accept, or requeue when a task is stuck); the current lens in the rail is lime by the system's own rule. Nothing else is lime.
- **Voice.** Lowercase, terse, scoped, `/` separators, two-digit numbering, accent period on titles, no emoji or exclamation marks.
- **Status carries a word.** Tags and status lines say the state in words (`submitted`, `stuck`, `[ ok ]`, `[ !! ]`); tone repeats it. The earlier open question about an alert colour is answered by the system: `heat` for warning and stuck, `danger` for failure, `steel` for info.
- **Two themes** from the same tokens, Void (default) and Paper. The prototype also follows the viewer's light/dark setting.

### 9.2 Layout and component mapping

The console is an Accelerate Shell: rail, one main column, an aside.

| Screen part | Accelerate component | Content |
|---|---|---|
| left column | `ax-rail` (312 px) | wordmark `aos.`, chip `run r-0412`, five lenses with glyphs and `[1]` to `[5]` indexes, a `not yet` chip for agents, memory and config, then run status and the pause control |
| top of main | `ax-command` | `/ aos : now`, opens the command palette (`:` or `⌘K`); the palette floats with `shadow-float` |
| title | display type, lowercase, accent period | the lens question: `what needs you.`, `what blocks what.` |
| three answers | `ax-readout` | `stuck 02`, `needs you 03`, `open questions 02`, `spent $5.20 of $60` with "2 agents report no cost" as the delta line. A missing cost is `—`, never 0 |
| lists | numbered `ax-eyebrow` sections, hairline rows | `01 / needs you` (loud), `02 / stuck`, `03 / open questions`, `04 / cost by agent` (quiet eyebrows). Each row is `#id`, title, a tag, `#seq` |
| state | `ax-tag` | `submitted` (info), `accepted` (ok), `changes requested` and `stuck` (warn), `working` (live), `open` (neutral) |
| tree | paths | `/1/3` instead of indentation; `+` and `−` fold |
| board | border-collapsed lattice | numbered columns by lifecycle; no gaps between cells, no drag |
| graph | `ax-panel ax-ticks ax-dots` plus `ax-figure` caption | hairline SVG, selected node in `signal-edge`, caption `fig. 01 / task dependencies` |
| timeline | `ax-terminal ax-ticks` | `events.log / r-0412`, one line per event with `#seq`, actor, kind, task, text; ends in the cursor |
| aside | `ax-shell__aside` | the selected task: eyebrow `task / #7`, serif title with accent period, key-value block, reviewer family tag, `ax-field` for the reason, `ax-status` line, buttons, last events |
| actions | `ax-btn` | `accept →` is the one primary; `request changes`, `requeue`, `show events` secondary or ghost; `cancel` is a danger button with a confirm step |
| feedback | `ax-status` | `[ ok ] recorded as event #413`; `[ !! ] a reason is required...` |

Left out on purpose: the ticker (no live values worth scrolling, and it breaks the idle bar), duotone and dither imagery, the `ax-frame` border (tools never carry it), a signal band. One `ax-ticks` panel per view (the log or the graph), at most two.

### 9.3 Behaviour

- **Writes:** the verbs in section 5, each one POST, same-origin, session-bound, one event with `why`. No config editing, no process spawning (P10 risk list).
- **Idle:** one SSE connection and the existing 10 s safety read. The only animation is the system's live pulse and cursor, both CSS, no JS timers.
- **Fonts:** the system's four families (Antonio, Archivo, IBM Plex Mono, Newsreader). AGENTS.md and ACS's CSP forbid external assets, so the dashboard serves the system's self-hosted `woff2` files (about 190 KB for the Latin subsets, already in the system's `fonts/` folder, SIL Open Font License). The prototype loads them from Google Fonts only because an artifact page cannot ship font files.
- **Budget against becoming the removed React dashboard:** no client framework, no router (URL fragments pick the lens), the system's CSS (about 25 KB, `tokens.css` plus `bundle.css`) as the only stylesheet, asset size cap asserted in a test.
- **Open item for the owner:** ACS's `DESIGN.md` forbids external assets and charts and says the page "does one thing". Adopting Accelerate means replacing that file; the spec does not edit it.

The prototype implements every row of the table above on fixture data: five lenses, the aside with `why`-required actions that append events, a confirm step on cancel, pause and resume, the command palette with the CLI grammar, the keys from section 8, and both themes.


## 10. Build order (maps to existing proposals)

1. **P05** computes attention and cost; extend it to emit the `Frame` and `status --json` (new: `needs`, `tree`, `cost` commands, `why` strings). This is the core of D01.
2. **P09** renders Now, the review card and the 80x24 layout; add Tree and Timeline lenses and the parity test.
3. **P10** adds the dashboard views on Accelerate (replacing its DESIGN.md amendment with adopting the system). Reuse the `Frame`; the dashboard's `/api/state` becomes `/api/frame`.
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
4. **Accelerate in the product repo.** Where the design system lives (ACS `docs/` or a package) and when `DESIGN.md` and `.impeccable/design.json` are retired. The spec assumes Accelerate replaces both.

## 13. Considered and rejected

- A chat pane as the primary surface. Messages are an event kind inside the Timeline lens; AOS is not a chat client.
- KPI tiles, sparklines and spend charts (the system's `readout` is a row of computed values, which is what the header strip is).
 "Spent $5.20 of $60" is a sentence with a link to the table behind it.
- A separate terminal-only and web-only vocabulary. One verb set, one lens list.
- Drag and drop on the board. Moving work is an explicit action with a reason.
- Animated or streaming token output in the console. The console reports state; transcripts stay in the trace.
