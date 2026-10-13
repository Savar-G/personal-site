"""Generate icon candidates (SVG) for round r1, render PNGs, and build a comparison board.

Run with a python that has fonttools + brotli:
  /tmp/fvenv/bin/python .design/icon/tools/gen.py
"""
import base64, json, os, subprocess, sys
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.varLib import instancer

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
MEDIA = os.path.join(ROOT, ".next/static/media")
OUT = os.path.join(ROOT, ".design/icon/r1")
TOOLS = os.path.dirname(os.path.abspath(__file__))

FONTS = {
    "inter": "83afe278b6a6bb3c-s.p.0q-301v4kxxnr.woff2",
    "reenie": "abecc27c54fcd607-s.14pco0m3oplp7.woff2",
}
_cache = {}


def font(name, wght=None):
    key = (name, wght)
    if key not in _cache:
        f = TTFont(os.path.join(MEDIA, FONTS[name]))
        if wght is not None and "fvar" in f:
            f = instancer.instantiateVariableFont(f, {"wght": wght})
        _cache[key] = f
    return _cache[key]


def text_path(text, fname, size, cx, cy, wght=None, tracking=0.0):
    """Path for `text`, its ink box centred on (cx, cy). size = em size in px."""
    f = font(fname, wght)
    gs = f.getGlyphSet()
    cmap = f.getBestCmap()
    upm = f["head"].unitsPerEm
    s = size / upm
    # measure ink bounds
    bp = BoundsPen(gs)
    x = 0
    for ch in text:
        g = cmap[ord(ch)]
        gs[g].draw(TransformPen(bp, (1, 0, 0, 1, x, 0)))
        x += gs[g].width + tracking * upm
    xmin, ymin, xmax, ymax = bp.bounds
    ox = cx - (xmin + xmax) / 2 * s
    oy = cy + (ymin + ymax) / 2 * s
    sp = SVGPathPen(gs)
    x = 0
    for ch in text:
        g = cmap[ord(ch)]
        gs[g].draw(TransformPen(sp, (s, 0, 0, -s, ox + x * s, oy)))
        x += gs[g].width + tracking * upm
    return sp.getCommands()


def b64(path):
    with open(path, "rb") as fh:
        return base64.b64encode(fh.read()).decode()


def svg(body, vb=64, extra=""):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" '
            f'viewBox="0 0 {vb} {vb}" width="{vb}" height="{vb}" {extra}>{body}</svg>')


def pixel(rows, palette):
    """rows: list of 16-char strings. '.' = transparent."""
    out = []
    for y, row in enumerate(rows):
        assert len(row) == 16, (y, row, len(row))
        x = 0
        while x < 16:
            c = row[x]
            if c == ".":
                x += 1
                continue
            run = 1
            while x + run < 16 and row[x + run] == c:
                run += 1
            out.append(f'<rect x="{x}" y="{y}" width="{run}" height="1" fill="{palette[c]}"/>')
            x += run
    return svg("".join(out), 16, 'shape-rendering="crispEdges"')


ICONS = []


def icon(id, family, name, bet, risk):
    def deco(fn):
        ICONS.append(dict(id=id, family=family, name=name, bet=bet, risk=risk, fn=fn))
        return fn
    return deco


INK = "#18181B"
BLUE = "#2F66F0"
HL = "#E3ECFD"

# ---------------------------------------------------------------- A: desk objects

@icon("A1", "A · Desk object", "Black coffee",
      "The coffee-chat cup, top down. Every visitor already meets it on the desk.",
      "At 16px it is a white disc with a dark centre; could read as a generic 'record' or 'eye'.")
