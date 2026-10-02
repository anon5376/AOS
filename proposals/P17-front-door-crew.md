# P17: aos as the front door: a crew on first run, goals in plain words

Status: **built as draft ACS PR #26** (base `rust-port`), waiting for the owner's word. Written 2026-10-02.
Targets the Rust implementation (`rust/`, binary `aos`). Bus schema and protocol are unchanged.

## Problem

Before #26, nobody but a developer could run ACS. To get agents working you had to:

1. hand-write a harness config, with providers, harnesses, and models carrying ten capability numbers each;
2. run `qagent agent add` once per agent;
3. start one `qagent supervise` per agent, each in its own terminal;
4. type `task add`.

Installing also needed a Rust toolchain. Agents were sent the bus brief and nothing else: no role, no way of working. `aos` drew the bus well, but it could not start anything.

## How the others feel (bounded comparison, 2026-10-02)

Sources:

- Hermes Agent at `54bc5e5` (`website/docs/`, `scripts/install.sh`, `hermes_cli/main.py`);
- Codex CLI at `9d2b603` (README, `docs/install.md`, `codex-rs/`);
- Claude Code docs at code.claude.com/docs/en/{setup, quickstart, settings, permission-modes, sub-agents}.

[F] means stated in the source. [I] means my inference.

| | Hermes Agent | Claude Code | Codex CLI |
|---|---|---|---|
| Install | `curl … \| bash`. Builds from source: it clones the repo, then pins uv, Python, Node, ripgrep, FFmpeg and Chromium [F] | `curl … \| bash`. Native binary that updates itself [F] | `curl … \| sh`. Static Rust binary, downloaded from a CDN with GitHub as fallback [F] |
| First run | "isn't configured yet … Run: hermes setup", then `[Y/n]`. Without a TTY it exits 1 [F] | Browser login [F] | Onboarding screen for sign-in, then "Trust and continue" for the repo [F] |
| Daily loop | REPL or TUI, slash commands, approvals `smart`/`manual`/`off` [F] | Full-screen TUI, permission modes, `claude -p` [F] | TUI, approval and sandbox as separate settings, `codex exec --json` [F] |
| Editable presets | `SOUL.md`, personalities, `skills/*/SKILL.md` [F] | `.claude/agents/*.md` with frontmatter [F] | `agents/*.toml` roles, profiles [F] |
| Doctor | `hermes doctor`, exits 0 or 1 [F] | `claude doctor` [F] | `codex doctor --json`, one fix per failure [F] |
| Many agents | Kanban board on SQLite with a dispatcher. Its docs say external CLIs as workers are "not yet a paved path" [F] | Subagents and agent teams, inside one vendor [F] | `/agents`, cloud tasks, inside one vendor [F] |

All three get you from install to typing in about a minute, and each is built around one vendor's agent. None of them runs a team made of *different* vendors' CLIs. None has a vendor-independent reviewer. None ties evidence and cost to a task across vendors [I, from the docs above].

## Our own way

ACS is not another chat loop. It is mission control for a team of the agent CLIs you already use:

- **A crew, not a chat.** You type a goal. A lead plans it, a builder does it, a reviewer checks it, and the result comes back to *your* gate. Nothing is accepted without you.
- **Independent review by default.** With two CLIs installed, the reviewer comes from a different model family than the builder. This is a crew-composition default, not the removed router. Whether it catches more defects is still P03's hypothesis to test on the benchmark.
- **Evidence and cost on one screen.** Results, checks, stalls and reported spend are all read from the bus and session files, never estimated.
- **Plain files you own.** The crew, role prompts and mission templates are Markdown and JSON in `~/.agent-bus/aos/`. Editing them is the configuration.

Comfort features copied where they are table stakes (PARITY):

- a one-line installer that downloads a prebuilt binary;
- a first-run screen that detects what is installed;
- a trust question before agents touch a folder;
- `doctor` that exits 1, with one fix per failure;
- one command for everything, with `aos fix …` from the shell.

## What #26 builds

- **Detection** of Claude Code, Codex CLI and Cursor CLI, the three CLIs whose adapters pass the bus tools on every turn. It also lists the CLIs it found that cannot join a crew yet.
- **Default crew**: lead, builder, reviewer, written as `crew.json` in the `qagent supervise --config` format.
- **Role prompts** (`roles/*.md`). The supervisor sends each agent its prompt before the brief on every turn, with `{team}` filled in.
- **Mission templates** (`missions/*.md`: run, build, fix, research, review, explain, docs). Any file you add becomes a command.
- **Command home**:
  - a sentence becomes a goal after one Enter;
  - a mission word expands its template;
  - `start`, `stop agents`, `setup`, `doctor`, `missions`, `crew`.
