# D02 terminal mockups at 120x36

Printed by `node proposals/assets/D01-prototype/mockups.js 120x36` from the same code the prototype draws. Fixture data, not a run.

now at 120x36
```text
 aos. / r-0412 / now                                                                            [ ok ] live #412  14:02
─────────────────────────┬──────────────────────────────────────────────────────────────────────────────────────────────
  run r-0412             │ what needs you.                                                                      7 items
                         │
  operate                │ needs you            │ stuck                │ spent usd            │ cost unknown
▍ ■ now ············[1]  │ ┌─┐ ┌─╴              │ ┌─┐ ╶─┐              │ ┌─╴  ╶─┐ ┌─┐         │ ╶─┐
  ▤ tree ···········[2]  │ │ │ └─┐              │ │ │ ┌─┘              │ └─┐  ┌─┘ │ │         │ ┌─┘
  ◇ board ··········[3]  │ └─┘ ╶─┘              │ └─┘ └─╴              │ ╶─┘ .└─╴ └─┘         │ └─╴
  § graph ··········[4]  │ 2 questions          │ over 30 min          │ of 60.00             │ impl-b, scout
  ▍ timeline ·······[5]  │ ────────────────────────────────────────────────────────────────────────────────────────────
                         │
  system                 │ ■ 01 / needs you
  @ agents ·········[6]  │▍ #7    review    hard usd cap per run                                                   #411
  ¶ memory ·········[7]  │       review is yours. author impl-b (gpt), round 1
  $ config ·········[8]  │  q-407 question  should a run with unknown cost (codex, hermes) be stopped by the us…   #407
                         │       impl-b asks, on #7
                         │  q-340 question  hermes reports no per-turn cost. record it as unknown, not zero?       #340
                         │       scout asks, on #2
                         │  m-36  memory    a usd cap cannot stop a run whose cost is unknown. caps must fall b…   #410
                         │       impl-b proposes a conclusion for project memory. agents read it on every brief once a…
                         │  #6    unrouted  cost on the status screen                                              #360
                         │       role cheap-worker has no agent. assign one, or add a cheap-worker agent
                         │
                         │ ■ 02 / stuck
                         │  #4    47 min    loop guard: same tool call 5x                                          #371
                         │       impl-b has written nothing for 47 min, since #371. u requeues, g reassigns
                         │  #8    60 min    docs: budgets and limits                                               #402
  needs you ·········05  │       impl-a has written nothing for 60 min, since #402. u requeues, g reassigns
  stuck ·············02  │
  spent ··········$5.20  │ ■ 03 / agents
  of budget ········$60  │ lead ● #1   impl-a ● #8   impl-b ● #4   rev-1 ● #3   scout ○ offline
  usd unknown ········2  │
                         │
─────────────────────────┴──────────────────────────────────────────────────────────────────────────────────────────────
 [ -- ] accept needs a reason. press a, type it, enter commits
  a accept   j/k move / enter open / 1-8 lens / p pause / : command / ? keys
```

tree at 120x36
```text
 aos. / r-0412 / tree                                                                           [ ok ] live #412  14:02
─────────────────────────┬──────────────────────────────────────────────────────────────────────────────────────────────
  run r-0412             │ how the goal breaks down.                                                            8 tasks
                         │
  operate                │ ■ 01 / 8 tasks / goal: ship budget enforcement for runs
  ■ now ············[1]  │▍ /1     ship budget enforcement for runs                      claimed           lead    #398
▍ ▤ tree ···········[2]  │  /1/2     research budget prior art                           accepted          scout   #341
  ◇ board ··········[3]  │  /1/3     add per-task token cap in core                      submitted         impl-a  #409
  § graph ··········[4]  │  /1/4     loop guard: same tool call 5x                       stuck 47 min      impl-b  #371
  ▍ timeline ·······[5]  │  /1/5     pause and resume from the cli                       changes requested impl-a  #405
                         │  /1/6     cost on the status screen                           open              —       #360
  system                 │  /1/7     hard usd cap per run                                yours to review   impl-b  #411
  @ agents ·········[6]  │  /8     docs: budgets and limits                              stuck 60 min      impl-a  #402
  ¶ memory ·········[7]  │
  $ config ·········[8]  │  paths are routes: /1/3 is task 3 under task 1
                         │
                         │
                         │
                         │
                         │
                         │
                         │
                         │
                         │
                         │
                         │
                         │
  needs you ·········05  │
  stuck ·············02  │
  spent ··········$5.20  │
  of budget ········$60  │
  usd unknown ········2  │
                         │
─────────────────────────┴──────────────────────────────────────────────────────────────────────────────────────────────
 [ -- ] every action is one event with your reason. : runs any qagent verb
 j/k move / enter open / 1-8 lens / p pause / : command / ? keys
```

