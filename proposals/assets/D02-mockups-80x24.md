# D02 terminal mockups at 80x24

Printed by `node proposals/assets/D01-prototype/mockups.js 80x24` from the same code the prototype draws. Fixture data, not a run.

now at 80x24
```text
 aos. / r-0412 / now                                    [ ok ] live #412  14:02
 1 now  2 tree  3 board  4 graph  5 timeline  6 agents  7 memory  8 config
────────────────────────────────────────────────────────────────────────────────
 needs you 05   stuck 02   spent $5.20 of $60   cost unknown 2 agents
────────────────────────────────────────────────────────────────────────────────
 ■ 01 / needs you
▍ #7    review    hard usd cap per run                                     #411
  q-407 question  should a run with unknown cost (codex, hermes) be sto…   #407
  q-340 question  hermes reports no per-turn cost. record it as unknown…   #340
  m-36  memory    a usd cap cannot stop a run whose cost is unknown. ca…   #410
  #6    unrouted  cost on the status screen                                #360

 ■ 02 / stuck
  #4    47 min    loop guard: same tool call 5x                            #371
  #8    60 min    docs: budgets and limits                                 #402

 ■ 03 / agents
 lead ● #1   impl-a ● #8   impl-b ● #4   rev-1 ● #3   scout ○ offline



────────────────────────────────────────────────────────────────────────────────
 [ -- ] accept needs a reason. press a, type it, enter commits
  a accept   j/k move / enter open / 1-8 lens / p pause / : command / ? keys
```

tree at 80x24
```text
 aos. / r-0412 / tree                                   [ ok ] live #412  14:02
 1 now  2 tree  3 board  4 graph  5 timeline  6 agents  7 memory  8 config
────────────────────────────────────────────────────────────────────────────────
 needs you 05   stuck 02   spent $5.20 of $60   cost unknown 2 agents
────────────────────────────────────────────────────────────────────────────────
 ■ 01 / 8 tasks / goal: ship budget enforcement for runs
▍ /1     ship budget enforcement for runs        claimed           lead    #398
  /1/2     research budget prior art             accepted          scout   #341
  /1/3     add per-task token cap in core        submitted         impl-a  #409
  /1/4     loop guard: same tool call 5x         stuck 47 min      impl-b  #371
  /1/5     pause and resume from the cli         changes requested impl-a  #405
  /1/6     cost on the status screen             open              —       #360
  /1/7     hard usd cap per run                  yours to review   impl-b  #411
  /8     docs: budgets and limits                stuck 60 min      impl-a  #402

  paths are routes: /1/3 is task 3 under task 1





────────────────────────────────────────────────────────────────────────────────
 [ -- ] every action is one event with your reason. : runs any qagent verb
 j/k move / enter open / 1-8 lens / p pause / : command / ? keys
```

board at 80x24
```text
 aos. / r-0412 / board                                  [ ok ] live #412  14:02
 1 now  2 tree  3 board  4 graph  5 timeline  6 agents  7 memory  8 config
────────────────────────────────────────────────────────────────────────────────
 needs you 05   stuck 02   spent $5.20 of $60   cost unknown 2 agents
────────────────────────────────────────────────────────────────────────────────
 ──────────────┬──────────────┬──────────────┬──────────────┬──────────────
  01 open    1 │ 02 claimed 3 │ 03 submitt 2 │ 04 changes 1 │ 05 accepte 1
 ──────────────┼──────────────┼──────────────┼──────────────┼──────────────
  #6  unassig… │▍#1  lead     │ #3  impl-a   │ #5  impl-a   │ #2  scout
  cost on the… │▍ship budget… │ add per-tas… │ pause and r… │ research bu…
               │              │              │              │
               │ #4  impl-b   │ #7  impl-b   │              │
               │ loop guard:… │ hard usd ca… │              │
               │ stuck 47 min │              │              │
               │              │              │              │
               │ #8  impl-a   │              │              │
               │ docs: budge… │              │              │
               │ stuck 60 min │              │              │
               │              │              │              │
               │              │              │              │
               │              │              │              │
────────────────────────────────────────────────────────────────────────────────
 [ -- ] every action is one event with your reason. : runs any qagent verb
 j/k move / enter open / 1-8 lens / p pause / : command / ? keys
```

graph at 80x24
```text
 aos. / r-0412 / graph                                  [ ok ] live #412  14:02
 1 now  2 tree  3 board  4 graph  5 timeline  6 agents  7 memory  8 config
────────────────────────────────────────────────────────────────────────────────
 needs you 05   stuck 02   spent $5.20 of $60   cost unknown 2 agents
────────────────────────────────────────────────────────────────────────────────

 ┌─ #1 ── claimed ┐            ┌─ #3  submitted ┐            ┌─ #5 ── changes ┐
 │ ship budget e… │     ┌──────│ add per-task … │─────┬──────│ pause and res… │
 └────────────────┘     │      └────────────────┘     │      └────────────────┘
                        │                             │
 ┌─ #2 ─ accepted ┐     │      ┌─ #4 ──── stuck ┐     │      ┌─ #6 ───── open ┐
 │ research budg… │─────┴──────│ loop guard: s… │     ├──────│ cost on the s… │
 └────────────────┘            └────────────────┘     │      └────────────────┘
                                                      │
 ┌─ #8 ──── stuck ┐                                   │      ┌─ #7  submitted ┐
 │ docs: budgets… │                                   └──────│ hard usd cap … │
 └────────────────┘                                          └────────────────┘



 fig. 01 / task dependencies / arrows read left to right
────────────────────────────────────────────────────────────────────────────────
 [ -- ] every action is one event with your reason. : runs any qagent verb
 j/k move / enter open / 1-8 lens / p pause / : command / ? keys
```

