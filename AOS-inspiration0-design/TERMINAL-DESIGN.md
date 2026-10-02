---
name: AOS Acceleration Chamber
surface: CLI and interactive TUI
mode: Operate
status: durable design contract
---

# AOS Acceleration Chamber: Terminal Design System

## Resolved terminal contract — 2026-09-19

These decisions supersede conflicting examples in this file, AGENT-SHELL.md,
CLI-SURFACE.md, and the earlier architecture blueprint.

| Question | Decision | Reason |
|---|---|---|
| Label width: 12, 13, or 14 | Labels occupy exactly 12 terminal columns; values begin at column 13. There is no additional separator space. | This is the explicit geometry in CONTEXT.md and the reconstructed-screen acceptance tests. |
| Rule width: 76, 78, or the terminal | Structural rules span their containing region. The standalone design diagnostic caps its specimen rule at 78 columns. Inline editable blocks reserve the last terminal column to prevent wrap ambiguity. | A specimen is bounded; a pane boundary must match the pane it separates. The old 76-character examples are illustrative. |
| Disconnected marker | `~ disconnected` everywhere. | `!` means intervention or conflict; `.` means waiting or dormant. |
| Tool trace | `MARKER state  tool_name  bounded detail`, with the state field padded to eight characters. Both state and tool name appear on every event. | The shorter `> READ` example omitted the lifecycle state. Tool identifiers retain their exact spelling. |
| Expanded aperture | Four lines: input branches, convergence stem, `> < decision`, outgoing generation. It appears only at a focal transition; compact views use `> <`. | The eight-line illustration consumes the narrow-screen decision budget without adding state. |
| Display case | Authored interface labels and prose are lowercase. User text, file paths, identifiers, environment names, model names, and command syntax retain their emitted case. | Case is data for machine strings, and unnecessary emphasis for interface labels. |

Canonical expanded aperture:

```text
inputs --+-- dissent
         |
        > < decision
         +--> next generation
```

The provider's private reasoning is never displayed. “Reasoning” view controls
show activity summaries and tool traces only. Streaming displays response text;
usage updates come from provider receipts.

The terminal is the same instrument as the dashboard, translated into a native
operating surface. It must make state, causality, authority, and the next action
legible before it makes the system feel fast. The terminal carries the
Acceleration Chamber through whole-field void and cobalt, severe boundaries,
localized signal, an open convergence aperture, and explicit decision gates.
It does not imitate a web page with ASCII art.

This file defines the durable visual and interaction rules shared by command
output and the interactive TUI. The CLI/TUI surface brief in
docs/design/CLI-SURFACE.md defines screen order, command vocabulary, density
budgets, and synthetic frames.

## Authority hierarchy

The highest authority is Claude Design's authored package:

1. The design bible in AOS Design System.zip, especially its uploaded DESIGN.md.
2. The authored files beside the archive: IDEA.md, REFERENCE_INDEX.md,
   CLAUDE_DESIGN_PROMPT.md, and example.html.
3. The source tokens, component prompts, and component examples inside the
   archive, including the Aperture, Global Rail, CLISheet, DecisionGate,
   AccelerationField, ConvergenceCore, GenerationRift, EvidencePlate,
   Telemetry, and StateBadge definitions.
4. PRODUCT.md in the authoritative AOS repository for product truth and
   implementation constraints.

The abandoned repository's generated implementation screenshots and
AI-generated mockup pictures are rejected visual authority. They are not
evidence for this translation, and no terminal pattern here is derived from
them. The authored package's design decisions are the source.

## Scope and limits

The authored package establishes the Acceleration Chamber: severe cobalt and
white fields, a quiet perimeter, thin contemporary typography, hard edges,
sparse rhythm, recursive delegation, compressed time, convergence, mutation,
and inspectable human gates. Its colors, aperture, hierarchy, convergence,
mutation, and gate language are carried forward. Web-only imagery and
implementation details are not.

The CLI is the first implementation surface. Provider names, authentication
flows, engine packaging, and backend command spelling remain runtime decisions.
This design specifies how a supported runtime must report them. It never turns a
proposed command, an illustrative run, or an unavailable provider into evidence
that the capability exists.

## Operating thesis

AOS is a research-control instrument for a difficult goal moving through
delegation, evidence, synthesis, and an attributable decision. A terminal view
is successful when an operator can answer five questions without hunting:

