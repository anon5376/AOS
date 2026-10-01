/* aos console / terminal renderer. a cell grid with accelerate roles instead of colours.
   runs in the browser (window.AOS_TUI) and in node (module.exports) so the spec mockups
   are printed by the same code the prototype draws. */
(function (root) {
  'use strict';

  // ---------- grid ----------
  // roles map to accelerate tokens: i1 ink-100, i2 ink-200, i3 ink-300, ln line-100, l2 line-200,
  // sg signal-ink, sf signal fill (on-signal text), ht heat, dg danger, st steel, rv reverse chip,
  // se selected row (bg-200 ground). bold is a separate flag (b).
  function Screen(w, h) {
    this.w = w; this.h = h;
    this.c = [];
    for (let y = 0; y < h; y++) { const r = []; for (let x = 0; x < w; x++) r.push({ ch: ' ', r: 'i2', b: 0, bg: '' }); this.c.push(r); }
  }
  Screen.prototype.put = function (x, y, s, role, opt) {
    if (y < 0 || y >= this.h) return x;
    s = String(s); opt = opt || {};
    const max = opt.max == null ? this.w - x : opt.max;
    let n = 0;
    for (const ch of s) {
      if (n >= max || x >= this.w) break;
      if (x >= 0) { const c = this.c[y][x]; c.ch = ch; c.r = role || 'i2'; c.b = opt.b ? 1 : 0; if (opt.bg !== undefined) c.bg = opt.bg; }
      x++; n++;
    }
    return x;
  };
  Screen.prototype.bg = function (x, y, w, bg) { for (let i = x; i < x + w && i < this.w; i++) if (y >= 0 && y < this.h && i >= 0) this.c[y][i].bg = bg; };
  Screen.prototype.hline = function (x, y, w, role, ch) { this.put(x, y, (ch || '─').repeat(Math.max(0, w)), role || 'ln'); };
  Screen.prototype.vline = function (x, y, h, role) { for (let i = 0; i < h; i++) this.put(x, y + i, '│', role || 'ln'); };
  // corner ticks: accelerate's registration marks, drawn as the four corners only
  Screen.prototype.ticks = function (x, y, w, h, role) {
    role = role || 'l2';
    this.put(x, y, '┌─', role); this.put(x + w - 2, y, '─┐', role);
    this.put(x, y + h - 1, '└─', role); this.put(x + w - 2, y + h - 1, '─┘', role);
  };
  Screen.prototype.text = function () { return this.c.map(r => r.map(c => c.ch).join('').replace(/\s+$/, '')).join('\n'); };
  Screen.prototype.html = function () {
    const esc = s => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
    const out = [];
    for (const row of this.c) {
      let line = '', run = '', key = null;
      const flush = () => { if (run) line += `<span class="${key}">${esc(run)}</span>`; run = ''; };
      for (const c of row) {
        const box = BOX[c.ch];
        const k = `t-${c.r}${c.b ? ' t-b' : ''}${c.bg ? ' t-bg-' + c.bg : ''}`;
        if (box || WIDE.test(c.ch)) {
          flush(); key = null;
          line += box ? `<span class="${k} t-box t-${box}"></span>` : `<span class="${k} t-cell">${esc(c.ch)}</span>`;
          continue;
        }
        if (k !== key) { flush(); key = k; }
        run += c.ch;
      }
      flush();
      out.push(line);
    }
    return out.join('\n');
  };
  // box glyphs are drawn by css (arms up/down/left/right) so lines join across cells,
  // as real terminals do; the latin font subset has no box-drawing glyphs.
  const BOX = { '━': 'LR', '─': 'lr', '│': 'ud', '┌': 'rd', '┐': 'ld', '└': 'ur', '┘': 'ul', '├': 'udr', '┤': 'udl', '┬': 'lrd', '┴': 'lru', '┼': 'udlr', '╶': 'r', '╴': 'l', '╷': 'd', '╵': 'u' };
  const WIDE = /[^\u0000-ÿ–-—‘-”…]/;

  // ---------- display digits ----------
  // antonio's compressed, light readout numerals, rebuilt from light box arms: 3 cells by 3 rows.
  const BIG = {
    '0': ['┌─┐', '│ │', '└─┘'], '1': ['╶┐ ', ' │ ', '╶┴╴'], '2': ['╶─┐', '┌─┘', '└─╴'], '3': ['╶─┐', ' ─┤', '╶─┘'],
    '4': ['╷ ╷', '└─┤', '  ╵'], '5': ['┌─╴', '└─┐', '╶─┘'], '6': ['┌─╴', '├─┐', '└─┘'], '7': ['╶─┐', '  │', '  ╵'],
    '8': ['┌─┐', '├─┤', '└─┘'], '9': ['┌─┐', '└─┤', '╶─┘'], '.': [' ', ' ', '.'], '—': ['   ', '╶─╴', '   '], ' ': [' ', ' ', ' ']
  };
  function big(scr, x, y, s, role) {
    for (const ch of String(s)) { const g = BIG[ch] || BIG[' ']; for (let i = 0; i < 3; i++) scr.put(x, y + i, g[i], role); x += g[0].length + (ch === '.' ? 0 : 1); }
    return x;
  }
  function bigWidth(s) { let n = 0; for (const ch of String(s)) n += (BIG[ch] || BIG[' '])[0].length + (ch === '.' ? 0 : 1); return n; }

  // ---------- helpers ----------
  const pad = (s, n) => { s = String(s); const a = [...s]; return a.length >= n ? a.slice(0, n).join('') : s + ' '.repeat(n - a.length); };
  const rpad = (s, n) => { s = String(s); const a = [...s]; return a.length >= n ? a.slice(a.length - n).join('') : ' '.repeat(n - a.length) + s; };
  const cut = (s, n) => { const a = [...String(s)]; return a.length <= n ? String(s) : a.slice(0, Math.max(0, n - 1)).join('') + '…'; };

  root.AOS_TUI = { Screen, big, bigWidth, pad, rpad, cut };
  if (typeof module !== 'undefined') module.exports = root.AOS_TUI;
})(typeof window !== 'undefined' ? window : globalThis);
