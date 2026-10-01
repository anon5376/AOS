# D02 terminal mockups at 160x48

Printed by `node proposals/assets/D01-prototype/mockups.js 160x48` from the same code the prototype draws. Fixture data, not a run.

now at 160x48
```text
 aos. / r-0412 / now                                                                                                                    [ ok ] live #412  14:02
─────────────────────────┬──────────────────────────────────────────────────────────────────────────────────────────────┬───────────────────────────────────────
  run r-0412             │ what needs you.                                                                      7 items │ ■ task / #7
                         │                                                                                              │ hard usd cap per run.
  operate                │ needs you            │ stuck                │ spent usd            │ cost unknown            │
▍ ■ now ············[1]  │ ┌─┐ ┌─╴              │ ┌─┐ ╶─┐              │ ┌─╴  ╶─┐ ┌─┐         │ ╶─┐                     │ state      submitted
  ▤ tree ···········[2]  │ │ │ └─┐              │ │ │ ┌─┘              │ └─┐  ┌─┘ │ │         │ ┌─┘                     │ assignee   impl-b / gpt
  ◇ board ··········[3]  │ └─┘ ╶─┘              │ └─┘ └─╴              │ ╶─┘ .└─╴ └─┘         │ └─╴                     │ reviewer   you
  § graph ··········[4]  │ 2 questions          │ over 30 min          │ of 60.00             │ impl-b, scout           │ depends    #3 submitted
  ▍ timeline ·······[5]  │ ──────────────────────────────────────────────────────────────────────────────────────────── │ result     cap checked before each
                         │                                                                                              │            turn. cost unknown for
  system                 │ ■ 01 / needs you                                                                             │            codex turns, tokens used
  @ agents ·········[6]  │▍ #7    review    hard usd cap per run                                                   #411 │            instead
  ¶ memory ·········[7]  │       review is yours. author impl-b (gpt), round 1                                          │ question   q-407 unanswered
  $ config ·········[8]  │  q-407 question  should a run with unknown cost (codex, hermes) be stopped by the us…   #407 │
                         │       impl-b asks, on #7                                                                     │ ■ last events
                         │  q-340 question  hermes reports no per-turn cost. record it as unknown, not zero?       #340 │ #411 task_submitted         impl-b
                         │       scout asks, on #2                                                                      │
                         │  m-36  memory    a usd cap cannot stop a run whose cost is unknown. caps must fall b…   #410 │  a accept →
                         │       impl-b proposes a conclusion for project memory. agents read it on every brief once a… │ r request changes / x cancel / t
                         │  #6    unrouted  cost on the status screen                                              #360 │ trace
                         │       role cheap-worker has no agent. assign one, or add a cheap-worker agent                │
                         │                                                                                              │
                         │ ■ 02 / stuck                                                                                 │
                         │  #4    47 min    loop guard: same tool call 5x                                          #371 │
                         │       impl-b has written nothing for 47 min, since #371. u requeues, g reassigns             │
                         │  #8    60 min    docs: budgets and limits                                               #402 │
                         │       impl-a has written nothing for 60 min, since #402. u requeues, g reassigns             │
                         │                                                                                              │
                         │ ■ 03 / agents                                                                                │
                         │ lead ● #1   impl-a ● #8   impl-b ● #4   rev-1 ● #3   scout ○ offline                         │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
  needs you ·········05  │                                                                                              │
  stuck ·············02  │                                                                                              │
  spent ··········$5.20  │                                                                                              │
  of budget ········$60  │                                                                                              │
  usd unknown ········2  │                                                                                              │
                         │                                                                                              │
─────────────────────────┴──────────────────────────────────────────────────────────────────────────────────────────────┴───────────────────────────────────────
 [ -- ] accept needs a reason. press a, type it, enter commits
  a accept   j/k move / enter open / 1-8 lens / p pause / : command / ? keys
```

