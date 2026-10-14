#!/bin/sh
# Renders .design/og/card.html to app/opengraph-image.jpg (1200x630) with headless Chrome.
# Opens the file directly; no server. Needs network for the Google Fonts.
set -e
root=$(cd "$(dirname "$0")/../../.." && pwd)
chrome="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
tmp=$(mktemp -d)
"$chrome" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
  --window-size=1200,630 --virtual-time-budget=8000 \
  --user-data-dir="$tmp/profile" --screenshot="$tmp/og.png" \
  "file://$root/.design/og/card.html" </dev/null >/dev/null 2>&1
sips -s format jpeg -s formatOptions 88 "$tmp/og.png" --out "$root/app/opengraph-image.jpg" >/dev/null
sips -g pixelWidth -g pixelHeight "$root/app/opengraph-image.jpg" | tail -2
ls -l "$root/app/opengraph-image.jpg" | awk '{print $5 " bytes"}'
rm -rf "$tmp"