1. What goal or run is in scope?
2. What changed most recently?
3. Which owner and causal path produced that change?
4. What evidence, uncertainty, or conflict constrains it?
5. What action is available, and which authority does it require?

The terminal uses one focal event per view and no more than three major regions.
The focal event can be an active branch, an unresolved objection, a proposed
mutation, or a decision gate. The rest of the screen is quiet context.

### Durable invariants

- The same engine state is addressable from the dashboard, command CLI, and TUI.
- Live, simulated, synthetic, unavailable, and unverified state are explicit.
- Goal, owner, parent, child, model or harness, state, evidence, cost, time,
  and next gate remain recoverable at every depth.
- A consequential action states its effect, reversibility, required authority,
  and confirmation text before it can be committed.
- Unlimited logical scale is represented through named aggregates and drill-down.
  The terminal never fakes an upper bound and never renders every worker.
- Color and motion add emphasis. Words, ordering, and glyphs carry meaning.
- The current focal path is bright. The perimeter is calm.
- Every visual device has a one-sentence system meaning.

## Terminal translation of the Acceleration Chamber

The web surface expresses the identity through large fields, rails, traces, and
spatial compression. The terminal expresses the same relationships through
ordered lines, indentation, full-width state bands, and explicit transitions.

| Acceleration Chamber element | Terminal-native pattern | Required meaning |
|---|---|---|
| Open convergence aperture | Baseline mark " > < "; expanded four-line aperture only at a focal event | Work branches toward a decision, then exits as a next generation. It is never a decorative spinner. |
| Global rail | One top line for scope, route, state, and connection; one optional bottom line for focus, key hints, and gate status | Persistent orientation without a sidebar. |
| Whole-field cobalt / void contrast | Void is the default field. Cobalt owns the active route, focused gate, or selected causal band across its full line or region | Cobalt is a committed state field, not a scatter of blue badges. |
| Localized intensity | A single active row or gate receives the signal color and the strongest text contrast. Unrelated rows recede to mineral | Activity has a location and a cause. |
| Thin boundaries | ASCII " - ", " | ", " + ", " > " and indentation are the baseline. Unicode rules are an optional enhancement | Regions, ownership, and change boundaries remain visible without box-drawing support. |
| Telemetry | Label-first key/value rows with units, stable alignment, and a timestamp or revision when live | Runtime facts are inspectable and copyable. |
| Hierarchy | A causal spine with stable IDs, parent labels, branch glyphs, state words, and aggregate rows | Delegation is ordered by cause, not decorative network geometry. |
| Agent trace | A line or event record with source, destination, state, and time; "->" indicates direction | A trace has provenance and a destination. |
| Convergence | A CONVERGENCE block with inputs, evidence count, objections, unresolved items, and proposed outcome | Compression is reversible into its inputs. |
| Mutation seam | A full-width MUTATION rule naming old and new generation, changed rules, regressions, and rollback point | A new generation is a visible seam, never a magical upgrade. |
| Decision gate | A GATE block or full-width gate band with authority, effect, reversibility, and numbered choices | The operator can see consequences before acting. |
| Context inspector | A focused detail region or an explicit inspect command | Detail is on demand and never crowds the causal path. |
| Bottom decision strip | A final command block with the next action, required confirmation, and safe escape | The next action is concrete and attributable. |

### The five signature terminal devices

These are the only recurring brand devices. They are functional and should
appear consistently in command output and the TUI.

1. **Open Aperture** — " > < " is the compact mark. Its expanded form shows
   branches entering, a gap at the decision point, and a line leaving for the
   next generation. Use it for goal focus, convergence, loading by discrete
   stages, and gates.
2. **Cobalt Rail** — a one-line scope and connection rail using the cobalt field
   when active. It tells the operator where they are before any content begins.
3. **Causal Spine** — an ASCII-safe "|--" tree with stable IDs and aggregate
   rows. It makes owner, parent, child, and active path visible without a graph.
4. **Evidence Dossier** — a bounded source block with claim, provenance,
   freshness, confidence, contradiction, and consumer. It turns evidence into
   inspectable records rather than decoration.
5. **Gate Strip** — a full-width decision block that names effect, authority,
   reversibility, objections, and numbered options. It is the terminal form of
   the synthesis and approval gate.

## Semantic hierarchy

The hierarchy is stable across colors, glyphs, and widths:

1. **Scope** — current project, goal, run, route, and connection.
2. **State** — the factual lifecycle state and whether the state is live,
   synthetic, simulated, unavailable, or unverified.
