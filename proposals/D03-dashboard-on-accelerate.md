# D03: The dashboard on Accelerate

- **Kind:** design spec for the dashboard surface of D01. No code in ACS.
- **Target:** `src/dashboard/` (page, assets, server), replacing today's single column.
- **Prototype:** https://claude.ai/artifact/JKLMqiCekJFcktsit2kcMw, source in `assets/D01-prototype/` (`dash.js`, `index.html`). Screenshots: `assets/D01-dash-now-void.png`, `D01-dash-agents-void.png`, `D01-dash-memory-void.png`, `D01-dash-config-paper.png`.
- **Status:** proposed.

## 1. Shell

Accelerate's `ax-shell` in three columns: the **rail** (brand mark `aos.`, `#seq`, run chip, goal, the `operate` and `system` lens groups with dotted leaders to `[1]`…`[8]`, then the three answers and the pause button at its foot), the **main** column (command bar, serif lens title with the accent period, readouts, the lens body), and the **inspector** (the card for the selected row). Below 1000 px the columns stack; below 700 px rows reflow to two lines. Void is the default; Paper follows `prefers-color-scheme: light`.

The answers stay in the rail on every lens, so needs, stuck and spend are visible while the operator works in agents, memory or config.

## 2. Lenses to components

| Lens | Readouts (`ax-figure`) | Body |
|---|---|---|
| now | needs you, stuck, spent of budget, cost unknown | needs rows (kind tag, title, why, `#seq`), stuck rows with minutes, agent lattice (one cell per agent, status dot, task) |
| tree | tasks, open, in review, done | path rows `/1/3`, state tag, assignee and model |
| board | — | columns by state (`open`, `claimed`, `submitted`, `changes requested`, `accepted`), cards with stuck minutes on their own line |
| graph | — | responsive SVG of task deps, edges in line-200, the selected node and its edges in signal-edge |
| timeline | — | `ax-terminal` log, one line per event with `#seq`, actor and kind; kind filter as an `ax-btn-group`; proposed kinds marked `*` |
| agents | agents, working, offline, cost unknown | hierarchy SVG from `parent_id`, roster table (id, role, harness / model, status, task, spend, last seen); **add agent** form in the inspector with the equivalent `qagent agent add …` shown under it |
| memory | entries, proposed, retired, project budget used | one section per scope with a budget meter, rows with kind, author, uses and `#seq`; **what a brief reads** composer (thread and agent selects, the entries that would be injected, token total, "other threads are never included") |
| config | version, staged, read keys, no reader | rows with the five-cell layer strip (default › preset › file › env › run, winning cell filled), reader tag (`read` with `file:line`, `no reader` in heat, `proposed`); staged diff in an `ax-terminal`; history with roll back |

## 3. The inspector

Every row opens the same inspector: a quiet eyebrow (`■ config / v14`), the title in Newsreader, a definition list of facts, then the actions. The **primary action** is the screen's single lime `ax-btn--primary`; secondary actions are ghost buttons. Verbs that need a reason show a `why` field marked "required, stored on the event" and refuse to submit without it, with the core's message in an `ax-status` line. A successful action reports `[ ok ] recorded as event #N` and the row updates from the SSE stream, not from the click.

Locked config keys show their value and "edit in agent-bus.config.json" with no input. Staging a `no reader` key shows: "accepted, but nothing reads this key yet. staging it records intent only."

## 4. Command palette

`:` or the command bar opens the palette. It takes the CLI grammar from D01 section 6 without the binary name (`task accept 7 --why tests cover the cap`, `config set constraints.maxRetries 3`, `memory approve m-36 --why …`, `goto 7`) and lists matching verbs as you type. It is the same parser the terminal uses.

## 5. What the server needs

Today the dashboard writes nothing but `POST /api/send` (`src/dashboard/server.ts:383-392`). Proposed: one `POST /api/verb` taking `{name, arg, why}` and calling the same core verb the CLI calls, with the operator identity the page already uses. No per-verb endpoints, so the dashboard cannot grow a verb the CLI lacks.

## 6. Fonts and the CSP

ACS serves the page under `default-src 'none'` with nonce scripts and styles (`server.ts:256`) and forbids external assets. Accelerate's README loads Google Fonts; the dashboard must not. Proposed: serve the five woff2 files Accelerate ships (Antonio, Archivo, Plex Mono 400 and 500, Newsreader; 218 KB together, measured from `assets/D01-prototype/fonts/`) from `GET /fonts/*` with long cache headers, and add `font-src 'self'` to the CSP. Their licence file ships beside them.

**Gap:** the Plex Mono subset has no box-drawing, arrow or block glyphs. The prototype draws box glyphs in CSS for the terminal view; the dashboard itself avoids those characters. D01 decision 6 asks whether to extend the subset instead.

## 7. Behaviour

- No framework and no build step beyond what ACS has: the page stays one HTML response with inlined CSS and JS under the nonce. The prototype is plain JS and about the size the real page would be.
- Updates arrive over the existing SSE channel; the page redraws the changed lens only.
- Keyboard: `1`–`8` lenses, `j`/`k` rows, `Enter` inspector, `:` palette, the same verb letters as the terminal (D02 section 7).
- Motion: Accelerate's fast ease on hover and focus, and the `live` pulse on the run tag. Nothing else moves.

## 8. Left out

KPI tiles without a list behind them, activity charts, a chat pane, removing or editing agents, editing harness commands or env from the browser, more themes than Void and Paper, and any asset from outside `127.0.0.1`.
