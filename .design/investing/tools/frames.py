# Freeze an animation prototype at given times and screenshot each frame (no server).
#   python3 .design/investing/tools/frames.py <proto.html> <out-prefix> <w> <h> <ms> [<ms> ...]
# Clicks every ".pig" on load, then pauses all Web Animations at <ms>.
import pathlib, subprocess, sys

src, prefix, w, h, *times = sys.argv[1:]
tools = pathlib.Path(__file__).parent
html = pathlib.Path(src).read_text()
for t in times:
    probe = f"""<script>
addEventListener("load", () => {{
  document.querySelectorAll(".pig").forEach((p) => p.click());
  // Headless virtual time does not advance the animation clock, so seek instead.
  // Only the first phase of each option exists at this point.
  setTimeout(() => {{
    document.getAnimations().forEach((a) => {{ a.pause(); a.currentTime = {t}; }});
  }}, 30);
}});
</script>"""
    page = pathlib.Path(f"{prefix}-{t}.html")
    page.write_text(html.replace("</body>", probe + "</body>"))
    subprocess.run(["bash", str(tools / "shot.sh"), str(page), f"{prefix}-{t}.png", w, h], check=True)
