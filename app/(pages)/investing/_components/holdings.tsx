"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { AccountView, HoldingView, Period } from "@/lib/investing-math";
import "./investing.css";

// "What I hold" (I-12): one period toggle, and for each account a donut beside a
// table. Hovering or focusing a slice or a row highlights both, and the donut's
// centre shows that holding. Every holding has its own colour slot (I-13).
// Motion (I-16): the first time an account scrolls into view its ring sweeps in
// clockwise, its total counts up from 0, and its rows fade in one after another; a
// hovered slice slides out from the centre; numbers roll when the period changes.

const PERIODS: [Period, string][] = [
  ["1M", "1M"],
  ["YTD", "YTD"],
  ["1Y", "1Y"],
  ["ALL", "All time"],
];
const SPAN: Record<Period, string> = {
  "1M": "past month",
  YTD: "this year",
  "1Y": "past year",
  ALL: "all time",
};

const pct = (x: number | null, sign = true) =>
  x === null ? "n/a" : `${sign ? (x >= 0 ? "+" : "−") : ""}${Math.abs(x * 100).toFixed(1)}%`;
const arrow = (x: number | null) => (x === null ? "n/a" : `${x >= 0 ? "▲" : "▼"} ${pct(x, false)}`);
const tone = (x: number | null) => (x === null ? "" : x >= 0 ? "inv-up" : "inv-down");
const colour = (slot: number) => `var(--inv-c${slot % 13})`;
const still = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const ENTER = "inv-enter"; // event on .inv-acct when its entrance starts

// One donut slice between two angles (radians, clockwise from 12 o'clock).
function arc(r0: number, r1: number, a0: number, a1: number) {
  const p = (r: number, a: number) => `${120 + r * Math.sin(a)} ${120 - r * Math.cos(a)}`;
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return `M${p(r1, a0)}A${r1} ${r1} 0 ${large} 1 ${p(r1, a1)}L${p(r0, a1)}A${r0} ${r0} 0 ${large} 0 ${p(r0, a0)}Z`;
}

// Slices in slot order, with a small gap of page between them. `out` is the 7 px
// offset that slides a hovered slice away from the centre along its middle.
function donut(holdings: HoldingView[]) {
  const gap = 0.012; // radians
  const starts = holdings.map((_, i) =>
    holdings.slice(0, i).reduce((s, h) => s + h.weight * 2 * Math.PI, 0),
  );
  return holdings.map((h, i) => {
    const a0 = starts[i];
    const a1 = a0 + h.weight * 2 * Math.PI;
    const mid = (a0 + a1) / 2;
    return {
      h,
      i,
      d: arc(74, 116, a0 + gap / 2, a1 - gap / 2),
      out: `translate(${(7 * Math.sin(mid)).toFixed(2)}px, ${(-7 * Math.cos(mid)).toFixed(2)}px)`,
    };
  });
}

function note(h: HoldingView, period: Period) {
  if (h.sinceBought.includes(period)) return "since bought";
  if (h.sinceListing.includes(period)) return "since listing";
  return null;
}

