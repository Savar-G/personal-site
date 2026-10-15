// Moves the /projects rail (project-rail.tsx). The stage is sticky; the list
// below it is tall enough for one stretch of scrolling per card. The scroll
// position sets which card is in the middle, and the cards trail it slightly
// (like GSAP's scrub), so the motion stays smooth on a notched mouse wheel.
// Only transform and opacity change, and the loop runs only while the cards
// are moving. Returns a cleanup for React.

const LAG = 0.16; // seconds for the cards to catch up with the scroll
const PER_CARD = 0.75; // screens of scrolling per card

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));
const pad = (n: number) => String(n).padStart(2, "0");

export function mountRail(list: HTMLElement): () => void {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};

  const stage = list.querySelector<HTMLElement>(".pj-rail-stage");
  const track = list.querySelector<HTMLElement>(".pj-rail-track");
  const bar = list.querySelector<HTMLElement>(".pj-rail-progress i");
  const count = list.querySelector<HTMLElement>(".pj-rail-count");
  const [prev, next] = list.querySelectorAll<HTMLButtonElement>(".pj-rail-arrow");
  const cards = Array.from(list.querySelectorAll<HTMLElement>(".pj-rail-card"));
  const snaps = Array.from(list.querySelectorAll<HTMLElement>(".pj-rail-snap"));
  if (!stage || !track || !bar || !count || !prev || !next) return () => {};

  const n = cards.length;
  const root = document.documentElement;
  root.classList.add("pj-rail-snapping");

  let listTop = 0;
  let per = 1;
  let cw = 0;
  let gap = 28;
  let width = 0;
  let height = 0;
  let shown = 0;
  let target = 0;
  let last = 0;
  let raf = 0;
  let active = -1;

  const goal = () => clamp((scrollY - listTop) / per, 0, n - 1);
  const inView = () =>
    scrollY > listTop - innerHeight * 0.5 &&
    scrollY < listTop + per * (n - 1) + innerHeight * 0.4;

  // Only the card in the middle plays its videos.
  function setActive(i: number) {
    if (i === active) return;
    active = i;
    cards.forEach((card, k) => {
      card.toggleAttribute("data-active", k === i);
      card.querySelectorAll<HTMLVideoElement>("video[data-rail-loop]").forEach((video) => {
        if (k === i && !video.dataset.userPaused) video.play().catch(() => {});
        else if (!video.paused) video.pause();
      });
    });
  }

  function render(s: number) {
    cards.forEach((card, i) => {
      const d = i - s;
      const near = Math.min(Math.abs(d), 1);
      if (Math.abs(d) > 2.2) {
        card.style.visibility = "hidden";
        return;
      }
      card.style.visibility = "visible";
      // Neighbours sit back, turned toward the middle, and tuck in a little.
      const x = d * (cw + gap) - Math.sign(d) * near * cw * 0.04;
      card.style.transform = `translate3d(${x.toFixed(1)}px,0,0) rotateY(${(clamp(-d, -1, 1) * 6).toFixed(2)}deg) scale(${(1 - 0.08 * near).toFixed(4)})`;
      card.style.opacity = (1 - 0.5 * near).toFixed(3);
    });
    bar!.style.transform = `scaleX(${(s / (n - 1)).toFixed(4)})`;
    const k = Math.round(s);
    count!.textContent = `${pad(k + 1)} / ${pad(n)}`;
    prev!.disabled = k === 0;
    next!.disabled = k === n - 1;
    setActive(inView() ? k : -1);
  }

  function step(now: number) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    shown += (target - shown) * (1 - Math.exp(-dt / LAG));
    if (Math.abs(target - shown) < 0.0005) shown = target;
    render(shown);
    raf = shown !== target ? requestAnimationFrame(step) : 0;
  }

  function onScroll() {
    target = goal();
    if (!raf && target !== shown) {
      last = performance.now();
      raf = requestAnimationFrame(step);
    }
  }

  function layout() {
    width = innerWidth;
    height = innerHeight;
    const narrow = width < 820;
    per = Math.round(height * PER_CARD);
    list.style.height = `${height + per * (n - 1)}px`;
    const top = parseFloat(getComputedStyle(stage!).top) || 0;
    listTop = list.getBoundingClientRect().top + scrollY - top;
    cw = Math.min(1060, width * (narrow ? 0.86 : 0.8));
    gap = narrow ? 14 : 28;
    track!.style.setProperty("--cw", `${cw}px`);
    track!.style.setProperty("--gap", `${gap}px`);
    snaps.forEach((snap, i) => (snap.style.top = `${i * per}px`));
    shown = target = goal();
    render(shown);
  }

  function jump(i: number, smooth = true) {
    scrollTo({
      top: listTop + clamp(i, 0, n - 1) * per,
      behavior: smooth ? "smooth" : "instant",
    });
    if (!smooth) {
      shown = target = goal();
      render(shown);
    }
  }

  // A phone's toolbar showing or hiding changes the height a little; only a
  // real resize re-lays the rail.
  function onResize() {
    if (innerWidth !== width || Math.abs(innerHeight - height) > 150) layout();
  }

  // A click on a neighbour brings it to the middle instead of opening it.
  function onClick(e: MouseEvent) {
    const card = (e.target as Element).closest<HTMLElement>(".pj-rail-card");
    const i = card ? cards.indexOf(card) : -1;
    if (i < 0 || i === Math.round(shown)) return;
    e.preventDefault();
    e.stopPropagation();
    jump(i);
  }

  // Tabbing into a card off to the side brings it to the middle at once. A
  // mouse click also focuses the link, so only keyboard focus counts here.
  function onFocus(e: FocusEvent) {
    const el = e.target as Element;
    if (!el.matches(":focus-visible")) return;
    const card = el.closest<HTMLElement>(".pj-rail-card");
    const i = card ? cards.indexOf(card) : -1;
    if (i >= 0 && i !== Math.round(shown)) jump(i, false);
  }

  function onKey(e: KeyboardEvent) {
    if (e.altKey || e.metaKey || e.ctrlKey || !inView()) return;
    if ((e.target as Element).closest?.("input, textarea, select, [contenteditable]")) return;
    const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    jump(Math.round(target) + dir);
  }

  // A sideways trackpad swipe over the cards moves them too.
  function onWheel(e: WheelEvent) {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) * 1.2) scrollBy(0, e.deltaX);
  }

  const onPrev = () => jump(Math.round(target) - 1);
  const onNext = () => jump(Math.round(target) + 1);

  layout();
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onResize);
  addEventListener("load", layout);
  addEventListener("keydown", onKey);
  stage.addEventListener("wheel", onWheel, { passive: true });
  track.addEventListener("click", onClick, true);
  track.addEventListener("focusin", onFocus);
  prev.addEventListener("click", onPrev);
  next.addEventListener("click", onNext);

  return () => {
    cancelAnimationFrame(raf);
    root.classList.remove("pj-rail-snapping");
    removeEventListener("scroll", onScroll);
    removeEventListener("resize", onResize);
    removeEventListener("load", layout);
    removeEventListener("keydown", onKey);
    stage.removeEventListener("wheel", onWheel);
    track.removeEventListener("click", onClick, true);
    track.removeEventListener("focusin", onFocus);
    prev.removeEventListener("click", onPrev);
    next.removeEventListener("click", onNext);
  };
}
