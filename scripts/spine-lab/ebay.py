# Usage: .venv/bin/python ebay.py <slug> "<search query>" [max_listings=3]
# Finds eBay listings with Firecrawl, downloads each listing's own gallery photos
# to refs-raw/<slug>-e<L>-<P>.jpg, and writes a numbered contact sheet
# refs-raw/<slug>-ebay-sheet.jpg (label "L-P" on each photo) to look at with Read.
# Costs about 1 Firecrawl credit per search and per listing.
import sys, re, json, subprocess, urllib.request, os
from PIL import Image, ImageDraw, ImageFont
slug, q = sys.argv[1], sys.argv[2]
maxl = int(sys.argv[3]) if len(sys.argv) > 3 else 3
r = subprocess.run(["firecrawl", "search", q + " ebay", "--limit", "10", "--json"], capture_output=True, text=True)
try: web = json.loads(r.stdout).get("data", {}).get("web", [])
except Exception: web = []
urls = []
for w in web:
    m = re.search(r"ebay\.[a-z.]+/itm/(?:[^/]+/)?(\d+)", w.get("url", ""))
    if m and m.group(1) not in [u[1] for u in urls]: urls.append((w["url"], m.group(1), w.get("title", "")))
urls = urls[:maxl]
if not urls: print("no eBay listings found"); sys.exit(1)
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/124 Safari/537.36"
tiles = []
for L, (u, iid, title) in enumerate(urls, 1):
    out = f"refs-raw/{slug}-e{L}.html"
    subprocess.run(["firecrawl", "scrape", f"https://www.ebay.com/itm/{iid}", "--format", "rawHtml", "-o", out], capture_output=True)
    h = open(out, encoding="utf8", errors="ignore").read() if os.path.exists(out) else ""
    ids = []
    pre = re.search(r'rel="preload"[^>]*href="https://i\.ebayimg\.com/images/g/([A-Za-z0-9~_-]+)/', h)
    if pre: ids.append(pre.group(1))
    for m in re.finditer(r'alt="Picture \d+ of \d+"[^>]*?src="https://i\.ebayimg\.com/images/g/([A-Za-z0-9~_-]+)/', h):
        if m.group(1) not in ids: ids.append(m.group(1))
    for m in re.finditer(r'"Picture \d+ of \d+"[^<]{0,300}?images/g/([A-Za-z0-9~_-]+)/', h):
        if m.group(1) not in ids: ids.append(m.group(1))
    print(f"listing {L}: {title[:70]} ({u}) - {len(ids)} photos")
    for P, i in enumerate(ids[:12], 1):
        f = f"refs-raw/{slug}-e{L}-{P}.jpg"
        try:
            req = urllib.request.Request(f"https://i.ebayimg.com/images/g/{i}/s-l1600.jpg", headers={"User-Agent": UA})
            open(f, "wb").write(urllib.request.urlopen(req, timeout=30).read())
            tiles.append((f"{L}-{P}", f))
        except Exception as e: print("  fail", i, e)
if not tiles: sys.exit(1)
H = 300; ims = []
for lab, f in tiles:
    im = Image.open(f).convert("RGB"); im = im.resize((max(1, int(im.width * H / im.height)), H)); ims.append((lab, im))
cols = 6; rows = [ims[k:k + cols] for k in range(0, len(ims), cols)]
W = max(sum(i.width + 8 for _, i in r) for r in rows)
sheet = Image.new("RGB", (W, len(rows) * (H + 8)), "white"); d = ImageDraw.Draw(sheet)
try: font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 28)
except Exception: font = None
for ri, r in enumerate(rows):
    x = 0
    for lab, im in r:
        y = ri * (H + 8); sheet.paste(im, (x, y)); d.rectangle([x, y, x + 62, y + 34], fill="yellow"); d.text((x + 4, y + 2), lab, fill="black", font=font); x += im.width + 8
sheet.save(f"refs-raw/{slug}-ebay-sheet.jpg", quality=85)
print(f"sheet: refs-raw/{slug}-ebay-sheet.jpg (photo L-P is refs-raw/{slug}-eL-P.jpg)")
