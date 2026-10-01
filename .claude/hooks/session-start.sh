#!/bin/bash
# SessionStart hook for Claude Code on the web. Prepares ACS (the codebase AOS sessions work on).
# Idempotent: safe on resume/compact (it only re-exports the same variables).
set -uo pipefail

[ "${CLAUDE_CODE_REMOTE:-}" = "true" ] || exit 0

is_acs() { [ -f "$1/package.json" ] && grep -q '"name": *"agent-communication-system"' "$1/package.json"; }

proj="${CLAUDE_PROJECT_DIR:-$PWD}"
acs=""
if [ -n "${ACS_DIR:-}" ]; then
  if is_acs "$ACS_DIR"; then acs="$(cd "$ACS_DIR" && pwd)"
  else echo "AOS hook: ACS_DIR=$ACS_DIR is not an agent-communication-system checkout; skipping setup."; exit 0; fi
else
  for d in "$proj/../agent-communication-system" "$HOME/agent-communication-system" \
           /home/user/agent-communication-system /home/claude/agent-communication-system; do
    if is_acs "$d"; then acs="$(cd "$d" && pwd)"; break; fi
  done
fi

if [ -z "$acs" ]; then
  echo "AOS hook: ACS (agent-communication-system) is not attached to this session; skipping setup."
  exit 0
fi

[ -n "${CLAUDE_ENV_FILE:-}" ] && printf 'export ACS_DIR=%q\n' "$acs" >> "$CLAUDE_ENV_FILE"

node_ok=$(node -e 'const [a,b]=process.versions.node.split(".").map(Number);console.log(a>22||(a===22&&b>=13)?"yes":"no")' 2>/dev/null || echo missing)
[ "$node_ok" = "yes" ] || echo "AOS hook: WARNING Node >=22.13 required, found: $(node -v 2>/dev/null || echo none)"

# --no-save: plain `npm install` rewrites ACS's package-lock.json (adds a root "license" field).
log="${TMPDIR:-/tmp}/aos-hook-npm.log"
if (cd "$acs" && npm install --no-audit --no-fund --no-save >"$log" 2>&1); then
  deps="deps installed"
else
  deps="npm install FAILED, see $log"
fi

chrome=""
for b in google-chrome google-chrome-stable chromium chromium-browser; do
  command -v "$b" >/dev/null 2>&1 && { chrome="$(command -v "$b")"; break; }
done
if [ -z "$chrome" ]; then
  for b in "${PLAYWRIGHT_BROWSERS_PATH:-/opt/pw-browsers}"/chromium-*/chrome-linux/chrome; do
    [ -x "$b" ] && { chrome="$b"; break; }
  done
  [ -n "$chrome" ] && [ -n "${CLAUDE_ENV_FILE:-}" ] && printf 'export CHROME_BIN=%q\n' "$chrome" >> "$CLAUDE_ENV_FILE"
fi

shallow=""
[ "$(git -C "$acs" rev-parse --is-shallow-repository 2>/dev/null)" = "true" ] && shallow="shallow clone; "
git -C "$acs" rev-parse --verify -q origin/rust-port >/dev/null 2>&1 || shallow="${shallow}rust-port not fetched; "

echo "AOS hook: ACS at $acs ($deps)."
echo "  chrome: ${chrome:-MISSING (browser smoke test will fail)}"
echo "  lsof:   $(command -v lsof || echo 'missing (optional; loopback check is skipped)')"
echo "  cargo:  $(command -v cargo || echo 'missing (only needed for rust-port)')"
[ -n "$shallow" ] && echo "  note:   ${shallow%; } (see AGENTS.md for fetch commands)"
exit 0
