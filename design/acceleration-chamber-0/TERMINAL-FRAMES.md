# Terminal frames: #/swarm

Plain-text compositions of the same illustrative mission as `swarm.html`, written to
the resolved contract in `AOS-inspiration0-design/TERMINAL-DESIGN.md`: seven-bit ASCII,
labels exactly 12 columns with values from column 13, authored labels lowercase,
state words uppercase with their marker, the compact aperture `> <`, no side panes
below 120 columns. Every frame is exactly the stated size; `screens/terminal-80x24.png`
shows the 80x24 frame in the truecolor tier.

Color is emphasis only. Each frame reads the same with `NO_COLOR`.

## 80x24: one ordered field, gate strip, footer

Five focal rows plus the root and one aggregate (the 80-119 budget). Rows are
ordered intervention first, then the causal path. The model handoff on A-19 is an
event phrase, not a state. The gate is a strip because a decision changes run
state; Enter opens it and never approves it.

```text
AOS > <  msn-2291 / gen 07 / swarm               s SYNTHETIC  * RUNNING  local
--------------------------------------------------------------------------------
goal        Can solid-state cell supply meet 2029 EU demand?
run         01:12:44 elapsed / 13 of 53 agents running
tokens      1.84M of 2.5M budget
cost        $21.40 estimated
evidence    128 items / 3 objections
--------------------------------------------------------------------------------
ROOT OBJ    * RUNNING   objective
|-- L-01    * RUNNING   Lead                 AOS / claude-opus-4
|   |-- A-22  ! BLOCKED   Filings audit      rate limit / retry 41s
|   |-- A-07  * RUNNING   Supply mapping     Codex / gpt-5-codex
|   |   |-- A-14  * RUNNING   Corpus triage  claude-sonnet-4
|   |   +-- A-19  * RUNNING   Capacity r...  handoff gpt-5 -> opus-4
+-- +48 hidden / 2 clusters, V-03, A-31 / 9 running, 2 failed   [d] expand
--------------------------------------------------------------------------------
? GATE      A-22 holds the unit check that could invert EV-131
authority   operator
options     [1] WAIT 41s   [2] REROUTE codex   [3] STOP branch
reversible  1 and 2 yes / 3 no: drops 6 evidence, confirm STOP
objections  3 open / EV-131 unit conversion unverified
--------------------------------------------------------------------------------
tab region  enter inspect  1-3 gate  / filter  d depth  ? keys  q leave
[ -- ] last event 12:44:19Z / A-22 rate limit / follow off
```

## 60x20: under 80 columns, one selected object

No tree and no side pane. The first two lines after the rail carry state and the
next action. NEXT, BACK and MORE move between objects; the gate options stay
numbered and the irreversible one states its confirmation.

```text
AOS > <  msn-2291 / swarm / A-22              s SYNTHETIC
! BLOCKED   A-22 Filings audit
next        gate open / choose 1, 2 or 3 below
------------------------------------------------------------
cause       provider rate limit / anthropic / retry 41s
impact      A-19 and CORE waiting
parent      L-01 Lead
harness     Claude Code
model       claude-sonnet-4
tokens      94K
cost        $1.10 estimated
elapsed     03:41
evidence    6 items / EV-131 ! CONFLICT
------------------------------------------------------------
[1] WAIT 41s         reversible / dependents stay queued
[2] REROUTE codex    reversible / loses cite-check skill
[3] STOP branch      irreversible / drops 6 / type STOP
------------------------------------------------------------
n next  b back  m more  1-3 choose  ? keys
[ -- ] 12:44:19Z / A-22 / follow off
```

## Monochrome check

Every state above carries its marker and word: `* RUNNING`, `! BLOCKED`,
`! CONFLICT`, `? GATE`, `s SYNTHETIC`. Nothing depends on the cobalt rail band,
the vermilion gate label, or the ultraviolet handoff phrase, which are the only
three colored regions in the truecolor tier.
