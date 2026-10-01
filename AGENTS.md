# AGENTS.md

Instructions for AI agents working from this repository (AOS). Read this, then `GOAL.md`.

## What this repo is

AOS is the owner's concept: an **Agentic Orchestration System**, an ultra-customizable, self-improving harness for prolonged, continuous, autonomous work, with established hierarchy prompt presets. The README is written by the owner, not by AI. Do not rewrite it.

AOS is **direction, not a spec**. The code being built lives in the sibling repo **ACS** (`anon5376/agent-communication-system`, binary `qagent`). Sessions started here analyse ACS, propose improvements, and implement them there. Take AOS's ideas conceptually (hierarchy presets, self-improvement, long-running autonomy, deep customization); never copy it literally, and never describe ACS as "AOS".

Where things live:

| Thing | Location |
|---|---|
| The bigger goal for ACS work | `GOAL.md` (this repo) |
| ACS checkout | `$ACS_DIR` (set by the SessionStart hook), else `../agent-communication-system` |
| ACS design docs | `PRODUCT.md`, `DESIGN.md`, `docs/V2-DESIGN.md`, `docs/architecture.md`, `docs/competitive-analysis.md`, `docs/standout-features.md`, `protocol/PROTOCOL.md`, `CHANGELOG.md` (`[Unreleased]` is the real current state) |
| Phase 1 proposals and decisions | `proposals/` in this repo (AOS), one markdown file per proposal; this is the only place planning files are allowed, so they survive between sessions |

## Two implementations

ACS exists twice, on one SQLite schema, sharing `bus.db`, tokens and signal files:

- **TypeScript** on `main`: the npm package, MCP server, supervisor, web dashboard.
- **Rust** on branch `rust-port` (`rust/`, crate `acs`, bins `acs`, `acs-app`, `qagent`; ratatui TUI, ~4 MB binary, per its README). The `acs` TUI is the surface the owner cares about most and the README hero GIF comes from it. It is **not stale**: never propose deleting it, and read `rust-port` before judging ACS's UI.

Rules: schema and protocol changes must keep both implementations compatible (migration plus a cross-implementation test); say which implementation a change targets; a feature that exists in only one is a gap to report. Which one is canonical long-term is an **open decision for the owner**; until decided, treat the TS schema (`src/core/db.ts`) as the reference.

## Standard: not another AI-slop agent TUI

The owner wants ACS to be genuinely good and unique, a harness people would seriously choose over Hermes Agent and the rest. Reject by default:

- generic chat-wrapper TUIs, ornamental dashboards, KPI tiles and gradients;
- features copied from competitors without a reason tied to ACS's own edge;
- README claims the code doesn't back, invented benchmarks, fake demo rosters;
- breadth over depth: one excellent, verified capability beats five sketches.

ACS's real edge (keep it, build on it): one SQLite file as durable bus, no daemon, vendor-neutral CLI agents behind adapters (including a Hermes adapter, `src/adapters.ts`), a real task lifecycle (claims, leases, review gates), the event log as the trace, and above all **independent review by a different model family with verdict-weighted routing** (`independentFamilyReview` in `src/provider-catalog.ts`, `src/router.ts`). Hermes grades its own work inside one loop; ACS can make "no model grades its own work" a guarantee. Every proposal must say which edge it strengthens, or why it earns a new one.

## UX bars (testable)

Surfaces: **CLI** for scripting, **TUI (`acs`)** for live operation, **web dashboard** for a glance. A UI change must meet these or say why not:

- one screen answers: what is stuck, what needs me, what it costs;
- fresh install to first accepted task in under 5 minutes;
- usable at 80x24, keyboard only;
- zero redraws while idle (measured, not assumed);
- every on-screen state links to an event sequence number;
- every UI PR carries a recording or screenshot.

## Working modes

Classify the request first. A question is not authorization to change anything.

- **Analyse / scan:** read-only. Report with `file:line` evidence, separate fact from inference.
- **Propose:** a ranked list: problem, evidence, change, cost, risk, how it would be verified. Stop there unless told to build.
- **Build:** smallest diff that satisfies the ask, in ACS, on a feature branch, as a PR. Never push to ACS's default branch, merge, publish to npm, or release without the owner's explicit word.

