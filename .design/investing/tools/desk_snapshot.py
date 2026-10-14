# Static, self-contained snapshot of the built desk (no server, no scripts), so an
# agent can render layout options in T3's preview browser.
#   python3 .design/investing/tools/desk_snapshot.py <out.html> [extra-html-file] [extra-css-file]
# Needs `npm run build` first. CSS, fonts, and images are inlined as data URIs.
import base64, mimetypes, pathlib, re, sys

root = pathlib.Path(__file__).resolve().parents[3]
import os
# PAGE=investing snapshots another prerendered route (default: the desk).
html = (root / f".next/server/app/{os.environ.get('PAGE', 'index')}.html").read_text()
out = pathlib.Path(sys.argv[1])
extra = pathlib.Path(sys.argv[2]).read_text() if len(sys.argv) > 2 else ""
extra_css = pathlib.Path(sys.argv[3]).read_text() if len(sys.argv) > 3 else ""


def data_uri(url):
    path = root / ".next" / url[len("/_next/"):] if url.startswith("/_next/") else root / "public" / url.lstrip("/")
    if not path.is_file():
        return url
    # T3's preview inlines absolute file paths itself; keeps the document small.
    if PATHS:
        return str(path)
    mime = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
    return f"data:{mime};base64,{base64.b64encode(path.read_bytes()).decode()}"


PATHS = True


def inline_css(m):
    css = (root / ".next" / m.group(1)[len("/_next/"):]).read_text()
    css = re.sub(r"url\((/[^)\"']+)\)", lambda u: f"url({data_uri(u.group(1))})", css)
    return f"<style>{css}</style>"


html = re.sub(r'<link rel="stylesheet" href="([^"]+)"[^>]*/>', inline_css, html)
# KEEP_INLINE=1 keeps inline scripts (the pre-paint script lays out the phone desk).
import os
if os.environ.get("KEEP_ALL") == "1":
    # Hydrate from the build: point the /_next/ scripts at .next on disk.
    html = re.sub(r'src="(/_next/[^"]+)"', lambda m: f'src="file://{root}/.next/{m.group(1)[len("/_next/"):]}"', html)
elif os.environ.get("KEEP_INLINE") == "1":
    html = re.sub(r"<script\b[^>]*\bsrc=[^>]*>.*?</script>", "", html, flags=re.S)
else:
    html = re.sub(r"<script\b[^>]*>.*?</script>", "", html, flags=re.S)
html = re.sub(r'<link rel="preload"[^>]*/>', "", html)
# Low-priority images can miss a headless screenshot.
html = html.replace(' fetchpriority="low"', "").replace(' decoding="async"', "")
html = re.sub(r'(src|href)="(/desk/[^"]+)"', lambda m: f'{m.group(1)}="{data_uri(m.group(2))}"', html)
html = re.sub(r"url\((/desk/[^)]+)\)", lambda m: f"url({data_uri(m.group(1))})", html)

# Final, still state: no landing animation, stage shown at 1:1.
still = """<style>
*,*::before,*::after{animation:none!important;transition:none!important}
.desk-page .stage{visibility:visible!important;transform:none!important;left:0!important;top:0!important;margin:0!important}
html,body{overflow:hidden}
""" + extra_css + "</style>"
html = html.replace("</head>", still + "</head>")
if extra:
    html = re.sub(r'(<div class="stage" id="stage"[^>]*>)', lambda m: m.group(1) + extra, html, count=1)
out.write_text(html)
print(out, len(html))