board at 120x36
```text
 aos. / r-0412 / board                                                                          [ ok ] live #412  14:02
─────────────────────────┬──────────────────────────────────────────────────────────────────────────────────────────────
  run r-0412             │ where each task is.                                         no dragging. moving is an action
                         │
  operate                │ ─────────────────┬─────────────────┬─────────────────┬─────────────────┬─────────────────
  ■ now ············[1]  │  01 open       1 │ 02 claimed    3 │ 03 submitted  2 │ 04 changes    1 │ 05 accepted   1
  ▤ tree ···········[2]  │ ─────────────────┼─────────────────┼─────────────────┼─────────────────┼─────────────────
▍ ◇ board ··········[3]  │  #6  unassigned  │▍#1  lead        │ #3  impl-a      │ #5  impl-a      │ #2  scout
  § graph ··········[4]  │  cost on the st… │▍ship budget en… │ add per-task t… │ pause and resu… │ research budge…
  ▍ timeline ·······[5]  │                  │                 │                 │                 │
                         │                  │ #4  impl-b      │ #7  impl-b      │                 │
  system                 │                  │ loop guard: sa… │ hard usd cap p… │                 │
  @ agents ·········[6]  │                  │ stuck 47 min    │                 │                 │
  ¶ memory ·········[7]  │                  │                 │                 │                 │
  $ config ·········[8]  │                  │ #8  impl-a      │                 │                 │
                         │                  │ docs: budgets … │                 │                 │
                         │                  │ stuck 60 min    │                 │                 │
                         │                  │                 │                 │                 │
                         │                  │                 │                 │                 │
                         │                  │                 │                 │                 │
                         │                  │                 │                 │                 │
                         │                  │                 │                 │                 │
                         │                  │                 │                 │                 │
                         │                  │                 │                 │                 │
                         │                  │                 │                 │                 │
                         │                  │                 │                 │                 │
                         │                  │                 │                 │                 │
  needs you ·········05  │                  │                 │                 │                 │
  stuck ·············02  │                  │                 │                 │                 │
  spent ··········$5.20  │                  │                 │                 │                 │
  of budget ········$60  │                  │                 │                 │                 │
  usd unknown ········2  │                  │                 │                 │                 │
                         │                  │                 │                 │                 │
─────────────────────────┴──────────────────────────────────────────────────────────────────────────────────────────────
 [ -- ] every action is one event with your reason. : runs any qagent verb
 j/k move / enter open / 1-8 lens / p pause / : command / ? keys
```