tree at 160x48
```text
 aos. / r-0412 / tree                                                                                                                   [ ok ] live #412  14:02
─────────────────────────┬──────────────────────────────────────────────────────────────────────────────────────────────┬───────────────────────────────────────
  run r-0412             │ how the goal breaks down.                                                            8 tasks │ ■ task / #1
                         │                                                                                              │ ship budget enforcement for runs.
  operate                │ ■ 01 / 8 tasks / goal: ship budget enforcement for runs                                      │
  ■ now ············[1]  │▍ /1     ship budget enforcement for runs                      claimed           lead    #398 │ state      claimed
▍ ▤ tree ···········[2]  │  /1/2     research budget prior art                           accepted          scout   #341 │ assignee   lead / claude
  ◇ board ··········[3]  │  /1/3     add per-task token cap in core                      submitted         impl-a  #409 │ depends    nothing
  § graph ··········[4]  │  /1/4     loop guard: same tool call 5x                       stuck 47 min      impl-b  #371 │
  ▍ timeline ·······[5]  │  /1/5     pause and resume from the cli                       changes requested impl-a  #405 │ ■ last events
                         │  /1/6     cost on the status screen                           open              —       #360 │ #398 task_note              lead
  system                 │  /1/7     hard usd cap per run                                yours to review   impl-b  #411 │
  @ agents ·········[6]  │  /8     docs: budgets and limits                              stuck 60 min      impl-a  #402 │ g reassign / x cancel / t trace
  ¶ memory ·········[7]  │                                                                                              │
  $ config ·········[8]  │  paths are routes: /1/3 is task 3 under task 1                                               │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
  needs you ·········05  │                                                                                              │
  stuck ·············02  │                                                                                              │
  spent ··········$5.20  │                                                                                              │
  of budget ········$60  │                                                                                              │
  usd unknown ········2  │                                                                                              │
                         │                                                                                              │
─────────────────────────┴──────────────────────────────────────────────────────────────────────────────────────────────┴───────────────────────────────────────
 [ -- ] every action is one event with your reason. : runs any qagent verb
 j/k move / enter open / 1-8 lens / p pause / : command / ? keys
```

board at 160x48
```text
 aos. / r-0412 / board                                                                                                                  [ ok ] live #412  14:02
─────────────────────────┬──────────────────────────────────────────────────────────────────────────────────────────────┬───────────────────────────────────────
  run r-0412             │ where each task is.                                         no dragging. moving is an action │ ■ task / #1
                         │                                                                                              │ ship budget enforcement for runs.
  operate                │ ─────────────────┬─────────────────┬─────────────────┬─────────────────┬─────────────────    │
  ■ now ············[1]  │  01 open       1 │ 02 claimed    3 │ 03 submitted  2 │ 04 changes    1 │ 05 accepted   1     │ state      claimed
  ▤ tree ···········[2]  │ ─────────────────┼─────────────────┼─────────────────┼─────────────────┼─────────────────    │ assignee   lead / claude
▍ ◇ board ··········[3]  │  #6  unassigned  │▍#1  lead        │ #3  impl-a      │ #5  impl-a      │ #2  scout           │ depends    nothing
  § graph ··········[4]  │  cost on the st… │▍ship budget en… │ add per-task t… │ pause and resu… │ research budge…     │
  ▍ timeline ·······[5]  │                  │                 │                 │                 │                     │ ■ last events
                         │                  │ #4  impl-b      │ #7  impl-b      │                 │                     │ #398 task_note              lead
  system                 │                  │ loop guard: sa… │ hard usd cap p… │                 │                     │
  @ agents ·········[6]  │                  │ stuck 47 min    │                 │                 │                     │ g reassign / x cancel / t trace
  ¶ memory ·········[7]  │                  │                 │                 │                 │                     │
  $ config ·········[8]  │                  │ #8  impl-a      │                 │                 │                     │
                         │                  │ docs: budgets … │                 │                 │                     │
                         │                  │ stuck 60 min    │                 │                 │                     │
                         │                  │                 │                 │                 │                     │
                         │                  │                 │                 │                 │                     │
                         │                  │                 │                 │                 │                     │
                         │                  │                 │                 │                 │                     │
                         │                  │                 │                 │                 │                     │
                         │                  │                 │                 │                 │                     │
                         │                  │                 │                 │                 │                     │
                         │                  │                 │                 │                 │                     │
                         │                  │                 │                 │                 │                     │
                         │                  │                 │                 │                 │                     │
                         │                  │                 │                 │                 │                     │
                         │                  │                 │                 │                 │                     │
                         │                  │                 │                 │                 │                     │
                         │                  │                 │                 │                 │                     │
                         │                  │                 │                 │                 │                     │
                         │                  │                 │                 │                 │                     │
                         │                  │                 │                 │                 │                     │
                         │                  │                 │                 │                 │                     │
                         │                  │                 │                 │                 │                     │
                         │                  │                 │                 │                 │                     │
                         │                  │                 │                 │                 │                     │
                         │                  │                 │                 │                 │                     │
  needs you ·········05  │                  │                 │                 │                 │                     │
  stuck ·············02  │                  │                 │                 │                 │                     │
  spent ··········$5.20  │                  │                 │                 │                 │                     │
  of budget ········$60  │                  │                 │                 │                 │                     │
  usd unknown ········2  │                  │                 │                 │                 │                     │
                         │                  │                 │                 │                 │                     │
─────────────────────────┴──────────────────────────────────────────────────────────────────────────────────────────────┴───────────────────────────────────────
 [ -- ] every action is one event with your reason. : runs any qagent verb
 j/k move / enter open / 1-8 lens / p pause / : command / ? keys
```