3. **Causality** — owner, parent, child, dependency, handoff, and event time.
4. **Evidence** — source, claim, freshness, confidence, contradiction, and
   downstream use.
5. **Authority** — who or what may change state, and what approval is required.
6. **Action** — the next safe command, its consequence, and its escape path.

Never invert this order to show an attractive metric first. A large token count
without owner or state is telemetry without operational value.

### State vocabulary

Use one state word and one short explanatory phrase. State words are stable
machine-facing vocabulary; the phrase is human-facing copy.

| State | Baseline marker | Signal meaning | Example copy |
|---|---:|---|---|
| RUNNING | * | Cobalt or bright blue | RUNNING / collecting source checks |
| WAITING | . | Mineral or white | WAITING / dependency: evidence-07 |
| BLOCKED | ! | Ultraviolet or bright magenta | BLOCKED / provider authorization required |
| FAILED | x | Vermilion or bright red | FAILED / retry is available |
| COMPLETE | + | Ion or bright green only when verified | COMPLETE / 12 claims reconciled |
| VERIFIED | + | Ion or bright green | VERIFIED / source lineage resolved |
| CONFLICT | ! | Vermilion | CONFLICT / two sources disagree |
| GATE | ? | Vermilion for intervention; cobalt for review | GATE / approval required before mutation |
| UNKNOWN | ? | Mineral | UNKNOWN / runtime did not report state |
| DISCONNECTED | ~ | Vermilion only when action is affected | DISCONNECTED / last state 14:02 UTC |
| SYNTHETIC | s | Ultraviolet or plain label | SYNTHETIC / sample frame; no engine state |
| SIMULATED | s | Ultraviolet or plain label | SIMULATED / command did not execute |
| UNAVAILABLE | - | Mineral or vermilion if blocking | UNAVAILABLE / capability is not published |

The marker and state word always appear together. Color never carries the state
alone. "x" is reserved for failure; "!" is reserved for conflict or required
intervention; "?" is reserved for unknown or a gate.

## Color system and fallback tiers

The palette inherits the authored Acceleration Chamber tokens from
tokens/colors.css. The terminal adds only derived mappings required for ANSI.
A TUI may paint fields. Plain command output should color the rail, state
marker, and action label only; it must not turn paragraphs into saturated
stripes.

### Truecolor

Truecolor is selected when the terminal advertises 24-bit color and the user
has not set NO_COLOR or an explicit monochrome mode.

| Semantic role | Value | Use |
|---|---|---|
| Void field | #050509 | Default TUI background and deep negative space |
| Void plate | #101017 | Quiet rail or secondary region |
| Void raised | #0B0B14 | Focused detail region; never a floating card |
| Graphite | #15151B | Secondary dark structure |
| Cobalt active field | #101CFF | Current route, active causal band, primary action, focused gate |
| Ultraviolet transition | #6B45FF | Handoff, adjacent generation, synthetic or simulated state |
| Ion verified | #B8FF3D | Verified success or healthy recovered path only |
| Vermilion intervention | #FF3B12 | Conflict, failure, rollback, irreversible consequence, human gate |
| Cold primary text | #FAFBFF | Goal, state, action, and selected content |
| Mineral primary field | #F4F4F0 | Calm light field when a command or TUI view explicitly uses it |
| Quiet telemetry | #7F818C | Labels and inactive telemetry |
| Dark rule | #23232C | Structural divider in a void field |
| Strong dark rule | #34343F | Focus boundary or gate boundary |
| Light rule | #CFD0D6 | Structural divider in a mineral field |

Truecolor foreground and background use standard SGR 38;2 and 48;2 sequences.
256-color foreground and background use 38;5 and 48;5 with the indexes above.
16-color output uses the standard ANSI foreground and background roles for the
selected tier. Reset attributes after each bounded label or field so a color
cannot leak into a prompt, path, or copied paragraph.

Do not use ion to mean interesting, cobalt to mean success, or vermilion as an
all-purpose accent. A normal view uses void, cold white, quiet metal, and at
most one signal role. A gate may add vermilion because it changes authority.

### 256-color

Use conventional xterm palette indexes. They are explicit approximations because
user terminal themes can remap the displayed RGB values.

