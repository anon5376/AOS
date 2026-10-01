# Q02: Docs say "independent review" while the gate only blocks self-review

- **Edge or parity:** neither. A claim the code does not back (until P03 ships).
- **Cost:** S (text only).
- **Risk:** low.
- **Targets:** TypeScript `main` docs; Rust branch README if it repeats it.
- **Status:** proposed quick fix. Becomes true, and can be restored, if P03 lands in `enforce` mode.

## Problem

README, the competitive analysis and the free-tier guide describe review as "independent", and the guide says independent review *requires* a different model family. The code enforces only that the assignee cannot accept its own work. A reviewer of the same family, or the creator who is the same model as the worker, passes the gate, and the operator can bypass it. The claim is strongest where AOS wants ACS to be most credible.

## Evidence

- `README.md:22`: "...progress notes, submission, and independent review."
- `docs/competitive-analysis.md:45`: "...progress, submission, independent review gates" listed as a *Different* strength.
- `docs/free-ai-setup.md:285-286` (the phrase is on line 286): "add a `reviewer` agent on a **different model family** than the workers (independent review requires it)". Nothing in the bus requires it.
- The gate, for comparison: reviewer must be `task.reviewer ?? task.creator` or the operator; the assignee cannot review; operator bypasses both (`src/core/bus.ts:979-982`). No family check anywhere in either implementation (`src/core/bus.ts`, `rust/src/bus.rs:1883-1888`). The family-aware router is reached only by tests (`src/router.ts:262-266`, `:295`) and V2 removed it from the coordination path (`docs/architecture.md:53`).
- `docs/standout-features.md` item 5 proposes headlining "review gates"; it should headline what is true.

## Change

Replace the word and the "requires" claim with accurate text, until P03 is shipped and on by default:

- README:22 → "...submission, and review by someone other than the assignee."
- competitive-analysis:45 → "review gates (the assignee cannot accept its own work; the operator can override)".
- free-ai-setup:285-286 → "adding a reviewer on a different model family is a good practice; ACS does not enforce it yet."
- Add one sentence to `docs/security.md` under "residual risks": the review gate prevents self-acceptance by identity, not by model family, and the operator can override it.

No behavioural change.

## Cost

Four small text edits.

## Risk

Low. It makes the pitch more modest. When P03 ships, restore the stronger wording with a link to the enforcing test.

## How it is verified

- `grep -rn "independent review" README.md docs/ CHANGELOG.md` returns only statements that match the shipped gate (reviewed by hand, listed in the PR).
- `npm run audit:public` still passes (docs-only change).
- The sentence added to `docs/security.md` cites the gate by file and line.
