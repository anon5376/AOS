# AOS design handoff 0: Acceleration Chamber on Accelerate

This is the handoff asked for by `AOS-inspiration0-design/README.md`: a mood and
layout analysis, a mapping from reference qualities to the existing components,
the conflicts between the two systems and how each is resolved, proposed token
changes, and representative compositions of `#/swarm` for desktop, mobile and a
narrow terminal. It is a design proposal. Nothing in ACS or AOS code changes.

Sources, in the README's order of authority:

- the authored package in `AOS-inspiration0-design/` (IDEA, DESIGN, START_HERE,
  REFERENCE_INDEX, `example.html`, the Swarm print specimen, both archives, the
  reference images) and `TERMINAL-DESIGN.md` for terminal work;
- "Accelerate" as it already exists in AOS: the tokens, fonts and voice in draft
  AOS #4 (`proposals/assets/D01-prototype/tokens.css`, D02, D03), which #4 states
  were taken from the owner's design system. The `anon5376/private` repository
  itself was not readable from this session, so #4's copy is the reference.

The authored kits were rendered at 1440x900 and 390x844 and compared with #4's
console screenshots before anything was drawn.

| Composition | File | Screenshot |
|---|---|---|
| Desktop, nothing selected | `swarm.html` | `screens/swarm-desktop-1440x900.png` |
| Desktop, A-22 selected | `swarm.html#A-22` | `screens/swarm-desktop-selected-1440x900.png` |
| Tablet, 760-1200 rule | `swarm.html` at 1024 | `screens/swarm-tablet-1024x768.png` |
| Mobile | `swarm.html` below 760 | `screens/swarm-mobile-390x844.png` |
| Mobile, inspector sheet | `swarm.html#A-22` | `screens/swarm-mobile-sheet-390x844.png` |
| Terminal 80x24 and 60x20 | `TERMINAL-FRAMES.md` | `screens/terminal-80x24.png`, `screens/terminal-60x20.png` |

`swarm.html` is one static file with self-hosted fonts and no network access. Click
a plate or row to open the inspector; Esc closes it.

## 1. Mood and layout

**Why it reads as research infrastructure.** Three things carry it. First, field
commitment: the Nous captures give whole viewports to one colour (cobalt or void)
and put nothing decorative on top, so a colour change means a state change.
Second, scale contrast: one thin monumental line against small, tracked mono
labels, with almost nothing at the sizes between. Third, a quiet perimeter: rails,
captions and inactive regions sit at low contrast and fixed positions, which is why
the one intense region (an active path, a gate) reads as an event rather than as
more interface.

**What the TikTok stills contribute** is structure, not imagery: the recursive
diagram gives upward branching with feedback, the bent tower gives a gravitational
attractor that bends what is near it, and the warped infrastructure gives scale
pressure. In AOS these become the upward delegation tree, the convergence core that
traces bend toward, and the generation seam that leaves the core on the far side.

**The relationships behind the layout:**

- Dominant focal event: one per screen. On `#/swarm` it is the open gate when one
  exists, otherwise the active causal path.
- Primary work field: about two thirds of the width, void, organised bottom-up
  (constraint, swarm, convergence, frontier).
- Conditional inspector: 380 px, only after selection; a bottom sheet on mobile.
- Navigation: one top rail; no permanent left sidebar.
- Decision strip: bottom, only while a gate is open.
- Progressive disclosure: aggregates, then drill-down, never every worker.

**What is specimen-only.** `example.html` and the Swarm print specimen are plates,
not product layouts: the serif title, the white inspector column and the arc
pattern in the cobalt field belong to the specimen. The kit's proportions (44 px
rail, 32 px CLI rail, 380 px inspector, three regions) are the product layout and
are kept.

**Desktop against mobile.** The Nous mobile captures keep hierarchy by turning
columns into ordered plates. They do not shrink the desktop. The authored mobile kit
already does this with a stage list; the composition keeps that and puts the gate
and the swarm stage first.

## 2. Reference qualities mapped to existing components

