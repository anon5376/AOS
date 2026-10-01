# P06: Enforce delegation limits in core and ship versioned presets in TypeScript

- **Edge or parity:** foundation, partial PARITY. Hermes has delegation depth, concurrency and iteration caps (`hermes-delta.md` row 7). ACS's own gap is that these limits are declared and not enforced.
- **Cost:** M.
- **Risk:** medium: tightening permissions changes behaviour for existing buses.
- **Targets:** both (core enforcement in `src/core/bus.ts` and `rust/src/bus.rs`; presets as shared JSON data).
- **Status:** proposed.
- **Depends on:** P02 only if a column is added (it is not needed for the minimum slice).

## Problem

The config declares who may delegate, to whom, how deep and how many tasks an agent may hold at once. The bus ignores all of it. A worker can create tasks for anyone, a manager can claim unlimited tasks, and delegation depth is unbounded. Preset prompts exist only in the Rust TUI's first-run wizard, hard-coded, so TypeScript users and the dashboard have no equivalent and nothing is versioned.

## Evidence

- Declared, unenforced: `AgentPermissions.maxDelegationDepth`, `allowedChildAgentIds` (`src/config.ts:94`, `:97`), `BusConstraints.maxDelegationDepth`, `maxConcurrentTasks` (`src/config.ts:144-145`). A grep over `src/` finds them only in `config.ts` (validation at `:247`, `:267-268`) and in `provider-catalog.ts` (defaults). Rust parses `constraints` and `permissions` as untyped `serde_json::Value` and never consumes them (`rust/src/config.rs:103`, `:129`; scan notes section 6).
- Persisted permissions are two booleans, `canDelegate` and `canReview`, defaulted by authority (`src/core/identity.ts:97-125`). `createTask` checks neither: it validates strings, assignee existence and dependencies only (`src/core/bus.ts:779-826`). `reviewTask` checks the reviewer id, not `canReview` (`:979-982`). The two booleans appear only in the MCP brief text (`src/mcp/render.ts:18`) and in router scoring (`src/router.ts:155`, `:257`).
- `claimTask` has no per-agent concurrency check (`src/core/bus.ts:828-880`). `tasks.parent_id` exists (`src/core/db.ts:38`) so depth is computable.
- Presets: four charters hard-coded in the TUI wizard, `planner`, `lead`, `worker-hard`, `worker-easy` (`rust/src/app.rs:179-258`, applied at `:378`). They hard-code `qagent` CLI syntax, name no model, harness or budget, and carry no version. TypeScript has no equivalent. PRODUCT.md says no fake agents in production config; shipping default presets is allowed (MANIFESTO: "useful defaults").

## Change

1. **Typed permissions in the bus.** Extend the identity `permissions_json` (already JSON, no migration) with `maxDelegationDepth`, `allowedChildAgentIds`, `maxConcurrentTasks`; defaults by authority match today's values (workers cannot delegate, depth from `constraints`, concurrency from `constraints`).
2. **Enforce in `createTask`:** require `canDelegate`; if `allowedChildAgentIds` is non-empty, `to` must be listed; depth is the length of the `parent_id` chain and must not exceed `maxDelegationDepth`. **In `claimTask`:** refuse beyond `maxConcurrentTasks` held tasks. **In `reviewTask`:** require `canReview` unless operator. All refusals are `forbidden`/`conflict` errors that name the limit and where it is set.
3. **Roll-out:** new buses enforce; existing buses are left alone until `qagent doctor --permissions` lists violations and the operator runs `qagent permissions enforce`, recorded as an event (P08). No silent behaviour change.
4. **Presets as data.** A `presets/` directory of versioned JSON files (`id`, `version`, `charter`, role, authority, permissions, suggested harness/model tags but no concrete credentials). `qagent preset list|show|apply <id> [--dry-run]`; `apply` creates agents and writes briefs. The Rust TUI wizard reads the same files through `include_str!`, replacing the hard-coded consts. Charters stop hard-coding CLI syntax and refer to the MCP tools and the injected protocol block.
5. **Attribution:** `agents.meta_json` records `preset: "<id>@<version>"`; review events (P04) include it, so outcomes are attributable to a preset version, which P12 needs.
6. **Config to bus:** `qagent init --config <file>` copies `constraints` and per-agent `permissions` into identities, so the config knob has a consumer (P15).

## Cost

Core checks are about 80 lines per implementation; presets JSON plus loader about 150 lines TS and 60 Rust; tests. The behaviour change is the cost to communicate, not to write.

## Risk

- **Breakage:** pipelines where a worker creates follow-up tasks today would start failing. Hence roll-out step 3 and explicit errors.
- **Depth semantics:** `parent_id` is optional on tasks; an agent can avoid depth by not setting a parent. Define depth over the creator chain too (task created by an agent that is itself working task N counts as child of N) or admit the limit applies only to declared parents. Pick one and document it; the test pins the choice.
- **Preset sprawl:** four presets are enough to start. More must earn their place on the benchmark.
- **Fake agents:** `apply` must refuse when a preset names a harness or model the machine lacks, or leave the agent disabled; it must never write enabled agents that cannot run.

## How it is verified

- Core unit tests in both implementations: a worker with `canDelegate=false` cannot `createTask`; `allowedChildAgentIds` rejects an unlisted `to`; depth 5 rejected at limit 4; the fifth concurrent claim refused at limit 4; `canReview=false` agent refused review.
- Interop: the same refusals through the Rust CLI on a TS-created bus (`scripts/v2-interop-smoke.mjs`).
- `qagent preset apply planner --dry-run` prints the agents it would create and writes nothing; `apply` on a machine without the harness leaves the agent disabled.
- Test that every declared limit has a consumer (feeds P15's knob audit).
- Benchmark tasks I05, I06, I09 are slices of this proposal (`benchmark.md`).
