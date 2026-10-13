# Usage: .venv/bin/python vsheet.py OUT slug... -> one image of each out/<slug>-vs.png (or out/<slug>.png) side by side
import sys
from PIL import Image, ImageDraw
out, slugs = sys.argv[1], sys.argv[2:]
H = 900; ims = []
import os
for s in slugs:
    f = f"out/{s}-vs.png" if os.path.exists(f"out/{s}-vs.png") else f"out/{s}.png"
    im = Image.open(f).convert("RGB"); ims.append((s, im.resize((int(im.width * H / im.height), H))))
W = sum(i.width + 16 for _, i in ims)
sh = Image.new("RGB", (W, H + 30), "white"); d = ImageDraw.Draw(sh); x = 0
for s, im in ims: sh.paste(im, (x, 30)); d.text((x + 4, 6), s, fill="black"); x += im.width + 16
sh.save(out, quality=88); print(out, sh.size)