graph at 120x36
```text
 aos. / r-0412 / graph                                                                          [ ok ] live #412  14:02
─────────────────────────┬──────────────────────────────────────────────────────────────────────────────────────────────
  run r-0412             │ what blocks what.                                                 left finishes before right
                         │
  operate                │
  ■ now ············[1]  │ ┌─ #1 ─────── claimed ┐           ┌─ #3 ───── submitted ┐           ┌─ #5 ─────── changes ┐
  ▤ tree ···········[2]  │ │ ship budget enforc… │     ┌─────│ add per-task token… │─────┬─────│ pause and resume f… │
  ◇ board ··········[3]  │ └─────────────────────┘     │     └─────────────────────┘     │     └─────────────────────┘
▍ § graph ··········[4]  │                             │                                 │
  ▍ timeline ·······[5]  │ ┌─ #2 ────── accepted ┐     │     ┌─ #4 ───────── stuck ┐     │     ┌─ #6 ────────── open ┐
                         │ │ research budget pr… │─────┴─────│ loop guard: same t… │     ├─────│ cost on the status… │
  system                 │ └─────────────────────┘           └─────────────────────┘     │     └─────────────────────┘
  @ agents ·········[6]  │                                                               │
  ¶ memory ·········[7]  │ ┌─ #8 ───────── stuck ┐                                       │     ┌─ #7 ───── submitted ┐
  $ config ·········[8]  │ │ docs: budgets and … │                                       └─────│ hard usd cap per r… │
                         │ └─────────────────────┘                                             └─────────────────────┘
                         │
                         │
                         │
                         │
                         │
                         │
                         │
                         │
                         │
                         │
                         │
  needs you ·········05  │
  stuck ·············02  │
  spent ··········$5.20  │
  of budget ········$60  │
  usd unknown ········2  │
                         │ fig. 01 / task dependencies / arrows read left to right
─────────────────────────┴──────────────────────────────────────────────────────────────────────────────────────────────
 [ -- ] every action is one event with your reason. : runs any qagent verb
 j/k move / enter open / 1-8 lens / p pause / : command / ? keys
```

timeline at 120x36
```text
 aos. / r-0412 / timeline                                                                       [ ok ] live #412  14:02
─────────────────────────┬──────────────────────────────────────────────────────────────────────────────────────────────
  run r-0412             │ what happened.                                                                     18 events
                         │
  operate                │ ┌─  events.log / r-0412                                         newest first / head #412  ─┐
  ■ now ············[1]  │ ▍ #412  rev-1     agent_working           rev-1  reviewing #3 (impl-a, claude) as gemini
  ▤ tree ···········[2]  │   #411  impl-b    task_submitted          7      usd cap, round 1
  ◇ board ··········[3]  │   #410  impl-b    memory_proposed*        m-36   usd cap cannot stop unknown cost
  § graph ··········[4]  │   #409  impl-a    task_submitted          3      token cap in core, round 1
▍ ▍ timeline ·······[5]  │   #407  impl-b    message                 q-407  question: usd cap vs unknown cost
                         │   #405  rev-1     task_changes_requested  5      resume does not restore claimed tasks; …
  system                 │   #402  impl-a    task_note               8      drafting section on limits
  @ agents ·········[6]  │   #398  lead      task_note               1      plan: caps first, then guards, then ui
  ¶ memory ·········[7]  │   #396  operator  config_changed*         v14    usd budget null → 60 for r-0412
  $ config ·········[8]  │   #371  impl-b    task_note               4      tool call repeated; trying alternative …
                         │   #366  impl-b    memory_added*           m-34   repeated call = same name and args
                         │   #360  lead      task_created            6      show cost next to stuck and needs you
                         │   #341  rev-1     task_accepted           2      evidence 3/3 links resolve
                         │   #340  scout     message                 q-340  question: hermes reports no per-turn co…
                         │   #338  scout     memory_added*           m-33   codex and hermes print no usd
                         │   #288  operator  memory_added*           m-31   cost not reported is unknown, never zero
                         │   #233  operator  config_changed*         v13    rev-1 filesystem write → read
                         │   #120  operator  config_changed*         v12    apply preset research-build-review v3
                         │
                         │
                         │
                         │
  needs you ·········05  │
  stuck ·············02  │
  spent ··········$5.20  │
  of budget ········$60  │
  usd unknown ········2  │   ▍ * event kind proposed by D01, not in acs yet
                         │ └─                                                                                        ─┘
─────────────────────────┴──────────────────────────────────────────────────────────────────────────────────────────────
 [ -- ] every action is one event with your reason. : runs any qagent verb
 j/k move / enter open / 1-8 lens / p pause / : command / ? keys
```

