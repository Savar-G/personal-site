"use client";

import { useState } from "react";
import type { AccountView, HoldingView, Period } from "@/lib/investing-math";
import "./investing.css";

// "What I hold" (I-12): one period toggle, and for each account a donut beside a
// table. Hovering or focusing a slice or a row highlights both, and the donut's
// centre shows that holding. Every holding has its own colour slot (I-13).

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
const tone = (x: number | null) => (x === null ? "" : x >= 0 ? "inv-up" : "inv-down");
const colour = (slot: number) => `var(--inv-c${slot % 13})`;

// One donut slice between two angles (radians, clockwise from 12 o'clock).
function arc(r0: number, r1: number, a0: number, a1: number) {
  const p = (r: number, a: number) => `${120 + r * Math.sin(a)} ${120 - r * Math.cos(a)}`;
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return `M${p(r1, a0)}A${r1} ${r1} 0 ${large} 1 ${p(r1, a1)}L${p(r0, a1)}A${r0} ${r0} 0 ${large} 0 ${p(r0, a0)}Z`;
}

// Slices in slot order, with a small gap of page between them.
function donut(holdings: HoldingView[]) {
  const gap = 0.012; // radians
  const starts = holdings.map((_, i) =>
    holdings.slice(0, i).reduce((s, h) => s + h.weight * 2 * Math.PI, 0),
  );
  return holdings.map((h, i) => {
    const a0 = starts[i];
    const a1 = a0 + h.weight * 2 * Math.PI;
    return { h, i, d: arc(74, 116, a0 + gap / 2, a1 - gap / 2) };
  });
}

function note(h: HoldingView, period: Period) {
  if (h.sinceBought.includes(period)) return "since bought";
  if (h.sinceListing.includes(period)) return "since listing";
  return null;
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
  const [active, setActive] = useState<string | null>(null);
  const on = (t: string) => () => setActive(t);
  const off = () => setActive(null);
  const shown = a.holdings.find((h) => h.ticker === active);
  const total = a.returns[period];

  const slices = donut(a.holdings);

  return (
    // Two or three holdings make a short table, so the donut shrinks to match.
    <div className={`inv-acct${a.holdings.length <= 3 ? " is-small" : ""}`}>
      <div className="inv-card inv-chart">
        <h3>
          {a.name}
          <span>{a.fullName}</span>
        </h3>
        <div className={`inv-donut${active ? " is-hovering" : ""}`}>
          <svg viewBox="0 0 240 240" aria-hidden="true">
            {slices.map(({ h, i, d }) => (
              <path
                key={h.ticker}
                d={d}
                fill={colour(i)}
                className={h.ticker === active ? "is-on" : undefined}
                onMouseEnter={on(h.ticker)}
                onMouseLeave={off}
              />
            ))}
          </svg>
          <div className="inv-centre" aria-live="polite">
            {shown ? (
              <>
                <span className="inv-tick">{shown.ticker}</span>
                <b className={tone(shown.returns[period])}>{pct(shown.returns[period])}</b>
                <small>{note(shown, period) ?? SPAN[period]}</small>
              </>
            ) : (
              <>
                <b className={tone(total)}>{pct(total)}</b>
                <small>{SPAN[period]}</small>
              </>
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
                    {x === null ? "n/a" : `${x >= 0 ? "▲" : "▼"} ${pct(x, false)}`}
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
