# Usage: .venv/bin/python crop.py IN OUT [--rotate DEG] [--box X0 Y0 X1 Y1] [--size]
# Rotates first (counter-clockwise degrees, canvas expands), then crops to the box
# (pixels, in the rotated image). --size only prints the image size.
import sys, argparse
from PIL import Image
a = argparse.ArgumentParser(); a.add_argument("inp"); a.add_argument("out", nargs="?")
a.add_argument("--rotate", type=float, default=0); a.add_argument("--box", type=int, nargs=4); a.add_argument("--size", action="store_true")
o = a.parse_args()
im = Image.open(o.inp).convert("RGB")
if o.size: print(im.size); sys.exit()
if o.rotate: im = im.rotate(o.rotate, expand=True, resample=Image.BICUBIC, fillcolor=(255, 255, 255))
if o.box: im = im.crop(tuple(o.box))
im.save(o.out, quality=90); print(o.out, im.size)
