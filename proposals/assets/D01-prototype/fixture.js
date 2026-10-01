/* aos console / fixture. illustrative data shaped like the acs bus (schema/001-baseline.sql,
   src/core/types.ts, agent-bus.config.json). not a real run. fields marked [proposed] do not
   exist in acs yet; the proposal that adds them is named next to each. */
(function (root) {
  'use strict';
  const MIN = 60000, NOW = Date.UTC(2026, 9, 1, 14, 2);
  const F = {
    run: { id: 'r-0412', goal: 'ship budget enforcement for runs', project: '~/src/acs', head: 412, paused: false, now: NOW,
      budgetUsd: 60, preset: 'research-build-review', presetVersion: 3 },

    // agents table + identities + sessions/<id>.json totals. family from src/provider-catalog.ts.
    // status is derived as bus.ts:284-292 does it: stored working/idle older than 15 min shows offline.
    agents: [
      { id: 'lead', role: 'manager', harness: 'claude', model: 'claude-opus-4-6', family: 'claude', parent: null, authority: 'manager',
        perms: { canDelegate: true, canReview: true, filesystem: 'write', shell: true, network: true, maxDelegationDepth: 4 },
        stored: 'working', seenMin: 1, task: 1, turns: 41, tok: 412e3, usd: 2.91, seq: 398, autoStart: false, approval: 'ask' },
      { id: 'impl-a', role: 'implementation', harness: 'claude', model: 'claude-sonnet-4-6', family: 'claude', parent: 'lead', authority: 'worker',
        perms: { canDelegate: false, canReview: false, filesystem: 'write', shell: true, network: false, maxDelegationDepth: 0 },
        stored: 'working', seenMin: 2, task: 8, turns: 33, tok: 301e3, usd: 1.88, seq: 409, approval: 'auto-safe' },
      { id: 'impl-b', role: 'implementation', harness: 'codex', model: 'gpt-5-codex', family: 'gpt', parent: 'lead', authority: 'worker',
        perms: { canDelegate: false, canReview: false, filesystem: 'write', shell: true, network: false, maxDelegationDepth: 0 },
        stored: 'working', seenMin: 1, task: 4, turns: 29, tok: 268e3, usd: null, seq: 411, approval: 'auto-safe' },
      { id: 'rev-1', role: 'reviewer', harness: 'gemini', model: 'gemini-2.5-pro', family: 'gemini', parent: 'lead', authority: 'worker',
        perms: { canDelegate: false, canReview: true, filesystem: 'read', shell: true, network: false, maxDelegationDepth: 0 },
        stored: 'working', seenMin: 0, task: 3, turns: 12, tok: 96e3, usd: 0.41, seq: 412, approval: 'ask' },
      { id: 'scout', role: 'research', harness: 'hermes', model: 'hermes-4-405b', family: 'hermes', parent: 'lead', authority: 'worker',
        perms: { canDelegate: false, canReview: false, filesystem: 'read', shell: false, network: true, maxDelegationDepth: 0 },
        stored: 'idle', seenMin: 22, task: null, turns: 9, tok: 54e3, usd: null, seq: 341, approval: 'ask' }
    ],

    // tasks: states from TaskState (types.ts:8-16). idle = minutes since the task's last event.
    tasks: [
      { id: 1, t: 'ship budget enforcement for runs', p: null, st: 'claimed', a: 'lead', dep: [], seq: 398, idle: 2 },
      { id: 2, t: 'research budget prior art', p: 1, st: 'accepted', a: 'scout', rev: 'rev-1', dep: [], seq: 341, idle: 0,
        res: '3 claims, 3 evidence links, 1 question left open' },
      { id: 3, t: 'add per-task token cap in core', p: 1, st: 'submitted', a: 'impl-a', rev: 'rev-1', dep: [2], seq: 409, idle: 3, round: 1,
        res: 'bus.ts +84 −6, 5 tests added, all pass', files: ['src/core/bus.ts', 'tests/budget.test.ts'] },
      { id: 4, t: 'loop guard: same tool call 5x', p: 1, st: 'claimed', a: 'impl-b', dep: [2], seq: 371, idle: 47, stuck: true, round: 1 },
      { id: 5, t: 'pause and resume from the cli', p: 1, st: 'changes_requested', a: 'impl-a', rev: 'rev-1', dep: [3], seq: 405, idle: 6, round: 2 },
      { id: 6, t: 'cost on the status screen', p: 1, st: 'open', a: null, role: 'cheap-worker', dep: [3], seq: 360, idle: 0, unrouted: true },
      { id: 7, t: 'hard usd cap per run', p: 1, st: 'submitted', a: 'impl-b', rev: 'operator', dep: [3], seq: 411, idle: 1, round: 1,
        res: 'cap checked before each turn. cost unknown for codex turns, tokens used instead' },
      { id: 8, t: 'docs: budgets and limits', p: null, st: 'claimed', a: 'impl-a', dep: [], seq: 402, idle: 60, stuck: true, round: 1 }
    ],

    // messages of type "question" with no "answer" yet (MessageType, types.ts:17)
    questions: [
      { id: 'q-407', from: 'impl-b', task: 7, seq: 407, t: 'should a run with unknown cost (codex, hermes) be stopped by the usd cap, or only by tokens?' },
      { id: 'q-340', from: 'scout', task: 2, seq: 340, t: 'hermes reports no per-turn cost. record it as unknown, not zero?' }
    ],

    // [proposed, P11 + D01] memory rows. kind and the proposed state are D01 additions to P11.
    memory: {
      budgets: { project: 6000, thread: 3000, agent: 2000 },
      entries: [
        { id: 'm-31', scope: 'project', key: '~/src/acs', kind: 'decision', st: 'active', author: 'operator', seq: 288, uses: 54,
          body: 'cost a harness does not report is unknown, never zero. show it as —.' },
        { id: 'm-33', scope: 'project', key: '~/src/acs', kind: 'observation', st: 'active', author: 'scout', seq: 338, uses: 21, from: 2,
          body: 'codex and hermes print token counts but no usd. claude and gemini print both.' },
        { id: 'm-36', scope: 'project', key: '~/src/acs', kind: 'conclusion', st: 'proposed', author: 'impl-b', seq: 410, uses: 0, from: 7,
          body: 'a usd cap cannot stop a run whose cost is unknown. caps must fall back to tokens per family.' },
        { id: 'm-34', scope: 'thread', key: 'task-4', kind: 'assumption', st: 'active', author: 'impl-b', seq: 366, uses: 7, from: 4,
          body: 'a repeated tool call means identical name and arguments; whitespace differences count as different.' },
        { id: 'm-35', scope: 'thread', key: 'task-5', kind: 'observation', st: 'active', author: 'rev-1', seq: 405, uses: 2, from: 5,
          body: 'resume does not restore claimed tasks. the test in tests/pause.test.ts reproduces it.' },
        { id: 'm-29', scope: 'agent', key: 'impl-a', kind: 'observation', st: 'active', author: 'impl-a', seq: 251, uses: 12,
          body: 'run npm run test:compile before node --test; dist-test is stale otherwise.' },
        { id: 'm-22', scope: 'project', key: '~/src/acs', kind: 'assumption', st: 'retired', author: 'lead', seq: 190, uses: 30, retiredSeq: 288, by: 'm-31',
          body: 'treat missing cost as zero until harnesses report it.' }
      ]
    },

    // config: agent-bus.config.json keys with where the effective value came from and who reads it.
    // consumer status (live, dead) is P15's audit; layers are D01. file:line from acs main 9691f55.
    config: {
      version: 14, file: 'agent-bus.config.json', path: '~/src/acs/.qagent/config.json',
      layers: ['default', 'preset', 'file', 'env', 'run'],
      keys: [
        { k: 'constraints.maxRetries', v: 2, layer: 'default', chain: [['default', 2]], use: 'dead', at: 'bus.ts:794 hard-codes ?? 2', type: 'int 0..10' },
        { k: 'constraints.maxConcurrentTasks', v: 4, layer: 'file', chain: [['default', 4], ['file', 4]], use: 'dead', at: 'no reader in src/', type: 'int 1..64' },
        { k: 'constraints.maxDelegationDepth', v: 4, layer: 'preset', chain: [['default', 4], ['preset', 4]], use: 'dead', at: 'no reader in src/ (P06 wires it)', type: 'int 0..8' },
        { k: 'constraints.isolation', v: 'path-locks', layer: 'file', chain: [['default', 'path-locks'], ['file', 'path-locks']], use: 'live', at: 'supervisor.ts:401', type: 'path-locks | worktree | none' },
        { k: 'constraints.optionalApiCostBudgetUSD', v: 60, layer: 'run', chain: [['default', null], ['file', null], ['run', 60]], use: 'dead', at: 'no reader in src/ (P07 wires it)', type: 'number | null' },
        { k: 'constraints.optionalTokenBudget', v: null, layer: 'default', chain: [['default', null]], use: 'dead', at: 'no reader in src/ (P07 wires it)', type: 'int | null' },
        { k: 'constraints.independentReviewComplexity', v: 4, layer: 'default', chain: [['default', 4]], use: 'dead', at: 'router.ts only, router not in src path', type: 'int 1..5' },
        { k: 'roles.reviewer.independentFamilyReview', v: true, layer: 'default', chain: [['default', true]], use: 'dead', at: 'router.ts:262, tests only (P03 wires it)', type: 'bool' },
        { k: 'agents.impl-b.approval', v: 'auto-safe', layer: 'preset', chain: [['default', 'ask'], ['preset', 'auto-safe']], use: 'proposed', at: 'P15 adds the field', type: 'ask | auto-safe | yolo' },
        { k: 'agents.scout.harnessOptions.timeoutMs', v: 3600000, layer: 'default', chain: [['default', 3600000]], use: 'live', at: 'adapters.ts:203', type: 'ms 1000..86400000' },
        { k: 'memory.budget.project', v: 6000, layer: 'default', chain: [['default', 6000]], use: 'proposed', at: 'P11 adds the field', type: 'chars' },
        { k: 'env.QAGENT_ALLOW_API_KEY', v: '0', layer: 'env', chain: [['default', '0'], ['env', '0']], use: 'live', at: 'supervisor.ts:38', type: '0 | 1', locked: 'set in the shell that starts the supervisor' },
        { k: 'harnesses.codex.command', v: 'codex', layer: 'file', chain: [['file', 'codex']], use: 'live', at: 'adapters.ts build()', type: 'path', locked: 'starts a process. edit the file, not the dashboard' }
      ],
      history: [
        { v: 14, seq: 396, actor: 'operator', why: 'cap this run at $60 while budgets are tested', diff: [['constraints.optionalApiCostBudgetUSD', null, 60]] },
        { v: 13, seq: 233, actor: 'operator', why: 'reviewer may not edit files', diff: [['agents.rev-1.permissions.filesystem', 'write', 'read']] },
        { v: 12, seq: 120, actor: 'preset', why: 'apply research-build-review v3', diff: [['constraints.maxDelegationDepth', 2, 4], ['agents.impl-b.approval', 'ask', 'auto-safe']] }
      ]
    },

    // events table rows (seq, actor, kind, entity_id, text). kinds from bus.ts; [p] marks proposed kinds.
    log: [
      [120, 'operator', 'config_changed', 'v12', 'apply preset research-build-review v3', 1],
      [233, 'operator', 'config_changed', 'v13', 'rev-1 filesystem write → read', 1],
      [288, 'operator', 'memory_added', 'm-31', 'cost not reported is unknown, never zero', 1],
      [338, 'scout', 'memory_added', 'm-33', 'codex and hermes print no usd', 1],
      [340, 'scout', 'message', 'q-340', 'question: hermes reports no per-turn cost'],
      [341, 'rev-1', 'task_accepted', '2', 'evidence 3/3 links resolve'],
      [360, 'lead', 'task_created', '6', 'show cost next to stuck and needs you'],
      [366, 'impl-b', 'memory_added', 'm-34', 'repeated call = same name and args', 1],
      [371, 'impl-b', 'task_note', '4', 'tool call repeated; trying alternative regex'],
      [396, 'operator', 'config_changed', 'v14', 'usd budget null → 60 for r-0412', 1],
      [398, 'lead', 'task_note', '1', 'plan: caps first, then guards, then ui'],
      [402, 'impl-a', 'task_note', '8', 'drafting section on limits'],
      [405, 'rev-1', 'task_changes_requested', '5', 'resume does not restore claimed tasks; see test'],
      [407, 'impl-b', 'message', 'q-407', 'question: usd cap vs unknown cost'],
      [409, 'impl-a', 'task_submitted', '3', 'token cap in core, round 1'],
      [410, 'impl-b', 'memory_proposed', 'm-36', 'usd cap cannot stop unknown cost', 1],
      [411, 'impl-b', 'task_submitted', '7', 'usd cap, round 1'],
      [412, 'rev-1', 'agent_working', 'rev-1', 'reviewing #3 (impl-a, claude) as gemini']
    ]
  };

  F.log = F.log.map(e => ({ seq: e[0], actor: e[1], kind: e[2], ref: e[3], text: e[4], proposed: !!e[5] }));
  // derived agent status, bus.ts:284-292
  F.agents.forEach(a => {
    a.status = a.stored === 'waiting' ? 'waiting' : a.stored === 'offline' ? 'offline' : (a.seenMin <= 15 ? a.stored : 'offline');
    a.derived = a.status !== a.stored;
  });
  root.AOS_FIXTURE = F;
  if (typeof module !== 'undefined') module.exports = F;
})(typeof window !== 'undefined' ? window : globalThis);
