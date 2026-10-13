"""Round 2: refinements of A2 (Plop). Run: /tmp/fvenv/bin/python .design/icon/tools/gen_r2.py"""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gen import svg, render, INK, BLUE, HL, ROOT

OUT = os.path.join(ROOT, ".design/icon/r2")
os.makedirs(OUT, exist_ok=True)
COFFEE = "#160b06"


def plop(sw=2.6, tile=None, drop=COFFEE, motion=True, k=1.0, cube=0.86):
    """The A2 scene. k scales the scene about the centre (to sit inside a tile)."""
    bg = f'<rect x="2" y="2" width="60" height="60" rx="15" fill="{tile}"/>' if tile else ""
    lines = f'<path d="M10 8 l3 5 M17 4 l1 5" fill="none" stroke-width="{sw * 0.85}"/>' if motion else ""
    ox = 5 + (0.86 - cube) * 32
    scene = f'''
<g stroke="{INK}" stroke-width="{sw}" stroke-linejoin="round" stroke-linecap="round">
  <ellipse cx="32" cy="50" rx="27" ry="10" fill="#fff"/>
  <ellipse cx="32" cy="49.5" rx="21" ry="6.6" fill="{COFFEE}" stroke-width="{sw * 0.77}"/>
  {lines}
  <g transform="translate({ox} {ox - 2 * (cube - 0.86) * 10}) rotate(-16 32 26) scale({cube})">
    <path d="M32 9 L50 18 L32 27 L14 18 Z" fill="#fff"/>
    <path d="M14 18 L32 27 L32 45 L14 36 Z" fill="#F1F1F3"/>
    <path d="M50 18 L32 27 L32 45 L50 36 Z" fill="#DCDCE1"/>
  </g>
</g>
<g fill="{drop}" stroke="{INK}" stroke-width="{sw * 0.62}">
  <path d="M9 36 q2.6 -6 5 0 a2.6 2.6 0 0 1 -5 0z" transform="rotate(-25 11.5 37)"/>
  <path d="M51 33 q2.6 -6 5 0 a2.6 2.6 0 0 1 -5 0z" transform="rotate(25 53.5 34)"/>
</g>'''
    if k != 1.0:
        scene = f'<g transform="translate(32 33) scale({k}) translate(-32 -32)">{scene}</g>'
    return svg(bg + scene)


V = [
    ("P1", "As picked", "A2 unchanged: cut-out, no tile.", plop()),
    ("P2", "Bold", "Thicker lines, bigger cube, no motion lines. Built to survive 16 px.",
     plop(sw=3.6, motion=False, cube=0.98)),
    ("P3", "Highlight tile", "Bold scene on the 'Savar.' highlight blue. Blue splash drops.",
     plop(sw=3.4, tile=HL, drop=BLUE, motion=False, k=0.84, cube=0.98)),
    ("P4", "Blue tile", "Bold scene on brand blue. The strongest colour in a row of tabs.",
     plop(sw=3.4, tile=BLUE, drop="#fff", motion=False, k=0.84, cube=0.98)),
]

for id, name, note, s in V:
    p = os.path.join(OUT, f"{id}.svg")
    open(p, "w").write(s)
    for z in (16, 32, 180):
        render(p, z, os.path.join(OUT, f"{id}-{z}.png"))
json.dump({"round": 2, "decision": "Final form of A2 (Plop)", "primary_axis": "small-size weight + backing tile",
           "options": [dict(id=i, name=n, note=t, artifact=f"{i}.svg") for i, n, t, _ in V]},
          open(os.path.join(OUT, "manifest.json"), "w"), indent=2)
print("ok", OUT)