| Quality | Where it comes from | Component it strengthens | What changes |
|---|---|---|---|
| Committed whole-field cobalt | Nous hero, Portal cloud | `GlobalRail` active route, objective band | The objective band on `#/swarm` is a full-width cobalt field while the mission runs, and void when it is paused or finished. The goal is the first thing read. |
| Thin monumental type, tracked mono labels | Nous hero and features | Route title, `Telemetry` | The objective is the one monumental element, in Antonio 300. Readouts use Antonio 300 numerals over mono labels, Accelerate's figure style. |
| Quiet perimeter, sparse rhythm | Nous features and FAQ | `GlobalRail`, stage ladder, `CLISheet` rail | The ladder labels run horizontally with counts under them; the CLI rail is one line of context plus key hints. |
| Gravitational attractor | Singularity tower | `ConvergenceCore` | The core sits at the top of the field with its inputs, evidence count and objections. Traces enter from below. |
| Exit on the far side | Aperture, recursive topology | `ConvergenceCore` to `GenerationRift` | A single ultraviolet line leaves the core to "gen 08 candidate / awaiting approval". Mutation is the aperture's exit, not a separate band. |
| Recursive branching upward | Recursive topology | `AccelerationField`, `AgentTrace` | Plates are placed by delegation depth from the objective at the floor. Edges are orthogonal and directed. A dependency that is not delegation is dashed, vermilion and labelled `! BLOCKS`. |
| One locally intense path | DESIGN restraint rule | `AgentTrace`, `AgentNode` | The active path is a 2 px cobalt trace with arrowheads. Off-path plates fade their contents, not their background, so traces stay occluded. |
| Ordered editorial plates on mobile | Nous 390 px captures | Mobile kit stage list | The swarm stage opens by default as an indented hierarchy, and the gate sits above the CLI sheet. |
| Accelerate eyebrow, numbered lenses, status codes | AOS #4 (D02, D03) | `SectionLabel`, `GlobalRail`, `CLISheet` | `■ 03 / swarm` eyebrows, route numbers 1-8 as keys, and `[ -- ]` / `[ ok ]` action receipts in the terminal status line. |

## 3. Conflicts and resolutions

### 3.1 Between Accelerate (#4) and the Acceleration Chamber package

