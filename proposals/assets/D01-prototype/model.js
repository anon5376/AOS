/* aos console / one read model and one verb set. the dashboard and the terminal both render
   frame(S) and both call verb(S, ...); neither keeps its own copy of the facts (D01 section 3). */
(function (root) {
  'use strict';
  const STUCK_MIN = 30;

  function clone(F) { return JSON.parse(JSON.stringify(F)); }

  function frame(S) {
    const T = id => S.tasks.find(t => t.id === id);
    const A = id => S.agents.find(a => a.id === id);
    const fam = id => (A(id) || {}).family || (id === 'operator' ? 'you' : '');
    const needs = [];
    S.tasks.filter(t => t.st === 'submitted' && t.rev === 'operator').forEach(t => needs.push({
      kind: 'review', ref: '#' + t.id, task: t.id, seq: t.seq, title: t.t,
      why: `review is yours. author ${t.a} (${fam(t.a)}), round ${t.round || 1}` }));
    S.questions.filter(q => !q.answered).forEach(q => needs.push({
      kind: 'question', ref: q.id, task: q.task, seq: q.seq, title: q.t, why: `${q.from} asks, on #${q.task}` }));
    S.memory.entries.filter(m => m.st === 'proposed').forEach(m => needs.push({
      kind: 'memory', ref: m.id, mem: m.id, task: m.from, seq: m.seq, title: m.body,
      why: `${m.author} proposes a ${m.kind} for ${m.scope} memory. agents read it on every brief once approved` }));
    S.tasks.filter(t => t.unrouted && t.st === 'open').forEach(t => needs.push({
      kind: 'unrouted', ref: '#' + t.id, task: t.id, seq: t.seq, title: t.t,
      why: `role ${t.role} has no agent. assign one, or add a ${t.role} agent` }));
    const stuck = S.tasks.filter(t => t.st === 'claimed' && t.idle >= STUCK_MIN).map(t => ({
      kind: 'stuck', ref: '#' + t.id, task: t.id, seq: t.seq, title: t.t, min: t.idle,
      why: `${t.a} has written nothing for ${t.idle} min, since #${t.seq}` }));
    const known = S.agents.filter(a => a.usd !== null);
    const spent = known.reduce((s, a) => s + a.usd, 0);
    const unknown = S.agents.filter(a => a.usd === null);
    const tok = S.agents.reduce((s, a) => s + a.tok, 0);
    const by = st => S.agents.filter(a => a.status === st).length;
    const mem = S.memory.entries;
    const used = scope => mem.filter(m => m.scope === scope && m.st !== 'retired').reduce((s, m) => s + m.body.length, 0);
    return {
      seq: S.run.head, needs, stuck, spent, unknown, tok,
      agents: { working: by('working'), waiting: by('waiting'), idle: by('idle'), offline: by('offline') },
      memory: { active: mem.filter(m => m.st === 'active').length, proposed: mem.filter(m => m.st === 'proposed').length,
        retired: mem.filter(m => m.st === 'retired').length, used },
      config: { version: S.config.version, staged: Object.keys(S.staged || {}).length,
        dead: S.config.keys.filter(k => k.use === 'dead').length, live: S.config.keys.filter(k => k.use === 'live').length },
      T, A, fam
    };
  }

  // every verb appends exactly one event and returns {ok, seq} or {ok:false, err}.
  const NEEDS_WHY = new Set(['accept', 'revise', 'cancel', 'answer', 'approve', 'retire', 'forget', 'apply', 'rollback', 'pause-agent']);
  function emit(S, kind, ref, text, proposed) { S.run.head++; S.log.push({ seq: S.run.head, actor: 'operator', kind, ref: String(ref), text, proposed: !!proposed }); return S.run.head; }

  function verb(S, name, arg, why) {
    why = (why || '').trim();
    if (NEEDS_WHY.has(name) && !why) return { ok: false, err: 'a reason is required. it is stored on the event' };
    const F = frame(S);
    const t = typeof arg === 'number' ? F.T(arg) : null;
    let seq;
    switch (name) {
      case 'accept': if (!t || t.st !== 'submitted') return { ok: false, err: 'only a submitted task can be accepted' };
        t.st = 'accepted'; seq = t.seq = emit(S, 'task_accepted', t.id, why); break;
      case 'revise': if (!t || t.st !== 'submitted') return { ok: false, err: 'only a submitted task can go back for changes' };
        t.st = 'changes_requested'; t.round = (t.round || 1) + 1; seq = t.seq = emit(S, 'task_changes_requested', t.id, why); break;
      case 'requeue': if (!t || t.st !== 'claimed') return { ok: false, err: 'only a claimed task can be requeued' };
        t.st = 'open'; t.a = null; t.stuck = false; t.idle = 0; seq = t.seq = emit(S, 'task_released', t.id, 'requeued. ' + (why || 'stalled')); break;
      case 'assign': if (!t) return { ok: false, err: 'no such task' };
        t.a = why || 'impl-a'; t.st = 'claimed'; t.unrouted = false; t.idle = 0; seq = t.seq = emit(S, 'task_claimed', t.id, 'assigned to ' + t.a + ' by operator'); break;
      case 'cancel': if (!t) return { ok: false, err: 'no such task' };
        t.st = 'cancelled'; t.stuck = false; seq = t.seq = emit(S, 'task_cancelled', t.id, why); break;
      case 'answer': { const q = S.questions.find(x => x.id === arg); if (!q) return { ok: false, err: 'no such question' };
        q.answered = true; seq = emit(S, 'message', q.id, 'answer: ' + why); break; }
      case 'pause': S.run.paused = !S.run.paused; seq = emit(S, S.run.paused ? 'run_paused' : 'run_resumed', S.run.id, S.run.paused ? 'new claims refused. running turns finish' : 'claims allowed', true); break;
      case 'pause-agent': { const a = F.A(arg); a.paused = !a.paused; seq = emit(S, a.paused ? 'agent_paused' : 'agent_resumed', a.id, why, true); break; }
      case 'add-agent': { const a = arg; if (!/^[A-Za-z0-9._-]+$/.test(a.id || '')) return { ok: false, err: 'id: letters, digits, dot, dash or underscore' };
        if (F.A(a.id)) return { ok: false, err: 'an agent named ' + a.id + ' exists' };
        S.agents.push({ id: a.id, role: a.role, harness: a.harness, model: a.model, family: a.family, parent: 'lead', authority: 'worker',
          perms: { canDelegate: false, canReview: a.role === 'reviewer', filesystem: 'write', shell: true, network: false, maxDelegationDepth: 0 },
          stored: 'offline', status: 'offline', seenMin: null, task: null, turns: 0, tok: 0, usd: a.harness === 'codex' || a.harness === 'hermes' ? null : 0, approval: 'ask' });
        seq = emit(S, 'agent_added', a.id, `${a.role} on ${a.harness} / ${a.model}. start: qagent supervise ${a.id}`); break; }
      case 'approve': { const m = S.memory.entries.find(x => x.id === arg); if (!m || m.st !== 'proposed') return { ok: false, err: 'only a proposed entry can be approved' };
        m.st = 'active'; seq = m.seq = emit(S, 'memory_approved', m.id, why, true); break; }
      case 'retire': { const m = S.memory.entries.find(x => x.id === arg); if (!m || m.st === 'retired') return { ok: false, err: 'already retired' };
        m.st = 'retired'; m.retiredSeq = seq = emit(S, 'memory_retired', m.id, why, true); break; }
      case 'supersede': { const m = S.memory.entries.find(x => x.id === arg.id); if (!m || m.st === 'retired') return { ok: false, err: 'only an active or proposed entry can be edited' };
        if (!arg.body || !arg.body.trim()) return { ok: false, err: 'type the new text of the entry' };
        const nid = 'm-' + (Math.max(...S.memory.entries.map(x => +x.id.slice(2))) + 1);
        seq = emit(S, 'memory_added', nid, 'supersedes ' + m.id + (why ? '. ' + why : ''), true);
        m.st = 'retired'; m.retiredSeq = seq; m.by = nid;
        S.memory.entries.push({ id: nid, scope: m.scope, key: m.key, kind: m.kind, st: 'active', author: 'operator', seq, uses: 0, body: arg.body.trim(), supersedes: m.id }); break; }
      case 'stage': { S.staged = S.staged || {}; const k = S.config.keys.find(x => x.k === arg.k);
        if (k.locked) return { ok: false, err: k.locked };
        const v = parse(k, arg.v); if (v.err) return { ok: false, err: v.err };
        if (v.val === k.v) { delete S.staged[k.k]; return { ok: true, staged: true }; }
        S.staged[k.k] = v.val; return { ok: true, staged: true }; }
      case 'apply': { const st = S.staged || {}; const ks = Object.keys(st); if (!ks.length) return { ok: false, err: 'nothing is staged' };
        const diff = ks.map(k => { const key = S.config.keys.find(x => x.k === k); const d = [k, key.v, st[k]]; key.v = st[k]; key.layer = 'run'; key.chain = key.chain.filter(c => c[0] !== 'run').concat([['run', st[k]]]); return d; });
        S.config.version++; seq = emit(S, 'config_changed', 'v' + S.config.version, why, true);
        S.config.history.unshift({ v: S.config.version, seq, actor: 'operator', why, diff }); S.staged = {}; break; }
      case 'rollback': { const h = S.config.history.find(x => x.v === arg); if (!h) return { ok: false, err: 'no such version' };
        const diff = h.diff.map(d => { const key = S.config.keys.find(x => x.k === d[0]); if (key) { key.v = d[1]; } return [d[0], d[2], d[1]]; });
        S.config.version++; seq = emit(S, 'config_changed', 'v' + S.config.version, 'rollback of v' + arg + '. ' + why, true);
        S.config.history.unshift({ v: S.config.version, seq, actor: 'operator', why: 'rollback of v' + arg + '. ' + why, diff }); break; }
      default: return { ok: false, err: 'unknown verb ' + name };
    }
    return { ok: true, seq };
  }

  function parse(k, raw) {
    raw = String(raw).trim();
    if (/^int/.test(k.type) || /^ms/.test(k.type)) {
      if (k.type.includes('null') && (raw === '' || raw === 'null')) return { val: null };
      if (!/^\d+$/.test(raw)) return { err: 'enter a whole number' };
      const n = +raw, m = k.type.match(/(\d+)\.\.(\d+)/);
      if (m && (n < +m[1] || n > +m[2])) return { err: `enter a whole number from ${m[1]} to ${m[2]}` };
      return { val: n };
    }
    if (/^number/.test(k.type)) { if (raw === '' || raw === 'null') return { val: null }; if (isNaN(+raw) || +raw < 0) return { err: 'enter a number of dollars, or null for no cap' }; return { val: +raw }; }
    if (k.type === 'bool') { if (raw !== 'true' && raw !== 'false') return { err: 'enter true or false' }; return { val: raw === 'true' }; }
    if (k.type.includes('|')) { const opts = k.type.split('|').map(s => s.trim()); if (!opts.includes(raw)) return { err: 'one of: ' + opts.join(', ') }; return { val: raw }; }
    return { val: raw };
  }

  // the command line grammar shared by `qagent`, ':' in the terminal and the dashboard palette.
  function command(S, line) {
    const m = line.trim().match(/^(\S+)\s*(\S+)?\s*(\S+)?(.*)$/);
    if (!m) return { ok: false, err: 'type a command, for example: accept 7 --why tests pass' };
    let [, w, a1, a2, rest] = m; let why = ((line.match(/--why\s+(.*)$/) || [])[1] || '').trim();
    if (a2 === '--why') a2 = undefined; if (a1 === '--why') a1 = undefined;
    const num = s => (s || '').replace('#', '');
    const lens = ['now', 'tree', 'board', 'graph', 'timeline', 'agents', 'memory', 'config'];
    if (lens.includes(w) && !a1) return { ok: true, lens: w };
    if (w === 'task' && ['accept', 'revise', 'requeue', 'cancel'].includes(a1)) { w = a1; a1 = a2; }
    if (['accept', 'revise', 'requeue', 'cancel'].includes(w)) return verb(S, w, +num(a1), why);
    if (w === 'assign') return verb(S, 'assign', +num(a1), a2);
    if (w === 'answer') return verb(S, 'answer', a1, why);
    if (w === 'pause' || w === 'resume') { if ((w === 'pause') === !!S.run.paused) return { ok: true }; return verb(S, 'pause'); }
    if (w === 'memory' && (a1 === 'approve' || a1 === 'retire')) return verb(S, a1, a2, why);
    if (w === 'config' && a1 === 'apply') return verb(S, 'apply', null, why);
    if (w === 'config' && a1 === 'rollback') return verb(S, 'rollback', +num(a2).replace('v', ''), why);
    if (w === 'goto') return { ok: true, goto: +num(a1) };
    if (w === 'agent' && a1 === 'add') { const opt = f => ((line.match(new RegExp('--' + f + '\\s+(\\S+)')) || [])[1]);
      const h = opt('harness') || 'claude'; const fam = { claude: 'claude', codex: 'gpt', gemini: 'gemini', hermes: 'hermes', opencode: 'glm' }[h] || h;
      return verb(S, 'add-agent', { id: a2, role: opt('role') || 'cheap-worker', harness: h, model: opt('model') || 'default', family: fam }); }
    if (w === 'config' && a1 === 'set') { const v = (line.match(/config\s+set\s+\S+\s+(\S+)/) || [])[1]; return verb(S, 'stage', { k: a2, v }); }
    return { ok: false, err: 'unknown command. try: accept 7 --why … / pause / memory approve m-36 --why … / agent add cheap-1 --role cheap-worker --harness claude / config set constraints.maxRetries 3 / goto 3' };
  }

  root.AOS_MODEL = { frame, verb, command, clone, STUCK_MIN };
  if (typeof module !== 'undefined') module.exports = root.AOS_MODEL;
})(typeof window !== 'undefined' ? window : globalThis);