- **Supervisors** run detached, so they survive leaving aos. The trust question is asked once per folder, and aos refuses to start agents in `~` or `/`.
- **Truer screens**:
  - stopped agents show as stopped right away;
  - cost comes from the CLIs' reports;
  - a lead waiting on busy children is not flagged as stuck.
- **Install**: `install.sh` plus a workflow that builds static Linux and macOS binaries and publishes them on an `aos-v*` tag.

## Edge or parity

Installer, first run, doctor and trust are PARITY. The cross-vendor crew with a different-family reviewer, the mission files, and the evidence gate are the claimed **edge**. The edge is a hypothesis until P01's benchmark shows that arm B beats arm A.

## Cost and risk

Cost was L: about 2,700 added lines in `rust/` (code, tests, prompt and mission files), plus the installer and the workflow. Risks:

- Medium: the Codex and Cursor crews ran only through their existing adapter invocations and were not tested with the real CLIs.
- Agents run with each adapter's permissive flags, for example Codex `--dangerously-bypass-approvals-and-sandbox`, which was already true of `qagent supervise`. The trust question makes this explicit; it does not sandbox anything.

## How it was verified

- `cargo test` passes, including 6 new crew tests.
- An end-to-end run in a fresh HOME at 80x24: welcome, a typed goal, trust, then lead, builder and reviewer, then accepted at the gate, then `aos stop`. A stand-in CLI played the agents through the real supervisors.
- One real Claude Code turn as the lead ($0.05, as the CLI reported).
- Installer paths: no Rust, building from source, a simulated download, and a bad checksum.

## Added after the first draft (same PR)

- `resume` (also from the shell): starts any stopped crew members, and they carry on with the open goal. When aos opens on an open goal with a stopped crew, it says so.
- `history`: your last 12 goals, each as open, at your gate, done, failed or stopped.
- Command home suggests matching commands and missions while you type the first word. `tab` completes, `/help` works, and up and down bring back earlier lines across restarts.

These are PARITY with `claude --continue`, `codex resume` and their slash menus.

## Not built: Gemini and Hermes in a crew

Both can get the bus tools without touching the user's project folder [F, from their source]:

- **Gemini CLI** (`fb972b2`) reads an extra settings file named by `GEMINI_CLI_SYSTEM_SETTINGS_PATH` and shallow-merges its `mcpServers` over the user's. A per-agent file therefore gives each agent its own identity. In an untrusted folder it forces approval mode back to `default`, which `GEMINI_CLI_TRUST_WORKSPACE=true` lifts.
- **Hermes** (`54bc5e5`) has no per-run MCP flag. A dedicated profile would work: `hermes profile create aos --clone`, plus an `mcp_servers` entry whose env uses `${QAGENT_AGENT_ID}`, which Hermes fills in from the process env. `--clone` does not copy OAuth sign-ins, so some users would sign in once more for that profile.

I did not build either. Setting up a CLI to run unattended with auto-approval and bus tools, without the user present, was stopped by this session's safety check. It needs the owner's explicit go-ahead. Neither was tested with the real CLI.

## Built after the first draft: pause, resume and budgets

There are new verbs in both implementations: `qagent agent pause <id> [reason]`, `agent resume <id>`, and `agent budget <id> [--turns N] [--minutes N] [--usd N] [--clear]`. In `aos` they are `pause`, `resume <agent>` and `budget <agent|all> 20 turns 60 min $2`.

- **Storage:** both are kept in `agents.meta_json` as `paused` and `budget`, rather than in the new column and table this proposal first sketched. There is no schema change, so the TypeScript and Rust sides share them as they are. `scripts/v2-interop-smoke.mjs` checks that each side reads what the other wrote.
- **Pause:** the supervisor checks before every turn. A paused agent finishes the turn it is in and then starts no new one. Its mail stays unread, and a claim it holds lapses at its lease.
- **Budget:** a budget counts turns, the minutes the CLI ran, and dollars as the CLI reported them, from the time it was set. A CLI that reports no cost counts as $0, so only turns and minutes are dependable for every CLI. `aos` says this on screen.
- **Reaching a budget:** the supervisor pauses the agent and writes to the operator. Resuming starts a fresh allowance of the same size.

Verified with the stand-in CLI only, through both supervisors' tests and a full `aos` run.

## Decisions for the owner

1. Merge #26, then push a tag `aos-v0.1.0`, so `install.sh` downloads binaries instead of building them.
2. Whether `aos` stays the name of the front door, and whether Rust stays the front-door implementation. Both were taken as defaults.
3. Whether to wire bus tools into the OpenCode, Kimi and Grok adapters so they can join a crew.
4. Port `instructions` (role prompts) to the TypeScript supervisor for parity.
5. Whether to build Gemini and Hermes crew support as described above. Both would run with auto-approval.