graph at 160x48
```text
 aos. / r-0412 / graph                                                                                                                  [ ok ] live #412  14:02
─────────────────────────┬──────────────────────────────────────────────────────────────────────────────────────────────┬───────────────────────────────────────
  run r-0412             │ what blocks what.                                                 left finishes before right │ ■ task / #1
                         │                                                                                              │ ship budget enforcement for runs.
  operate                │                                                                                              │
  ■ now ············[1]  │ ┌─ #1 ─────── claimed ┐           ┌─ #3 ───── submitted ┐           ┌─ #5 ─────── changes ┐  │ state      claimed
  ▤ tree ···········[2]  │ │ ship budget enforc… │     ┌─────│ add per-task token… │─────┬─────│ pause and resume f… │  │ assignee   lead / claude
  ◇ board ··········[3]  │ └─────────────────────┘     │     └─────────────────────┘     │     └─────────────────────┘  │ depends    nothing
▍ § graph ··········[4]  │                             │                                 │                              │
  ▍ timeline ·······[5]  │ ┌─ #2 ────── accepted ┐     │     ┌─ #4 ───────── stuck ┐     │     ┌─ #6 ────────── open ┐  │ ■ last events
                         │ │ research budget pr… │─────┴─────│ loop guard: same t… │     ├─────│ cost on the status… │  │ #398 task_note              lead
  system                 │ └─────────────────────┘           └─────────────────────┘     │     └─────────────────────┘  │
  @ agents ·········[6]  │                                                               │                              │ g reassign / x cancel / t trace
  ¶ memory ·········[7]  │ ┌─ #8 ───────── stuck ┐                                       │     ┌─ #7 ───── submitted ┐  │
  $ config ·········[8]  │ │ docs: budgets and … │                                       └─────│ hard usd cap per r… │  │
                         │ └─────────────────────┘                                             └─────────────────────┘  │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
  needs you ·········05  │                                                                                              │
  stuck ·············02  │                                                                                              │
  spent ··········$5.20  │                                                                                              │
  of budget ········$60  │                                                                                              │
  usd unknown ········2  │                                                                                              │
                         │ fig. 01 / task dependencies / arrows read left to right                                      │
─────────────────────────┴──────────────────────────────────────────────────────────────────────────────────────────────┴───────────────────────────────────────
 [ -- ] every action is one event with your reason. : runs any qagent verb
 j/k move / enter open / 1-8 lens / p pause / : command / ? keys
```