agents at 120x36
```text
 aos. / r-0412 / agents                                                                         [ ok ] live #412  14:02
─────────────────────────┬──────────────────────────────────────────────────────────────────────────────────────────────
  run r-0412             │ who is working.                                                                     5 agents
                         │
  operate                │ working              │ waiting              │ offline              │ tokens, millions
  ■ now ············[1]  │ ┌─┐ ╷ ╷              │ ┌─┐ ┌─┐              │ ┌─┐ ╶┐               │ ╶┐   ╶┐  ╶─┐
  ▤ tree ···········[2]  │ │ │ └─┤              │ │ │ │ │              │ │ │  │               │  │    │   ─┤
  ◇ board ··········[3]  │ └─┘   ╵              │ └─┘ └─┘              │ └─┘ ╶┴╴              │ ╶┴╴ .╶┴╴ ╶─┘
  § graph ··········[4]  │ claimed a turn       │ blocked on mail      │ no call in 15 min    │ 2 agents report no u
  ▍ timeline ·······[5]  │ ────────────────────────────────────────────────────────────────────────────────────────────
                         │
  system                 │ ■ 01 / hierarchy / preset research-build-review v3
▍ @ agents ·········[6]  │  agent           role            harness / model         state       task  tokens usd
  ¶ memory ·········[7]  │▍ lead            manager         claude / claude-opus-4… ● working   #1     412k   $2.91
  $ config ·········[8]  │  ├ impl-a        implementation  claude / claude-sonnet… ● working   #8     301k   $1.88
                         │  ├ impl-b        implementation  codex / gpt-5-codex     ● working   #4     268k       —
                         │  ├ rev-1         reviewer        gemini / gemini-2.5-pro ● working   #3      96k   $0.41
                         │  └ scout         research        hermes / hermes-4-405b  ○ offline   —       54k       —
                         │
                         │  offline is derived: a stored state older than 15 min shows offline (bus.ts:291)
                         │  p pauses the selected agent. add one with :agent add <id> --role <role> --harness <h>
                         │
                         │
                         │
                         │
                         │
                         │
  needs you ·········05  │
  stuck ·············02  │
  spent ··········$5.20  │
  of budget ········$60  │
  usd unknown ········2  │
                         │
─────────────────────────┴──────────────────────────────────────────────────────────────────────────────────────────────
 [ -- ] every action is one event with your reason. : runs any qagent verb
 j/k move / enter open / 1-8 lens / p pause / : command / ? keys
```

memory at 120x36
```text
 aos. / r-0412 / memory                                                                         [ ok ] live #412  14:02
─────────────────────────┬──────────────────────────────────────────────────────────────────────────────────────────────
  run r-0412             │ what the run knows.                                                            p11, proposed
                         │
  operate                │ active               │ proposed             │ retired              │ project chars
  ■ now ············[1]  │ ┌─┐ ┌─╴              │ ┌─┐ ╶┐               │ ┌─┐ ╶┐               │ ╶─┐ ╶─┐ ╶─┐
  ▤ tree ···········[2]  │ │ │ └─┐              │ │ │  │               │ │ │  │               │ ┌─┘  ─┤   │
  ◇ board ··········[3]  │ └─┘ ╶─┘              │ └─┘ ╶┴╴              │ └─┘ ╶┴╴              │ └─╴ ╶─┘   ╵
  § graph ··········[4]  │ entries agents read  │ waiting on you       │ kept, not read       │ of 6000
  ▍ timeline ·······[5]  │ ────────────────────────────────────────────────────────────────────────────────────────────
                         │
  system                 │ ■ 01 / project memory                                ━───────────────────────       237/6000
  @ agents ·········[6]  │▍ m-31  decision    active    cost a harness does not report is unknown, n…     operator #288
▍ ¶ memory ·········[7]  │  m-33  observation active    codex and hermes print token counts but no u…        scout #338
  $ config ·········[8]  │  m-36  conclusion  proposed  a usd cap cannot stop a run whose cost is un…       impl-b #410
                         │  m-22  assumption  retired   treat missing cost as zero until harnesses r…         lead #190
                         │
                         │ ■ 02 / thread memory                                 ━───────────────────────       184/3000
                         │  m-34  assumption  active    a repeated tool call means identical name an…       task-4 #366
                         │  m-35  observation active    resume does not restore claimed tasks. the t…       task-5 #405
                         │
                         │ ■ 03 / agent memory                                  ━───────────────────────        74/2000
                         │  m-29  observation active    run npm run test:compile before node --test;…       impl-a #251
                         │  a brief for task-4 reads project + thread task-4 + its agent. never another thread.
                         │
                         │
                         │
  needs you ·········05  │
  stuck ·············02  │
  spent ··········$5.20  │
  of budget ········$60  │
  usd unknown ········2  │
                         │
─────────────────────────┴──────────────────────────────────────────────────────────────────────────────────────────────
 [ -- ] every action is one event with your reason. : runs any qagent verb
 j/k move / enter open / 1-8 lens / p pause / : command / ? keys
```