// A number that rolls from its last value to a new one. React renders only the first
// value; after that the text is written here, frame by frame. With `entrance`, it
// starts at 0 and counts up when its account's entrance starts.
function Rolling({
  value,
  format,
  entrance = false,
}: {
  value: number | null;
  format: (x: number | null) => string;
  entrance?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [first] = useState(value);
  const shown = useRef(value);
  const latest = useRef(value);
  const fmt = useRef(format);
  const raf = useRef(0);
  const waiting = useRef(false); // armed for the entrance: hold at 0 until it starts

  useEffect(() => {
    fmt.current = format;
  });

  // Roll the text from `from` to `to`; a null at either end jumps.
  const roll = useRef((from: number | null, to: number | null, ms: number) => {
    const el = ref.current;
    if (!el) return;
    cancelAnimationFrame(raf.current);
    shown.current = to;
    if (from === null || to === null || from === to || still()) {
      el.textContent = fmt.current(to);
      return;
    }
    const t0 = performance.now();
    const step = (t: number) => {
      // A frame can be stamped a little before t0; clamp so it never starts below `from`.
      const k = Math.min(1, Math.max(0, (t - t0) / ms));
      el.textContent = fmt.current(from + (to - from) * (1 - Math.pow(1 - k, 3)));
      if (k < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  });

  useLayoutEffect(() => {
    const el = ref.current;
    const acct = el?.closest(".inv-acct");
    if (!entrance || !el || !acct || still() || latest.current === null) return;
    shown.current = 0;
    waiting.current = true;
    el.textContent = fmt.current(0);
    const go = () => {
      waiting.current = false;
      roll.current(0, latest.current, 900);
    };
    acct.addEventListener(ENTER, go, { once: true });
    return () => acct.removeEventListener(ENTER, go);
  }, [entrance]);

  useEffect(() => {
    latest.current = value;
    if (!waiting.current && value !== shown.current) roll.current(shown.current, value, 450);
  }, [value]);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  return <span ref={ref}>{format(first)}</span>;
}

export function Holdings({ accounts }: { accounts: AccountView[] }) {
  const [period, setPeriod] = useState<Period>("ALL");
  return (
    <section className="inv" aria-labelledby="inv-hold">
      <div className="inv-bar">
        <h2 id="inv-hold">What I hold</h2>
        <div className="inv-seg" role="group" aria-label="Period">
          {PERIODS.map(([p, label]) => (
            <button key={p} type="button" aria-pressed={p === period} onClick={() => setPeriod(p)}>
              {label}
            </button>
          ))}
        </div>
      </div>
      {accounts.map((a) => (
        <Account key={a.id} account={a} period={period} />
      ))}
    </section>
  );
}

function Account({ account: a, period }: { account: AccountView; period: Period }) {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<string | null>(null);
  const on = (t: string) => () => setActive(t);
  const off = () => setActive(null);
  const shown = a.holdings.find((h) => h.ticker === active);
  const total = a.returns[period];
  const slices = donut(a.holdings);

  // Entrance: hide the ring and rows before the first paint (CSS, data-armed), then
  // play once when the account is a third in view. Without JS everything shows.
  useLayoutEffect(() => {
    const el = root.current;
    if (!el || still()) return;
    el.dataset.armed = "";
    const enter = () => {
      delete el.dataset.armed;
      el.dataset.enter = "";
      el.dispatchEvent(new Event(ENTER));
    };
    if (!("IntersectionObserver" in window)) return enter();
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        enter();
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    // Two or three holdings make a short table, so the donut shrinks to match.
    <div ref={root} className={`inv-acct${a.holdings.length <= 3 ? " is-small" : ""}`}>
      <div className="inv-card inv-chart">
        <h3>
          {a.name}
          <span>{a.fullName}</span>
        </h3>
        <div className={`inv-donut${active ? " is-hovering" : ""}`}>
          <svg viewBox="0 0 240 240" aria-hidden="true">
            <defs>
              {/* A thick circle stroke that draws clockwise from 12 o'clock reveals the ring. */}
              <mask id={`inv-mask-${a.id}`}>
                <circle className="inv-sweep" cx="120" cy="120" r="65" fill="none" stroke="#fff" strokeWidth="132"
                  strokeDasharray="408.4 408.4" transform="rotate(-90 120 120)" />
              </mask>
            </defs>
            <g mask={`url(#inv-mask-${a.id})`}>
              {slices.map(({ h, i, d, out }) => (
                <path
                  key={h.ticker}
                  d={d}
                  fill={colour(i)}
                  className={h.ticker === active ? "is-on" : undefined}
                  style={h.ticker === active ? { transform: out } : undefined}
                  onMouseEnter={on(h.ticker)}
                  onMouseLeave={off}
                />
              ))}
            </g>
          </svg>
          <div className="inv-centre" aria-live="polite">
            {/* The total stays mounted (hidden on hover) so its entrance runs once. */}
            <div className="inv-centre-total" hidden={!!shown}>
              <b className={tone(total)}>
                <Rolling value={total} format={pct} entrance />
              </b>
              <small>{SPAN[period]}</small>
            </div>
            {shown && (
              <div key={shown.ticker}>
                <span className="inv-tick">{shown.ticker}</span>
                <b className={tone(shown.returns[period])}>
                  <Rolling value={shown.returns[period]} format={pct} />
                </b>
                <small>{note(shown, period) ?? SPAN[period]}</small>
              </div>
            )}
          </div>
        </div>
        {/* The hovered holding's name and weight sit under the donut; the hole is too small for them. */}
        <p className="inv-under" aria-live="polite">
          {shown && (
            <>
              <b>{shown.name}</b>
              <br />
              {(shown.weight * 100).toFixed(1)}% of {a.name}
            </>
          )}
        </p>
      </div>

      <div className="inv-card inv-tablecard">
        <table className="inv-table">
          <caption className="sr-only">
            {a.name} holdings: allocation and return, {SPAN[period]}
          </caption>
          <thead>
            <tr>
              <th scope="col">Holding</th>
              <th scope="col" className="inv-n">
                Return, {SPAN[period]}
              </th>
              <th scope="col" className="inv-n">
                Allocation
              </th>
            </tr>
          </thead>
          <tbody>
            {a.holdings.map((h, i) => {
              const x = h.returns[period];
              const why = note(h, period);
              return (
                <tr
                  key={h.ticker}
                  tabIndex={0}
                  style={{ "--i": i } as React.CSSProperties}
                  className={h.ticker === active ? "is-on" : undefined}
                  onMouseEnter={on(h.ticker)}
                  onMouseLeave={off}
                  onFocus={on(h.ticker)}
                  onBlur={off}
                >
                  <td className="inv-h">
                    <div>
                      <span className="inv-sw" style={{ background: colour(i) }} aria-hidden="true" />
                      <span className="inv-tk">{h.ticker}</span>
                      <span className="inv-nm">{h.name}</span>
                    </div>
                    {h.about && <p className="inv-about">{h.about}</p>}
                  </td>
                  <td className={`inv-n ${tone(x)}`}>
                    <Rolling value={x} format={arrow} />
                    {why && <span className="inv-why">{why}</span>}
                  </td>
                  <td className="inv-n">{(h.weight * 100).toFixed(1)}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