## ACS ground rules

- TypeScript ESM, Node >=22.13, npm. Dependencies are only `@modelcontextprotocol/sdk` and `zod`; **ask before adding any dependency**.
- `src/core/` imports nothing outside `core/`. Keep the coordination library free of supervisor, dashboard and adapter code.
- `dist/` is committed and must match the build (`npm run test:dist`): run `npm run build` and commit `dist/` with source changes.
- Do not run plain `npm install` in ACS; it rewrites `package-lock.json`. Use `npm install --no-save` (the hook does this).
- `DESIGN.md` (web dashboard: flat, no panels, no external assets, CSP nonce, one write) and `PRODUCT.md` conflict: PRODUCT.md still describes panels, rounded rows, a colour setting and drag-and-drop from the pre-V2 product, which `docs/architecture.md` lists as removed. **Default: `DESIGN.md` governs the web dashboard; PRODUCT.md's principles (start empty, no fake roster, state on screen matches the broker) stay binding, its UI details are stale.** Confirm with the owner before relying on this, and propose fixing PRODUCT.md.
- ACS `main` tracks the owner's `.claude/settings.json` (6180f2d): leave it alone.

## Verify before claiming done

From `$ACS_DIR`:

```
npx tsc --noEmit                                  # typecheck (no lint script exists)
npm run test:compile && mkdir -p dist-test && cp tests/fixtures/test-bus.config.json dist-test/agent-bus.config.json \
  && node --test --test-concurrency=1 --test-force-exit dist-test/tests/<file>.test.js   # one test file
npm test                                          # full gate: build, dist check, unit, browser, lifecycle
```

CI (`.github/workflows/universal-harness-ci.yml`) runs `npm ci`, `npm audit --audit-level=high`, `npm run audit:public`, then `npm test`; run the audits too before opening a PR. For `rust-port`, run `cargo test` and `cargo clippy` in `rust/`.

The browser smoke test needs Chrome: the hook exports `CHROME_BIN` pointing at Playwright's Chromium when `google-chrome` is absent. `lsof` is optional (the loopback check in the dashboard smoke test is skipped without it); CI installs it.

Flakiness: the claim-race EPIPE in `core-claim` is already fixed (`tests/core-claim.test.ts`). The hard `<500 ms` asserts in `tests/wait-notify.test.ts` remain a risk. A red CI on a timing test is not proof your change is wrong, and not an excuse: reproduce, show it is pre-existing, then fix the timing rather than re-running until green. Never skip or disable a test.

## Research and web access

- Web access is pre-approved in `.claude/settings.json`. **If any approval prompt for web access still appears, stop web research immediately**, continue from the repos and what you know, and say so once. Never leave the owner clicking approvals.
- Prefer primary sources (official docs, repos, specs). Record URL and access date; mark unverified claims as such. Competitor stars and features change: re-check before quoting `docs/competitive-analysis.md`. Start Hermes work from ACS's own Hermes adapter (`src/adapters.ts`, `hermesAdapter`).

## Skills

Use when they fit: `deep-research` (competitors, protocols), `code-review` and `security-review` (before any PR), `simplify` (after a build), `skill-creator` (new reusable skills), `session-start-hook` (environment), `artifact-design` and `dataviz` (any shareable report or chart). Skip the `bio-research` plugin skills; they are irrelevant here.

## Conduct

- Lead with the outcome; be direct and dense. No filler, no repeated summaries.
- Make reversible assumptions and keep going; ask only when the answer changes the result.
- Don't add process the owner didn't ask for: no status logs, trackers, extra planning files. The one exception is `proposals/` (above), because Phase 1 output must outlive the session.
- Ask before: new dependencies, deleting material work, force-pushes, external messages, publishing, merging.
- Report failures exactly. Never claim something ran, passed or shipped without execution evidence.
- Commit trailers and PR attribution follow the session's instructions.