| Truecolor role | xterm index | Fallback |
|---|---:|---|
| Void field | 232 | Blackest available gray |
| Void plate | 233 | Dark gray |
| Void raised | 235 | Dark gray |
| Graphite | 236 | Dark gray |
| Cobalt active | 21 | Blue |
| Ultraviolet transition | 99 | Violet |
| Ion verified | 190 | Yellow-green |
| Vermilion intervention | 202 | Orange-red |
| Cold primary text | 255 | Light gray |
| Mineral primary field | 254 | Near-white |
| Quiet telemetry | 246 | Medium gray |
| Dark rule | 239 | Dark medium gray |
| Strong dark rule | 244 | Light medium gray |
| Light rule | 251 | Light gray |

The TUI may use indexes 232, 233, and 235 as field backgrounds. In command
output, prefer foreground color plus the marker and state word so the output
remains readable when a theme maps a background unexpectedly.

### 16-color

Use only standard ANSI roles. Do not assume a particular RGB value.

| Truecolor role | ANSI role |
|---|---|
| Void field / plates | black |
| Graphite / quiet rule | bright black |
| Cold primary text | bright white |
| Mineral primary field | white |
| Quiet telemetry | white |
| Cobalt active | bright blue |
| Ultraviolet transition | bright magenta |
| Ion verified | bright green |
| Vermilion intervention | bright red |
| Strong rule | white |

Bold may reinforce a label but is not the state encoding. If a 16-color
terminal cannot distinguish bright black from black, the marker and state word
still carry the meaning.

### NO_COLOR and monochrome

When NO_COLOR is present, the user requests monochrome, TERM is dumb, or output
is redirected, emit no ANSI control sequences. Do not replace color with
unicode-only decoration. Use the following words and markers:

| Semantic state | Monochrome form |
|---|---|
| Active | * RUNNING |
| Waiting | . WAITING |
| Complete or verified | + VERIFIED |
| Blocked or conflict | ! BLOCKED or ! CONFLICT |
| Gate | ? GATE |
| Unknown | ? UNKNOWN |
| Disconnected | ~ DISCONNECTED |
| Synthetic or simulated | s SYNTHETIC or s SIMULATED |
| Selected | > SELECTED |

The monochrome TUI retains the void field only when the terminal can set a
background safely. Otherwise it uses the user's default background and preserves
the same line structure. A plain command transcript never requires a dark
background.

### Fallback order

Apply fallback in this order:

1. User flags and environment: NO_COLOR, monochrome, no-motion, and plain mode
   override terminal capability.
2. Output destination: redirected or piped output is plain unless the user
   explicitly requests ANSI.
3. Terminal capability: truecolor, 256-color, 16-color, then no color.
4. Semantic redundancy: marker, state word, position, and copy remain in every
   tier.

Do not silently downgrade a consequential state to an ambiguous gray dot. If
the fallback loses a distinction, write the state word and a one-line reason.

## Typography and glyph policy

### Baseline

The baseline is seven-bit ASCII. It must be complete, copyable, and readable in
an SSH session, a log file, a narrow terminal, and a screen reader's text
stream. Use a system monospace or the user's configured terminal font. AOS does
not require Archivo, IBM Plex Mono, Powerline fonts, patched glyph sets, or a
particular locale.

Use:

- AOS for product identity and ">" for the command prompt.
- "> <" for the compact open aperture.
- "|--", "+--", and "|" for causal hierarchy.
- "->" and "<-" for direction.
- "*", ".", "+", "!", "?", "~", and "s" for state markers.
- "-", "=", and "+" for rules and gate boundaries.
- "..." for truncation; never rely on a single Unicode ellipsis.

The TUI may offer a Unicode enhancement when the locale is UTF-8 and width
calibration succeeds. Permitted enhancements are box-drawing rules, compact
arrow forms, and the aperture pair "⟩ ⟨". Every enhanced frame must have the
ASCII equivalent above. Do not require braille, emoji, combining marks,
powerline glyphs, or ambiguous-width symbols.

### Width and locale

- Measure every displayed grapheme using terminal width semantics. Treat tabs as
  spaces and never let tabs decide alignment.
- Prefer ASCII for IDs, commands, state, timestamps, and gate options.
- Wrap prose at the terminal's actual width. Preserve whole words and keep the
  prompt or state marker at the left edge.
- When a string exceeds its field, keep the beginning and the stable suffix
  identifier: evidence-...-07. Do not cut in the middle of a wide character.
- If the locale reports CJK ambiguous-width behavior, measure by the terminal's
  returned width and pad from that measurement. Never hard-code one-cell
  assumptions for user text.
