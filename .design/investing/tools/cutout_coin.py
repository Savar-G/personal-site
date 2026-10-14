# Cut the loonie (r1/loonie.jpg) out of its white background: gold pixels, hole-filled.
#   /tmp/inv-venv/bin/python .design/investing/tools/cutout_coin.py <src.jpg> <out.webp>
import sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

im = Image.open(sys.argv[1]).convert("RGB")
a = np.asarray(im).astype(np.float32)
sat = a.max(2) - a.min(2)
coin = ndi.binary_fill_holes(ndi.binary_closing(sat > 40, iterations=4))
lab, n = ndi.label(coin)
coin = lab == (1 + int(np.argmax(ndi.sum(coin, lab, range(1, n + 1)))))
coin = ndi.binary_erosion(coin, iterations=2)
alpha = ndi.gaussian_filter(coin.astype(np.float32), 1.0)
img = Image.fromarray(np.dstack([a, alpha * 255]).clip(0, 255).astype(np.uint8), "RGBA")
ys, xs = np.where(alpha > 0.02)
img = img.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
img.thumbnail((256, 256), Image.LANCZOS)
img.save(sys.argv[2], "WEBP", quality=88, method=6)
print(sys.argv[2], img.size)
