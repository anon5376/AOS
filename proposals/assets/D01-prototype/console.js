/* aos console / the terminal surface (`acs`), drawn into a cell grid. the same frame and
   verbs as the dashboard; only the layout differs. D02 is the spec for every rule used here. */
(function (root) {
  'use strict';
  const TUI = root.AOS_TUI || require('./tui.js');
  const M = root.AOS_MODEL || require('./model.js');
  const { Screen, big, bigWidth, pad, rpad, cut } = TUI;

  const LENSES = [
    ['now', '■', 'operate'], ['tree', '▤', 'operate'], ['board', '◇', 'operate'], ['graph', '§', 'operate'], ['timeline', '▍', 'operate'],
    ['agents', '@', 'system'], ['memory', '¶', 'system'], ['config', '$', 'system']];
  const TITLE = { now: 'what needs you', tree: 'how the goal breaks down', board: 'where each task is', graph: 'what blocks what',
    timeline: 'what happened', agents: 'who is working', memory: 'what the run knows', config: 'how the system runs' };
  const TONE = { open: 'i2', claimed: 'i1', submitted: 'st', changes_requested: 'ht', accepted: 'sg', failed: 'dg', cancelled: 'i3', blocked: 'ht' };
  const word = st => st.replace(/_/g, ' ');
  const usd = n => n == null ? '—' : '$' + n.toFixed(2);
  const ktok = n => n >= 1e6 ? (n / 1e6).toFixed(2) + 'M' : Math.round(n / 1e3) + 'k';
  const p2 = n => String(n).padStart(2, '0');

  // ---------- selectable items per lens ----------
  function items(S, F, lens) {
    if (lens === 'now') return F.needs.concat(F.stuck).map(x => ({ key: x.kind + ':' + x.ref, x }));
    if (lens === 'tree') return treeRows(S).map(r => ({ key: 'task:' + r.t.id, t: r.t, path: r.path, depth: r.depth }));
    if (lens === 'board' || lens === 'graph') return S.tasks.map(t => ({ key: 'task:' + t.id, t }));
    if (lens === 'timeline') return S.log.slice().reverse().map(e => ({ key: 'ev:' + e.seq, e }));
    if (lens === 'agents') return agentRows(S).map(r => ({ key: 'agent:' + r.a.id, a: r.a, branch: r.branch }));
    if (lens === 'memory') return ['project', 'thread', 'agent'].flatMap(sc => S.memory.entries.filter(m => m.scope === sc)).map(m => ({ key: 'mem:' + m.id, m }));
    if (lens === 'config') return S.config.keys.map(k => ({ key: 'cfg:' + k.k, k }));
    return [];
  }
  function treeRows(S) {
    const out = [];
    const walk = (p, path, d) => S.tasks.filter(t => t.p === p).forEach(t => { out.push({ t, path: path + '/' + t.id, depth: d }); walk(t.id, path + '/' + t.id, d + 1); });
    walk(null, '', 0); return out;
  }
  function agentRows(S) {
    const out = [];
    const walk = (p, pre) => { const kids = S.agents.filter(a => a.parent === p); kids.forEach((a, i) => { out.push({ a, branch: p === null ? '' : pre + (i === kids.length - 1 ? '└ ' : '├ ') }); walk(a.id, p === null ? '' : pre + (i === kids.length - 1 ? '  ' : '│ ')); }); };
    walk(null, ''); return out;
  }
  function selected(S, ui) { const it = items(S, M.frame(S), ui.lens); const i = Math.max(0, Math.min(it.length - 1, ui.sel[ui.lens] || 0)); return it[i]; }

  // ---------- primary action: the one lime fill per screen ----------
  function primary(S, F, it) {
    if (!it) return null;
    if (it.x) { const x = it.x;
      if (x.kind === 'review') return ['a', 'accept', 'accept', x.task];
      if (x.kind === 'question') return ['y', 'answer', 'answer', x.ref];
      if (x.kind === 'memory') return ['A', 'approve', 'approve', x.mem];
      if (x.kind === 'unrouted') return ['g', 'assign to impl-a', 'assign', x.task];
      if (x.kind === 'stuck') return ['u', 'requeue', 'requeue', x.task]; }
    if (it.t) { const t = it.t;
      if (t.st === 'submitted' && t.rev === 'operator') return ['a', 'accept', 'accept', t.id];
      if (t.st === 'claimed' && t.idle >= M.STUCK_MIN) return ['u', 'requeue', 'requeue', t.id];
      if (t.unrouted) return ['g', 'assign to impl-a', 'assign', t.id]; }
    if (it.m && it.m.st === 'proposed') return ['A', 'approve', 'approve', it.m.id];
    if (it.k && S.staged && Object.keys(S.staged).length) return ['A', 'apply v' + (S.config.version + 1), 'apply', null];
    return null;
  }

  // ---------- frame ----------
  function draw(S, ui, W, H) {
    const s = new Screen(W, H), F = M.frame(S);
    if (W < 80 || H < 24) {
      s.put(2, 1, '[ !  ]', 'ht'); s.put(9, 1, `needs 80x24, this is ${W}x${H}`, 'ht');
      s.put(9, 2, 'nothing is hidden: resize, or run qagent status', 'i3');
      return s;
    }
    const wide = W >= 100, aside = W >= 140;
    const it = selected(S, ui), prim = primary(S, F, it);
    // header: wordmark, path, live state
    let x = s.put(1, 0, 'aos', 'i1', { b: 1 }); x = s.put(x, 0, '.', 'sg', { b: 1 });
    x = s.put(x, 0, ` / ${S.run.id} / `, 'i3'); s.put(x, 0, ui.lens + (ui.card ? ' / ' + cardTitle(it) : ''), 'i1');
    const live = S.run.paused ? ['[ !  ]', 'ht', `paused #${F.seq}  p resumes`] : ['[ ok ]', 'sg', `live #${F.seq}  14:02`];
    const rw = live[0].length + 1 + live[2].length;
    s.put(W - 1 - rw, 0, live[0], live[1]); s.put(W - rw + live[0].length, 0, live[2], S.run.paused ? 'ht' : 'i2');

    let top, left, right = aside ? W - 41 : W - 1;
    if (wide) {
      s.hline(0, 1, W);
      rail(s, S, F, ui, 2, H - 4);
      s.vline(25, 1, H - 4); s.put(25, 1, '┬', 'ln'); s.put(25, H - 3, '┴', 'ln');
      top = 2; left = 27;
    } else {
      // rail collapsed to one row; three answers as one line
      let tx = 1;
      LENSES.forEach((l, i) => { const cur = ui.lens === l[0]; tx = s.put(tx, 1, String(i + 1), cur ? 'sg' : 'i3'); tx = s.put(tx + 1, 1, l[0], cur ? 'sg' : 'i2', { b: cur }) + 2; });
      s.hline(0, 2, W);
      let ax = 1;
      ax = s.put(ax, 3, 'needs you ', 'i3'); ax = s.put(ax, 3, p2(F.needs.length), 'i1', { b: 1 }) + 3;
      ax = s.put(ax, 3, 'stuck ', 'i3'); ax = s.put(ax, 3, p2(F.stuck.length), F.stuck.length ? 'ht' : 'i1', { b: 1 }) + 3;
      ax = s.put(ax, 3, 'spent ', 'i3'); ax = s.put(ax, 3, usd(F.spent), 'i1', { b: 1 }); ax = s.put(ax, 3, ` of $${S.run.budgetUsd}`, 'i3') + 3;
      ax = s.put(ax, 3, 'cost unknown ', 'i3'); s.put(ax, 3, `${F.unknown.length} agents`, 'i1');
      s.hline(0, 4, W);
      top = 5; left = 1;
    }
    const bottom = H - 4; // last content row
    if (aside) { s.vline(W - 40, 1, H - 4); s.put(W - 40, 1, '┬', 'ln'); s.put(W - 40, H - 3, '┴', 'ln'); }
    const mainW = right - left;
    if (ui.card && !aside) card(s, S, F, ui, it, prim, left, top, mainW, bottom);
    else lensBody(s, S, F, ui, left, top, mainW, bottom, wide);
    if (aside) card(s, S, F, ui, it, prim, W - 38, 2, 37, bottom);

    // status line and keys
    s.hline(0, H - 3, W); if (wide) s.put(25, H - 3, '┴', 'ln'); if (aside) s.put(W - 40, H - 3, '┴', 'ln');
    if (ui.mode === 'why' || ui.mode === 'cmd') {
      const lab = ui.mode === 'cmd' ? ':' : ui.pending[0] === 'e' ? `${ui.pending[1]} ▸` : `why (${ui.pending[1]}) ▸`;
      let px = s.put(1, H - 2, lab, 'i1', { b: 1 }) + 1; px = s.put(px, H - 2, ui.buf, 'i1'); s.put(px, H - 2, '▍', 'sg');
    } else {
      const m = ui.msg || { st: 'idle', text: hint(S, F, ui, it, prim) };
      const code = { idle: '[ -- ]', ok: '[ ok ]', warn: '[ !  ]', error: '[ !! ]', busy: '[ .. ]' }[m.st];
      const role = { idle: 'i3', ok: 'sg', warn: 'ht', error: 'dg', busy: 'i1' }[m.st];
      s.put(1, H - 2, code, role); s.put(8, H - 2, m.text, m.st === 'idle' ? 'i2' : role, { max: W - 9 });
    }
    keys(s, S, ui, prim, H - 1, W);
    return s;
  }

  function cardTitle(it) { if (!it) return ''; if (it.x) return it.x.ref; if (it.t) return '#' + it.t.id; if (it.a) return it.a.id; if (it.m) return it.m.id; if (it.k) return it.k.k.split('.').pop(); if (it.e) return '#' + it.e.seq; return ''; }

  function rail(s, S, F, ui, y0, y1) {
    let y = y0;
    s.put(1, y, ` run ${S.run.id} `, 'rv', { b: 1 }); y += 2;
    let grp = null;
    LENSES.forEach((l, i) => {
      if (l[2] !== grp) { if (grp) y++; grp = l[2]; s.put(1, y, ` ${grp} `, 'rv'); y++; }
      const cur = ui.lens === l[0];
      if (cur) s.put(0, y, '▍', 'sg');
      s.put(2, y, l[1], cur ? 'sg' : 'i3'); s.put(4, y, l[0], cur ? 'sg' : 'i2', { b: cur });
      s.put(5 + l[0].length, y, '·'.repeat(18 - l[0].length - 3), 'l2'); s.put(20, y, `[${i + 1}]`, cur ? 'sg' : 'i3');
      y++;
    });
    // the three answers stay in view on every lens
    y = Math.max(y + 1, y1 - 5);
    const row = (lab, val, role) => { s.put(2, y, lab, 'i3'); s.put(3 + lab.length, y, '·'.repeat(Math.max(1, 20 - lab.length - val.length)), 'l2'); s.put(23 - val.length, y, val, role || 'i1', { b: 1 }); y++; };
    row('needs you', p2(F.needs.length)); row('stuck', p2(F.stuck.length), F.stuck.length ? 'ht' : 'i1');
    row('spent', usd(F.spent)); row('of budget', '$' + S.run.budgetUsd.toFixed(0)); row('usd unknown', String(F.unknown.length));
  }

  // ---------- lens bodies ----------
  function heading(s, x, y, w, lens, sub) {
    let nx = s.put(x, y, TITLE[lens], 'i1', { b: 1 }); nx = s.put(nx, y, '.', 'sg', { b: 1 });
    if (sub) s.put(x + w - sub.length, y, sub, 'i3');
  }
  function eyebrow(s, x, y, n, label, loud, right, w) {
    s.put(x, y, '■', loud ? 'sg' : 'i3'); s.put(x + 2, y, `${p2(n)} / ${label}`, 'i2', { b: 1 });
    if (right) s.put(x + w - right.length, y, right, 'i3');
  }
  // readout: label over compressed display digits, hairline between columns (from 100 columns)
  function readout(s, x, y, w, cells) {
    const cw = Math.floor(w / cells.length);
    cells.forEach((c, i) => {
      const cx = x + i * cw;
      if (i) s.vline(cx - 2, y, 5);
      s.put(cx, y, c[0], 'i3');
      big(s, cx, y + 1, c[1], c[3] || 'i1');
      if (c[2]) s.put(cx, y + 4, c[2], c[4] || 'i3', { max: cw - 3 });
    });
    s.hline(x, y + 5, w);
    return y + 6;
  }
  function sel(s, ui, x, y, w, on) { if (on) { s.bg(x - 1, y, w + 1, 'se'); s.put(x - 1, y, '▍', 'i1'); } }

  function lensBody(s, S, F, ui, x, y, w, yb, wide) {
    const it = items(S, F, ui.lens), cur = Math.max(0, Math.min(it.length - 1, ui.sel[ui.lens] || 0));
    const isSel = i => i === cur;
    if (wide) { heading(s, x, y, w, ui.lens, sub(S, F, ui.lens)); y += 2; }
    const L = ui.lens;
    if (L === 'now') {
      if (wide) y = readout(s, x, y, w, [['needs you', p2(F.needs.length), `${F.needs.filter(n => n.kind === 'question').length} questions`],
        ['stuck', p2(F.stuck.length), `over ${M.STUCK_MIN} min`, F.stuck.length ? 'ht' : 'i1'],
        ['spent usd', F.spent.toFixed(2), `of ${S.run.budgetUsd.toFixed(2)}`], ['cost unknown', String(F.unknown.length), F.unknown.map(a => a.id).join(', ')]]) + 1;
      eyebrow(s, x, y, 1, 'needs you', true, null, w); y++;
      let i = 0;
      F.needs.forEach(n => { if (y > yb) return; nowRow(s, x, y, w, n, isSel(i), wide); sel(s, ui, x, y, w, isSel(i)); y++;
        if (wide && y <= yb) { s.put(x + 6, y, cut(n.why, w - 6), 'i3'); y++; } i++; });
      y++; if (y > yb) return;
      eyebrow(s, x, y, 2, 'stuck', false, null, w); y++;
      F.stuck.forEach(n => { if (y > yb) return; nowRow(s, x, y, w, n, isSel(i), wide); sel(s, ui, x, y, w, isSel(i)); y++;
        if (wide && y <= yb) { s.put(x + 6, y, cut(n.why + '. u requeues, g reassigns', w - 6), 'i3'); y++; } i++; });
      y++; if (y > yb) return;
      eyebrow(s, x, y, 3, 'agents', false, null, w); y++;
      let ax = x;
      S.agents.forEach(a => { const seg = `${a.id} ${a.status === 'offline' ? '○' : '●'} ${a.task ? '#' + a.task : a.status}`;
        if (ax + seg.length > x + w) { y++; ax = x; } if (y > yb) return;
        ax = s.put(ax, y, a.id, 'i1'); ax = s.put(ax + 1, y, a.status === 'offline' ? '○' : '●', a.status === 'offline' ? 'i3' : 'i1');
        ax = s.put(ax + 1, y, a.task ? '#' + a.task : a.status, 'i3') + 3; });
      return;
    }
    if (L === 'tree') {
      eyebrow(s, x, y, 1, `${S.tasks.length} tasks / goal: ${S.run.goal}`, true, null, w); y++;
      it.forEach((r, i) => { if (y > yb) return; const t = r.t;
        s.put(x + 1, y, pad(r.path, 6), 'i3'); s.put(x + 8 + r.depth * 2, y, cut(t.t, w - 40 - r.depth * 2), 'i1');
        stateWord(s, x + w - 30, y, t); s.put(x + w - 12, y, pad(t.a || '—', 7), 'i2'); s.put(x + w - 4, y, rpad('#' + t.seq, 4), 'i3');
        sel(s, ui, x, y, w, isSel(i)); y++; });
      if (y + 1 <= yb) s.put(x + 1, y + 1, 'paths are routes: /1/3 is task 3 under task 1', 'i3');
      return;
    }
    if (L === 'board') {
      const cols = ['open', 'claimed', 'submitted', 'changes_requested', 'accepted'];
      const cw = Math.floor((w + 1) / cols.length);
      s.hline(x, y, cw * cols.length - 1);
      cols.forEach((c, i) => { const cx = x + i * cw; const ts = S.tasks.filter(t => t.st === c);
        if (i) { s.vline(cx - 1, y + 1, yb - y); s.put(cx - 1, y, '┬', 'ln'); }
        s.put(cx + 1, y + 1, `${p2(i + 1)} ${c === 'changes_requested' ? 'changes' : c}`, 'i2', { b: 1 }); s.put(cx + cw - 4, y + 1, rpad(ts.length, 2), 'i3');
        s.hline(cx, y + 2, cw - 1); if (i) s.put(cx - 1, y + 2, '┼', 'ln');
        let yy = y + 3;
        ts.forEach(t => { if (yy + 1 > yb) return; const k = it.findIndex(r => r.t.id === t.id);
          const stk = t.idle >= M.STUCK_MIN && t.st === 'claimed', rows = stk ? 3 : 2;
          s.put(cx + 1, yy, '#' + t.id, 'i3'); s.put(cx + 5, yy, cut(t.a || 'unassigned', cw - 7), 'i3');
          s.put(cx + 1, yy + 1, cut(t.t, cw - 3), 'i1');
          if (stk) s.put(cx + 1, yy + 2, `stuck ${t.idle} min`, 'ht');
          if (isSel(k)) for (let r = 0; r < rows; r++) { s.bg(cx, yy + r, cw - 1, 'se'); s.put(cx, yy + r, '▍', 'i1'); }
          yy += rows + 1; }); });
      return;
    }
    if (L === 'graph') { graph(s, S, ui, it, cur, x, y, w, yb); return; }
    if (L === 'timeline') {
      const h = yb - y + 1;
      s.ticks(x, y, w, h);
      s.put(x + 3, y, ' events.log ', 'i1'); s.put(x + 15, y, `/ ${S.run.id} `, 'i3');
      const r = ` newest first / head #${F.seq} `; s.put(x + w - 3 - r.length, y, r, 'i3');
      let yy = y + 1, i = 0;
      const start = Math.max(0, cur - (h - 4));
      it.slice(start).forEach((row, j) => { if (yy > yb - 2) return; const e = row.e; const k = start + j;
        const kr = /changes|cancel|released|failed/.test(e.kind) ? (/failed/.test(e.kind) ? 'dg' : 'ht') : 'i1';
        s.put(x + 2, yy, rpad('#' + e.seq, 4), 'i3'); s.put(x + 8, yy, pad(e.actor, 9), 'i2');
        s.put(x + 18, yy, pad(e.kind + (e.proposed ? '*' : ''), 23), kr); s.put(x + 42, yy, pad(e.ref, 6), 'i3');
        s.put(x + 49, yy, cut(e.text, w - 52), 'i2'); sel(s, ui, x + 1, yy, w - 2, isSel(k)); yy++; i++; });
      s.put(x + 2, yb - 1, '▍', 'sg'); s.put(x + 4, yb - 1, '* event kind proposed by D01, not in acs yet', 'i3');
      return;
    }
    if (L === 'agents') {
      if (wide) y = readout(s, x, y, w, [['working', p2(F.agents.working), 'claimed a turn'], ['waiting', p2(F.agents.waiting), 'blocked on mail'],
        ['offline', p2(F.agents.offline), 'no call in 15 min', F.agents.offline ? 'ht' : 'i1'], ['tokens, millions', (F.tok / 1e6).toFixed(2), `${F.unknown.length} agents report no usd`]]) + 1;
      eyebrow(s, x, y, 1, `hierarchy / preset ${S.run.preset} v${S.run.presetVersion}`, true, null, w); y++;
      const cols = wide ? [0, 16, 32, 56, 68, 74, 81] : [0, 13, 0, 29, 41, 48, 55];
      s.put(x + 1 + cols[0], y, 'agent', 'i3'); s.put(x + 1 + cols[1], y, 'role', 'i3'); if (wide) s.put(x + 1 + cols[2], y, 'harness / model', 'i3');
      s.put(x + 1 + cols[3], y, 'state', 'i3'); s.put(x + 1 + cols[4], y, 'task', 'i3'); s.put(x + 1 + cols[5], y, 'tokens', 'i3'); s.put(x + 1 + cols[6], y, 'usd', 'i3'); y++;
      it.forEach((r, i) => { if (y > yb) return; const a = r.a;
        s.put(x + 1, y, r.branch, 'ln'); s.put(x + 1 + r.branch.length, y, a.id, 'i1', { b: !r.branch });
        s.put(x + 1 + cols[1], y, cut(a.role, 14), 'i2'); if (wide) s.put(x + 1 + cols[2], y, cut(`${a.harness} / ${a.model}`, 23), 'i2');
        const st = a.paused ? ['○ paused', 'ht'] : a.status === 'offline' ? ['○ offline', a.derived ? 'ht' : 'i3'] : ['● ' + a.status, 'i1'];
        s.put(x + 1 + cols[3], y, st[0], st[1]); s.put(x + 1 + cols[4], y, a.task ? '#' + a.task : '—', 'i3');
        s.put(x + 1 + cols[5], y, rpad(ktok(a.tok), 5), 'i2'); s.put(x + 1 + cols[6], y, rpad(usd(a.usd), 6), a.usd == null ? 'i3' : 'i2');
        sel(s, ui, x, y, w, isSel(i)); y++; });
      if (wide && y + 1 <= yb) { y++; s.put(x + 1, y, 'offline is derived: a stored state older than 15 min shows offline (bus.ts:291)', 'i3'); y++; }
      if (y + 1 <= yb) s.put(x + 1, y + (wide ? 0 : 1), 'p pauses the selected agent. add one with :agent add <id> --role <role> --harness <h>', 'i3', { max: w - 1 });
      return;
    }
    if (L === 'memory') {
      if (wide) y = readout(s, x, y, w, [['active', p2(F.memory.active), 'entries agents read'], ['proposed', p2(F.memory.proposed), 'waiting on you', F.memory.proposed ? 'i1' : 'i1'],
        ['retired', p2(F.memory.retired), 'kept, not read'], ['project chars', String(F.memory.used('project')), `of ${S.memory.budgets.project}`]]) + 1;
      let n = 0, i = 0;
      ['project', 'thread', 'agent'].forEach(sc => { if (y > yb) return;
        const used = F.memory.used(sc), cap = S.memory.budgets[sc];
        eyebrow(s, x, y, ++n, `${sc} memory`, n === 1, null, w);
        const mw = Math.min(24, w - 50); if (mw > 6) { const f = Math.round(mw * used / cap); s.put(x + w - mw - 15, y, '━'.repeat(f), 'i1'); s.put(x + w - mw - 15 + f, y, '─'.repeat(mw - f), 'ln'); s.put(x + w - 13, y, rpad(`${used}/${cap}`, 13), 'i3'); }
        y++;
        S.memory.entries.filter(m => m.scope === sc).forEach(m => { if (y > yb) return;
          const k = it.findIndex(r => r.m.id === m.id);
          s.put(x + 1, y, pad(m.id, 5), 'i3'); s.put(x + 7, y, pad(m.kind, 11), 'i2');
          s.put(x + 19, y, pad(m.st, 9), m.st === 'proposed' ? 'st' : m.st === 'retired' ? 'i3' : 'i2');
          s.put(x + 29, y, cut(m.body, w - 47), m.st === 'retired' ? 'i3' : 'i1');
          s.put(x + w - 17, y, rpad(`${cut(m.scope === 'project' ? m.author : m.key, 8)} #${m.seq}`, 17), 'i3');
          sel(s, ui, x, y, w, isSel(k)); y++; i++; });
        y++; });
      if (y <= yb) s.put(x + 1, y - 1, wide ? 'a brief for task-4 reads project + thread task-4 + its agent. never another thread.' : 'task-4 reads project + task-4 + its agent. never other threads.', 'i3', { max: w - 1 });
      return;
    }
    if (L === 'config') {
      if (wide) y = readout(s, x, y, w, [['version', 'v' === 'v' ? String(S.config.version) : '', `#${S.config.history[0].seq} last change`], ['staged', p2(F.config.staged), F.config.staged ? 'A applies' : 'nothing pending'],
        ['live keys', p2(F.config.live), 'read at runtime'], ['no reader', p2(F.config.dead), 'set, nothing reads it', F.config.dead ? 'ht' : 'i1']]) + 1;
      eyebrow(s, x, y, 1, `${S.config.file} / layers: default › preset › file › env › run`, true, null, w); y++;
      const kw = wide ? 38 : 30;
      it.forEach((r, i) => { if (y > yb) return; const k = r.k; const staged = S.staged && k.k in S.staged;
        s.put(x + 1, y, cut(wide ? k.k : k.k.replace(/^constraints\./, ''), kw), 'i1');
        s.put(x + 2 + kw, y, pad(cut(staged ? String(S.staged[k.k]) : String(k.v), 11), 11), staged ? 'st' : 'i1', { b: staged });
        s.put(x + 14 + kw, y, pad(k.layer, 8), k.layer === 'run' ? 'i1' : 'i3');
        const use = k.use === 'dead' ? ['no reader', 'ht'] : k.use === 'live' ? ['read', 'i2'] : ['proposed', 'i3'];
        s.put(x + 23 + kw, y, pad(use[0], 10), use[1]);
        if (wide) s.put(x + 34 + kw, y, cut(k.locked ? 'locked / ' + k.at : k.at, w - 35 - kw), 'i3');
        sel(s, ui, x, y, w, isSel(i)); y++; });
      if (y + 1 <= yb) s.put(x + 1, y + 1, 'e edits a key into staged. A applies all staged keys as one version.', 'i3');
      return;
    }
  }
  function sub(S, F, L) {
    return { now: `${F.needs.length + F.stuck.length} items`, tree: `${S.tasks.length} tasks`, board: 'no dragging. moving is an action', graph: 'left finishes before right',
      timeline: `${S.log.length} events`, agents: `${S.agents.length} agents`, memory: 'p11, proposed', config: `v${S.config.version}` }[L];
  }
  function stateWord(s, x, y, t) {
    if (t.st === 'claimed' && t.idle >= M.STUCK_MIN) { s.put(x, y, `stuck ${t.idle} min`, 'ht'); return; }
    s.put(x, y, (t.st === 'submitted' && t.rev === 'operator' ? 'yours to review' : word(t.st)), TONE[t.st] || 'i2');
  }
  function nowRow(s, x, y, w, n, on, wide) {
    s.put(x + 1, y, pad(n.ref, 5), 'i3');
    s.put(x + 7, y, pad(n.kind === 'stuck' ? `${n.min} min` : n.kind, 9), n.kind === 'stuck' ? 'ht' : 'i2');
    s.put(x + 17, y, cut(n.title, w - 24), 'i1');
    s.put(x + w - 5, y, rpad('#' + n.seq, 5), 'i3');
  }

  // graph: layered by dependency depth, edges drawn as joined box arms
  function graph(s, S, ui, it, cur, x, y, w, yb) {
    const T = id => S.tasks.find(t => t.id === id);
    const depth = id => { const t = T(id); return t.dep.length ? 1 + Math.max(...t.dep.map(depth)) : 0; };
    const layers = {}; S.tasks.forEach(t => (layers[depth(t.id)] = layers[depth(t.id)] || []).push(t));
    const nl = Object.keys(layers).length, nw = Math.min(26, Math.floor((w - 4) / nl) - 6), gap = Math.floor((w - nl * nw) / Math.max(1, nl - 1));
    const pos = {};
    Object.keys(layers).forEach(l => layers[l].forEach((t, r) => pos[t.id] = { x: x + l * (nw + gap), y: y + 1 + r * 4 }));
    // arms layer
    const arms = {}; const add = (cx, cy, a) => { const k = cx + ',' + cy; arms[k] = (arms[k] || '') + a; };
    S.tasks.forEach(t => t.dep.forEach(d => { const a = pos[d], b = pos[t.id]; const x0 = a.x + nw, x1 = b.x - 1, ya = a.y + 1, yb2 = b.y + 1, mx = x0 + Math.floor((x1 - x0) / 2);
      for (let i = x0; i < mx; i++) add(i, ya, 'lr'); add(mx, ya, 'l');
      if (ya !== yb2) { for (let j = Math.min(ya, yb2); j <= Math.max(ya, yb2); j++) { if (j !== ya && j !== yb2) add(mx, j, 'ud'); } add(mx, ya, yb2 > ya ? 'd' : 'u'); add(mx, yb2, yb2 > ya ? 'u' : 'd'); }
      add(mx, yb2, 'r'); for (let i = mx + 1; i <= x1; i++) add(i, yb2, 'lr'); }));
    const CH = { lr: '─', ud: '│', rd: '┌', ld: '┐', ur: '└', ul: '┘', udr: '├', udl: '┤', lrd: '┬', lru: '┴', udlr: '┼', r: '╶', l: '╴', d: '╷', u: '╵' };
    Object.keys(arms).forEach(k => { const [cx, cy] = k.split(',').map(Number); const set = new Set(arms[k]); const key = ['u', 'd', 'l', 'r'].filter(c => set.has(c)).join('');
      const norm = { ud: 'ud', lr: 'lr', dr: 'rd', dl: 'ld', ur: 'ur', ul: 'ul', udr: 'udr', udl: 'udl', dlr: 'lrd', ulr: 'lru', udlr: 'udlr', r: 'r', l: 'l', d: 'd', u: 'u' }[key];
      if (cy <= yb) s.put(cx, cy, CH[norm] || '┼', 'l2'); });
    S.tasks.forEach(t => { const p = pos[t.id]; if (p.y + 2 > yb) return; const k = it.findIndex(r => r.t.id === t.id); const on = k === cur;
      const role = on ? 'i1' : 'ln';
      s.put(p.x, p.y, '┌' + '─'.repeat(nw - 2) + '┐', role); s.put(p.x, p.y + 1, '│', role); s.put(p.x + nw - 1, p.y + 1, '│', role); s.put(p.x, p.y + 2, '└' + '─'.repeat(nw - 2) + '┘', role);
      s.put(p.x + 2, p.y, ` #${t.id} `, on ? 'i1' : 'i3');
      const stuck = t.st === 'claimed' && t.idle >= M.STUCK_MIN;
      const sw = stuck ? 'stuck' : t.st === 'changes_requested' ? 'changes' : t.st;
      s.put(p.x + nw - 3 - sw.length, p.y, ' ' + sw + ' ', stuck ? 'ht' : TONE[t.st] || 'i2');
      s.put(p.x + 2, p.y + 1, cut(t.t, nw - 4), 'i1');
      if (on) s.bg(p.x + 1, p.y + 1, nw - 2, 'se'); });
    s.put(x, yb, 'fig. 01 / task dependencies / arrows read left to right', 'i3');
  }

  // ---------- card: the aside at 140+ columns, or the whole main pane below that ----------
  function card(s, S, F, ui, it, prim, x, y, w, yb) {
    if (!it) { s.put(x, y, 'nothing selected.', 'i3'); return; }
    const kv = (k, v, role) => { if (y > yb) return; s.put(x, y, pad(k, 10), 'i3'); const lines = wrap(String(v), w - 11); lines.forEach((l, i) => { if (y > yb) return; s.put(x + 11, y, l, role || 'i1'); if (i < lines.length - 1) y++; }); y++; };
    const para = (t, role) => wrap(t, w).forEach(l => { if (y <= yb) { s.put(x, y, l, role || 'i2'); y++; } });
    const eb = (t, loud) => { if (y > yb) return; s.put(x, y, '■', loud ? 'sg' : 'i3'); s.put(x + 2, y, t, 'i2', { b: 1 }); y++; };
    const title = t => { wrap(String(t).replace(/[.?]$/, ''), w - 1).forEach((l, i, a) => { if (y > yb) return; const nx = s.put(x, y, l, 'i1', { b: 1 }); if (i === a.length - 1) s.put(nx, y, '.', 'sg', { b: 1 }); y++; }); y++; };
    const events = (pred, n) => { eb('last events'); S.log.filter(pred).slice(-n).reverse().forEach(e => { if (y > yb) return; s.put(x, y, rpad('#' + e.seq, 4), 'i3'); s.put(x + 5, y, cut(e.kind + (e.proposed ? '*' : ''), 22), 'i2'); s.put(x + 28, y, cut(e.actor, w - 28), 'i3'); y++; }); };
    const task = it.t || (it.x && it.x.task && F.T(it.x.task));
    if (it.x && it.x.kind === 'memory') return memCard(S.memory.entries.find(m => m.id === it.x.mem));
    if (it.x && it.x.kind === 'question') {
      const q = S.questions.find(q => q.id === it.x.ref);
      eb(`question / ${q.id}`, true); title(q.t);
      kv('from', `${q.from} on #${q.task}`); kv('asked', `#${q.seq}`); y++;
      para('your answer is sent as a message to ' + q.from + ' and stored on the event.', 'i3'); y++;
      return actions();
    }
    if (it.m) return memCard(it.m);
    if (task) {
      eb(`task / #${task.id}`, true); title(task.t);
      kv('state', task.st === 'claimed' && task.idle >= M.STUCK_MIN ? `stuck ${task.idle} min` : word(task.st), task.idle >= M.STUCK_MIN && task.st === 'claimed' ? 'ht' : TONE[task.st]);
      kv('assignee', task.a ? `${task.a} / ${F.fam(task.a)}` : `none. role ${task.role}`);
      if (task.rev) { const same = F.fam(task.rev) === F.fam(task.a); kv('reviewer', task.rev === 'operator' ? 'you' : `${task.rev} / ${F.fam(task.rev)}`); if (task.rev !== 'operator') kv('', same ? '■ same family' : '■ different family', same ? 'ht' : 'i2'); }
      kv('depends', task.dep.length ? task.dep.map(d => '#' + d + ' ' + word(F.T(d).st)).join(', ') : 'nothing');
      if (task.res) kv('result', task.res);
      const q = S.questions.find(q => q.task === task.id && !q.answered); if (q) kv('question', `${q.id} unanswered`, 'ht');
      y++; events(e => e.ref === String(task.id), 3); y++;
      return actions();
    }
    if (it.a) { const a = it.a;
      eb(`agent / ${a.id}`, true); title(`${a.id}, ${a.role}`);
      kv('harness', `${a.harness} / ${a.model}`); kv('family', a.family); kv('parent', a.parent || 'none (top)');
      kv('state', a.paused ? 'paused by you' : a.status + (a.derived ? ` (stored ${a.stored}, last call ${a.seenMin} min ago)` : ''), a.derived ? 'ht' : 'i1');
      kv('authority', `${a.authority} / delegate ${a.perms.canDelegate ? 'yes' : 'no'} / review ${a.perms.canReview ? 'yes' : 'no'}`);
      kv('access', `fs ${a.perms.filesystem} / shell ${a.perms.shell ? 'yes' : 'no'} / net ${a.perms.network ? 'yes' : 'no'}`);
      kv('approval', a.approval + '  (p15, proposed)');
      kv('spend', `${a.turns} turns / ${ktok(a.tok)} tok / ${usd(a.usd)}${a.usd == null ? ' not reported' : ''}`);
      y++; events(e => e.actor === a.id, 3); y++;
      return actions();
    }
    if (it.k) { const k = it.k; const staged = S.staged && k.k in S.staged;
      eb(`config / v${S.config.version}`, true); title(k.k);
      kv('effective', String(k.v)); kv('type', k.type);
      kv('layers', k.chain.map(c => `${c[0]} ${c[1] === null ? 'null' : c[1]}`).join(' › '));
      kv('won by', k.layer); kv('reader', (k.use === 'dead' ? 'none. ' : '') + k.at, k.use === 'dead' ? 'ht' : 'i2');
      if (staged) kv('staged', String(S.staged[k.k]), 'st');
      if (k.locked) { y++; s.put(x, y, '[ -- ]', 'i3'); para('  ' + k.locked, 'i3'); }
      y++; eb('versions'); S.config.history.slice(0, 3).forEach(h => { if (y > yb) return; s.put(x, y, 'v' + h.v, 'i1'); s.put(x + 5, y, rpad('#' + h.seq, 4), 'i3'); s.put(x + 10, y, cut(h.why, w - 10), 'i2'); y++; });
      y++; return actions();
    }
    if (it.e) { const e = it.e; eb(`event / #${e.seq}`, true); title(e.kind.replace(/_/g, ' ')); kv('actor', e.actor); kv('entity', e.ref); kv('text', e.text); if (e.proposed) kv('', 'kind proposed by D01', 'i3'); return; }

    function memCard(m) {
      eb(`memory / ${m.id}`, true); title(m.body);
      kv('kind', m.kind); kv('state', m.st + (m.st === 'retired' ? ` at #${m.retiredSeq}, by ${m.by}` : ''), m.st === 'proposed' ? 'st' : 'i1');
      kv('scope', `${m.scope} / ${m.key}`); kv('author', `${m.author} at #${m.seq}${m.from ? ' from #' + m.from : ''}`);
      kv('read by', m.st === 'proposed' ? 'no brief yet' : `${m.uses} briefs`);
      y++; para(m.scope === 'project' ? 'project memory goes into every brief in ~/src/acs. it is framed as data, not instructions.' : m.scope === 'thread' ? `only briefs for ${m.key} read this. other threads never do.` : `only ${m.key} reads this.`, 'i3'); y++;
      return actions();
    }
    function actions() {
      if (y > yb) return;
      let ax = x;
      if (prim) { ax = s.put(x, y, ` ${prim[0]} ${prim[1]} → `, 'sf', { b: 1 }) + 2; }
      const rest = secondary(S, it).map(r => `${r[0]} ${r[1]}`).join(' / ');
      if (rest && ax + rest.length <= x + w) s.put(ax, y, rest, 'i2');
      else if (rest) { y++; para(rest, 'i2'); }
    }
  }
  function secondary(S, it) {
    const t = it.t || (it.x && it.x.task && S.tasks.find(q => q.id === it.x.task));
    if (it.x && it.x.kind === 'question') return [['t', 'open #' + it.x.task]];
    if (it.x && it.x.kind === 'memory' || it.m) { const m = it.m || S.memory.entries.find(q => q.id === it.x.mem); return m.st === 'retired' ? [['t', 'trace']] : [['X', 'retire'], ['e', 'edit as new version'], ['t', 'trace']]; }
    if (it.a) return [['p', it.a.paused ? 'resume agent' : 'pause agent'], ['t', 'trace']];
    if (it.k) return it.k.locked ? [['t', 'trace']] : [['e', 'edit'], ['R', 'rollback v' + (S.config.version)], ['t', 'trace']];
    if (t) { const r = []; if (t.st === 'submitted' && t.rev === 'operator') r.push(['r', 'request changes']); if (t.st === 'claimed') r.push(['g', 'reassign']); if (!['accepted', 'cancelled'].includes(t.st)) r.push(['x', 'cancel']); r.push(['t', 'trace']); return r; }
    return [];
  }
  function hint(S, F, ui, it, prim) {
    if (S.run.paused) return 'paused. new claims are refused; running turns finish. p resumes';
    if (prim) return `${prim[1]} needs a reason. press ${prim[0]}, type it, enter commits`;
    return 'every action is one event with your reason. : runs any qagent verb';
  }
  function keys(s, S, ui, prim, y, W) {
    let x = 1;
    const cardShown = ui.card || W >= 140;
    if (prim && ui.mode === 'nav') { x = s.put(x, y, ` ${prim[0]} ${prim[1]} `, cardShown ? 'i1' : 'sf', { b: 1 }) + 2; }
    const ks = ui.mode === 'nav' ? (ui.card ? 'esc back / j/k move / t trace / : command / ? keys' : 'j/k move / enter open / 1-8 lens / p pause / : command / ? keys')
      : 'enter commits / esc cancels';
    s.put(x, y, ks, 'i3', { max: W - x - 1 });
  }
  function wrap(t, w) { const out = []; let line = ''; String(t).split(' ').forEach(word => { if ((line + ' ' + word).trim().length > w) { if (line) out.push(line); line = word; } else line = (line + ' ' + word).trim(); }); if (line) out.push(line); return out.length ? out : ['']; }

  // ---------- keys: one handler shared by the prototype and the spec's scripted mockups ----------
  function key(S, ui, k, W) {
    ui.msg = null;
    const F = M.frame(S), it = items(S, F, ui.lens), prim = primary(S, F, it[Math.max(0, Math.min(it.length - 1, ui.sel[ui.lens] || 0))]);
    if (ui.mode === 'why' || ui.mode === 'cmd') {
      if (k === 'Escape') { ui.mode = 'nav'; ui.buf = ''; return; }
      if (k === 'Backspace') { ui.buf = ui.buf.slice(0, -1); return; }
      if (k === 'Enter') {
        const pv = ui.pending && ui.pending[2];
        const r = ui.mode === 'cmd' ? M.command(S, ui.buf) : pv === 'stage' ? M.verb(S, 'stage', { k: ui.pending[3], v: ui.buf })
          : pv === 'supersede' ? M.verb(S, 'supersede', { id: ui.pending[3], body: ui.buf }) : M.verb(S, pv, ui.pending[3], ui.buf);
        if (r.lens) { ui.lens = r.lens; ui.card = false; }
        if (r.goto) { ui.lens = 'tree'; ui.sel.tree = items(S, F, 'tree').findIndex(x => x.t.id === r.goto); ui.card = true; }
        ui.msg = r.ok ? { st: 'ok', text: r.seq ? `recorded as event #${r.seq}` : r.staged ? 'staged. A applies it as a new version' : 'done' } : { st: 'error', text: r.err };
        ui.mode = 'nav'; ui.buf = ''; return;
      }
      if (k.length === 1) ui.buf += k; return;
    }
    const n = it.length, i = ui.sel[ui.lens] || 0;
    if (k === 'j' || k === 'ArrowDown') ui.sel[ui.lens] = Math.min(n - 1, i + 1);
    else if (k === 'k' || k === 'ArrowUp') ui.sel[ui.lens] = Math.max(0, i - 1);
    else if (k === 'g' && !prim) ui.sel[ui.lens] = 0;
    else if (/^[1-8]$/.test(k)) { ui.lens = LENSES[+k - 1][0]; ui.card = false; }
    else if (k === 'Enter') ui.card = true;
    else if (k === 'Escape') ui.card = false;
    else if (k === ':') { ui.mode = 'cmd'; ui.buf = ''; }
    else if (k === 'p' && ui.lens !== 'agents') { const r = M.verb(S, 'pause'); ui.msg = { st: 'ok', text: `recorded as event #${r.seq}` }; }
    else if (prim && k === prim[0]) {
      if (prim[2] === 'requeue' || prim[2] === 'assign') { const r = M.verb(S, prim[2], prim[3]); ui.msg = r.ok ? { st: 'ok', text: `recorded as event #${r.seq}` } : { st: 'error', text: r.err }; }
      else { ui.mode = 'why'; ui.buf = ''; ui.pending = prim; }
    } else if (k === 'x' || k === 'X' || k === 'r' || (k === 'p' && ui.lens === 'agents')) {
      const sel = it[i]; const map = { x: ['x', 'cancel', 'cancel', sel && (sel.t ? sel.t.id : sel.x && sel.x.task)], r: ['r', 'request changes', 'revise', sel && (sel.t ? sel.t.id : sel.x && sel.x.task)],
        X: ['X', 'retire', 'retire', sel && (sel.m ? sel.m.id : sel.x && sel.x.mem)], p: ['p', 'pause agent', 'pause-agent', sel && sel.a && sel.a.id] }[k];
      if (map[3]) { ui.mode = 'why'; ui.buf = ''; ui.pending = map; }
    } else if (k === 'e' && it[i] && (it[i].k || it[i].m)) {
      const sel = it[i]; if (sel.k && sel.k.locked) { ui.msg = { st: 'warn', text: sel.k.locked }; return; }
      ui.mode = 'why'; ui.pending = sel.k ? ['e', 'new value', 'stage', sel.k.k] : ['e', 'new text', 'supersede', sel.m.id]; ui.buf = sel.k ? String(sel.k.k in (S.staged || {}) ? S.staged[sel.k.k] : sel.k.v) : sel.m.body;
    } else if (k === 'R' && ui.lens === 'config') { ui.mode = 'why'; ui.buf = ''; ui.pending = ['R', 'roll back v' + S.config.version, 'rollback', S.config.version];
    } else if (k === 't') { ui.lens = 'timeline'; ui.card = false;
    } else if (k === '?') ui.msg = { st: 'idle', text: 'j/k move / enter card / esc back / 1-8 lens / a r u g x verbs / p pause / : command' };
  }

  function newUI(lens) { return { lens: lens || 'now', sel: {}, card: false, mode: 'nav', buf: '', msg: null, pending: null }; }
  root.AOS_CONSOLE = { draw, key, newUI, LENSES, items };
  if (typeof module !== 'undefined') module.exports = root.AOS_CONSOLE;
})(typeof window !== 'undefined' ? window : globalThis);