config at 120x36
```text
 aos. / r-0412 / config                                                                         [ ok ] live #412  14:02
─────────────────────────┬──────────────────────────────────────────────────────────────────────────────────────────────
  run r-0412             │ how the system runs.                                                                     v14
                         │
  operate                │ version              │ staged               │ live keys            │ no reader
  ■ now ············[1]  │ ╶┐  ╷ ╷              │ ┌─┐ ┌─┐              │ ┌─┐ ╷ ╷              │ ┌─┐ ╶─┐
  ▤ tree ···········[2]  │  │  └─┤              │ │ │ │ │              │ │ │ └─┤              │ │ │   │
  ◇ board ··········[3]  │ ╶┴╴   ╵              │ └─┘ └─┘              │ └─┘   ╵              │ └─┘   ╵
  § graph ··········[4]  │ #396 last change     │ nothing pending      │ read at runtime      │ set, nothing reads i
  ▍ timeline ·······[5]  │ ────────────────────────────────────────────────────────────────────────────────────────────
                         │
  system                 │ ■ 01 / agent-bus.config.json / layers: default › preset › file › env › run
  @ agents ·········[6]  │▍ constraints.maxRetries                 2           default  no reader  bus.ts:794 hard-co…
  ¶ memory ·········[7]  │  constraints.maxConcurrentTasks         4           file     no reader  no reader in src/
▍ $ config ·········[8]  │  constraints.maxDelegationDepth         4           preset   no reader  no reader in src/ …
                         │  constraints.isolation                  path-locks  file     read       supervisor.ts:401
                         │  constraints.optionalApiCostBudgetUSD   60          run      no reader  no reader in src/ …
                         │  constraints.optionalTokenBudget        null        default  no reader  no reader in src/ …
                         │  constraints.independentReviewComplexi… 4           default  no reader  router.ts only, ro…
                         │  roles.reviewer.independentFamilyReview true        default  no reader  router.ts:262, tes…
                         │  agents.impl-b.approval                 auto-safe   preset   proposed   P15 adds the field
                         │  agents.scout.harnessOptions.timeoutMs  3600000     default  read       adapters.ts:203
                         │  memory.budget.project                  6000        default  proposed   P11 adds the field
                         │  env.QAGENT_ALLOW_API_KEY               0           env      read       locked / superviso…
                         │  harnesses.codex.command                codex       file     read       locked / adapters.…
                         │
                         │  e edits a key into staged. A applies all staged keys as one version.
  needs you ·········05  │
  stuck ·············02  │
  spent ··········$5.20  │
  of budget ········$60  │
  usd unknown ········2  │
                         │
─────────────────────────┴──────────────────────────────────────────────────────────────────────────────────────────────
 [ -- ] every action is one event with your reason. : runs any qagent verb
 j/k move / enter open / 1-8 lens / p pause / : command / ? keys
```

