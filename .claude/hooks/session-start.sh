#!/bin/bash
# SessionStart hook for Claude Code on the web. Prepares ACS (the codebase AOS sessions work on).
set -uo pipefail

[ "${CLAUDE_CODE_REMOTE:-}" = "true" ] || exit 0

proj="${CLAUDE_PROJECT_DIR:-$PWD}"
acs=""
for d in "${ACS_DIR:-}" "$proj/../agent-communication-system" "$HOME/agent-communication-system" \
         /home/user/agent-communication-system /home/claude/agent-communication-system; do
  if [ -n "$d" ] && [ -f "$d/package.json" ]; then acs="$(cd "$d" && pwd)"; break; fi
done

if [ -z "$acs" ]; then
  echo "AOS hook: ACS (agent-communication-system) is not attached to this session; skipping setup."
  exit 0
fi

[ -n "${CLAUDE_ENV_FILE:-}" ] && echo "export ACS_DIR=\"$acs\"" >> "$CLAUDE_ENV_FILE"

node_ok=$(node -e 'const [a,b]=process.versions.node.split(".").map(Number);console.log(a>22||(a===22&&b>=13)?"yes":"no")' 2>/dev/null || echo missing)
[ "$node_ok" = "yes" ] || echo "AOS hook: WARNING Node >=22.13 required, found: $(node -v 2>/dev/null || echo none)"

# --no-save: plain `npm install` rewrites ACS's package-lock.json (adds a root "license" field).
if (cd "$acs" && npm install --no-audit --no-fund --no-save >/dev/null 2>&1); then
  deps="deps installed"
else
  deps="npm install FAILED (run it by hand in $acs)"
fi

chrome=""
for b in google-chrome google-chrome-stable chromium chromium-browser; do
  command -v "$b" >/dev/null 2>&1 && { chrome="$(command -v "$b")"; break; }
done
if [ -z "$chrome" ]; then
  for b in "${PLAYWRIGHT_BROWSERS_PATH:-/opt/pw-browsers}"/chromium-*/chrome-linux/chrome; do
    [ -x "$b" ] && { chrome="$b"; break; }
  done
  [ -n "$chrome" ] && [ -n "${CLAUDE_ENV_FILE:-}" ] && echo "export CHROME_BIN=\"$chrome\"" >> "$CLAUDE_ENV_FILE"
fi

echo "AOS hook: ACS at $acs ($deps)."
echo "  chrome: ${chrome:-MISSING (browser smoke test will fail)}"
echo "  lsof:   $(command -v lsof || echo 'missing (optional; loopback check is skipped)')"
exit 0
