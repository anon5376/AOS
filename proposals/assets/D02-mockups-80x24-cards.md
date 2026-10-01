# D02 terminal mockups at 80x24, card open

Printed by `node proposals/assets/D01-prototype/mockups.js 80x24 --card`. At 80 columns the card replaces the main pane.

now / card at 80x24
```text
 aos. / r-0412 / now / #7                               [ ok ] live #412  14:02
 1 now  2 tree  3 board  4 graph  5 timeline  6 agents  7 memory  8 config
────────────────────────────────────────────────────────────────────────────────
 needs you 05   stuck 02   spent $5.20 of $60   cost unknown 2 agents
────────────────────────────────────────────────────────────────────────────────
 ■ task / #7
 hard usd cap per run.

 state      submitted
 assignee   impl-b / gpt
 reviewer   you
 depends    #3 submitted
 result     cap checked before each turn. cost unknown for codex turns, tokens
            used instead
 question   q-407 unanswered

 ■ last events
 #411 task_submitted         impl-b

  a accept →   r request changes / x cancel / t trace

────────────────────────────────────────────────────────────────────────────────
 [ -- ] accept needs a reason. press a, type it, enter commits
  a accept   esc back / j/k move / t trace / : command / ? keys
```

tree / card at 80x24
```text
 aos. / r-0412 / tree / #1                              [ ok ] live #412  14:02
 1 now  2 tree  3 board  4 graph  5 timeline  6 agents  7 memory  8 config
────────────────────────────────────────────────────────────────────────────────
 needs you 05   stuck 02   spent $5.20 of $60   cost unknown 2 agents
────────────────────────────────────────────────────────────────────────────────
 ■ task / #1
 ship budget enforcement for runs.

 state      claimed
 assignee   lead / claude
 depends    nothing

 ■ last events
 #398 task_note              lead

 g reassign / x cancel / t trace





────────────────────────────────────────────────────────────────────────────────
 [ -- ] every action is one event with your reason. : runs any qagent verb
 esc back / j/k move / t trace / : command / ? keys
```

board / card at 80x24
```text
 aos. / r-0412 / board / #1                             [ ok ] live #412  14:02
 1 now  2 tree  3 board  4 graph  5 timeline  6 agents  7 memory  8 config
────────────────────────────────────────────────────────────────────────────────
 needs you 05   stuck 02   spent $5.20 of $60   cost unknown 2 agents
────────────────────────────────────────────────────────────────────────────────
 ■ task / #1
 ship budget enforcement for runs.

 state      claimed
 assignee   lead / claude
 depends    nothing

 ■ last events
 #398 task_note              lead

 g reassign / x cancel / t trace





────────────────────────────────────────────────────────────────────────────────
 [ -- ] every action is one event with your reason. : runs any qagent verb
 esc back / j/k move / t trace / : command / ? keys
```

graph / card at 80x24
```text
 aos. / r-0412 / graph / #1                             [ ok ] live #412  14:02
 1 now  2 tree  3 board  4 graph  5 timeline  6 agents  7 memory  8 config
────────────────────────────────────────────────────────────────────────────────
 needs you 05   stuck 02   spent $5.20 of $60   cost unknown 2 agents
────────────────────────────────────────────────────────────────────────────────
 ■ task / #1
 ship budget enforcement for runs.

 state      claimed
 assignee   lead / claude
 depends    nothing

 ■ last events
 #398 task_note              lead

 g reassign / x cancel / t trace





────────────────────────────────────────────────────────────────────────────────
 [ -- ] every action is one event with your reason. : runs any qagent verb
 esc back / j/k move / t trace / : command / ? keys
```

timeline / card at 80x24
```text
 aos. / r-0412 / timeline / #412                        [ ok ] live #412  14:02
 1 now  2 tree  3 board  4 graph  5 timeline  6 agents  7 memory  8 config
────────────────────────────────────────────────────────────────────────────────
 needs you 05   stuck 02   spent $5.20 of $60   cost unknown 2 agents
────────────────────────────────────────────────────────────────────────────────
 ■ event / #412
 agent working.

 actor      rev-1
 entity     rev-1
 text       reviewing #3 (impl-a, claude) as gemini










────────────────────────────────────────────────────────────────────────────────
 [ -- ] every action is one event with your reason. : runs any qagent verb
 esc back / j/k move / t trace / : command / ? keys
```

agents / card at 80x24
```text
 aos. / r-0412 / agents / lead                          [ ok ] live #412  14:02
 1 now  2 tree  3 board  4 graph  5 timeline  6 agents  7 memory  8 config
────────────────────────────────────────────────────────────────────────────────
 needs you 05   stuck 02   spent $5.20 of $60   cost unknown 2 agents
────────────────────────────────────────────────────────────────────────────────
 ■ agent / lead
 lead, manager.

 harness    claude / claude-opus-4-6
 family     claude
 parent     none (top)
 state      working
 authority  manager / delegate yes / review yes
 access     fs write / shell yes / net yes
 approval   ask (p15, proposed)
 spend      41 turns / 412k tok / $2.91

 ■ last events
 #398 task_note              lead
 #360 task_created           lead

────────────────────────────────────────────────────────────────────────────────
 [ -- ] every action is one event with your reason. : runs any qagent verb
 esc back / j/k move / t trace / : command / ? keys
```

memory / card at 80x24
```text
 aos. / r-0412 / memory / m-31                          [ ok ] live #412  14:02
 1 now  2 tree  3 board  4 graph  5 timeline  6 agents  7 memory  8 config
────────────────────────────────────────────────────────────────────────────────
 needs you 05   stuck 02   spent $5.20 of $60   cost unknown 2 agents
────────────────────────────────────────────────────────────────────────────────
 ■ memory / m-31
 cost a harness does not report is unknown, never zero. show it as —.

 kind       decision
 state      active
 scope      project / ~/src/acs
 author     operator at #288
 read by    54 briefs

 project memory goes into every brief in ~/src/acs. it is framed as data, not
 instructions.

 X retire / e edit as new version / t trace



────────────────────────────────────────────────────────────────────────────────
 [ -- ] every action is one event with your reason. : runs any qagent verb
 esc back / j/k move / t trace / : command / ? keys
```

config / card at 80x24
```text
 aos. / r-0412 / config / maxRetries                    [ ok ] live #412  14:02
 1 now  2 tree  3 board  4 graph  5 timeline  6 agents  7 memory  8 config
────────────────────────────────────────────────────────────────────────────────
 needs you 05   stuck 02   spent $5.20 of $60   cost unknown 2 agents
────────────────────────────────────────────────────────────────────────────────
 ■ config / v14
 constraints.maxRetries.

 effective  2
 type       int 0..10
 layers     default 2
 won by     default
 reader     none. bus.ts:794 hard-codes ?? 2

 ■ versions
 v14  #396 cap this run at $60 while budgets are tested
 v13  #233 reviewer may not edit files
 v12  #120 apply research-build-review v3

 e edit / R rollback v14 / t trace

────────────────────────────────────────────────────────────────────────────────
 [ -- ] every action is one event with your reason. : runs any qagent verb
 esc back / j/k move / t trace / : command / ? keys
```

