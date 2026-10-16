// Moves the /projects rail (project-rail.tsx). The page does not scroll: it is
// one screen tall, and the wheel, a trackpad, a touch swipe, the arrow keys,
// and the buttons move the row of cards sideways instead. After each gesture
// the rail settles on one card. The cards trail the input slightly, so a
// notched mouse wheel still looks smooth. Only transform and opacity change,
// and the loop runs only while the cards are moving. Returns a cleanup for
// React.

const LAG = 0.16; // seconds for the cards to catch up with the input
const WHEEL_PER_CARD = 500; // px of vertical wheel travel per card
const SETTLE_MS = 130; // quiet time after the last wheel event before settling
const NUDGE = 0.12; // a gesture this far (in cards) goes on to the next card
const FLICK = 0.6; // cards per second; a faster swipe goes on to the next card
const STRETCH = 0.12; // how far past the first or last card the rail gives

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));
const pad = (n: number) => String(n).padStart(2, "0");

export function mountRail(list: HTMLElement): () => void {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};

  const track = list.querySelector<HTMLElement>(".pj-rail-track");
  const bar = list.querySelector<HTMLElement>(".pj-rail-progress i");
  const count = list.querySelector<HTMLElement>(".pj-rail-count");
  const [prev, next] = list.querySelectorAll<HTMLButtonElement>(".pj-rail-arrow");
  const cards = Array.from(list.querySelectorAll<HTMLElement>(".pj-rail-card"));
  if (!track || !bar || !count || !prev || !next) return () => {};

  const n = cards.length;
  const root = document.documentElement;
  root.classList.add("pj-rail-locked");

  let cw = 0;
  let gap = 28;
  let shown = 0;
  let target = 0;
  let last = 0;
  let raf = 0;
  let active = -1;
  let gestureFrom: number | null = null;
  let settleTimer = 0;

  const step = () => cw + gap; // px between card centres

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
      const x = d * step() - Math.sign(d) * near * cw * 0.04;
      card.style.transform = `translate3d(${x.toFixed(1)}px,0,0) rotateY(${(clamp(-d, -1, 1) * 6).toFixed(2)}deg) scale(${(1 - 0.08 * near).toFixed(4)})`;
      card.style.opacity = (1 - 0.5 * near).toFixed(3);
    });
    const p = clamp(s, 0, n - 1);
    bar!.style.transform = `scaleX(${(p / (n - 1)).toFixed(4)})`;
    const k = Math.round(p);
    count!.textContent = `${pad(k + 1)} / ${pad(n)}`;
    prev!.disabled = k === 0;
    next!.disabled = k === n - 1;
    setActive(k);
  }

  function frame(now: number) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    shown += (target - shown) * (1 - Math.exp(-dt / LAG));
    if (Math.abs(target - shown) < 0.0005) shown = target;
    render(shown);
    raf = shown !== target ? requestAnimationFrame(frame) : 0;
  }

  function moveTo(t: number, instant = false) {
    target = t;
    if (instant) {
      shown = t;
      render(shown);
      return;
    }
    if (!raf && target !== shown) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  }

  // Free movement during a gesture, a little give past either end.
  const drift = (t: number) => moveTo(clamp(t, -STRETCH, n - 1 + STRETCH));

  // Settle on one card: a small nudge still goes to the next card, so one
  // notch of a mouse wheel or a short swipe moves exactly one card.
  function settle(from: number, velocity = 0) {
    const moved = target - from;
    let to = Math.round(target);
    if (Math.abs(velocity) > FLICK) to = Math.round(from) + Math.sign(velocity);
    else if (Math.abs(moved) > NUDGE && Math.abs(moved) < 0.5)
      to = Math.round(from) + Math.sign(moved);
    moveTo(clamp(to, 0, n - 1));
  }

  const go = (i: number) => moveTo(clamp(i, 0, n - 1));

  function layout() {
    const narrow = innerWidth < 820;
    cw = Math.min(1060, innerWidth * (narrow ? 0.86 : 0.8));
    gap = narrow ? 14 : 28;
    track!.style.setProperty("--cw", `${cw}px`);
    track!.style.setProperty("--gap", `${gap}px`);
    render(shown);
  }

  // ---- wheel and trackpad ----
  function onWheel(e: WheelEvent) {
    if (e.ctrlKey) return; // pinch zoom
    // A player that has focus (the YouTube embed) keeps its own wheel.
    if ((e.target as Element).closest?.("iframe")) return;
    e.preventDefault();
    const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? innerHeight : 1;
    const dx = e.deltaX * unit;
    const dy = e.deltaY * unit;
    // A sideways swipe moves the cards one to one; a vertical one, by distance.
    const delta = Math.abs(dx) > Math.abs(dy) ? dx / step() : dy / WHEEL_PER_CARD;
    if (gestureFrom === null) gestureFrom = Math.round(target);
    drift(target + delta);
    clearTimeout(settleTimer);
    settleTimer = window.setTimeout(() => {
      settle(gestureFrom ?? target);
      gestureFrom = null;
    }, SETTLE_MS);
  }

  // ---- touch swipes (either direction) ----
  let touch: { id: number; x: number; y: number; from: number; t: number; axis: "x" | "y" | null; vx: number; lastPos: number; lastT: number } | null = null;
  let swallowClick = false;

  function onPointerDown(e: PointerEvent) {
    if (e.pointerType === "mouse" || touch) return;
    touch = { id: e.pointerId, x: e.clientX, y: e.clientY, from: target, t: e.timeStamp, axis: null, vx: 0, lastPos: target, lastT: e.timeStamp };
  }
  function onPointerMove(e: PointerEvent) {
    if (!touch || e.pointerId !== touch.id) return;
    const dx = e.clientX - touch.x;
    const dy = e.clientY - touch.y;
    if (!touch.axis) {
      if (Math.hypot(dx, dy) < 8) return;
      touch.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      list.setPointerCapture?.(e.pointerId);
    }
    const t = touch.from - (touch.axis === "x" ? dx : dy) / step();
    drift(t);
    const dt = (e.timeStamp - touch.lastT) / 1000;
    if (dt > 0) touch.vx = (target - touch.lastPos) / dt;
    touch.lastPos = target;
    touch.lastT = e.timeStamp;
  }
  function onPointerUp(e: PointerEvent) {
    if (!touch || e.pointerId !== touch.id) return;
    if (touch.axis) {
      swallowClick = true;
      setTimeout(() => (swallowClick = false), 0);
      // A finger held still before lifting is not a flick.
      const v = e.timeStamp - touch.lastT > 80 ? 0 : touch.vx;
      settle(Math.round(touch.from), v);
    }
    touch = null;
  }

  // ---- clicks, focus, keys ----
  // A click on a neighbour brings it to the middle instead of opening it.
  function onClick(e: MouseEvent) {
    const card = (e.target as Element).closest<HTMLElement>(".pj-rail-card");
    const i = card ? cards.indexOf(card) : -1;
    if (swallowClick || (i >= 0 && i !== Math.round(target))) {
      e.preventDefault();
      e.stopPropagation();
      if (!swallowClick) go(i);
    }
  }

  // Tabbing into a card off to the side brings it to the middle at once. A
  // mouse click also focuses the link, so only keyboard focus counts here.
  function onFocus(e: FocusEvent) {
    const el = e.target as Element;
    if (!el.matches(":focus-visible")) return;
    const card = el.closest<HTMLElement>(".pj-rail-card");
    const i = card ? cards.indexOf(card) : -1;
    if (i >= 0 && i !== Math.round(target)) moveTo(i, true);
  }

  function onKey(e: KeyboardEvent) {
    if (e.altKey || e.metaKey || e.ctrlKey) return;
    if ((e.target as Element).closest?.("input, textarea, select, [contenteditable]")) return;
    const k = Math.round(target);
    const to =
      e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === "PageDown" || (e.key === " " && !e.shiftKey)
        ? k + 1
        : e.key === "ArrowLeft" || e.key === "ArrowUp" || e.key === "PageUp" || (e.key === " " && e.shiftKey)
          ? k - 1
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? n - 1
              : null;
    if (to === null) return;
    // Space on a button or link still presses it.
    if (e.key === " " && (e.target as Element).closest?.("button, a")) return;
    e.preventDefault();
    go(to);
  }

  const onPrev = () => go(Math.round(target) - 1);
  const onNext = () => go(Math.round(target) + 1);

  layout();
  // "All projects" on a case study links to /projects?p=<slug>: start on that card.
  const from = new URLSearchParams(location.search).get("p");
  const start = from ? cards.findIndex((card) => card.dataset.slug === from) : -1;
  if (start > 0) moveTo(start, true);

  addEventListener("wheel", onWheel, { passive: false });
  addEventListener("resize", layout);
  addEventListener("keydown", onKey);
  list.addEventListener("pointerdown", onPointerDown);
  list.addEventListener("pointermove", onPointerMove);
  list.addEventListener("pointerup", onPointerUp);
  list.addEventListener("pointercancel", onPointerUp);
  track.addEventListener("click", onClick, true);
  track.addEventListener("focusin", onFocus);
  prev.addEventListener("click", onPrev);
  next.addEventListener("click", onNext);

  return () => {
    cancelAnimationFrame(raf);
    clearTimeout(settleTimer);
    root.classList.remove("pj-rail-locked");
    removeEventListener("wheel", onWheel);
    removeEventListener("resize", layout);
    removeEventListener("keydown", onKey);
    list.removeEventListener("pointerdown", onPointerDown);
    list.removeEventListener("pointermove", onPointerMove);
    list.removeEventListener("pointerup", onPointerUp);
    list.removeEventListener("pointercancel", onPointerUp);
    track.removeEventListener("click", onClick, true);
    track.removeEventListener("focusin", onFocus);
    prev.removeEventListener("click", onPrev);
    next.removeEventListener("click", onNext);
  };
}
