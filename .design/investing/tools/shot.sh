#!/bin/bash
# One-shot headless Chrome screenshot of a local HTML file (no server).
#   bash .design/investing/tools/shot.sh <in.html> <out.png> [width] [height]
set -euo pipefail
#   DARK=1 renders with prefers-color-scheme: dark.
in="$1"; out="$2"; w="${3:-1440}"; h="${4:-900}"
dark=(); [ "${DARK:-}" = 1 ] && dark=(--force-dark-mode)
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new --disable-gpu --hide-scrollbars ${dark[@]+"${dark[@]}"} \
  --user-data-dir=/tmp/inv-shot-profile \
  --window-size="$w,$h" --virtual-time-budget="${BUDGET:-2000}" \
  --screenshot="$out" "file://$in" 2>/dev/null
ls -la "$out"
