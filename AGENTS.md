# AGENTS.md

Instructions for AI agents working from this repository (AOS). Read this, then `GOAL.md`.

## What this repo is

AOS is the owner's concept: an **Agentic Orchestration System**, an ultra-customizable, self-improving harness for prolonged, continuous, autonomous work, with established hierarchy prompt presets. The README is written by the owner, not by AI. Do not rewrite it.

`MANIFESTO.md` states the principles (research first, self-organizing swarm, scale with coordination, everything configurable, one engine for CLI and dashboard, knowledge left behind, accountable autonomy). Read it before proposing anything; where it and the code disagree, the manifesto is the direction and the gap is a proposal.

AOS is **direction, not a spec**. The code being built lives in the sibling repo **ACS** (`anon5376/agent-communication-system`, binary `qagent`). Sessions started here analyse ACS, propose improvements, and implement them there. Take AOS's ideas conceptually (hierarchy presets, self-improvement, long-running autonomy, deep customization); never copy it literally, and never describe ACS as "AOS".

Where things live:

| Thing | Location |
|---|---|
| The bigger goal for ACS work | `GOAL.md` (this repo) |
| Principles | `MANIFESTO.md` (this repo) |
| ACS checkout | `$ACS_DIR` (set by the SessionStart hook), else `../agent-communication-system` |
| ACS design docs (on ACS `main`) | `PRODUCT.md`, `DESIGN.md`, `docs/V2-DESIGN.md`, `docs/architecture.md`, `docs/competitive-analysis.md` (does not cover Hermes), `docs/standout-features.md`, `protocol/PROTOCOL.md`, `CHANGELOG.md` (`[Unreleased]` is the unreleased state of `main`) |
| Proposals | `proposals/` in this repo (AOS); see "Proposals workflow" |

ACS clones in sessions can be shallow and main-only. Fetch what you need: `git -C "$ACS_DIR" fetch --unshallow origin; git -C "$ACS_DIR" fetch origin rust-port pull/17/head:pr-17` (or GitHub MCP `get_file_contents` with `ref=rust-port`).

## Proposals workflow

Phase 1 output must outlive the container, so it is committed. Commit to a `claude/proposals-*` branch of AOS, one file per proposal in `proposals/`, plus `proposals/README.md` as the ranked index (id, title, edge, cost, risk, status). Open or update one draft PR on AOS. The owner picks by commenting on the PR or the index; each picked proposal then gets its own `/goal` (a green PR in ACS plus a before/after on the benchmark). `proposals/` is the only place planning files are allowed.

## Two implementations

ACS exists twice, on one SQLite schema, sharing `bus.db`, tokens and signal files:

- **TypeScript** on `main`: the npm package, MCP server, supervisor, web dashboard.
- **Rust** on branch `rust-port` (`rust/`, crate `acs`, bins `acs`, `acs-app`, `qagent`; ratatui TUI, a small single binary). The `acs` TUI is the surface the owner cares about most and the README hero GIF comes from it. It is **not stale**: never propose deleting it, and read `rust-port` before judging ACS's UI.

Rules: schema and protocol changes must keep both implementations compatible (migration plus `node scripts/v2-interop-smoke.mjs`, the cross-implementation test that CI runs on `rust-port`); say which implementation a change targets; a feature that exists in only one is a gap to report. Which one is canonical long-term is an **open decision for the owner**; until decided, treat the TS schema (`src/core/db.ts`) as the reference.

## Standard: not another AI-slop agent TUI

The owner wants ACS to be genuinely good and unique, a harness people would seriously choose over Hermes Agent and the rest. Reject by default:

- generic chat-wrapper TUIs, ornamental dashboards, KPI tiles and gradients;
- features copied from competitors without a reason tied to ACS's own edge;
- README claims the code doesn't back, invented benchmarks, fake demo rosters;
- breadth over depth: one excellent, verified capability beats five sketches.

ACS's real assets: one SQLite file as durable bus, no daemon, vendor-neutral CLI agents behind adapters (including a Hermes adapter, `src/adapters.ts`), a task lifecycle (claims, leases, review gates), the event log as the trace. **Today** the review gate blocks only self-review (`src/core/bus.ts:982`); it never checks model family. Family-diverse routing (`independentFamilyReview` in `src/provider-catalog.ts`, `routeTask` in `src/router.ts:295`) is reached only by tests, and V2 deliberately removed the router from the coordination path (`docs/architecture.md`, "What was removed"). So cross-family review is a **proposed edge, not a shipped one**; any proposal building on it must say why V2 removed the router and what is different now. Hermes now ships its own multi-agent Kanban board (see `GOAL.md`), so single-agent-loop comparisons are out of date. Every proposal must say which edge it strengthens, or why it earns a new one, and label parity work as parity.