def a1():
    return svg(f'''
<defs>
  <radialGradient id="cf" cx="0.42" cy="0.38" r="0.7">
    <stop offset="0" stop-color="#3a2416"/><stop offset="0.55" stop-color="#160b06"/><stop offset="1" stop-color="#0b0503"/>
  </radialGradient>
  <linearGradient id="sp" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4f4f5"/><stop offset="1" stop-color="#8f9096"/></linearGradient>
</defs>
<ellipse cx="33" cy="35" rx="29" ry="28" fill="#000" opacity="0.10"/>
<circle cx="32" cy="33" r="28" fill="#fff" stroke="#D4D4D8" stroke-width="1.2"/>
<circle cx="32" cy="33" r="21" fill="none" stroke="#EDEDF0" stroke-width="1.2"/>
<g transform="rotate(-38 30 31)"><rect x="44" y="26" width="13" height="8" rx="4" fill="#fff" stroke="#C9C9CF" stroke-width="1.4"/></g>
<g transform="rotate(42 14 44)"><ellipse cx="14" cy="38" rx="4.2" ry="6" fill="url(#sp)" stroke="#9a9ba1" stroke-width="0.8"/><rect x="12.9" y="43" width="2.2" height="17" rx="1.1" fill="url(#sp)" stroke="#9a9ba1" stroke-width="0.6"/></g>
<circle cx="30" cy="31" r="18.5" fill="#fff" stroke="#C9C9CF" stroke-width="1.6"/>
<circle cx="30" cy="31" r="14.6" fill="#B98552"/>
<circle cx="30" cy="31" r="13.2" fill="url(#cf)"/>
<ellipse cx="25.5" cy="26.5" rx="3.6" ry="2" fill="#fff" opacity="0.18" transform="rotate(-35 25.5 26.5)"/>
''')


@icon("A2", "A · Desk object", "Plop",
      "The sugar cube mid-drop, drawn in the cartoon style of the splash. Playful and ownable.",
      "Cartoon line style is new to the site's photographic desk; the cube alone reads as 'a box'.")
def a2():
    return svg(f'''
<g stroke="{INK}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round">
  <ellipse cx="32" cy="50" rx="27" ry="10" fill="#fff"/>
  <ellipse cx="32" cy="49.5" rx="21" ry="6.6" fill="#160b06" stroke-width="2"/>
  <path d="M10 8 l3 5 M17 4 l1 5" fill="none" stroke-width="2.2"/>
  <g transform="translate(5 5) rotate(-16 32 26) scale(0.86)">
    <path d="M32 9 L50 18 L32 27 L14 18 Z" fill="#fff"/>
    <path d="M14 18 L32 27 L32 45 L14 36 Z" fill="#F1F1F3"/>
    <path d="M50 18 L32 27 L32 45 L50 36 Z" fill="#DCDCE1"/>
  </g>
</g>
<g fill="#160b06" stroke="{INK}" stroke-width="1.6">
  <path d="M9 36 q2.6 -6 5 0 a2.6 2.6 0 0 1 -5 0z" transform="rotate(-25 11.5 37)"/>
  <path d="M51 33 q2.6 -6 5 0 a2.6 2.6 0 0 1 -5 0z" transform="rotate(25 53.5 34)"/>
</g>
''')


@icon("A3", "A · Desk object", "Polaroid",
      "A tilted polaroid holding your own Cappadocia photo. Real media, not an illustration.",
      "A photo turns to colour noise at 16px; it only shines at 180px (home screen).")
def a3():
    png = os.path.join(TOOLS, "trip_cappadocia.png")
    if not os.path.exists(png):
        subprocess.run(["sips", "-s", "format", "png", os.path.join(ROOT, "public/desk/trip_cappadocia.webp"),
                        "--out", png], check=True, capture_output=True)
    img = b64(png)
    return svg(f'''
<defs><clipPath id="ph"><rect x="15" y="10" width="34" height="34"/></clipPath>
<filter id="sh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="1.6" stdDeviation="1.8" flood-opacity="0.28"/></filter></defs>
<g transform="rotate(-8 32 32)">
  <rect x="11" y="6" width="42" height="52" rx="1.5" fill="#FCFCFA" filter="url(#sh)"/>
  <image href="data:image/png;base64,{img}" xlink:href="data:image/png;base64,{img}" x="15" y="10" width="34" height="34" preserveAspectRatio="xMidYMid slice" clip-path="url(#ph)"/>
</g>
''')


