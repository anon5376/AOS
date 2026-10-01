# Q05: Refresh `docs/competitive-analysis.md` with Hermes and re-check quoted figures

- **Edge or parity:** neither. Stale comparison.
- **Cost:** S.
- **Risk:** low.
- **Targets:** `docs/competitive-analysis.md`, `docs/standout-features.md` (text only).
- **Status:** proposed quick fix.

## Problem

The analysis never mentions Hermes Agent, which AOS names as the main reference, and its pitch ("positioning gaps") treats single-agent frameworks as the competition. Hermes now ships a multi-agent Kanban board with a dispatcher, worktrees and a review stage, so several rows are out of date for the product ACS is actually compared with. Star counts are quoted from August and September.

## Evidence

- `grep -n -i hermes docs/competitive-analysis.md` returns nothing; the file's scope line is "multi-agent orchestration frameworks, agent control planes, and lightweight/CLI local coordination tools" (`docs/competitive-analysis.md:3`).
- "Behind: no built-in git worktree/workspace isolation" (`docs/competitive-analysis.md:46`) will be wrong once PR #17 merges, and Hermes's `worktree` workspace kind (`kanban.md:133-137`, per `hermes-delta.md` row 3) is a direct comparison missing from the table.
- "Different: ... independent review gates" (`:45`) is addressed by Q02.
- `docs/standout-features.md` recommends features already built (stalled detection, trace, roster: `CHANGELOG.md` `[Unreleased]`) as future work and quotes third-party issue threads and blog posts as evidence; the rest of the repo's docs do not need to be changed, but the file is marked a positioning draft.
- A dated, sourced comparison now exists in this PR: `proposals/hermes-delta.md` (Hermes `e8c97320`, read from a clone), and it is explicit that the two products overlap on board, dispatcher and review only, and that Hermes calls non-Hermes CLI lanes "not yet a paved path" (`kanban-worker-lanes.md:119-125`).

## Change

1. Add Hermes Agent as a row, built from `hermes-delta.md` (what overlaps, what does not, with doc paths), with the access date and commit hash in the row.
2. Update the "Behind" and "Different" bullets to the Hermes-aware versions: remove "single-agent" assumptions, label worktrees and stall handling as parity once shipped, keep the heterogeneous-CLI bus and path-lease claim as the distinguishing points, each marked as hypothesis where the delta says so.
3. Re-check star counts and dates on the day of the edit from the repositories themselves; replace any figure that cannot be re-checked with "unverified" and the access date. The delta records 250.4k stars and 53.6k forks for Hermes from GitHub on 2026-10-01 (read by the AOS PR #1 reviewer; not independently re-fetched here).
4. At the top of `docs/standout-features.md`, add a note stating which recommended items now exist (stalled, trace, roster, registry manifests) and which are still open.

## Cost

An afternoon with web access to refresh numbers; the Hermes content already exists in `hermes-delta.md`.

## Risk

Competitor numbers go stale within weeks; each quoted figure carries its access date so staleness is visible. Do not copy the delta's inferences into a public doc without the FACT/INFER labels.

## How it is verified

- Every Hermes statement in the doc has a path into the Hermes repo and a commit hash; a reviewer spot-checks five of them against a clone.
- `npm run audit:public` passes (docs-only).
- `grep -n "unverified" docs/competitive-analysis.md` lists the figures that could not be re-checked.