- Avoid line-reflow during live updates. Repaint a bounded region or emit a
  discrete new event; do not smear a changing tree across the terminal.
- Use plain ASCII timestamps and decimal values. Locale-specific digits and
  separators can make copied logs ambiguous.

### Typographic hierarchy

There is no display font in a terminal. Scale comes from order, whitespace,
field ownership, weight, and a small number of full-width labels:

1. Scope and focal state in cold white or the active field.
2. Section label in sparse uppercase.
3. Goal, finding, or action in sentence case.
4. Telemetry in aligned monospace key/value rows.
5. Stable IDs and paths in monospace with no decorative shortening.

Uppercase is for rails, state labels, gates, and short actions. Do not turn
paragraphs or user goals into all caps.

## Layout grammar

Terminal width changes the composition. It never produces a shrunken web graph.
The screen has at most three major regions at every width.

| Width | Composition | Density and behavior |
|---|---|---|
| 160+ columns | Top Cobalt Rail; main causal field; conditional inspector; one-line footer or Gate Strip | Show the active causal path, up to nine visible rows, two aggregate rows, and the selected object's detail. Keep the inspector at roughly one third of the body. |
| 120-159 columns | Top rail; main field with a narrow inspector or gate band; footer | Retain one active path and up to seven visible rows. Collapse quiet telemetry into a DETAILS action. The inspector may replace the gate while the user is browsing. |
| 80-119 columns | Top rail; one ordered field; detail is a replace-in-place view; footer with keys | Do not split into side panes. Show up to five focal rows and one aggregate row. Enter opens details; Esc returns. |
| Under 80 columns | One column, one selected object or one event, with explicit NEXT, BACK, and MORE actions | No graph, no miniature map, no side pane, and no long telemetry rows. The command/log surface is the source of truth. Wrap at word boundaries and keep state plus next action on the first two lines. |

The top rail is one line by default. A two-line rail is permitted only when a
gate or disconnected state needs a cause. The footer line is a key legend or
gate status, never an always-open console drawer.

### Region rules

- The primary region owns the focal event and at least 60 percent of the width
  when an inspector is present.
- An inspector contains selected-object facts, provenance, and actions. It does
  not repeat the whole list.
- A decision region appears only when an action changes run state, authority,
  memory, configuration, or generation.
- A quiet region may be blank. Negative space is a hierarchy signal, not a
  reason to add a panel.
- A long list is a cursor-controlled viewport. It is never compressed into
  microscopic type.

## Hierarchy, telemetry, convergence, and mutation

### Causal hierarchy

Represent the visible hierarchy as a stable spine:

    ROOT R-204  [RUNNING]  objective
    |-- A-01  [RUNNING]  source reconciliation
    |   |-- A-01.1  [WAITING]  provider response
    |   +-- +12 hidden  / source checks
    |-- A-02  [CONFLICT]  independent review
    +-- +24 hidden  / dormant branches

Every visible row carries an owner ID and state. An aggregate row carries its
parent, label, count, state summary, latest meaningful event, and a drill-down
action. Stable ordering is: intervention required, causal path, recently
changed, active, waiting, then quiet aggregates. Ties preserve engine order.

### Telemetry

Telemetry uses one fact per row, a stable label, and a unit or denominator:

    ELAPSED       00:12:44
    TOKENS        38.2k input / 9.4k output
    COST          unavailable
    EVIDENCE      17 items / 3 unresolved
    LAST EVENT    12:44:19Z / A-02

No number appears without its meaning. A count of zero is different from an
unknown count. UNBOUNDED describes an absent product cap; it does not promise
that provider, budget, or sandbox limits disappear.

### Convergence

The convergence device is a bounded block:

    > <  CONVERGENCE / SYNTHESIS-03
    inputs       5 branches / 18 evidence items
    agreement    3 support / 1 objection / 1 unresolved
    conclusion   provisional
    next gate    approve conclusion or continue research

Selecting it expands the exact source rows and objections. The block must state
what is compressed and how to reopen it. A bar, spinner, or changing number
cannot stand in for convergence.

### Mutation seam

Any change to prompts, routing, worker composition, memory policy, provider,
or evaluation rules uses a seam:

    --- MUTATION / GEN-03 -> GEN-04 ---
    changed      routing rule: evidence-review receives source lineage
    evidence     4 checks / 1 regression
    rollback     GEN-03 available
    authority    operator approval required