# ---------------------------------------------------------------- B: signature type

@icon("B1", "B · Signature", "Savar. highlight",
      "Lifts the homepage's one brand moment: blue 'S.' on the highlighter, caught mid-beckon (-3°).",
      "Still a letter in a square. Closest to the current icon in kind, if not in feel.")
def b1():
    d = text_path("S.", "inter", 46, 32, 33, wght=700, tracking=-0.02)
    return svg(f'''
<rect x="2" y="2" width="60" height="60" rx="15" fill="{HL}"/>
<g transform="rotate(-3 32 32) translate(0 -1.5)"><path d="{d}" fill="{BLUE}"/></g>
''')


@icon("B2", "B · Signature", "Gel-pen s.",
      "A handwritten 's' in black gel ink on a notebook page: the pen you can pick up on the desk.",
      "Handwriting is thin; it needs a heavy stroke to survive at 16px and may look childish.")
def b2():
    d = text_path("s", "reenie", 92, 29, 32)
    return svg(f'''
<rect x="2" y="2" width="60" height="60" rx="13" fill="#FBF8F1" stroke="#E7E1D3" stroke-width="1"/>
<g stroke="#D9E3F5" stroke-width="1"><line x1="2" y1="20" x2="62" y2="20"/><line x1="2" y1="32" x2="62" y2="32"/><line x1="2" y1="44" x2="62" y2="44"/><line x1="2" y1="56" x2="62" y2="56"/></g>
<line x1="13" y1="2" x2="13" y2="62" stroke="#F3C9C9" stroke-width="1"/>
<path d="{d}" fill="{INK}" stroke="{INK}" stroke-width="3.2" stroke-linejoin="round"/>
<circle cx="48" cy="44.5" r="4.3" fill="{BLUE}"/>
''')


@icon("B3", "B · Signature", "Sticker",
      "'S.' as a die-cut vinyl sticker with a peeling corner.",
      "Peel detail is lost under 32px; at 16px it is B1 with a white edge.")
def b3():
    d = text_path("S.", "inter", 40, 31, 31, wght=800, tracking=-0.03)
    return svg(f'''
<defs><filter id="ss" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="1.5" stdDeviation="1.4" flood-opacity="0.25"/></filter></defs>
<g transform="rotate(-6 32 32)" filter="url(#ss)">
  <path d="M10 4 H54 a6 6 0 0 1 6 6 V44 L44 60 H10 a6 6 0 0 1 -6 -6 V10 a6 6 0 0 1 6 -6z" fill="#fff"/>
  <path d="M13 8 H51 a4 4 0 0 1 4 4 V41 L41 55 H13 a4 4 0 0 1 -4 -4 V12 a4 4 0 0 1 4 -4z" fill="{BLUE}"/>
  <path d="{d}" fill="#fff" transform="translate(1 -0.5)"/>
  <path d="M60 44 L44 60 Q46 47 60 44z" fill="#E4E4E7" stroke="#D4D4D8" stroke-width="0.6"/>
</g>
''')


# ---------------------------------------------------------------- C: pixel (RAZR world)

@icon("C1", "C · Pixel", "RAZR screen",
      "A pixel 'S' with a blinking-cursor bar on the RAZR's navy screen. Built on a 16px grid, so it is the sharpest option in a tab.",
      "Retro pixel is a known trope; it carries the RAZR, not Savar.")