timeline at 80x24
```text
 aos. / r-0412 / timeline                               [ ok ] live #412  14:02
 1 now  2 tree  3 board  4 graph  5 timeline  6 agents  7 memory  8 config
────────────────────────────────────────────────────────────────────────────────
 needs you 05   stuck 02   spent $5.20 of $60   cost unknown 2 agents
────────────────────────────────────────────────────────────────────────────────
 ┌─  events.log / r-0412                           newest first / head #412  ─┐
 ▍ #412  rev-1     agent_working           rev-1  reviewing #3 (impl-a, cla…
   #411  impl-b    task_submitted          7      usd cap, round 1
   #410  impl-b    memory_proposed*        m-36   usd cap cannot stop unkno…
   #409  impl-a    task_submitted          3      token cap in core, round 1
   #407  impl-b    message                 q-407  question: usd cap vs unkn…
   #405  rev-1     task_changes_requested  5      resume does not restore c…
   #402  impl-a    task_note               8      drafting section on limits
   #398  lead      task_note               1      plan: caps first, then gu…
   #396  operator  config_changed*         v14    usd budget null → 60 for …
   #371  impl-b    task_note               4      tool call repeated; tryin…
   #366  impl-b    memory_added*           m-34   repeated call = same name…
   #360  lead      task_created            6      show cost next to stuck a…
   #341  rev-1     task_accepted           2      evidence 3/3 links resolve
   ▍ * event kind proposed by D01, not in acs yet
 └─                                                                          ─┘
────────────────────────────────────────────────────────────────────────────────
 [ -- ] every action is one event with your reason. : runs any qagent verb
 j/k move / enter open / 1-8 lens / p pause / : command / ? keys
```

agents at 80x24
```text
 aos. / r-0412 / agents                                 [ ok ] live #412  14:02
 1 now  2 tree  3 board  4 graph  5 timeline  6 agents  7 memory  8 config
────────────────────────────────────────────────────────────────────────────────
 needs you 05   stuck 02   spent $5.20 of $60   cost unknown 2 agents
────────────────────────────────────────────────────────────────────────────────
 ■ 01 / hierarchy / preset research-build-review v3
  agent        role            state       task   tokens usd
▍ lead         manager         ● working   #1      412k   $2.91
  ├ impl-a     implementation  ● working   #8      301k   $1.88
  ├ impl-b     implementation  ● working   #4      268k       —
  ├ rev-1      reviewer        ● working   #3       96k   $0.41
  └ scout      research        ○ offline   —        54k       —

  p pauses the selected agent. add one with :agent add <id> --role <role> --har







────────────────────────────────────────────────────────────────────────────────
 [ -- ] every action is one event with your reason. : runs any qagent verb
 j/k move / enter open / 1-8 lens / p pause / : command / ? keys
```

memory at 80x24
```text
 aos. / r-0412 / memory                                 [ ok ] live #412  14:02
 1 now  2 tree  3 board  4 graph  5 timeline  6 agents  7 memory  8 config
────────────────────────────────────────────────────────────────────────────────
 needs you 05   stuck 02   spent $5.20 of $60   cost unknown 2 agents
────────────────────────────────────────────────────────────────────────────────
 ■ 01 / project memory                  ━───────────────────────       237/6000
▍ m-31  decision    active    cost a harness does not report…     operator #288
  m-33  observation active    codex and hermes print token c…        scout #338
  m-36  conclusion  proposed  a usd cap cannot stop a run wh…       impl-b #410
  m-22  assumption  retired   treat missing cost as zero unt…         lead #190

 ■ 02 / thread memory                   ━───────────────────────       184/3000
  m-34  assumption  active    a repeated tool call means ide…       task-4 #366
  m-35  observation active    resume does not restore claime…       task-5 #405

 ■ 03 / agent memory                    ━───────────────────────        74/2000
  m-29  observation active    run npm run test:compile befor…       impl-a #251
  task-4 reads project + task-4 + its agent. never other threads.



────────────────────────────────────────────────────────────────────────────────
 [ -- ] every action is one event with your reason. : runs any qagent verb
 j/k move / enter open / 1-8 lens / p pause / : command / ? keys
```

config at 80x24
```text
 aos. / r-0412 / config                                 [ ok ] live #412  14:02
 1 now  2 tree  3 board  4 graph  5 timeline  6 agents  7 memory  8 config
────────────────────────────────────────────────────────────────────────────────
 needs you 05   stuck 02   spent $5.20 of $60   cost unknown 2 agents
────────────────────────────────────────────────────────────────────────────────
 ■ 01 / agent-bus.config.json / layers: default › preset › file › env › run
▍ maxRetries                     2           default  no reader
  maxConcurrentTasks             4           file     no reader
  maxDelegationDepth             4           preset   no reader
  isolation                      path-locks  file     read
  optionalApiCostBudgetUSD       60          run      no reader
  optionalTokenBudget            null        default  no reader
  independentReviewComplexity    4           default  no reader
  roles.reviewer.independentFam… true        default  no reader
  agents.impl-b.approval         auto-safe   preset   proposed
  agents.scout.harnessOptions.t… 3600000     default  read
  memory.budget.project          6000        default  proposed
  env.QAGENT_ALLOW_API_KEY       0           env      read
  harnesses.codex.command        codex       file     read

  e edits a key into staged. A applies all staged keys as one version.
────────────────────────────────────────────────────────────────────────────────
 [ -- ] every action is one event with your reason. : runs any qagent verb
 j/k move / enter open / 1-8 lens / p pause / : command / ? keys
```