timeline at 160x48
```text
 aos. / r-0412 / timeline                                                                                                               [ ok ] live #412  14:02
─────────────────────────┬──────────────────────────────────────────────────────────────────────────────────────────────┬───────────────────────────────────────
  run r-0412             │ what happened.                                                                     18 events │ ■ event / #412
                         │                                                                                              │ agent working.
  operate                │ ┌─  events.log / r-0412                                         newest first / head #412  ─┐ │
  ■ now ············[1]  │ ▍ #412  rev-1     agent_working           rev-1  reviewing #3 (impl-a, claude) as gemini     │ actor      rev-1
  ▤ tree ···········[2]  │   #411  impl-b    task_submitted          7      usd cap, round 1                            │ entity     rev-1
  ◇ board ··········[3]  │   #410  impl-b    memory_proposed*        m-36   usd cap cannot stop unknown cost            │ text       reviewing #3 (impl-a,
  § graph ··········[4]  │   #409  impl-a    task_submitted          3      token cap in core, round 1                  │            claude) as gemini
▍ ▍ timeline ·······[5]  │   #407  impl-b    message                 q-407  question: usd cap vs unknown cost           │
                         │   #405  rev-1     task_changes_requested  5      resume does not restore claimed tasks; …    │
  system                 │   #402  impl-a    task_note               8      drafting section on limits                  │
  @ agents ·········[6]  │   #398  lead      task_note               1      plan: caps first, then guards, then ui      │
  ¶ memory ·········[7]  │   #396  operator  config_changed*         v14    usd budget null → 60 for r-0412             │
  $ config ·········[8]  │   #371  impl-b    task_note               4      tool call repeated; trying alternative …    │
                         │   #366  impl-b    memory_added*           m-34   repeated call = same name and args          │
                         │   #360  lead      task_created            6      show cost next to stuck and needs you       │
                         │   #341  rev-1     task_accepted           2      evidence 3/3 links resolve                  │
                         │   #340  scout     message                 q-340  question: hermes reports no per-turn co…    │
                         │   #338  scout     memory_added*           m-33   codex and hermes print no usd               │
                         │   #288  operator  memory_added*           m-31   cost not reported is unknown, never zero    │
                         │   #233  operator  config_changed*         v13    rev-1 filesystem write → read               │
                         │   #120  operator  config_changed*         v12    apply preset research-build-review v3       │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
  needs you ·········05  │                                                                                              │
  stuck ·············02  │                                                                                              │
  spent ··········$5.20  │                                                                                              │
  of budget ········$60  │                                                                                              │
  usd unknown ········2  │   ▍ * event kind proposed by D01, not in acs yet                                             │
                         │ └─                                                                                        ─┘ │
─────────────────────────┴──────────────────────────────────────────────────────────────────────────────────────────────┴───────────────────────────────────────
 [ -- ] every action is one event with your reason. : runs any qagent verb
 j/k move / enter open / 1-8 lens / p pause / : command / ? keys
```

agents at 160x48
```text
 aos. / r-0412 / agents                                                                                                                 [ ok ] live #412  14:02
─────────────────────────┬──────────────────────────────────────────────────────────────────────────────────────────────┬───────────────────────────────────────
  run r-0412             │ who is working.                                                                     5 agents │ ■ agent / lead
                         │                                                                                              │ lead, manager.
  operate                │ working              │ waiting              │ offline              │ tokens, millions        │
  ■ now ············[1]  │ ┌─┐ ╷ ╷              │ ┌─┐ ┌─┐              │ ┌─┐ ╶┐               │ ╶┐   ╶┐  ╶─┐            │ harness    claude / claude-opus-4-6
  ▤ tree ···········[2]  │ │ │ └─┤              │ │ │ │ │              │ │ │  │               │  │    │   ─┤            │ family     claude
  ◇ board ··········[3]  │ └─┘   ╵              │ └─┘ └─┘              │ └─┘ ╶┴╴              │ ╶┴╴ .╶┴╴ ╶─┘            │ parent     none (top)
  § graph ··········[4]  │ claimed a turn       │ blocked on mail      │ no call in 15 min    │ 2 agents report no u    │ state      working
  ▍ timeline ·······[5]  │ ──────────────────────────────────────────────────────────────────────────────────────────── │ authority  manager / delegate yes /
                         │                                                                                              │            review yes
  system                 │ ■ 01 / hierarchy / preset research-build-review v3                                           │ access     fs write / shell yes / net
▍ @ agents ·········[6]  │  agent           role            harness / model         state       task  tokens usd        │            yes
  ¶ memory ·········[7]  │▍ lead            manager         claude / claude-opus-4… ● working   #1     412k   $2.91     │ approval   ask (p15, proposed)
  $ config ·········[8]  │  ├ impl-a        implementation  claude / claude-sonnet… ● working   #8     301k   $1.88     │ spend      41 turns / 412k tok /
                         │  ├ impl-b        implementation  codex / gpt-5-codex     ● working   #4     268k       —     │            $2.91
                         │  ├ rev-1         reviewer        gemini / gemini-2.5-pro ● working   #3      96k   $0.41     │
                         │  └ scout         research        hermes / hermes-4-405b  ○ offline   —       54k       —     │ ■ last events
                         │                                                                                              │ #398 task_note              lead
                         │  offline is derived: a stored state older than 15 min shows offline (bus.ts:291)             │ #360 task_created           lead
                         │  p pauses the selected agent. add one with :agent add <id> --role <role> --harness <h>       │
                         │                                                                                              │ p pause agent / t trace
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
  needs you ·········05  │                                                                                              │
  stuck ·············02  │                                                                                              │
  spent ··········$5.20  │                                                                                              │
  of budget ········$60  │                                                                                              │
  usd unknown ········2  │                                                                                              │
                         │                                                                                              │
─────────────────────────┴──────────────────────────────────────────────────────────────────────────────────────────────┴───────────────────────────────────────
 [ -- ] every action is one event with your reason. : runs any qagent verb
 j/k move / enter open / 1-8 lens / p pause / : command / ? keys
```