| Conflict | Accelerate (#4) | Chamber package | Resolution | Why |
|---|---|---|---|---|
| Signal colour | One lime `#d9ff6c` fill per screen on the primary action | Cobalt for active, selection and primary action; ion `#B8FF3D` only for verified | Cobalt owns the primary action and the active state. Lime retires on AOS surfaces, and ion keeps the verified meaning. | DESIGN says ion "never means cool", and the terminal contract fixes ion as verified-only. Two greens with different meanings would be read as one. |
| Ground | `#0c0d0c`, green-tinted | Void `#050509`, blue-tinted | Void. | Void sits beside cobalt without a green cast and is already the terminal's truecolor field. |
| Shell | 312 px permanent left rail with lenses and answers | Top rail, no permanent sidebar | Top rail. Accelerate's lens numbers become route keys 1-8. Its "answers" (needs you, stuck, spend) move into the objective readouts and the gate strip. | DESIGN forbids a permanent sidebar. The answers stay visible on every route because the readouts and gate are part of the shell. |
| Display face | Antonio | Archivo Narrow (flagged as a substitute) | Antonio. | The package says its fonts are substitutes because no binaries were supplied. Accelerate ships licensed, self-hosted Antonio, which meets "narrow contemporary grotesk". |
| Interface face | Archivo | Instrument Sans (substitute) | Archivo. | Same reason. It is also already in #4's CSP plan. |
| Telemetry face | IBM Plex Mono | IBM Plex Mono | No conflict. | |
| Serif | Newsreader for lens and inspector titles | "No serif classicism" | Drop Newsreader on AOS surfaces. Inspector titles use Antonio 300. | DESIGN's don'ts. It also saves 132 KB of the 218 KB font payload #4 measured. |
| Case | Lowercase everywhere | Uppercase rails and labels (kit); lowercase authored labels (terminal contract, 2026-09-19) | Authored labels are lowercase on both surfaces with label tracking. State words stay uppercase with their marker. Machine strings keep their emitted case. | The terminal contract is the latest surface-specific decision, and it agrees with Accelerate. State words are a fixed machine vocabulary, so uppercase keeps them distinct from prose. |
| Status vocabulary | `●` `○` `▍`, heat, danger and steel tags | `* . + ! ? ~ s` markers with fixed state words | Contract markers and words. Accelerate's colours map as follows: stuck becomes `! BLOCKED` with its cause and age; failed becomes `x FAILED`; submitted or in review becomes `? GATE` in cobalt. `[ ok ]` and `[ -- ]` survive only as action receipts. | The marker and word must survive NO_COLOR. Heat, danger and steel are new hues the Chamber palette does not have. |
| Accent period | `what needs you.` | Not specified | Kept on route titles in the text colour, not a signal colour. Not used on user text such as the objective. | It is Accelerate's voice and costs no signal. |
| KPI readouts | Big numerals, only with a list behind them | No metric-card grids | Readouts appear only in the objective band, five at most, each with a unit or denominator. | Both systems reject bare KPI tiles. |
| Light theme | Paper, by `prefers-color-scheme` | Mineral tokens defined, no screens | Void is the default operational surface. Mineral is the Paper equivalent and is mapped in tokens but not designed here. | Neither source designed light operational screens. This needs its own pass. |
| Terminal glyphs | Box-drawing numerals and rules, lens glyphs | Seven-bit ASCII baseline, Unicode optional | ASCII baseline. Box drawing is an enhancement that never carries meaning. | The terminal contract is explicit, and #4 notes that the Plex Mono subset lacks box glyphs. |
| Terminal side pane | Rail column from 100 columns | No side pane below 120 columns | Contract layout grammar. | Later and surface-specific. |

### 3.2 Inside the authored kit, found by rendering it

| Finding | Resolution in the composition |
|---|---|
| At 1440 px the route list clips ("MEMOR") behind the mission label. | Routes shrink first and the rail's right side never wraps. Below 1200 px the provider count leaves the rail. |
| Stage ladder labels are set vertically. | Horizontal labels with counts under them. |
| Plates truncate model ids mid-string (`qwen3-`, `claude-so`). | Plates are 264 px wide. Model ids are never cut inside the identifier, per the terminal contract's truncation rule. |
| `HANDOFF` is drawn as a run state. | A handoff is an event. A-19 is `* RUNNING`, with `gpt-5 -> opus-4` on the plate and an ultraviolet left edge. The state vocabulary stays the contract's. |
| The five-band ladder (frontier, convergence, mutation, swarm, constraint) leaves the mutation band empty most of the time. | Three bands in the field: convergence, swarm, constraint. Frontier is the field's top line of unresolved items. Mutation is the core's exit to the candidate generation. |

### 3.3 Between the authored sources

- **START_HERE "first surface" against the README's "this is a handoff and does not
  implement".** The compositions are static design artefacts with illustrative state
  and no backend, which satisfies both.
- **DESIGN's "AI/ACC" label.** It is not used. Nothing on `#/swarm` needed it.

### 3.4 Illustrative data corrected

The kit counts 41 agents but its clusters hold 46 workers, and it captions this as
"46 OF 41". The compositions count 7 named agents plus 46 clustered workers as 53,
of which 13 are running. Every frame uses the same numbers.

## 4. Proposed token changes

These are recorded here before being spread anywhere, as the README asks. The core
ten values are unchanged.

| Token | Value | Replaces | Reason |
|---|---|---|---|
| `--cobalt-text` | `#6A73FF` (5.34:1 on void) | `--state-running-on-dark` `#5560FF` (4.36:1) | Running-state text at 11 px fails 4.5:1 with the current step. `#6A73FF` already exists as `--trace-stable-on-dark`, so no new hue is added. |
| `--uv-text` | `#8F75FF` (5.96:1 on void) | Ultraviolet `#6B45FF` used as text (3.80:1) | `! BLOCKED` and handoff phrases are text. Raw ultraviolet stays for traces and plate edges, where 3:1 applies. |
| `--f-display` | Antonio | Archivo Narrow | Section 3.1, display face. |
| `--f-ui` | Archivo | Instrument Sans | Section 3.1, interface face. |
| Accelerate `--signal` | retired on AOS surfaces | | Section 3.1, signal colour. The owner's website keeps its own tokens. |
| Accelerate `--heat`, `--danger`, `--steel` | retired on AOS surfaces | | Mapped to state words in section 3.1. |

Contrast was computed with the WCAG 2 formula for each pair. One restriction
follows: vermilion text on a cobalt field is 2.24:1, so a gate is never drawn inside
the cobalt band.

## 5. The compositions

**Desktop, 1440x900.** Top rail; the cobalt objective band with the goal and five
readouts; the void field with the delegation tree rising from the objective to the
convergence core; the gate strip; and the one-line CLI rail. With nothing selected
the field takes the full width. Selecting A-22 opens the inspector, which shows
parent, harness, model, reasoning, context, tokens, cost, elapsed, workspace,
skills, MCP, evidence, dependents and the evidence item the agent gates. The
equivalent CLI command is shown and marked simulated.

**Tablet, 760-1200.** The DESIGN rule is applied literally. Clusters and the
completed branch fold into the caption, and the causal path becomes a left spine.
The blocked and handoff branches sit beside it under the core. Peripheral telemetry
(provider count, the fifth readout, the gate's explanatory paragraph) is dropped.

**Mobile, 390x844.** The objective is a cobalt field with four readouts. Stages run
frontier to constraint, and swarm opens by default as an indented hierarchy with
marker, word, harness, model, tokens and cost on each row. The gate sits above the
CLI sheet with its two reversible options, and the irreversible one is under "more".
The inspector is a bottom sheet.

**Terminal.** At 80x24 the screen has a rail, goal and telemetry rows, a causal
spine with five focal rows, the root and one aggregate, a gate strip, keys and a
status line. At 60x20 it shows one selected object with state and next action on
the first two lines. Both are pure ASCII and are checked to fit their stated size.

## 6. How this improves hierarchy and usability

Against START_HERE's usability proof:

| Question | Where it is answered in under a few seconds |
|---|---|
| What goal is the system pursuing? | The cobalt band, the largest type on screen. In the kit the goal was a 30 px line in a void header. |
| Who is working now? | `13 running / 53` in the readouts, and `* RUNNING` on each plate or row. |
| Who delegated each task? | Plates sit by depth above their parent with directed edges. The inspector names the parent, and the terminal spine indents by delegation. |
| Which harness and model? | The second line of every plate and row. Ids are no longer cut mid-string. |
| Tokens, cost, elapsed? | Mission-level in the readouts, agent-level on each plate. Cost always says "est." |
| What evidence has been produced? | Readouts and core (128 / 3 objections), the inspector's evidence count, and the gated item in full. |
| Where is the bottleneck or human intervention? | One place: the gate strip, plus the `! BLOCKS` dependency in the field and `! BLOCKED` on A-22. The kit drew the same facts but at equal weight with everything else. |
| How did this run change the next generation? | The core's exit line to "gen 08 candidate / 4 changes / awaiting approval", which leads to `#/evolution`. |

Combining the systems also removes two competing signal colours and one permanent
sidebar, and it gives the terminal and dashboard the same labels, state words, route
numbers and receipts. An operator who learns one surface can read the other.

## 7. Decisions left to the owner

1. **Lime retires on AOS surfaces.** This changes the look of draft AOS #4's
   console, which spends its one lime fill on the primary action. The composition
   uses cobalt for that action.
2. **Newsreader leaves AOS surfaces.** #4 uses it for lens and inspector titles.
3. **Lowercase authored labels on the dashboard too.** The authored kit uses
   uppercase rails. The terminal contract and Accelerate both use lowercase.
