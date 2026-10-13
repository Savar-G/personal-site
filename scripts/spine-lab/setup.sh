#!/bin/sh
# One-time setup for the spine lab. Needs node, uv, and network access.
# Installs the canvas renderer, a Python venv (fonttools, brotli, pillow), and
# static weight instances of every site spine font (Skia ignores variable axes).
set -e
cd "$(dirname "$0")"
npm install --no-audit --no-fund --loglevel=error
[ -x .venv/bin/python ] || uv venv -q .venv
uv pip install -q --python .venv/bin/python fonttools brotli pillow
mkdir -p fonts-static specs refs refs-raw imgs out notes
for f in "../../app/(pages)/bookshelf/_fonts/"*.woff2; do
  .venv/bin/python instance.py "$f" fonts-static "$(basename "$f" .woff2)" >/dev/null
done
# Inter comes from next/font/google on the site, so fetch it for the lab.
[ -f fonts-static/inter-400.ttf ] || node getfont.mjs "Inter" >/dev/null
echo "spine lab ready: $(ls fonts-static | wc -l | tr -d ' ') font instances"