memory at 160x48
```text
 aos. / r-0412 / memory                                                                                                                 [ ok ] live #412  14:02
─────────────────────────┬──────────────────────────────────────────────────────────────────────────────────────────────┬───────────────────────────────────────
  run r-0412             │ what the run knows.                                                            p11, proposed │ ■ memory / m-31
                         │                                                                                              │ cost a harness does not report is
  operate                │ active               │ proposed             │ retired              │ project chars           │ unknown, never zero. show it as —.
  ■ now ············[1]  │ ┌─┐ ┌─╴              │ ┌─┐ ╶┐               │ ┌─┐ ╶┐               │ ╶─┐ ╶─┐ ╶─┐             │
  ▤ tree ···········[2]  │ │ │ └─┐              │ │ │  │               │ │ │  │               │ ┌─┘  ─┤   │             │ kind       decision
  ◇ board ··········[3]  │ └─┘ ╶─┘              │ └─┘ ╶┴╴              │ └─┘ ╶┴╴              │ └─╴ ╶─┘   ╵             │ state      active
  § graph ··········[4]  │ entries agents read  │ waiting on you       │ kept, not read       │ of 6000                 │ scope      project / ~/src/acs
  ▍ timeline ·······[5]  │ ──────────────────────────────────────────────────────────────────────────────────────────── │ author     operator at #288
                         │                                                                                              │ read by    54 briefs
  system                 │ ■ 01 / project memory                                ━───────────────────────       237/6000 │
  @ agents ·········[6]  │▍ m-31  decision    active    cost a harness does not report is unknown, n…     operator #288 │ project memory goes into every brief
▍ ¶ memory ·········[7]  │  m-33  observation active    codex and hermes print token counts but no u…        scout #338 │ in ~/src/acs. it is framed as data,
  $ config ·········[8]  │  m-36  conclusion  proposed  a usd cap cannot stop a run whose cost is un…       impl-b #410 │ not instructions.
                         │  m-22  assumption  retired   treat missing cost as zero until harnesses r…         lead #190 │
                         │                                                                                              │
                         │ ■ 02 / thread memory                                 ━───────────────────────       184/3000 │ X retire / e edit as new version / t
                         │  m-34  assumption  active    a repeated tool call means identical name an…       task-4 #366 │ trace
                         │  m-35  observation active    resume does not restore claimed tasks. the t…       task-5 #405 │
                         │                                                                                              │
                         │ ■ 03 / agent memory                                  ━───────────────────────        74/2000 │
                         │  m-29  observation active    run npm run test:compile before node --test;…       impl-a #251 │
                         │  a brief for task-4 reads project + thread task-4 + its agent. never another thread.         │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
  needs you ·········05  │                                                                                              │
  stuck ·············02  │                                                                                              │
  spent ··········$5.20  │                                                                                              │
  of budget ········$60  │                                                                                              │
  usd unknown ········2  │                                                                                              │
                         │                                                                                              │
─────────────────────────┴──────────────────────────────────────────────────────────────────────────────────────────────┴───────────────────────────────────────
 [ -- ] every action is one event with your reason. : runs any qagent verb
 j/k move / enter open / 1-8 lens / p pause / : command / ? keys
```

