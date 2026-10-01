/* aos console / the dashboard surface on accelerate components, and the page wiring.
   both surfaces share one state object S: an action taken in one shows up in the other. */
(function () {
  'use strict';
  const M = window.AOS_MODEL, C = window.AOS_CONSOLE, FIX = window.AOS_FIXTURE;
  let S = M.clone(FIX);
  const D = { surface: 'dash', lens: 'now', sel: {}, kind: null, confirm: null, adding: false, brief: { task: 4, agent: 'impl-b' }, msg: null };
  let TU = C.newUI('now'); let size = [120, 36]; let tier = 'true';
  const $ = s => document.querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const p2 = n => String(n).padStart(2, '0');
  const usd = n => n == null ? '—' : '$' + n.toFixed(2);
  const ktok = n => n >= 1e6 ? (n / 1e6).toFixed(2) + 'M' : Math.round(n / 1e3) + 'k';
  const word = s => String(s).replace(/_/g, ' ');
  const LENS = C.LENSES;
  const TITLE = { now: 'what needs you', tree: 'how the goal breaks down', board: 'where each task is', graph: 'what blocks what', timeline: 'what happened', agents: 'who is working', memory: 'what the run knows', config: 'how the system runs' };
  const TONE = { submitted: 'info', changes_requested: 'warn', accepted: 'ok', failed: 'error' };
  const stuckT = t => t.st === 'claimed' && t.idle >= M.STUCK_MIN;
  const tag = (t) => stuckT(t) ? `<span class="ax-tag ax-tag--warn">stuck ${t.idle} min</span>`
    : `<span class="ax-tag ${TONE[t.st] ? 'ax-tag--' + TONE[t.st] : ''} ${t.st === 'claimed' ? 'ax-tag--live' : ''}">${t.st === 'submitted' && t.rev === 'operator' ? 'yours to review' : word(t.st)}</span>`;
  const atag = a => a.paused ? '<span class="ax-tag ax-tag--warn">paused</span>' : a.status === 'offline' ? `<span class="ax-tag ${a.derived ? 'ax-tag--warn' : ''}">offline</span>` : `<span class="ax-tag ${a.status === 'working' ? 'ax-tag--live' : ''}">${a.status}</span>`;

  // ---------- selection ----------
  function itemsFor(lens) {
    const F = M.frame(S);
    if (lens === 'now') return F.needs.concat(F.stuck).map(x => x.kind === 'memory' ? 'mem:' + x.mem : x.kind === 'question' ? 'q:' + x.ref : 'task:' + x.task);
    if (lens === 'agents') return S.agents.map(a => 'agent:' + a.id);
    if (lens === 'memory') return S.memory.entries.map(m => 'mem:' + m.id);
    if (lens === 'config') return S.config.keys.map(k => 'cfg:' + k.k);
    if (lens === 'timeline') return S.log.slice().reverse().map(e => 'ev:' + e.seq);
    return S.tasks.map(t => 'task:' + t.id);
  }
  function cur() { const it = itemsFor(D.lens); if (!it.includes(D.sel[D.lens])) D.sel[D.lens] = it[0]; return D.sel[D.lens]; }

  // ---------- rail ----------
  function rail() {
    const F = M.frame(S);
    let grp = null, html = `<div class="railhead"><a class="ax-wordmark" href="#now" data-lens="now">aos<span class="ax-dot">.</span></a><span class="ax-meta">#${F.seq}</span></div>`;
    html += `<div class="ax-rail__section"><span class="ax-rail__chip">run ${S.run.id}</span><span class="ax-meta">${esc(S.run.goal)}</span></div>`;
    LENS.forEach((l, i) => {
      if (l[2] !== grp) { if (grp) html += '</div>'; grp = l[2]; html += `<div class="ax-rail__section"><span class="ax-rail__chip">${grp}</span>`; }
      html += `<a href="#${l[0]}" data-lens="${l[0]}" ${D.lens === l[0] ? 'aria-current="page"' : ''}><span class="ax-rail__glyph">${l[1]}</span>${l[0]}<span class="ax-rail__leader"></span><span class="ax-rail__index">[${i + 1}]</span></a>`;
    });
    html += '</div>';
    html += `<div class="railfoot"><dl class="answers ax-mono">
      <div><dt>needs you</dt><span class="lead"></span><dd>${p2(F.needs.length)}</dd></div>
      <div><dt>stuck</dt><span class="lead"></span><dd class="${F.stuck.length ? 'warn' : ''}">${p2(F.stuck.length)}</dd></div>
      <div><dt>spent</dt><span class="lead"></span><dd>${usd(F.spent)} of $${S.run.budgetUsd}</dd></div>
      <div><dt>cost unknown</dt><span class="lead"></span><dd>${F.unknown.length} agents</dd></div></dl>
      <p class="ax-status" data-state="${S.run.paused ? 'warn' : 'ok'}" role="status">${S.run.paused ? 'paused. new claims are refused' : 'run is live'}</p>
      <button class="ax-btn ax-btn--sm" data-act="pause" type="button">${S.run.paused ? 'resume run' : 'pause run'}</button></div>`;
    $('#rail').innerHTML = html;
  }

  // ---------- main ----------
  const command = () => `<button class="ax-command" type="button" data-act="palette"><span class="ax-command__glyph">/</span><span class="ax-command__path">aos : ${S.run.id} : <b>${D.lens}</b></span><span class="ax-command__keys"><span>command</span><kbd class="ax-kbd">:</kbd></span></button>`;
  const readout = cells => `<dl class="ax-readout">${cells.map(c => `<div><dt>${c[0]}</dt><dd>${c[1]}${c[2] ? `<span class="ax-delta ${c[3] || ''}">${c[2]}</span>` : ''}</dd></div>`).join('')}</dl>`;
  const head = (cells) => `${command()}<h1 class="ax-display lens">${TITLE[D.lens]}<span class="ax-dot">.</span></h1>${cells ? readout(cells) : ''}`;
  const sec = (n, label, loud, right, body) => `<section><div class="sechead"><p class="ax-eyebrow ${loud ? '' : 'ax-eyebrow--quiet'}">${p2(n)} / ${label}</p>${right ? `<span class="ax-meta">${right}</span>` : ''}</div>${body}</section>`;
  const selAttr = key => `data-sel="${esc(key)}" role="button" tabindex="0" aria-selected="${cur() === key}"`;

  function now() {
    const F = M.frame(S);
    const needs = F.needs.map(n => { const key = n.kind === 'memory' ? 'mem:' + n.mem : n.kind === 'question' ? 'q:' + n.ref : 'task:' + n.task;
      return `<div class="row" ${selAttr(key)}><span class="ax-meta num">${esc(n.ref)}</span><span class="ax-tag">${n.kind}</span><span class="t">${esc(n.title)}</span><span class="end"><span class="ax-meta">#${n.seq}</span></span><span class="why">${esc(n.why)}</span></div>`; }).join('');
    const stuck = F.stuck.map(n => `<div class="row" ${selAttr('task:' + n.task)}><span class="ax-meta num">${n.ref}</span><span class="ax-tag ax-tag--warn">${n.min} min</span><span class="t">${esc(n.title)}</span><span class="end"><span class="ax-meta">#${n.seq}</span></span><span class="why">${esc(n.why)}. requeue, reassign or wait</span></div>`).join('');
    const swarm = `<div class="lattice">${S.agents.map(a => `<div class="cell" ${selAttr('agent:' + a.id)}><span class="mono">${a.id}</span>${atag(a)}<span class="ax-meta">${a.task ? 'on #' + a.task : 'no task'} / ${ktok(a.tok)} / ${usd(a.usd)}</span></div>`).join('')}</div>`;
    return head([['needs you', p2(F.needs.length), `${F.needs.filter(n => n.kind === 'question').length} are questions`], ['stuck', p2(F.stuck.length), `no event for ${M.STUCK_MIN}+ min`, F.stuck.length ? 'ax-delta--bad' : ''],
      ['spent usd', F.spent.toFixed(2), `of ${S.run.budgetUsd.toFixed(2)} for ${S.run.id}`], ['cost unknown', p2(F.unknown.length), F.unknown.map(a => a.id).join(', ') + ' report no usd']]) +
      sec(1, 'needs you', true, 'reviews, then questions, memory, routing', needs || '<p class="empty">nothing is waiting on you. the next thing that will: a submission or a question.</p>') +
      sec(2, 'stuck', false, null, stuck || '<p class="empty">nothing is stuck.</p>') +
      sec(3, 'agents', false, '— means the harness reports no usd. it is not zero', swarm);
  }
  function tree() {
    const out = [];
    const walk = (p, path, d) => S.tasks.filter(t => t.p === p).forEach(t => { const pa = path + '/' + t.id;
      out.push(`<div class="row row--tree" ${selAttr('task:' + t.id)}><span class="ax-meta num">${pa}</span><span class="t" style="padding-left:${d * 1.25}em">${esc(t.t)}</span><span>${tag(t)}</span><span class="ax-meta">${t.a || '—'}</span><span class="ax-meta">#${t.seq}</span></div>`); walk(t.id, pa, d + 1); });
    walk(null, '', 0);
    return head(null) + sec(1, `${S.tasks.length} tasks / goal: ${esc(S.run.goal)}`, true, 'paths are routes: /1/3 is task 3 under task 1', out.join(''));
  }
  function board() {
    const cols = ['open', 'claimed', 'submitted', 'changes_requested', 'accepted'];
    return head(null) + `<div class="lattice board">${cols.map((c, i) => { const ts = S.tasks.filter(t => t.st === c);
      return `<div class="bcol"><div class="bhead"><span class="mono">${c === 'changes_requested' ? 'changes' : c}</span><span class="ax-meta num">${p2(ts.length)}</span></div>${ts.map(t => `<div class="bcard" ${selAttr('task:' + t.id)}><span class="ax-meta">#${t.id} / ${t.a || 'unassigned'}</span><span>${esc(t.t)}</span>${stuckT(t) ? `<span class="ax-tag ax-tag--warn">stuck ${t.idle} min</span>` : ''}</div>`).join('') || '<p class="ax-meta">—</p>'}</div>`; }).join('')}</div>
      <p class="note">no dragging. a task moves when someone takes an action with a reason; select one and use the inspector.</p>`;
  }
  function graph() {
    const T = id => S.tasks.find(t => t.id === id);
    const dep = id => { const t = T(id); return t.dep.length ? 1 + Math.max(...t.dep.map(dep)) : 0; };
    const L = {}; S.tasks.forEach(t => (L[dep(t.id)] = L[dep(t.id)] || []).push(t));
    const W = 210, H = 50, gx = 70, gy = 18, pos = {};
    Object.keys(L).forEach(c => L[c].forEach((t, r) => pos[t.id] = { x: 10 + c * (W + gx), y: 10 + r * (H + gy) }));
    let svg = '';
    S.tasks.forEach(t => t.dep.forEach(d => { const a = pos[d], b = pos[t.id], mx = a.x + W + gx / 2;
      svg += `<path d="M${a.x + W} ${a.y + H / 2} H${mx} V${b.y + H / 2} H${b.x}" fill="none" stroke="var(--line-200)" stroke-width="1"/>`; }));
    S.tasks.forEach(t => { const p = pos[t.id], on = cur() === 'task:' + t.id, st = stuckT(t) ? 'stuck ' + t.idle + ' min' : word(t.st);
      svg += `<g data-sel="task:${t.id}" tabindex="0" role="button" aria-label="task ${t.id}, ${esc(t.t)}, ${st}" style="cursor:pointer"><rect x="${p.x}" y="${p.y}" width="${W}" height="${H}" fill="var(--bg-100)" stroke="${on ? 'var(--signal-edge)' : 'var(--line-200)'}" stroke-width="${on ? 2 : 1}"/>
        <text x="${p.x + 10}" y="${p.y + 20}" fill="var(--ink-100)" font-size="12">#${t.id} ${esc(t.t.length > 23 ? t.t.slice(0, 22) + '…' : t.t)}</text>
        <text x="${p.x + 10}" y="${p.y + 38}" fill="${stuckT(t) ? 'var(--heat)' : 'var(--ink-300)'}" font-size="11">${st} / ${t.a || 'unassigned'}</text></g>`; });
    const W2 = 20 + Object.keys(L).length * (W + gx) - gx, H2 = 20 + Math.max(...Object.values(L).map(l => l.length)) * (H + gy) - gy;
    return head(null) + `<figure class="ax-figure fig"><div class="ax-panel ax-ticks ax-dots"><svg viewBox="0 0 ${W2} ${H2}" style="width:100%;max-width:${W2}px;height:auto;display:block" role="img" aria-label="task dependency graph">${svg}</svg></div>
      <figcaption class="ax-figure__caption"><span><b>fig. 01</b> / task_deps, read left to right</span><span>${S.tasks.length} tasks</span></figcaption></figure>`;
  }
  function timeline() {
    const kinds = [...new Set(S.log.map(e => e.kind))];
    const ev = S.log.filter(e => !D.kind || e.kind === D.kind).slice().reverse();
    const lc = k => /failed/.test(k) ? 'e' : /changes|cancel|released/.test(k) ? 'w' : 'o';
    return head(null) + `<div class="filters"><button class="ax-btn ax-btn--sm ${D.kind ? 'ax-btn--ghost' : ''}" data-kind="">all</button>${kinds.map(k => `<button class="ax-btn ax-btn--sm ${D.kind === k ? '' : 'ax-btn--ghost'}" data-kind="${k}">${word(k)}</button>`).join('')}</div>
      <figure class="ax-terminal ax-ticks"><div class="ax-terminal__bar"><span><strong>events.log</strong> / ${S.run.id}</span><span>newest first / head #${S.run.head}</span></div>
      <div class="ax-terminal__body logb">${ev.map(e => `<div class="ev" ${selAttr('ev:' + e.seq)}><span class="c">#${e.seq}</span><span class="o">${esc(e.actor)}</span><span class="${lc(e.kind)}">${e.kind}${e.proposed ? '*' : ''}</span><span class="c">${esc(e.ref)}</span><span class="d">${esc(e.text)}</span></div>`).join('')}<span class="ax-cursor"></span></div></figure>
      <p class="note">* an event kind D01 proposes; acs does not emit it yet.</p>`;
  }
  function agents() {
    const F = M.frame(S);
    // hierarchy figure from parent_id
    const top = S.agents.filter(a => !a.parent), kids = id => S.agents.filter(a => a.parent === id);
    const W = 168, H = 64, gx = 16, gy = 56;
    const level2 = kids(top[0].id), totalW = Math.max(W, level2.length * (W + gx) - gx) + 20;
    const pos = {}; pos[top[0].id] = { x: (totalW - W) / 2, y: 10 }; level2.forEach((a, i) => pos[a.id] = { x: 10 + i * (W + gx), y: 10 + H + gy });
    let svg = `<path d="M${totalW / 2} ${10 + H} V${10 + H + gy / 2}" stroke="var(--line-200)" fill="none"/>`;
    if (level2.length > 1) svg += `<path d="M${pos[level2[0].id].x + W / 2} ${10 + H + gy / 2} H${pos[level2[level2.length - 1].id].x + W / 2}" stroke="var(--line-200)" fill="none"/>`;
    level2.forEach(a => svg += `<path d="M${pos[a.id].x + W / 2} ${10 + H + gy / 2} V${pos[a.id].y}" stroke="var(--line-200)" fill="none"/>`);
    S.agents.forEach(a => { const p = pos[a.id]; if (!p) return; const on = cur() === 'agent:' + a.id; const off = a.status === 'offline' || a.paused;
      svg += `<g data-sel="agent:${a.id}" tabindex="0" role="button" aria-label="agent ${a.id}, ${a.role}, ${a.status}" style="cursor:pointer"><rect x="${p.x}" y="${p.y}" width="${W}" height="${H}" fill="var(--bg-100)" stroke="${on ? 'var(--signal-edge)' : 'var(--line-200)'}" stroke-width="${on ? 2 : 1}"/>
        <rect x="${p.x + 10}" y="${p.y + 13}" width="7" height="7" fill="${off ? 'var(--bg-000)' : 'var(--ink-100)'}" stroke="var(--ink-200)"/>
        <text x="${p.x + 24}" y="${p.y + 21}" fill="var(--ink-100)" font-size="13">${a.id}</text>
        <text x="${p.x + 10}" y="${p.y + 39}" fill="var(--ink-300)" font-size="11">${a.role} / ${a.family}</text>
        <text x="${p.x + 10}" y="${p.y + 55}" fill="${a.derived || a.paused ? 'var(--heat)' : 'var(--ink-300)'}" font-size="11">${a.paused ? 'paused' : a.status}${a.task ? ' / #' + a.task : ''}</text></g>`; });
    const H2 = 10 + H + gy + H + 10;
    const rows = S.agents.map(a => `<tr data-sel="agent:${a.id}" role="button" tabindex="0" aria-selected="${cur() === 'agent:' + a.id}"><td class="mono">${a.parent ? '<span class="dim">' + a.parent + ' / </span>' : ''}${a.id}</td><td>${a.role}</td><td class="mono">${a.harness} <span class="dim">/ ${a.model}</span></td><td>${atag(a)}</td><td class="mono">${a.task ? '#' + a.task : '—'}</td><td class="r num">${ktok(a.tok)}</td><td class="r num">${usd(a.usd)}</td></tr>`).join('');
    return head([['working', p2(F.agents.working), 'ran a turn in 15 min'], ['waiting', p2(F.agents.waiting), 'blocked on mail'], ['offline', p2(F.agents.offline), 'no bus call for 15 min', F.agents.offline ? 'ax-delta--bad' : ''], ['tokens', (F.tok / 1e6).toFixed(2) + 'M', `${F.unknown.length} agents report no usd`]]) +
      `<figure class="ax-figure fig"><div class="ax-panel ax-ticks ax-dots"><svg viewBox="0 0 ${totalW} ${H2}" style="width:100%;max-width:${totalW}px;height:auto;display:block" role="img" aria-label="agent hierarchy">${svg}</svg></div>
      <figcaption class="ax-figure__caption"><span><b>fig. 01</b> / hierarchy from agents.parent_id, preset ${S.run.preset} v${S.run.presetVersion}</span><span>${S.agents.length} agents</span></figcaption></figure>` +
      sec(2, 'roster', false, `<button class="ax-btn ax-btn--sm" data-act="add-agent" type="button">add agent</button>`,
        `<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>agent</th><th>role</th><th>harness / model</th><th>state</th><th>task</th><th class="r">tokens</th><th class="r">usd</th></tr></thead><tbody>${rows}</tbody></table></div>
        <p class="note">offline is derived, not reported: a stored state older than 15 min reads as offline (bus.ts:291). scout last called the bus 22 min ago.</p>`);
  }
  function memory() {
    const F = M.frame(S);
    const scopes = [['project', '~/src/acs', 'every brief in this project reads it'], ['thread', 'task-4, task-5', 'only briefs in that thread read it'], ['agent', 'impl-a', 'only that agent reads it']];
    const body = scopes.map(([sc, key, rule], i) => { const used = F.memory.used(sc), cap = S.memory.budgets[sc];
      const ents = S.memory.entries.filter(m => m.scope === sc).map(m => `<div class="row row--mem ${m.st}" ${selAttr('mem:' + m.id)}><span class="ax-meta">${m.id}</span><span class="ax-tag">${m.kind}</span><span class="t">${esc(m.body)}</span><span class="end"><span class="ax-tag ${m.st === 'proposed' ? 'ax-tag--info' : ''}">${m.st}</span></span><span class="why ax-meta">${m.author} at #${m.seq}${m.from ? ' / from task #' + m.from : ''}${m.scope !== 'project' ? ' / ' + m.key : ''} / ${m.st === 'active' ? 'read by ' + m.uses + ' briefs' : m.st === 'proposed' ? 'not read until approved' : 'not read'}</span></div>`).join('');
      return sec(i + 1, `${sc} memory / ${key}`, i === 0, `<span class="meter" title="${used} of ${cap} characters"><span class="meter__track"><span class="meter__fill" style="width:${Math.min(100, used / cap * 100)}%"></span></span><span class="num">${used} / ${cap} ch</span></span>`, ents + `<p class="note">${rule}.</p>`); }).join('');
    const b = D.brief, bt = S.tasks.find(t => t.id === +b.task);
    const pick = (sc, k) => S.memory.entries.filter(m => m.scope === sc && m.key === k && m.st === 'active');
    const P = S.memory.entries.filter(m => m.scope === 'project' && m.st === 'active'), Th = pick('thread', 'task-' + b.task), Ag = pick('agent', b.agent);
    const ch = a => a.reduce((s, m) => s + m.body.length, 0);
    const brief = `<div class="brief"><div class="brief__ctl">
        <div class="ax-field"><label class="ax-field__label" for="bt">task</label><select class="ax-select" id="bt">${S.tasks.map(t => `<option value="${t.id}" ${t.id === +b.task ? 'selected' : ''}>#${t.id} ${esc(t.t)}</option>`).join('')}</select></div>
        <div class="ax-field"><label class="ax-field__label" for="ba">agent</label><select class="ax-select" id="ba">${S.agents.map(a => `<option ${a.id === b.agent ? 'selected' : ''}>${a.id}</option>`).join('')}</select></div></div>
      <pre class="eq">brief(<b>task-${b.task}</b>, <b>${b.agent}</b>) =
  project ~/src/acs   <b>${p2(P.length)}</b> entries  <b>${ch(P)}</b> ch   <i>${P.map(m => m.id).join(' ') || '—'}</i>
+ thread  task-${b.task}${' '.repeat(Math.max(1, 10 - String(b.task).length))}<b>${p2(Th.length)}</b> entries  <b>${ch(Th)}</b> ch   <i>${Th.map(m => m.id).join(' ') || '—'}</i>
+ agent   ${b.agent}${' '.repeat(Math.max(1, 12 - b.agent.length))}<b>${p2(Ag.length)}</b> entries  <b>${ch(Ag)}</b> ch   <i>${Ag.map(m => m.id).join(' ') || '—'}</i>
= <b>${ch(P) + ch(Th) + ch(Ag)}</b> ch, framed as data: "recorded by &lt;author&gt; at #seq: …"
<i>never read: other threads, other agents' entries, proposed and retired entries</i></pre></div>`;
    return head([['active', p2(F.memory.active), 'read into briefs'], ['proposed', p2(F.memory.proposed), 'waiting on you'], ['retired', p2(F.memory.retired), 'kept, never read'], ['project', F.memory.used('project') + ' ch', `of ${S.memory.budgets.project} budget`]]) +
      body + sec(4, 'what a brief reads', false, 'p11 boundary, computed from the rows above', brief);
  }
  function config() {
    const F = M.frame(S); const st = S.staged || {};
    const LAY = S.config.layers;
    const rows = S.config.keys.map(k => { const set = new Set(k.chain.map(c => c[0])); const isSt = k.k in st;
      return `<div class="row row--cfg" ${selAttr('cfg:' + k.k)}><span class="k">${esc(k.k)}</span><span class="v ${isSt ? 'staged' : ''}">${esc(String(isSt ? st[k.k] : k.v))}${isSt ? ' staged' : ''}</span>
        <span class="cfgmeta"><span class="layers" title="set in: ${[...set].join(', ')}; effective from ${k.layer}">${LAY.map(l => `<span class="${l === k.layer ? 'win' : set.has(l) ? 'set' : ''}" aria-label="${l}"></span>`).join('')}</span>
        <span class="use">${k.use === 'dead' ? '<span class="ax-tag ax-tag--warn">no reader</span>' : k.use === 'live' ? '<span class="ax-tag">read</span>' : '<span class="ax-tag">proposed</span>'}</span>
        <span class="ax-meta">${k.locked ? 'locked / ' : ''}${esc(k.at)}</span></span></div>`; }).join('');
    return head([['version', 'v' + S.config.version, `last change #${S.config.history[0].seq}`], ['staged', p2(F.config.staged), F.config.staged ? 'apply from the inspector' : 'nothing pending'], ['read', p2(F.config.live), 'keys a runtime reads'], ['no reader', p2(F.config.dead), 'set, but nothing reads them', F.config.dead ? 'ax-delta--bad' : '']]) +
      sec(1, `${S.config.file} / effective values`, true, `<span class="layers-key">${LAY.map((l, i) => `<span>${p2(i + 1)} ${l}</span>`).join('')}</span>`,
        rows + `<p class="note">each strip has one cell per layer, in that order: filled is where the value came from, outlined is set but overridden. "no reader" is the p15 audit: the key is accepted but nothing in src/ reads it, so changing it changes nothing.</p>`);
  }

  // ---------- inspector ----------
  function inspector() {
    const key = cur(); const F = M.frame(S);
    if (D.adding) return addAgent();
    if (!key) return '<p class="empty">select something.</p>';
    const [kind, id] = [key.slice(0, key.indexOf(':')), key.slice(key.indexOf(':') + 1)];
    const evs = pred => { const e = S.log.filter(pred).slice(-4).reverse(); return `<div><p class="ax-eyebrow ax-eyebrow--quiet">last events</p>${e.map(x => `<div class="evl"><span class="ax-meta">#${x.seq}</span><span><span class="mono">${x.kind}${x.proposed ? '*' : ''}</span> <span class="dim">/ ${esc(x.actor)}</span><br><span class="dim">${esc(x.text)}</span></span></div>`).join('') || '<p class="note">no events yet.</p>'}</div>`; };
    const why = (label, needed) => `<div class="ax-field"><label class="ax-field__label" for="why">why <output>${needed ? 'required, stored on the event' : 'optional, stored on the event'}</output></label><textarea class="ax-input" id="why" rows="2" placeholder="one line, for example: tests cover the cap"></textarea></div>
      <p class="ax-status" id="msg" role="status" aria-live="polite" data-state="${D.msg ? D.msg.st : 'idle'}">${D.msg ? esc(D.msg.text) : label}</p>`;
    const btn = (act, label, cls, arg) => `<button class="ax-btn ${cls || ''}" type="button" data-act="${act}" ${arg !== undefined ? `data-arg="${esc(arg)}"` : ''}>${label}${cls && cls.includes('primary') ? ' <span class="ax-btn__glyph">→</span>' : ''}</button>`;
    const title = t => `<h2 class="ins__title">${esc(String(t).replace(/[.?]$/, ''))}<span class="ax-dot">${/\?$/.test(t) ? '?' : '.'}</span></h2>`;
    if (kind === 'task') { const t = F.T(+id); const sub = t.st === 'submitted' && t.rev === 'operator', stk = stuckT(t);
      const same = t.rev && t.rev !== 'operator' && F.fam(t.rev) === F.fam(t.a);
      const q = S.questions.find(q => q.task === t.id && !q.answered);
      return `<div class="ins"><p class="ax-eyebrow ax-eyebrow--quiet">task / #${t.id}</p>${title(t.t)}<p>${tag(t)} <span class="ax-meta">last event #${t.seq}</span></p>
        <dl class="kv"><dt>assignee</dt><dd>${t.a ? `${t.a} <span class="dim">/ ${F.A(t.a).model}</span>` : `none. role ${t.role} has no agent`}</dd>
        ${t.rev ? `<dt>reviewer</dt><dd>${t.rev === 'operator' ? 'you' : `${t.rev} <span class="dim">/ ${F.fam(t.rev)}</span> <span class="ax-tag ${same ? 'ax-tag--warn' : ''}">${same ? 'same family' : 'different family'}</span>`}</dd>` : ''}
        <dt>depends on</dt><dd>${t.dep.map(d => `#${d} <span class="dim">${word(F.T(d).st)}</span>`).join(', ') || 'nothing'}</dd>
        ${t.res ? `<dt>result</dt><dd>${esc(t.res)}</dd>` : ''}${t.files ? `<dt>files</dt><dd class="mono">${t.files.join('<br>')}</dd>` : ''}
        ${q ? `<dt>question</dt><dd><span class="ax-tag ax-tag--warn">unanswered</span> ${esc(q.t)}</dd>` : ''}</dl>
        ${why(sub ? 'a reason is required to accept or send back' : stk ? 'requeue releases the claim; the next agent with the role picks it up' : t.unrouted ? 'assigning sets the owner and records who decided' : 'no action is pending on this task', sub)}
        <div class="acts">${sub ? btn('accept', 'accept', 'ax-btn--primary') + btn('revise', 'request changes') : ''}${stk ? btn('requeue', 'requeue', 'ax-btn--primary') + btn('assign', 'reassign to rev-1', '', 'rev-1') : ''}${t.unrouted ? btn('assign', 'assign to impl-a', 'ax-btn--primary', 'impl-a') : ''}
          ${!['accepted', 'cancelled'].includes(t.st) ? btn('cancel', D.confirm === key ? 'confirm cancel' : 'cancel', D.confirm === key ? 'ax-btn--danger' : 'ax-btn--ghost') : ''}${btn('trace', 'show events', 'ax-btn--ghost')}</div>
        ${evs(e => e.ref === String(t.id))}<p class="note">cli: qagent task ${sub ? 'review ' + t.id + ' --accept --why "…"' : stk ? 'requeue ' + t.id : 'show ' + t.id}</p></div>`; }
    if (kind === 'q') { const q = S.questions.find(x => x.id === id);
      return `<div class="ins"><p class="ax-eyebrow ax-eyebrow--quiet">question / ${q.id}</p>${title(q.t)}<dl class="kv"><dt>from</dt><dd>${q.from} on #${q.task}</dd><dt>asked</dt><dd>#${q.seq}</dd><dt>state</dt><dd>${q.answered ? 'answered' : '<span class="ax-tag ax-tag--warn">unanswered</span>'}</dd></dl>
        ${q.answered ? '' : why('your answer is sent to ' + q.from + ' as an answer message', true)}<div class="acts">${q.answered ? '' : btn('answer', 'send answer', 'ax-btn--primary', q.id)}${btn('goto', 'open #' + q.task, 'ax-btn--ghost', q.task)}</div>
        <p class="note">cli: qagent send ${q.from} "…" --type answer --task ${q.task}</p></div>`; }
    if (kind === 'mem') { const m = S.memory.entries.find(x => x.id === id);
      return `<div class="ins"><p class="ax-eyebrow ax-eyebrow--quiet">memory / ${m.id}</p>${title(m.body)}<p><span class="ax-tag">${m.kind}</span> <span class="ax-tag ${m.st === 'proposed' ? 'ax-tag--info' : ''}">${m.st}</span></p>
        <dl class="kv"><dt>scope</dt><dd>${m.scope} <span class="dim">/ ${m.key}</span></dd><dt>author</dt><dd>${m.author} at #${m.seq}${m.from ? ` <span class="dim">from task #${m.from}</span>` : ''}</dd><dt>read by</dt><dd>${m.st === 'active' ? m.uses + ' briefs' : 'no brief'}</dd>${m.st === 'retired' ? `<dt>retired</dt><dd>at #${m.retiredSeq}${m.by ? ', superseded by ' + m.by : ''}</dd>` : ''}<dt>size</dt><dd class="num">${m.body.length} ch</dd></dl>
        <p class="note">${m.scope === 'project' ? 'once active, every brief in ~/src/acs carries this, framed as data. a wrong entry steers every later agent, which is why project entries from agents wait for you.' : m.scope === 'thread' ? 'only briefs in ' + m.key + ' read this.' : 'only ' + m.key + ' reads this.'}</p>
        ${m.st !== 'retired' ? why(m.st === 'proposed' ? 'approving makes it active for every brief in scope' : 'retiring keeps the row and stops briefs reading it', true) : ''}
        <div class="acts">${m.st === 'proposed' ? btn('approve', 'approve', 'ax-btn--primary', m.id) : ''}${m.st !== 'retired' ? btn('retire', 'retire', '', m.id) : ''}${btn('trace', 'show events', 'ax-btn--ghost')}</div>
        ${m.st !== 'retired' ? `<div class="ax-disclosure"><details><summary>edit as a new version</summary><div class="ins"><div class="ax-field"><label class="ax-field__label" for="mt">new text <output>this entry retires</output></label><textarea class="ax-input" id="mt" rows="3">${esc(m.body)}</textarea></div>${btn('supersede', 'save new version', '', m.id)}</div></details></div>` : ''}
        <p class="note">cli: qagent memory ${m.st === 'proposed' ? 'approve' : 'show'} ${m.id}</p></div>`; }
    if (kind === 'agent') { const a = F.A(id);
      return `<div class="ins"><p class="ax-eyebrow ax-eyebrow--quiet">agent / ${a.id}</p>${title(a.id + ', ' + a.role)}<p>${atag(a)} <span class="ax-meta">last event #${a.seq || '—'}</span></p>
        <dl class="kv"><dt>harness</dt><dd class="mono">${a.harness} / ${a.model}</dd><dt>family</dt><dd>${a.family}</dd><dt>parent</dt><dd>${a.parent || 'none, top of the tree'}</dd>
        <dt>state</dt><dd>${a.derived ? `offline <span class="dim">(stored ${a.stored}; last bus call ${a.seenMin} min ago)</span>` : a.status}</dd>
        <dt>authority</dt><dd>${a.authority} <span class="dim">/ delegate ${a.perms.canDelegate ? 'yes' : 'no'} / review ${a.perms.canReview ? 'yes' : 'no'} / depth ${a.perms.maxDelegationDepth}</span></dd>
        <dt>access</dt><dd>files ${a.perms.filesystem} / shell ${a.perms.shell ? 'yes' : 'no'} / network ${a.perms.network ? 'yes' : 'no'}</dd>
        <dt>approval</dt><dd>${a.approval} <span class="dim">(p15 field, proposed)</span></dd>
        <dt>spend</dt><dd class="num">${a.turns} turns / ${ktok(a.tok)} tokens / ${usd(a.usd)}${a.usd == null ? ' <span class="dim">not reported by ' + a.harness + '</span>' : ''}</dd></dl>
        ${why(a.derived ? 'nothing restarts a supervisor by itself. start it: qagent supervise ' + a.id : 'pausing stops new claims for this agent; its running turn finishes', false)}
        <div class="acts">${btn('pause-agent', a.paused ? 'resume agent' : 'pause agent', '', a.id)}${btn('trace-agent', 'show events', 'ax-btn--ghost', a.id)}</div>
        ${evs(e => e.actor === a.id)}<p class="note">no remove or edit verb exists in acs today; retire and edit are D01 proposals.</p></div>`; }
    if (kind === 'cfg') { const k = S.config.keys.find(x => x.k === id); const st = S.staged || {}; const n = Object.keys(st).length;
      const diff = Object.keys(st).map(kk => { const o = S.config.keys.find(x => x.k === kk); return `<span class="del">- ${kk} ${JSON.stringify(o.v)}</span>\n<span class="add">+ ${kk} ${JSON.stringify(st[kk])}</span>`; }).join('\n');
      return `<div class="ins"><p class="ax-eyebrow ax-eyebrow--quiet">config / v${S.config.version}</p><h2 class="ins__title mono" style="font:400 18px/1.3 var(--font-mono)">${esc(k.k)}</h2>
        <dl class="kv"><dt>effective</dt><dd class="mono">${esc(String(k.v))}</dd><dt>type</dt><dd class="mono">${esc(k.type)}</dd><dt>reader</dt><dd>${k.use === 'dead' ? '<span class="ax-tag ax-tag--warn">no reader</span> ' : ''}<span class="mono dim">${esc(k.at)}</span></dd></dl>
        <div><p class="ax-eyebrow ax-eyebrow--quiet">layers, lowest first</p><ol class="chain">${S.config.layers.map(l => { const c = k.chain.find(x => x[0] === l); return `<li class="${l === k.layer ? 'win' : ''}"><span>${l}</span><span>${c ? esc(String(c[1])) : '—'}</span><span>${l === k.layer ? '■ wins' : ''}</span></li>`; }).join('')}</ol></div>
        ${k.locked ? `<p class="ax-status" data-state="idle">${esc(k.locked)}</p>` : `<div class="ax-field" id="cfgf"><label class="ax-field__label" for="cv">new value <output>${esc(k.type)}</output></label><input class="ax-input" id="cv" value="${esc(String(k.k in st ? st[k.k] : k.v))}"><p class="ax-field__help" id="cvh">${k.use === 'dead' ? 'accepted, but nothing reads this key yet. staging it records intent only.' : 'staged changes apply together as one new version.'}</p></div>
        <div class="acts">${btn('stage', 'stage change', '', k.k)}</div>`}
        ${n ? `<figure class="ax-terminal diff"><div class="ax-terminal__bar"><span><strong>staged</strong> / v${S.config.version} → v${S.config.version + 1}</span><span>${n} key${n > 1 ? 's' : ''}</span></div><pre class="ax-terminal__body">${diff}</pre></figure>${why('applying writes one config_changed event and a new version you can roll back', true)}<div class="acts">${btn('apply', 'apply v' + (S.config.version + 1), 'ax-btn--primary')}${btn('unstage', 'discard', 'ax-btn--ghost')}</div>` : ''}
        <div><p class="ax-eyebrow ax-eyebrow--quiet">versions</p>${S.config.history.map(h => `<div class="evl"><span class="ax-meta">v${h.v}</span><span>${esc(h.why)} <span class="dim">/ ${h.actor} / #${h.seq}</span><br><span class="mono dim">${h.diff.map(d => `${d[0]} ${JSON.stringify(d[1])} → ${JSON.stringify(d[2])}`).join('; ')}</span>${h.v < S.config.version ? `<br><button class="ax-btn ax-btn--sm ax-btn--ghost" type="button" data-act="rollback" data-arg="${h.v}">roll back v${h.v}</button>` : ''}</span></div>`).join('')}</div>
        ${n ? '' : `<p class="ax-status" id="msg" role="status" aria-live="polite" data-state="${D.msg ? D.msg.st : 'idle'}">${D.msg ? esc(D.msg.text) : 'the dashboard never edits harness commands or credentials'}</p>`}
        <p class="note">cli: qagent config set ${esc(k.k)} &lt;value&gt; / qagent config apply --why "…"</p></div>`; }
    if (kind === 'ev') { const e = S.log.find(x => x.seq === +id);
      return `<div class="ins"><p class="ax-eyebrow ax-eyebrow--quiet">event / #${e.seq}</p>${title(word(e.kind))}<dl class="kv"><dt>actor</dt><dd>${e.actor}</dd><dt>entity</dt><dd class="mono">${esc(e.ref)}</dd><dt>text</dt><dd>${esc(e.text)}</dd>${e.proposed ? '<dt>kind</dt><dd>proposed by D01, not emitted by acs yet</dd>' : ''}</dl><p class="note">cli: qagent log --since ${e.seq - 1} --limit 1</p></div>`; }
    return '';
  }
  function addAgent() {
    return `<div class="ins"><p class="ax-eyebrow ax-eyebrow--quiet">agents / add</p><h2 class="ins__title">add an agent<span class="ax-dot">.</span></h2>
      <form id="addf" class="ins" novalidate>
      <div class="ax-field"><label class="ax-field__label" for="ai">id</label><input class="ax-input" id="ai" placeholder="cheap-1" autocomplete="off"><p class="ax-field__help">letters, digits, dot, dash or underscore. it is the agent's name on every event.</p></div>
      <div class="ax-field"><label class="ax-field__label" for="ar">role</label><select class="ax-select" id="ar">${['cheap-worker', 'implementation', 'reviewer', 'research', 'tester', 'planner', 'manager'].map(r => `<option>${r}</option>`).join('')}</select><p class="ax-field__help">cheap-worker has no agent today, so #6 waits.</p></div>
      <div class="ax-field"><label class="ax-field__label" for="ah">harness / model</label><select class="ax-select" id="ah"><option value="claude|claude-haiku-4-5|claude">claude / claude-haiku-4-5</option><option value="gemini|gemini-2.5-flash|gemini">gemini / gemini-2.5-flash</option><option value="codex|gpt-5-mini|gpt">codex / gpt-5-mini</option><option value="opencode|glm-5.3|glm">opencode / glm-5.3</option></select></div>
      <p class="ax-status" id="msg" role="status" aria-live="polite" data-state="${D.msg ? D.msg.st : 'idle'}">${D.msg ? esc(D.msg.text) : 'adding registers the agent offline. it runs once you start its supervisor'}</p>
      <div class="acts"><button class="ax-btn ax-btn--primary" type="submit">add agent <span class="ax-btn__glyph">→</span></button><button class="ax-btn ax-btn--ghost" type="button" data-act="cancel-add">close</button></div></form>
      <p class="note">cli: qagent agent add &lt;id&gt; --role &lt;role&gt; --harness &lt;h&gt; --model &lt;m&gt;</p></div>`;
  }

  // ---------- render + act ----------
  function render() {
    if (D.surface === 'tty') return renderTTY();
    rail();
    $('#pane').innerHTML = { now, tree, board, graph, timeline, agents, memory, config }[D.lens]();
    $('#aside').innerHTML = inspector();
  }
  function renderTTY() {
    const s = C.draw(S, TU, size[0], size[1]);
    const t = $('#tty'); t.innerHTML = s.html(); t.className = 'tty' + (tier === 'c16' ? ' c16' : '');
  }
  function say(r) { D.msg = r.ok ? { st: 'ok', text: r.seq ? `recorded as event #${r.seq}` : r.staged ? 'staged. apply it as a new version below' : 'done' } : { st: 'error', text: r.err }; }
  function act(a, arg) {
    const key = cur(); const id = key && key.slice(key.indexOf(':') + 1); const why = ($('#why') || {}).value || '';
    D.msg = null;
    if (a === 'pause') { M.verb(S, 'pause'); return render(); }
    if (a === 'palette') return openPal();
    if (a === 'add-agent') { D.adding = true; return render(); }
    if (a === 'cancel-add') { D.adding = false; return render(); }
    if (a === 'trace') { D.lens = 'timeline'; D.kind = null; return render(); }
    if (a === 'trace-agent') { D.lens = 'timeline'; return render(); }
    if (a === 'goto') { D.lens = 'tree'; D.sel.tree = 'task:' + arg; return render(); }
    if (a === 'cancel' && D.confirm !== key) { D.confirm = key; D.msg = { st: 'warn', text: 'cancel stops the task for good. press confirm cancel' }; return render(); }
    D.confirm = null;
    const map = { accept: ['accept', +id], revise: ['revise', +id], requeue: ['requeue', +id], cancel: ['cancel', +id], assign: ['assign', +id, arg], answer: ['answer', arg], approve: ['approve', arg], retire: ['retire', arg], 'pause-agent': ['pause-agent', arg], apply: ['apply', null], rollback: ['rollback', +arg] };
    if (a === 'stage') { const r = M.verb(S, 'stage', { k: arg, v: $('#cv').value }); say(r); render(); if (!r.ok) { const f = $('#cfgf'); if (f) { f.setAttribute('data-invalid', ''); $('#cv').setAttribute('aria-invalid', 'true'); $('#cvh').textContent = r.err; } } return; }
    if (a === 'unstage') { S.staged = {}; return render(); }
    if (a === 'supersede') { const r = M.verb(S, 'supersede', { id: arg, body: $('#mt').value }, why); say(r); if (r.ok) D.sel.memory = 'mem:' + S.memory.entries[S.memory.entries.length - 1].id; return render(); }
    const m = map[a]; if (!m) return;
    const r = M.verb(S, m[0], m[1], m[2] !== undefined ? m[2] : why);
    say(r); render(); if (!r.ok) { const w = $('#why'); if (w) w.focus(); }
  }
  // palette
  function openPal() { $('#pal').hidden = false; $('#ci').value = ''; $('#pals').textContent = ''; $('#pals').removeAttribute('data-state'); $('#ci').focus(); }
  function closePal() { $('#pal').hidden = true; }
  $('#palf').addEventListener('submit', e => { e.preventDefault(); const r = M.command(S, $('#ci').value);
    if (r.lens) { D.lens = r.lens; closePal(); return render(); }
    if (r.goto) { D.lens = 'tree'; D.sel.tree = 'task:' + r.goto; closePal(); return render(); }
    if (r.ok) { say(r); closePal(); return render(); }
    $('#pals').textContent = r.err; $('#pals').dataset.state = 'error'; });

  document.addEventListener('click', e => {
    const t = e.target;
    if (t.id === 'pal') return closePal();
    if (t.closest('#sv-dash') || t.closest('#sv-tty')) { D.surface = t.closest('#sv-tty') ? 'tty' : 'dash'; $('#dash').hidden = D.surface !== 'dash'; $('#term').hidden = D.surface !== 'tty';
      $('#sv-dash').setAttribute('aria-pressed', D.surface === 'dash'); $('#sv-tty').setAttribute('aria-pressed', D.surface === 'tty'); TU.lens = D.lens; render(); if (D.surface === 'tty') $('#tty').focus(); else rail(); return; }
    if (t.closest('#reset')) { S = M.clone(FIX); D.sel = {}; D.msg = null; D.adding = false; TU = C.newUI(D.lens); render(); return; }
    const sz = t.closest('[data-size]'); if (sz) { size = sz.dataset.size.split('x').map(Number); document.querySelectorAll('[data-size]').forEach(b => b.setAttribute('aria-pressed', b === sz)); renderTTY(); $('#tty').focus(); return; }
    const ti = t.closest('[data-tier]'); if (ti) { tier = ti.dataset.tier; document.querySelectorAll('[data-tier]').forEach(b => b.setAttribute('aria-pressed', b === ti)); renderTTY(); $('#tty').focus(); return; }
    if (D.surface !== 'dash') return;
    const l = t.closest('[data-lens]'); if (l) { e.preventDefault(); D.lens = l.dataset.lens; D.msg = null; D.adding = false; render(); $('#pane').focus({ preventScroll: true }); return; }
    const k = t.closest('[data-kind]'); if (k) { D.kind = k.dataset.kind || null; render(); return; }
    const b = t.closest('[data-act]'); if (b) { act(b.dataset.act, b.dataset.arg); return; }
    const s = t.closest('[data-sel]'); if (s) { D.sel[D.lens] = s.dataset.sel; D.msg = null; D.confirm = null; D.adding = false; render(); }
  });
  document.addEventListener('change', e => { if (e.target.id === 'bt') { D.brief.task = +e.target.value; render(); } if (e.target.id === 'ba') { D.brief.agent = e.target.value; render(); } });
  document.addEventListener('submit', e => { if (e.target.id !== 'addf') return; e.preventDefault();
    const [harness, model, family] = $('#ah').value.split('|'); const r = M.verb(S, 'add-agent', { id: $('#ai').value.trim(), role: $('#ar').value, harness, model, family });
    say(r); if (r.ok) { D.adding = false; D.sel.agents = 'agent:' + $('#ai').value.trim(); D.lens = 'agents'; } render(); });
  document.addEventListener('keydown', e => {
    if (!$('#pal').hidden) { if (e.key === 'Escape') closePal(); return; }
    if (D.surface === 'tty') { if (document.activeElement !== $('#tty')) return; if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key.length === 1 || ['Enter', 'Escape', 'Backspace', 'ArrowUp', 'ArrowDown'].includes(e.key)) { e.preventDefault(); C.key(S, TU, e.key, size[0]); D.lens = TU.lens; renderTTY(); } return; }
    const tag = document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') { if (e.key === 'Escape') document.activeElement.blur(); return; }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openPal(); return; }
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (/^[1-8]$/.test(e.key)) { D.lens = LENS[+e.key - 1][0]; D.adding = false; render(); return; }
    if (e.key === ':') { e.preventDefault(); openPal(); return; }
    if (e.key === 'j' || e.key === 'k') { const it = itemsFor(D.lens); let i = it.indexOf(cur()); i = Math.max(0, Math.min(it.length - 1, i + (e.key === 'j' ? 1 : -1))); D.sel[D.lens] = it[i]; render();
      const el = document.querySelector(`[data-sel="${CSS.escape(it[i])}"]`); if (el) el.scrollIntoView({ block: 'nearest' }); return; }
    if (e.key === 'Enter') { const s = document.activeElement.closest && document.activeElement.closest('[data-sel]'); if (s) { D.sel[D.lens] = s.dataset.sel; render(); } }
  });
  const h = (location.hash || '').slice(1); if (LENS.some(l => l[0] === h)) D.lens = h;
  render();
})();
