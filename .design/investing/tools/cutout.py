# Cut the glass piggy bank (r1/C.jpg) out of its white background for the desk.
#   /tmp/inv-venv/bin/python .design/investing/tools/cutout.py <src.jpg> <out.webp> <preview-dir>
#
# The glass is clear, so its inside shows the white studio background. Keeping that
# white inside the silhouette is the "light fill" (DESIGN.md D1): in dark mode the
# piggy stays a light glass object instead of letting the page show through.
# Silhouette: every pixel that is not near-white, closed and hole-filled. Outside it,
# the grey studio shadow is rebuilt as black at alpha = (255 - lum) / 255.
import sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

src, out, prev = sys.argv[1], sys.argv[2], sys.argv[3]
GRAD = float(sys.argv[4]) if len(sys.argv) > 4 else 40  # edge strength on the 0-255 Sobel scale
CLOSE = int(sys.argv[5]) if len(sys.argv) > 5 else 20  # px of closing; bridges gaps in the outline
im = Image.open(src).convert("RGB")
a = np.asarray(im).astype(np.float32)
lum = a @ np.array([0.2126, 0.7152, 0.0722], np.float32)
sat = a.max(2) - a.min(2)

# Object pixels: sharp edges. The glass outline is faint but crisp; the studio shadow
# is a smooth gradient, so edge strength separates them where brightness cannot.
smooth = ndi.gaussian_filter(lum, 1.0)
grad = np.hypot(ndi.sobel(smooth, 0), ndi.sobel(smooth, 1))
ink = (grad > GRAD) | (sat > 40)
body = ndi.binary_closing(ink, structure=np.ones((3, 3)), iterations=CLOSE)
body = ndi.binary_fill_holes(body)
Image.fromarray((ink * 255).astype(np.uint8)).resize((512, 512)).save(f"{prev}/cut-ink.png")
# Keep the largest piece only (stray specks in the backdrop).
lab, n = ndi.label(body)
if n > 1:
    sizes = ndi.sum(body, lab, range(1, n + 1))
    body = lab == (1 + int(np.argmax(sizes)))
body = ndi.binary_erosion(body, iterations=2)

# Soft 1-2 px edge.
edge = ndi.gaussian_filter(body.astype(np.float32), 1.2)

# Shadow outside the body: darkness of the backdrop, as black.
shadow = np.clip((250 - lum) / 250, 0, 1) * 0.9
shadow = ndi.gaussian_filter(shadow, 1.5)

alpha = np.maximum(edge, shadow * (1 - edge))
rgb = a * edge[..., None]  # body keeps its colour; shadow is black
rgba = np.dstack([rgb, alpha * 255]).clip(0, 255).astype(np.uint8)
img = Image.fromarray(rgba, "RGBA")

# Trim to content with a small margin, then size for the desk (2x of ~260 px).
ys, xs = np.where(alpha > 0.02)
pad = 12
box = (max(xs.min() - pad, 0), max(ys.min() - pad, 0), min(xs.max() + pad, img.width), min(ys.max() + pad, img.height))
img = img.crop(box)
img.thumbnail((640, 640), Image.LANCZOS)
img.save(out, "WEBP", quality=86, method=6)

for name, bg in (("white", (255, 255, 255)), ("dark", (24, 24, 27))):
    base = Image.new("RGBA", img.size, bg + (255,))
    Image.alpha_composite(base, img).convert("RGB").save(f"{prev}/cut-{name}.jpg", quality=88)
Image.fromarray((np.asarray(img)[..., 3])).save(f"{prev}/cut-alpha.png")
print(out, img.size)
