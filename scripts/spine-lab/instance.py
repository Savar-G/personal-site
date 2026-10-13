# Usage: instance.py SRC.woff2 OUTDIR NAME -> static TTFs at each 100 weight in the wght range
import sys, os
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
src, out, name = sys.argv[1:4]
os.makedirs(out, exist_ok=True)
f = TTFont(src)
if "fvar" not in f:
    f.flavor = None; f.save(os.path.join(out, f"{name}.ttf")); print("static", name); sys.exit()
axes = {a.axisTag: a for a in f["fvar"].axes}
w = axes.get("wght")
lo, hi = (int(w.minValue), int(w.maxValue)) if w else (400, 400)
for wt in range(100, 1000, 100):
    if wt < lo or wt > hi: continue
    g = TTFont(src)
    loc = {t: (wt if t == "wght" else a.defaultValue) for t, a in axes.items()}
    inst = instantiateVariableFont(g, loc)
    inst.flavor = None
    inst["OS/2"].usWeightClass = wt
    inst.save(os.path.join(out, f"{name}-{wt}.ttf"))
print(name, lo, hi)