config at 160x48
```text
 aos. / r-0412 / config                                                                                                                 [ ok ] live #412  14:02
─────────────────────────┬──────────────────────────────────────────────────────────────────────────────────────────────┬───────────────────────────────────────
  run r-0412             │ how the system runs.                                                                     v14 │ ■ config / v14
                         │                                                                                              │ constraints.maxRetries.
  operate                │ version              │ staged               │ live keys            │ no reader               │
  ■ now ············[1]  │ ╶┐  ╷ ╷              │ ┌─┐ ┌─┐              │ ┌─┐ ╷ ╷              │ ┌─┐ ╶─┐                 │ effective  2
  ▤ tree ···········[2]  │  │  └─┤              │ │ │ │ │              │ │ │ └─┤              │ │ │   │                 │ type       int 0..10
  ◇ board ··········[3]  │ ╶┴╴   ╵              │ └─┘ └─┘              │ └─┘   ╵              │ └─┘   ╵                 │ layers     default 2
  § graph ··········[4]  │ #396 last change     │ nothing pending      │ read at runtime      │ set, nothing reads i    │ won by     default
  ▍ timeline ·······[5]  │ ──────────────────────────────────────────────────────────────────────────────────────────── │ reader     none. bus.ts:794
                         │                                                                                              │            hard-codes ?? 2
  system                 │ ■ 01 / agent-bus.config.json / layers: default › preset › file › env › run                   │
  @ agents ·········[6]  │▍ constraints.maxRetries                 2           default  no reader  bus.ts:794 hard-co…  │ ■ versions
  ¶ memory ·········[7]  │  constraints.maxConcurrentTasks         4           file     no reader  no reader in src/    │ v14  #396 cap this run at $60 while …
▍ $ config ·········[8]  │  constraints.maxDelegationDepth         4           preset   no reader  no reader in src/ …  │ v13  #233 reviewer may not edit files
                         │  constraints.isolation                  path-locks  file     read       supervisor.ts:401    │ v12  #120 apply research-build-revie…
                         │  constraints.optionalApiCostBudgetUSD   60          run      no reader  no reader in src/ …  │
                         │  constraints.optionalTokenBudget        null        default  no reader  no reader in src/ …  │ e edit / R rollback v14 / t trace
                         │  constraints.independentReviewComplexi… 4           default  no reader  router.ts only, ro…  │
                         │  roles.reviewer.independentFamilyReview true        default  no reader  router.ts:262, tes…  │
                         │  agents.impl-b.approval                 auto-safe   preset   proposed   P15 adds the field   │
                         │  agents.scout.harnessOptions.timeoutMs  3600000     default  read       adapters.ts:203      │
                         │  memory.budget.project                  6000        default  proposed   P11 adds the field   │
                         │  env.QAGENT_ALLOW_API_KEY               0           env      read       locked / superviso…  │
                         │  harnesses.codex.command                codex       file     read       locked / adapters.…  │
                         │                                                                                              │
                         │  e edits a key into staged. A applies all staged keys as one version.                        │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
                         │                                                                                              │
  needs you ·········05  │                                                                                              │
  stuck ·············02  │                                                                                              │
  spent ··········$5.20  │                                                                                              │
  of budget ········$60  │                                                                                              │
  usd unknown ········2  │                                                                                              │
                         │                                                                                              │
─────────────────────────┴──────────────────────────────────────────────────────────────────────────────────────────────┴───────────────────────────────────────
 [ -- ] every action is one event with your reason. : runs any qagent verb
 j/k move / enter open / 1-8 lens / p pause / : command / ? keys
```