The seam remains in the retrospective after the change. The terminal never
describes self-improvement as automatic or irreversible.

### Decision gate

Every consequential gate contains the same fields:

    [GATE]  MUTATION / APPROVAL REQUIRED
    effect        changes swarm routing for the next run
    authority     operator
    reversible    yes / rollback GEN-03
    objections    1 unresolved source conflict
    options       [1] APPROVE  [2] REVISE  [3] HOLD
    confirm       type APPROVE to continue

The default cursor is safe and non-committing. Enter opens a gate; it never
approves one. Approval requires an explicit option and, when the effect is
irreversible or destructive, an exact confirmation phrase.

## Density and unlimited logical swarms

The engine may represent an unbounded logical swarm. The terminal represents
the operator's current decision surface.

### Exact visible budgets

- Command home: five recent runs and three pending actions. More items appear
  behind MORE.
- Goal intake: the objective field plus at most six inferred constraints.
  Additional assumptions are grouped under +N UNRESOLVED.
- Swarm live view: nine visible causal rows at 160+ columns, seven at
  120-159, five at 80-119, and one selected row under 80. At least one row is
  reserved for a parent or root.
- Any width may show at most two aggregate rows in the primary field. Each
  aggregate must be expandable.
- Selected-agent inspector: twelve fact rows before DETAILS; evidence and
  event history use their own viewport.
- Evidence: eight records before MORE; objections remain visible even when
  low-priority evidence is grouped.
- Synthesis and gate: all unresolved objections are counted; five are visible
  before +N MORE OBJECTIONS.
- Configuration and memory indexes: eleven objects or records before search
  and pagination.
- Retrospective: five pivotal events before SHOW ALL EVENTS.

These are viewport budgets, not engine limits. The count shown after an
aggregate is the engine-reported count. If the engine cannot provide a count,
show +? HIDDEN and explain that the count is unknown.

### Progressive disclosure

1. Start at the smallest useful causal neighborhood: root, selected path,
   blocking dependencies, and the nearest gate.
2. Use Enter to inspect the selected row. Preserve the parent breadcrumb.
3. Use / to search and d to change depth. Search never changes engine state.
4. Use Tab to move between field, inspector, and gate. A hidden region is
   announced as hidden; it is not silently removed.
5. Use Esc to return one scale. q exits only the current surface, never a
   running goal without a stop prompt.
6. Use a stable filter and sort order. Live updates must not move the focused
   item out from under the operator.
7. Coalesce repeated telemetry at most five times per second in the TUI. A
   collapsed burst reports its interval and event count.
8. Never auto-scroll the TUI. Follow mode is explicit. Plain log mode may
   follow only when the operator passes the follow option.

## Interaction and accessibility

### Keyboard model

Keyboard use is mandatory. Mouse support, if added, mirrors the same focus and
action model. The following keys are the durable baseline:

| Key | Meaning |
|---|---|
| Arrow keys or j / k | Move within the current list or tree |
| Tab / Shift+Tab | Move between major regions |
| Enter | Inspect or open the focused object |
| Esc | Close detail, cancel draft, or return one scale |
| / | Filter the current list |
| d | Change causal depth or reveal details |
| f | Toggle explicit follow mode |
| ? | Open the key and command reference |
| g, s, e, m, r | Go to goal, swarm, evidence, memory, retrospective |
| c | Open command home or command palette |
| p | Open provider and authentication status |
| Ctrl-L | Redraw the terminal |
| Ctrl-C | Request stop; a second press requires an explicit exit confirmation |
| Number keys in a gate | Choose a visible option; consequential choices still confirm |

When text is focused, printable keys edit text instead of changing screens.
Every mutating action is also available as a named command, so no action
depends on memorizing a shortcut.

### Screen-reader and log mode

The TUI must provide a no-alt-screen log mode. It emits ordered event records,
full state words, owner IDs, and next actions. It does not rely on cursor
movement, color, animation, or a tree's branch shape.

Recommended output modes are:

- --log: append-only human-readable events; no alternate screen.
- --plain or NO_COLOR: no ANSI; retain markers and state words.
- --json: machine-readable records; no decorative labels or terminal control
  sequences.
- --quiet: only gates, failures, disconnections, and completion.
- --verbose: include phase changes and coalesced event counts.

The exact option spelling can be finalized with the CLI implementation, but the
semantics are fixed. A screen reader must hear "ACTIVE, agent A-02, owner
research lead, collecting source checks", not infer it from a colored dot.

