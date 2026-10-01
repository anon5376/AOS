#!/bin/bash
# SessionStart hook for Claude Code on the web. Prepares ACS (the codebase AOS sessions work on).
set -euo pipefail

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

# --no-save: plain `npm install` rewrites ACS's package-lock.json (adds a root "license" field).
(cd "$acs" && npm install --no-audit --no-fund --no-save >/dev/null)

[ -n "${CLAUDE_ENV_FILE:-}" ] && echo "export ACS_DIR=\"$acs\"" >> "$CLAUDE_ENV_FILE"

chrome=""
for b in google-chrome google-chrome-stable chromium chromium-browser; do
  command -v "$b" >/dev/null 2>&1 && { chrome="$(command -v "$b")"; break; }
done
if [ -z "$chrome" ]; then
  for b in /opt/pw-browsers/chromium-*/chrome-linux/chrome; do [ -x "$b" ] && chrome="$b"; done
  [ -n "$chrome" ] && [ -n "${CLAUDE_ENV_FILE:-}" ] && echo "export CHROME_BIN=\"$chrome\"" >> "$CLAUDE_ENV_FILE"
fi

echo "AOS hook: ACS ready at $acs (deps installed)."
echo "  chrome: ${chrome:-MISSING (browser smoke test will fail)}"
echo "  lsof:   $(command -v lsof || echo 'MISSING (lifecycle smoke test will fail)')"