def c1():
    rows = [
        "..nnnnnnnnnnnn..",
        ".nhhhhhhhhhhhhn.",
        "nnnnnnnnnnnnnnnn",
        "nnnnnnnnnnnnnnnn",
        "nnnwwwwwwnnnnnnn",
        "nnwwwwwwwwnnnnnn",
        "nnwwnnnnnnnnnnnn",
        "nnwwwwwwwnnnnnnn",
        "nnnwwwwwwwnnnnnn",
        "nnnnnnnnwwnnnnnn",
        "nnwwwwwwwwnnnnnn",
        "nnnwwwwwwnnnoonn",
        "nnnnnnnnnnnnoonn",
        "nnnnnnnnnnnnnnnn",
        ".nnnnnnnnnnnnnn.",
        "..nnnnnnnnnnnn..",
    ]
    return pixel(rows, {"n": "#0A1B3D", "h": "#2F6BD8", "w": "#FFFFFF", "o": "#F59E0B"})


@icon("C2", "C · Pixel", "Pixel ramen",
      "The Food object as 16x16 pixel art: bowl, egg, nori, chopsticks, steam. Warm and personal.",
      "Food icons are common on food sites; may say 'ramen blog' before it says 'Savar'.")
def c2():
    rows = [
        "...s...s........",
        "..s...s.......c.",
        "...s...s.....c.c",
        "..s...s.....c.c.",
        "...........c.c..",
        "..ggwwwbb.c.c...",
        ".oyywyywbbyyyyo.",
        ".orrrrrrrrrrrro.",
        ".orrwrrrrrrwrro.",
        "..orrrrrrrrrro..",
        "..orrrrrrrrrro..",
        "...orrrrrrrro...",
        "....oooooooo....",
        ".....oddddo.....",
        "....oooooooo....",
        "................",
    ]
    pal = {"s": "#A1A1AA", "c": "#9A6B3F", "g": "#4CAF50", "w": "#FFFFFF", "b": "#1F2A20",
           "y": "#F2B43C", "o": INK, "r": "#D9412B", "d": "#B5321F"}
    return pixel(rows, pal)


@icon("C3", "C · Pixel", "Pixel coffee",
      "The coffee cup as pixel art with rising steam: the coffee-chat invite in a 16px tile.",
      "Coffee-cup favicons exist (cafes, Java). Less unique than the top-down A1.")
def c3():
    rows = [
        "................",
        ".....s...s......",
        "....s...s.......",
        ".....s...s......",
        "....s...s.......",
        "................",
        "..oooooooooo....",
        "..owwwwwwwwooo..",
        "..owkkkkkkwo.o..",
        "..owwwwwwwwo.o..",
        "..owwwwwwwwooo..",
        "..owwwwwwwwo....",
        "...owwwwwwo.....",
        ".oooooooooooooo.",
        "..oppppppppppo..",
        "................",
    ]
    return pixel(rows, {"s": "#A1A1AA", "o": INK, "w": "#FFFFFF", "k": "#2A1810", "p": "#E4E4E7"})


# ---------------------------------------------------------------- D: hidden marks

@icon("D1", "D · Hidden mark", "Desk from above",
      "The whole homepage in miniature: notebook, folder, polaroid, and coffee scattered on a white desk.",
      "At 16px it is confetti. Meaning only lands for people who have seen the homepage.")
def d1():
    return svg(f'''
<rect x="2" y="2" width="60" height="60" rx="14" fill="#fff" stroke="#E4E4E7" stroke-width="1.2"/>
<g transform="rotate(-10 20 22)"><rect x="9" y="9" width="17" height="24" rx="2" fill="{INK}"/><rect x="22" y="9" width="1.6" height="24" fill="#3f3f46"/></g>
<g transform="rotate(8 44 20)"><rect x="34" y="11" width="22" height="16" rx="2" fill="{BLUE}"/><rect x="34" y="9" width="9" height="4" rx="1.4" fill="{BLUE}"/><rect x="36" y="9.5" width="18" height="3" fill="#fff"/></g>
<g transform="rotate(12 20 46)"><rect x="10" y="36" width="19" height="22" rx="1" fill="#fff" stroke="#D4D4D8" stroke-width="1"/><rect x="12.5" y="38.5" width="14" height="13" fill="#F59E0B"/><circle cx="19.5" cy="43" r="2.6" fill="#D9412B"/></g>
<circle cx="45" cy="45" r="11" fill="#fff" stroke="#C9C9CF" stroke-width="1.4"/>
<circle cx="45" cy="45" r="7.5" fill="#160b06"/>
''')


