# Q04: README on `main` shows a TUI it cannot run and misstates the adapter list

- **Edge or parity:** neither. README claims the code on that branch does not back.
- **Cost:** S (text only).
- **Risk:** low.
- **Targets:** `main` README and docs; `rust-port` README for the size figure.
- **Status:** proposed quick fix.

## Problem

The README on `main` opens with a GIF titled "acs terminal UI demo", but `main` contains no TUI. The `acs` binary exists only on the `rust-port` branch, and the `main` README never says how to get it. The feature list on the same README names six harnesses while the code ships more (and calls one of them by a name that is not an adapter). These are small, but the owner flagged exactly this class of claim, and the TUI is the surface they care about most: the front door should say which implementation shows it.

## Evidence

- `README.md:9`: `![acs terminal UI demo](docs/assets/acs-demo.gif)`; the GIF is committed at `docs/assets/acs-demo.gif`. `grep -rn "ratatui\|\"acs\"" src package.json` on `main` returns nothing; `package.json` has no `acs` bin. The TUI is `rust/src/app.rs` on `rust-port` (bins `acs` and `acs-app`, `rust/Cargo.toml`).
- The `main` README has no section that mentions installing or running `acs`; its install section is npm only (`README.md:29-48`).
- `README.md:24`: "Harness adapters for Claude Code, Codex, Gemini, Kimi, OpenCode, and OpenAI-compatible CLIs." The adapter table in code is `claude`, `codex`, `kimi`, `gemini`, `cursor`, `grok`, `opencode`, `hermes`, `fake`, `command` (`src/adapters.ts:570-581`). Cursor, Grok and Hermes are missing from the README; "OpenAI-compatible CLIs" is not an adapter but a standalone CLI usable through `command` (`package.json:25`, `src/openai-compatible-harness.ts`).
- `docs/competitive-analysis.md:44` repeats "a ~4MB dependency-free Rust binary with a TUI" as a *Different* strength; `rust-port`'s root README says ~4 MB while `rust/README.md:79` says ~5 MB (AOS PR #1 review, F15). Neither figure was measured in this scan.
- `CHANGELOG.md` `[Unreleased]` lists stalled-task detection, `trace` and `supervise --roster` as unreleased `main` features; the Rust branch has stalled, requeue and trace but not `--roster` (`rust/src/cli.rs:953-980`), so "both implementations" is not true for all of them.

## Change

1. README: caption the GIF "`acs` TUI (Rust, `rust-port` branch; not part of the npm package)" and add a short "Terminal UI" section: how to build it (the `rust-port` README commands) and that it shares `bus.db` with the TypeScript `qagent`.
2. README:24: list the adapters that exist and are tested; say "or any CLI through the `command` adapter" instead of "OpenAI-compatible CLIs".
3. Replace "~4 MB" in `competitive-analysis.md` and the `rust-port` README with a measured figure (`cargo build --release`, then `ls -l`), recorded with the target and Rust version, or drop the number.
4. Add a short "implementation differences" table to `docs/FULL-GUIDE.md` (TS vs Rust: roster supervisor, worktrees if PR #17 merges, TUI, router) so a parity gap reads as a gap, per AOS rules. Source of the table: `proposals/` scan notes and `hermes-delta.md` section 5.

## Cost

An hour of text edits and one `cargo build --release` for the size.

## Risk

Low. The table in step 4 will go stale; mark it with the commit it was written against and have P02's CI job fail when a command exists in only one implementation without an entry.

## How it is verified

- Every adapter named in the README exists in `ADAPTERS` (a script compares the README list to `Object.keys(ADAPTERS)` and runs in `audit:public`).
- The TUI caption and section render and their links resolve (link check).
- The size figure in the docs equals the measured one (command and output in the PR).
