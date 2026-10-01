# P15: Configuration surface: a knob audit, real consumers, approval rules, auth and a native-harness slot

- **Edge or parity:** PARITY on breadth of configuration (Hermes: dozens of providers, OAuth logins, MCP client with per-tool selection, plugins, approval modes; `hermes-delta.md` rows 10, 11, 18). ACS's version is deliberately narrower (it is a bus under other vendors' CLIs and does not log in to model providers). The edge to protect is honesty: no knob without a consumer.
- **Cost:** M.
- **Risk:** low-medium; deleting a documented knob breaks someone's config, so deprecate with a warning first.
- **Targets:** both (the Rust config silently ignores unknown and untyped keys); TypeScript adapters.
- **Status:** proposed.
- **Depends on:** P06 and P07 give several knobs their consumers; this proposal audits the rest.

## Problem

MANIFESTO: "tweak everything" (roles, prompts, models, harnesses, routing, tools, skills, plugins, MCP servers, budgets, memory, approval rules), with defaults and clear interfaces, supported authentication methods and room for a native harness. AOS's rule: "every knob has a default and a documented interface; no knob without a consumer". Today many declared knobs have no consumer, and the Rust side accepts anything without complaint, so a misspelt key looks like it worked.

## Evidence

- Knobs read only by config validation or by test-reached code (grep over `src/`, ACS `6180f2d`):
  - no runtime consumer: `constraints.maxDelegationDepth`, `maxConcurrentTasks`, `defaultWriteScopes`, `optionalTokenBudget`, `optionalApiCostBudgetUSD`, `enrollmentTtlSeconds`, `independentReviewComplexity`, `maxRetries` (config value; task creation hard-codes `?? 2`, `src/core/bus.ts:794`), per-agent `allowedPaths`, `allowedChildAgentIds` (`src/config.ts:89-97`, `:144-153`; defaults `src/provider-catalog.ts:313-322`);
  - `isolation` has a consumer only if PR #17 merges (`path-locks | worktree | none`);
  - test-reached only (router): `permittedProviders`, `permittedFamilies`, `preferSubscription`, role policies and the ten routing weights (`src/router.ts:155-270`, `:295`);
  - displayed only: `canDelegate`, `canReview` (`src/mcp/render.ts:18`).
- Rust: `roles`, `routing`, `constraints`, per-agent `permissions` and `capabilities` are untyped `serde_json::Value`, never consumed at runtime; `deny_unknown_fields` is absent, so mistyped keys are silently ignored (`rust/src/config.rs:72`, `:103`, `:107`, `:125-129`; scan section 6). PR #17's `isolation: "worktree"` would load and be ignored in Rust.
- Approval rules are delegated to each harness, and one adapter hard-codes the permissive choice: the Hermes adapter always passes `--yolo` (`src/adapters.ts:514`). No config field selects an approval posture.
- Authentication: ACS does not authenticate to model providers; the harness CLI owns login, and the catalog only records how (`authKind`, `loginCommand`, `installHint`: `src/config.ts:39`, `src/provider-catalog.ts`, `docs/provider-support.md`). That is a legitimate design; it needs to be stated, with the supported methods listed per harness.
- A native-harness slot partly exists: the `HarnessAdapter` interface (`id`, `prepare`, `build`, `parse`; `src/adapters.ts:62-67`), a generic `command` adapter for custom CLIs (`src/adapters.ts:173-190`, `:580`), and a one-shot OpenAI-compatible CLI of 87 lines run through it (`src/openai-compatible-harness.ts`, `package.json:25`). There is no documented contract or conformance test for a new adapter.
- Adapters drop things the manifesto lists: MCP servers are only injected as ACS's own server (`qagent mcp-config`, `src/mcp/config.ts`); there is no per-agent list of extra MCP servers, skills or plugins. Cursor and opencode adapters already write per-agent config into the workdir (`src/adapters.ts:384-385`, `:461`), so a consumer for extra MCP servers is a few lines there.

## Change

1. **Knob audit as a test and a doc.** `docs/configuration.md` generated from the types: every field, default, who consumes it (file:line), and status `live`, `advisory` or `dead`. A test fails when a field in `config.ts` has no consumer and is not marked `deprecated`. Dead knobs get one of three fates, decided with the owner per knob: wire it (budgets, depth, concurrency via P06/P07), deprecate with a startup warning, or remove.
2. **Reject unknown keys.** Rust config parsing becomes typed for the fields above and warns (then errors in `qagent doctor --strict`) on unknown keys; TS validation does the same. A mistyped `optionalApiCostBudgetUsd` no longer passes silently.
3. **Approval posture as config.** A per-agent `approval` field (`ask | auto-safe | yolo`, default `ask`) that adapters map to their harness flags where they exist (for example the Hermes `--yolo`, Claude Code permission modes, Codex approval policy). An adapter that cannot honour a posture says so in `doctor`. The Hermes adapter stops hard-coding `--yolo`.
4. **Extra MCP servers and instructions per agent**, only where a consumer exists: `harnessOptions.mcpServers` written by the adapters that already write config (`cursor`, `opencode`) and passed through `--mcp-config`-style flags where the harness has them. Skills and plugins stay out until a harness-neutral meaning exists; do not invent one.
5. **Auth statement.** `docs/provider-support.md` gets a table: per harness, supported login methods (subscription login, API key env var, local) and what ACS scrubs from the child environment (`docs/security.md:45`). `qagent doctor` checks that the chosen method is available and says which env var or login it will use, without printing secrets.
6. **Native-harness contract.** Document the `HarnessAdapter` contract (inputs, session resume, usage reporting with `null` for unknown cost per P05, malformed handling) and add `tests/adapter-conformance.test.ts` run against `fake` and `command` (with the OpenAI-compatible CLI as its fixture); a native harness later is an adapter that passes it.

## Cost

Audit test and generated doc: small. Typed Rust config and strict mode: about 200 lines. Approval mapping: a few lines per adapter plus docs. The decisions about each dead knob are the owner's.

## Risk

- **Breaking existing configs** by rejecting unknown keys or removing fields: warn first, strict opt-in, remove only in a minor release with CHANGELOG notes.
- **Approval posture is safety-relevant:** defaulting to `ask` may stall unattended runs that today run with `--yolo`. State the behaviour change clearly; the default for the Hermes adapter changes, and the benchmark config sets `auto-safe` or `yolo` explicitly and records it.
- **Knob creep:** every added field needs a consumer in the same PR (the audit test enforces it).
- **Adapter fidelity:** flag names differ by CLI version; conformance tests use the fake CLI and do not prove behaviour against real vendors.

## How it is verified

- The audit test: red on `main` today for the dead knobs listed, green after each is wired, deprecated or removed.
- Unknown-key tests in TS and Rust: a typo produces a warning naming the key and the nearest valid one; strict mode errors.
- Adapter tests: `approval: ask` for Hermes no longer passes `--yolo` (argument snapshot); `yolo` does.
- Conformance suite passes for the fake and command adapters.
- Benchmark: the run's `MANIFEST.json` records approval posture and every non-default knob, so arms are comparable (P01).
