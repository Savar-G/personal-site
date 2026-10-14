# Builds board.html (one self-contained page) from cards.css + cards.html.
import pathlib, sys
here = pathlib.Path(__file__).parent
css = (here / "cards.css").read_text()
cards = (here / "cards.html").read_text()
mode = sys.argv[1] if len(sys.argv) > 1 else "board"
fonts = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Courier+Prime:wght@700&family=Pixelify+Sans&family=Reenie+Beanie&display=block">'
board_css = """
body{margin:0} .grid{display:flex;flex-direction:column;gap:28px}
.opt h3{font:600 15px/1.3 var(--font-sans,system-ui);margin:0 0 4px} .opt .bet{font:13px/1.45 var(--font-sans,system-ui);color:var(--muted-foreground,#666);margin:0 0 10px}
.frame{width:100%;aspect-ratio:1200/630;position:relative;overflow:hidden;border-radius:12px;container-type:inline-size}
.frame .og{transform-origin:0 0;transform:scale(calc(100cqw / 1200px))}
.small{display:flex;gap:16px;flex-wrap:wrap}
.imsg{width:300px;border-radius:16px;overflow:hidden;background:#e5e5ea;font-family:system-ui}
.imsg .frame{border-radius:0}
.imsg .cap{padding:8px 12px;font-size:13px;color:#111} .imsg .cap b{display:block;font-size:13px} .imsg .cap span{color:#555}
"""
if mode == "single":
    html = f"<!doctype html><html><head>{fonts}<style>{css} body{{margin:0}}</style></head><body>{cards}</body></html>"
else:
    import re
    blocks = re.findall(r'(<div class="og [a-d]" id="([A-D])">.*?\n</div>)', cards, re.S)
    meta = {
        "A": ("A. The desk", "The card is a crop of the homepage desk: real objects around the greeting. Promise: what you see is what you get."),
        "B": ("B. Plop", "One bold brand colour and the new sugar-cube icon, huge. Built to be read at thumbnail size."),
        "C": ("C. Incoming call", "The RAZR rings in the dark. The card is a hook that asks to be tapped, not a summary."),
        "D": ("D. Scrapbook", "Real photos and project prints, taped down around a name label. Shows the range of a life, not a job title."),
    }
    out = []
    for block, k in blocks:
        t, b = meta[k]
        out.append(f'<div class="opt"><h3>{t}</h3><p class="bet">{b}</p><div class="frame">{block}</div></div>')
    small = "".join(f'<div class="imsg"><div class="frame">{blk}</div><div class="cap"><b>Savar Gupta</b><span>savargupta.com</span></div></div>' for blk, k in blocks)
    html = f'<!doctype html><html><head>{fonts}<style>{css}{board_css}</style></head><body><div class="grid">{"".join(out)}<div class="opt"><h3>At iMessage size</h3><p class="bet">How each one reads in a chat bubble (about 300 px wide).</p><div class="small">{small}</div></div></div></body></html>'
(here / ("single.html" if mode == "single" else "board.html")).write_text(html)
print("ok", len(html))