@icon("D2", "D · Hidden mark", "Coffee ring",
      "A coffee ring left on paper: proof someone sat and worked here. Quiet, editorial, unlike any other favicon.",
      "Could read as a stain or a broken circle; brown on cream has low contrast in dark tab bars.")
def d2():
    return svg(f'''
<defs><radialGradient id="rg" cx="0.5" cy="0.5" r="0.5">
  <stop offset="0.78" stop-color="#8B5A2B" stop-opacity="0.05"/>
  <stop offset="0.9" stop-color="#8B5A2B" stop-opacity="0.35"/>
  <stop offset="0.965" stop-color="#6B3F1A" stop-opacity="0.95"/>
  <stop offset="1" stop-color="#6B3F1A" stop-opacity="0"/>
</radialGradient></defs>
<rect x="2" y="2" width="60" height="60" rx="13" fill="#FBF8F1"/>
<circle cx="31" cy="33" r="22" fill="url(#rg)"/>
<path d="M31 11.5 a21.5 21.5 0 1 1 -18.6 10.7" fill="none" stroke="#5E3615" stroke-width="2.6" stroke-linecap="round" opacity="0.9"/>
<path d="M14 18 a21.5 21.5 0 0 1 9.6 -5.2" fill="none" stroke="#5E3615" stroke-width="1.4" stroke-linecap="round" opacity="0.45"/>
<circle cx="50.5" cy="14.5" r="2.4" fill="#6B3F1A" opacity="0.75"/>
<circle cx="55" cy="10.5" r="1.2" fill="#6B3F1A" opacity="0.6"/>
''')


@icon("D3", "D · Hidden mark", "Stirred S",
      "Black coffee from above with the spoon's stir trail forming an 'S'. A monogram you notice second.",
      "If the swirl is too subtle it is just a coffee; too strong and it is latte art (and you take it black).")
def d3():
    d = text_path("S", "inter", 40, 32, 32, wght=600)
    return svg(f'''
<defs><radialGradient id="c3" cx="0.4" cy="0.36" r="0.75"><stop offset="0" stop-color="#3a2416"/><stop offset="0.6" stop-color="#140a05"/><stop offset="1" stop-color="#0b0503"/></radialGradient></defs>
<circle cx="32" cy="32" r="30" fill="#fff" stroke="#D4D4D8" stroke-width="1.2"/>
<circle cx="32" cy="32" r="25.5" fill="#B98552"/>
<circle cx="32" cy="32" r="23.6" fill="url(#c3)"/>
<path d="{d}" fill="none" stroke="#C99A66" stroke-width="2.4" stroke-linejoin="round" opacity="0.95"/>
<ellipse cx="23" cy="21" rx="5" ry="2.4" fill="#fff" opacity="0.14" transform="rotate(-35 23 21)"/>
''')


# ---------------------------------------------------------------- render + board

def render(svg_path, size, out):
    subprocess.run(["rsvg-convert", "-w", str(size), "-h", str(size), svg_path, "-o", out], check=True)