### Reduced motion

Respect the terminal's reduced-motion preference when available and provide an
explicit no-motion setting. Reduced motion replaces aperture movement,
auto-refresh shimmer, and animated trace travel with discrete state changes.
The selected row, new event, and gate are announced by text. Motion is never
required to discover a state.

### Event verbosity

The default is normal:

- initial scope and connection;
- phase changes;
- state transitions;
- evidence additions that affect the current path;
- conflicts, gates, failures, and recoveries.

Quiet suppresses routine progress. Verbose adds coalesced telemetry and
delegation events. Trace is an explicit diagnostic mode, not the default. A
running worker must not flood the operator's decision surface with token-level
or heartbeat-level noise.

### Error, empty, and disconnected states

Every exceptional state uses the same four-line order:

1. State and scope.
2. Cause, if known.
3. Impact and authority.
4. Next action and safe escape.

Example:

    ! DISCONNECTED / RUN R-204
    cause       local engine did not answer within 5s
    impact      live state is stale; no action was sent
    next        [R] retry  [L] view last state  [Q] leave watch

An empty state teaches the next action:

    AOS > EVIDENCE
    no evidence is indexed for RUN R-204
    next        collect sources or inspect the run inputs

An unavailable capability is not rendered as disabled success. It names the
missing publication or authorization and offers configuration or exit.

## Terminal copy rules

Copy follows the instrument order: state first, consequence second, action last.

- Use present tense and concrete verbs: waiting for source check, requires
  operator approval, rollback is available.
- Keep labels short and sparse. Put explanation in sentence case below the
  label.
- Name the owner and scope before a metric.
- State whether output is live, synthetic, simulated, unavailable, or
  unverified at the point where confusion could occur.
- Use UNKNOWN, UNAVAILABLE, and UNVERIFIED when they are true. Do not replace
  them with a plausible placeholder.
- Describe capability and provider state from runtime evidence. Do not promise
  OAuth, models, tools, or limits that the engine has not published.
- Never print secrets, tokens, authorization codes, or full credential paths.
- Use APPROVE, REVISE, HOLD, STOP, RETRY, INSPECT, and BACK for actions. A
  destructive action includes its consequence in the same block.
- Do not use marketing slogans, fake urgency, or decorative pseudo-telemetry.

Good:

    [GATE] APPROVAL REQUIRED
    effect      publish GEN-04 routing rules to the next run
    authority   operator
    reversible  yes / rollback GEN-03
    action      [1] approve  [2] revise  [3] hold

Poor:

    !!! SUPER INTELLIGENT SWARM READY !!!

## What does not cross from the dashboard

The terminal does not import:

- specimen, biological, infrastructure, or other raster imagery;
- the web's large display titles or image-led focal fields;
- the rendered branch map, SVG traces, coordinate zoom, or a miniature graph;
- ornamental crosshairs, registration marks, image captions, or decorative
  scan textures;
- a permanent left sidebar, floating inspector, rounded cards, shadows,
  gradients, glass, glow, or browser-sized columns;
- a web bottom console drawer that is always present;
- smooth route transitions, ambient particles, pulsing neon, auto-scrolling
  telemetry, random jitter, or permanent glitch effects;
- dashboard demo slogans when they do not report a current state;
- dependence on Archivo, IBM Plex Mono, patched fonts, emoji, or Unicode
  box-drawing;
- a one-to-one copy of the web's route navigation or its visual proportions.

The semantic equivalents remain: scope, state, owner, evidence, causal
relationships, mutation seam, gate, and next action. If removing the dashboard's
imagery leaves no legible goal-to-decision path, the terminal translation has
failed.

## Acceptance bar

Before a terminal surface is considered visually aligned, a reviewer should be
able to verify:

- the first two lines identify scope and current state;
- one focal event dominates and no more than three major regions exist;
- the selected path can be followed in ASCII;
- every state survives no color and no Unicode;
- active, blocked, verified, unknown, synthetic, and disconnected states are
  distinct in words and markers;
- an unlimited swarm is aggregated without a fake cap;
- a gate exposes effect, authority, reversibility, objections, options, and
  confirmation before action;
- evidence expands back to source and lineage;
- reduced motion and log mode preserve meaning;
- a narrow terminal receives an ordered list, never a miniature graph;
- the screen ends with a concrete next action or an honest empty state.