## UX bars (testable)

Surfaces: **CLI** for scripting, **TUI (`acs`)** for live operation, **web dashboard** for structure (task tree, graph, board, timeline) and control, all on one state, as `MANIFESTO.md` requires. A UI change must meet these or say why not:

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
- `DESIGN.md` governs **visual language** (flat, no ornament, CSP nonce, no external assets). Its **scope limits** (a single write action, no charts or graphs, "does one thing") are superseded by `MANIFESTO.md` (task trees, graphs, boards, timelines; inspect, redirect, pause, resume from the dashboard). Propose a `DESIGN.md` amendment rather than silently breaking it. `PRODUCT.md` still describes pre-V2 panels, rounded rows, a colour setting and drag-and-drop (`docs/architecture.md` lists the old product as removed): its principles (no fake agents in production config, state on screen matches the broker) stay binding, its UI details are stale. Shipping default presets is allowed (manifesto: "useful defaults"); fake agents in production config are not.
- ACS `main` tracks the owner's `.claude/settings.json` (6180f2d): leave it alone.

## Verify before claiming done

From `$ACS_DIR`:

```
npx tsc --noEmit                                  # typecheck (no lint script exists)
npm run test:compile && mkdir -p dist-test && cp tests/fixtures/test-bus.config.json dist-test/agent-bus.config.json \
  && node --test --test-concurrency=1 --test-force-exit dist-test/tests/<file>.test.js   # one test file
npm test                                          # full gate: build, dist check, unit, browser, lifecycle
```

CI (`.github/workflows/universal-harness-ci.yml`) runs `npm ci`, `npm audit --audit-level=high`, `npm run audit:public`, `npm test`; run the audits too before opening a PR. On `rust-port` CI also runs `cargo build --manifest-path rust/Cargo.toml` then `node scripts/v2-interop-smoke.mjs`, and a separate job `cargo test --manifest-path rust/Cargo.toml`. `cargo clippy` is advisory (not a CI gate).

The browser smoke test needs Chrome: the hook exports `CHROME_BIN` pointing at Playwright's Chromium when `google-chrome` is absent. `lsof` is optional (the loopback check in the dashboard smoke test is skipped without it); CI only asserts it is installed.

Flakiness: the claim-race EPIPE in `core-claim` is already fixed (`tests/core-claim.test.ts`). The hard `<500 ms` asserts in `tests/wait-notify.test.ts` remain a risk. A red CI on a timing test is not proof your change is wrong, and not an excuse: reproduce, show it is pre-existing, then fix the timing rather than re-running until green. Never skip or disable a test.

## Research and web access

- Hermes research: shallow-clone `NousResearch/hermes-agent` and read `website/docs/` and the source; record the commit hash. Don't rely on search snippets.
- Web access is pre-approved in `.claude/settings.json`. **If any approval prompt for web access still appears, stop web research immediately**, continue from the repos and what you know, and say so once. Never leave the owner clicking approvals.
- Prefer primary sources (official docs, repos, specs). Record URL and access date; mark unverified claims as such. Competitor stars and features change: re-check before quoting `docs/competitive-analysis.md`. Start Hermes work from ACS's own Hermes adapter (`src/adapters.ts`, `hermesAdapter`).

## Skills

Use when they fit: `anthropic-skills:deep-research` (competitors, protocols), `code-review` and `security-review` (before any PR), `simplify` (after a build), `anthropic-skills:skill-creator` (new reusable skills), `session-start-hook` (environment), `artifact-design` and `dataviz` (any shareable report or chart).

## Conduct

- Lead with the outcome; be direct and dense. No filler, no repeated summaries.
- Make reversible assumptions and keep going; ask only when the answer changes the result.
- Don't add process the owner didn't ask for: no status logs, trackers, extra planning files. The one exception is `proposals/` (above), because Phase 1 output must outlive the session.
- Self-improvement features need operator consent or an explicit policy, versioning and rollback; never let an agent expand its own authority.
- Ask before: new dependencies, deleting material work, force-pushes, external messages, publishing, merging.
- Report failures exactly. Never claim something ran, passed or shipped without execution evidence.
