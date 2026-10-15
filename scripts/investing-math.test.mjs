// node --experimental-strip-types --test scripts/investing-math.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { viewAccount, periodStarts, endOfDay } from "../lib/investing-math.ts";

const DAY = 86400;
const now = endOfDay("2026-10-14") - 3600;
const snap = "2026-06-07";

// A daily series from `from` to `now` whose price is f(ts).
function series(from, f) {
  const s = { t: [], close: [], adj: [] };
  for (let ts = from; ts <= now; ts += DAY) {
    s.t.push(ts);
    s.close.push(f(ts));
    s.adj.push(f(ts));
  }
  return s;
}
const start = now - 700 * DAY;
const flat = series(start, () => 100);
const fxFlat = series(start, () => 1.4);
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} != ${b}`);

const account = (holdings) => ({
  id: "t",
  name: "T",
  fullName: "Test",
  asOf: snap,
  placeholder: false,
  allTime: null,
  holdings,
});
const h = (symbol, currency, weight, investedShare, valueRatio, allTime) => ({
  ticker: symbol,
  symbol,
  name: symbol,
  currency,
  weight,
  investedShare,
  valueRatio,
  allTime,
});

test("flat prices keep snapshot weights, zero period returns, snapshot all-time", () => {
  const a = account([h("A", "USD", 60, 60, 1.2, 20), h("B", "CAD", 40, 40, 0.8, -20)]);
  const v = viewAccount(a, { A: flat, B: flat }, fxFlat, now);
  near(v.holdings.find((x) => x.ticker === "A").weight, 0.6);
  for (const p of ["1M", "YTD", "1Y"]) near(v.returns[p], 0);
  near(v.holdings[0].returns.ALL, 0.2);
  near(v.returns.ALL, 0.6 * 0.2 + 0.4 * -0.2);
});

test("a USD stock that doubles over the year, FX flat", () => {
  const y1 = periodStarts(now)["1Y"];
  const doubler = series(start, (ts) => (ts <= y1 ? 100 : 200));
  const a = account([h("A", "USD", 50, 50, 1, 0), h("B", "CAD", 50, 50, 1, 0)]);
  const v = viewAccount(a, { A: doubler, B: flat }, fxFlat, now);
  const A = v.holdings.find((x) => x.ticker === "A");
  near(A.returns["1Y"], 1);
  // The snapshot is after the jump, so today's weights are still 50/50.
  near(A.weight, 0.5);
  // Today 0.5 + 0.5; a year ago 0.25 + 0.5 → +33.3%.
  near(v.returns["1Y"], 1 / 0.75 - 1);
  near(v.returns["1M"], 0);
});

test("FX moves the account return in CAD but not the holding's own return", () => {
  const ytd = periodStarts(now).YTD;
  const fx = series(start, (ts) => (ts <= ytd ? 1.25 : 1.5));
  const a = account([h("A", "USD", 100, 100, 1, 0)]);
  const v = viewAccount(a, { A: flat }, fx, now);
  near(v.holdings[0].returns.YTD, 0);
  near(v.returns.YTD, 0.2);
});

test("a holding listed after the period start reports since listing", () => {
  const listed = endOfDay("2026-03-13");
  const young = series(listed, (ts) => 20 + (ts - listed) / DAY / 100);
  const a = account([h("CASV", "CAD", 100, 100, 1, 0)]);
  const v = viewAccount(a, { CASV: young }, fxFlat, now);
  // Listed in March: both YTD (from Dec 31) and 1Y start before the first trade.
  assert.deepEqual(v.holdings[0].sinceListing, ["YTD", "1Y"]);
  near(v.holdings[0].returns["1Y"], young.adj.at(-1) / young.adj[0] - 1);
});

test("an account with only its own all-time gain grows it by the holdings' moves", () => {
  const s = endOfDay(snap);
  const up = series(start, (ts) => (ts <= s ? 100 : 110));
  const a = account([h("A", "CAD", 50, 50, null, null), h("B", "CAD", 50, 50, null, null)]);
  a.allTime = 1.5;
  const v = viewAccount(a, { A: up, B: flat }, fxFlat, now);
  near(v.returns.ALL, 1.015 * (0.5 * 1.1 + 0.5) - 1);
  assert.equal(v.holdings[0].returns.ALL, null);
});

test("a period that starts before the first buy shows the gain since bought", () => {
  const y1 = periodStarts(now)["1Y"];
  const doubler = series(start, (ts) => (ts <= y1 ? 100 : 200));
  const a = account([{ ...h("A", "CAD", 100, 100, 1.05, 5), firstBuy: "2026-09-01" }]);
  const v = viewAccount(a, { A: doubler }, fxFlat, now);
  // Bought after the jump: 1Y and YTD are the 5% since bought, not +100%.
  near(v.holdings[0].returns["1Y"], 0.05);
  near(v.holdings[0].returns.YTD, 0.05);
  assert.deepEqual(v.holdings[0].sinceBought, ["YTD", "1Y"]);
  near(v.returns["1Y"], 0.05);
  // 1M starts after the first buy, so it is the plain price move.
  near(v.holdings[0].returns["1M"], 0);
});

test("all time adds the move since the snapshot on money invested", () => {
  const s = endOfDay(snap);
  const up = series(start, (ts) => (ts <= s ? 100 : 110));
  // Worth 1.5x the money put in at the snapshot, gain 50%.
  const a = account([h("A", "CAD", 100, 100, 1.5, 50)]);
  const v = viewAccount(a, { A: up }, fxFlat, now);
  near(v.holdings[0].returns.ALL, 0.5 + 1.5 * 0.1);
  near(v.returns.ALL, 0.5 + 1.5 * 0.1);
});

test("the broker's own YTD and All time replace the account totals, rolled forward", () => {
  const rep = "2026-10-01";
  const r = endOfDay(rep);
  const up = series(start, (ts) => (ts <= r ? 100 : 110));
  const a = account([h("A", "CAD", 50, 50, 1.2, 20), h("B", "CAD", 50, 50, 1, 0)]);
  a.reported = { asOf: rep, ytd: 15, allTime: 40 };
  const v = viewAccount(a, { A: up, B: flat }, fxFlat, now);
  // Half the account rose 10% after the broker's figures.
  near(v.returns.ALL, 1.4 * 1.05 - 1);
  near(v.returns.YTD, 1.15 * 1.05 - 1);
  // 1M and 1Y and the holdings keep the price method.
  near(v.holdings[0].returns.ALL, 0.2 + 1.2 * 0.1);
  near(v.returns["1Y"], 0.05);
});

test("a reported YTD from last year is not used", () => {
  const a = account([h("A", "CAD", 100, 100, 1, 0)]);
  a.reported = { asOf: "2025-12-15", ytd: 30, allTime: 40 };
  const v = viewAccount(a, { A: flat }, fxFlat, now);
  near(v.returns.YTD, 0);
  near(v.returns.ALL, 0.4);
});
