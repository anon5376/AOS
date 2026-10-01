# Q01: README tells users to install a package that does not exist

- **Edge or parity:** neither. A claim the code (the registry) does not back.
- **Cost:** S (text only).
- **Risk:** low.
- **Targets:** TypeScript `main` docs. No code, no schema.
- **Status:** proposed quick fix. Publishing to npm is NOT part of this and needs the owner's explicit word.

## Problem

The README's first install instruction fails. `npm install -g agent-communication-system` returns 404 because the package was never published; `0.2.0` exists only as a git tag. `CHANGELOG.md` calls `0.2.0` "First public release". This fails the "fresh install to first accepted task in under 5 minutes" bar at step one and contradicts AGENTS.md's rule against README claims the code does not back.

## Evidence

- `README.md:30-34`: "Install globally, or run straight through `npx`: `npm install -g agent-communication-system`; `npx -p agent-communication-system qagent <command>`".
- Registry check on 2026-10-01: `curl https://registry.npmjs.org/agent-communication-system` returns HTTP 404 (and `npm view` returned 404 in the AOS PR #1 review).
- `git tag` in the ACS clone lists only `v0.2.0`; `package.json` has `"version": "0.2.0"` and no `private` field (publishing was prepared, not done).
- `CHANGELOG.md:44-46`, `## [0.2.0] — 2026-09-30`: "First public release."
- The repo's own docs say publish is pending: `docs/promotion-playbook.md:8` ("not on npm... Install is clone, `npm ci`, `npm run build`, `npm link`"), `docs/marketing-strategy.md:72` (`npm publish` unchecked), `docs/submission-pack.md:202` ("submit only after `npm publish`").
- Other docs repeat the install line: `docs/submission-pack.md:31`, `docs/releasing.md:32`.

## Change

1. README Quick start leads with the working path: clone, `npm ci`, `npm run build`, `npm link` (the block currently labelled "Building from source instead"). Keep the `npm install -g` / `npx` lines but under a clearly marked "After the first npm release" note, or remove them until publish. Do not leave a command that is known to fail as the first instruction.
2. `CHANGELOG.md`: reword the `0.2.0` heading text from "First public release" to state what is true ("Tagged on GitHub; not yet published to npm"), or move it after publish. Keep the entries.
3. Leave `docs/submission-pack.md` and `docs/releasing.md` as they are (they describe the post-publish state and say so), but add a one-line "after publish" qualifier where they present the command as available now.
4. Add `scripts/check-readme-install.mjs` (or a step in `audit:public`) that fails if the README's first install command names the package while `npm view` is 404 and the version is not marked released. Offline-safe: guard on an env var so CI without network does not fail.

## Cost

Under an hour: edits to README, CHANGELOG, one small check.

## Risk

Low. The one trap: reverting to "from source first" lowers the pitch's polish; that is the honest cost until publish, and publish is the owner's decision.

## How it is verified

- On a clean clone, the README's first block runs as written: `npm ci && npm run build && npm link && qagent init` succeeds (command and exit status recorded in the PR).
- The check script is red on `main` today and green after the change.
- Benchmark task I01 in `benchmark.md` is this fix (red/green validator included).
