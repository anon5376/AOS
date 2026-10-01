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
| ACS design docs | `PRODUCT.md`, `DESIGN.md`, `docs/V2-DESIGN.md`, `docs/architecture.md`, `docs/competitive-analysis.md`, `docs/standout-features.md`, `protocol/PROTOCOL.md` |

## Standard: not another AI-slop agent TUI

The owner wants ACS to be genuinely good and unique, a harness people would seriously choose over Hermes Agent and the rest. Reject by default:

- generic chat-wrapper TUIs, ornamental dashboards, KPI tiles and gradients;
- features copied from competitors without a reason tied to ACS's own edge;
- README claims the code doesn't back, invented benchmarks, fake demo rosters;
- breadth over depth: one excellent, verified capability beats five sketches.

ACS's real edge (keep it, build on it): one SQLite file as durable bus, no daemon, vendor-neutral CLI agents behind adapters, a real task lifecycle (claims, leases, review gates), the event log as the trace. Every proposal must say which of these it strengthens, or why it earns a new one.

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
- Dashboard rules in `DESIGN.md` (flat, no external assets, CSP nonce, one write) hold until the owner changes them; propose a change to `DESIGN.md` first if a feature needs to break one.
- Product principles in `PRODUCT.md` (start empty, no fake roster, state on screen matches the broker) are binding.
- Do not touch `.claude/` in ACS (gitignored there).

## Verify before claiming done

From `$ACS_DIR`:

```
npx tsc --noEmit                                  # typecheck (no lint script exists)
npm run test:compile && mkdir -p dist-test && cp tests/fixtures/test-bus.config.json dist-test/agent-bus.config.json \
  && node --test --test-concurrency=1 --test-force-exit dist-test/tests/<file>.test.js   # one test file
npm test                                          # full gate: build, dist check, unit, browser, lifecycle
```

The browser smoke test needs Chrome: the hook exports `CHROME_BIN` pointing at Playwright's Chromium when `google-chrome` is absent. The lifecycle test needs `lsof`.

Known flaky tests: claim-race EPIPE in `core-claim`, hard `<500 ms` asserts in `wait-notify`. A red CI on these is not proof your change is wrong, and not an excuse: reproduce, show the failure is pre-existing, then fix the test's timing or race rather than re-running until green. Never skip or disable a test.

## Research and web access

- Web access is pre-approved in `.claude/settings.json`. **If any approval prompt for web access still appears, stop web research immediately**, continue from the repos and what you know, and say so once. Never leave the owner clicking approvals.
- Prefer primary sources (official docs, repos, specs). Record URL and access date; mark unverified claims as such. Competitor stars and features change: re-check before quoting `docs/competitive-analysis.md`.

## Skills

Use when they fit: `deep-research` (competitors, protocols), `code-review` and `security-review` (before any PR), `simplify` (after a build), `skill-creator` (new reusable skills), `session-start-hook` (environment), `artifact-design` and `dataviz` (any shareable report or chart). Skip the `bio-research` plugin skills; they are irrelevant here.

## Conduct

- Lead with the outcome; be direct and dense. No filler, no repeated summaries.
- Make reversible assumptions and keep going; ask only when the answer changes the result.
- Don't add process the owner didn't ask for: no status logs, trackers, extra planning files.
- Ask before: new dependencies, deleting material work, force-pushes, external messages, publishing, merging.
- Report failures exactly. Never claim something ran, passed or shipped without execution evidence.
- Commit trailers and PR attribution follow the session's instructions.