def main():
    only = set(sys.argv[1:])
    manifest = {"round": 1, "decision": "What should the site icon be about, and in what style?",
                "primary_axis": "subject + rendering style",
                "invariants": ["site palette (#18181B, #2F66F0, #E3ECFD)", "same sizes: 16, 32, 180", "light + dark tab bars"],
                "options": []}
    cards = []
    for ic in ICONS:
        if only and ic["id"] not in only:
            continue
        sp = os.path.join(OUT, f'{ic["id"]}.svg')
        with open(sp, "w") as fh:
            fh.write(ic["fn"]())
        pngs = {}
        for s in (16, 32, 180):
            p = os.path.join(OUT, f'{ic["id"]}-{s}.png')
            render(sp, s, p)
            pngs[s] = b64(p)
        manifest["options"].append({k: ic[k] for k in ("id", "family", "name", "bet", "risk")} | {"artifact": f'{ic["id"]}.svg'})
        cards.append((ic, pngs))
    with open(os.path.join(OUT, "manifest.json"), "w") as fh:
        json.dump(manifest, fh, indent=2)

    def tab(pngs, dark):
        bg, fg, bar = ("#2B2B2F", "#E4E4E7", "#1C1C1F") if dark else ("#FFFFFF", "#18181B", "#E9E9EC")
        return (f'<div class="bar" style="background:{bar}"><div class="tab" style="background:{bg};color:{fg}">'
                f'<img src="data:image/png;base64,{pngs[32]}" width="16" height="16">Savar Gupta</div></div>')

    fams = {}
    for ic, pngs in cards:
        fams.setdefault(ic["family"], []).append((ic, pngs))
    html = ['''<!doctype html><meta charset="utf-8"><title>Site icon - round 1</title><style>
body{font:14px/1.45 Inter,system-ui,-apple-system,sans-serif;margin:0;padding:32px 40px 60px;background:#F7F7F8;color:#18181B}
h1{font-size:22px;margin:0 0 4px;letter-spacing:-.4px}.sub{color:#52525B;margin:0 0 28px}
h2{font-size:13px;text-transform:uppercase;letter-spacing:.08em;color:#71717A;margin:30px 0 12px}
.row{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
.card{background:#fff;border:1px solid #E4E4E7;border-radius:16px;padding:16px}
.top{display:flex;gap:16px;align-items:center}.big{width:112px;height:112px;border-radius:24px;background:#F4F4F5;display:grid;place-items:center}
.big img{width:96px;height:96px}.sizes{display:flex;gap:10px;align-items:end}.sizes img{display:block}.sizes figure{margin:0;text-align:center;font-size:10px;color:#A1A1AA}
.id{font-weight:600;font-size:15px}.id span{color:#2F66F0;margin-right:6px}
.bar{padding:6px 8px 0;border-radius:8px 8px 0 0;margin-top:10px}.tab{display:inline-flex;gap:8px;align-items:center;padding:7px 14px;border-radius:8px 8px 0 0;font-size:12px}
.bet{margin:12px 0 4px}.risk{color:#71717A;font-size:12.5px}
.dock{display:flex;gap:6px;margin-top:10px;padding:8px;border-radius:14px;background:linear-gradient(135deg,#a8c0ff,#3f2b96)}
.dock img{width:44px;height:44px;border-radius:10px}
</style><h1>Site icon, round 1</h1><p class="sub">11 candidates in 4 directions. Each one is shown big, at true 16 and 32 px, in light and dark browser tabs, and as a home-screen icon. Pick the directions to keep; mixes are welcome.</p>''']
    for fam, items in fams.items():
        html.append(f"<h2>{fam}</h2><div class='row'>")
        for ic, p in items:
            html.append(f'''<div class="card"><div class="top"><div class="big"><img src="data:image/png;base64,{p[180]}"></div>
<div><div class="id"><span>{ic["id"]}</span>{ic["name"]}</div><div class="sizes" style="margin-top:10px">
<figure><img src="data:image/png;base64,{p[16]}" width="16" height="16">16</figure>
<figure><img src="data:image/png;base64,{p[32]}" width="32" height="32">32</figure>
<figure><img src="data:image/png;base64,{p[180]}" width="44" height="44" style="border-radius:10px">home</figure></div></div></div>
{tab(p, False)}{tab(p, True)}
<p class="bet">{ic["bet"]}</p><p class="risk">Risk: {ic["risk"]}</p></div>''')
        html.append("</div>")
    with open(os.path.join(OUT, "board.html"), "w") as fh:
        fh.write("".join(html))
    print("wrote", len(cards), "icons ->", OUT)


if __name__ == "__main__":
    main()
