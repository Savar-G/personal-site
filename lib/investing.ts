import data from "./investing-data.json";
import {
  type AccountInput,
  type AccountView,
  type Series,
  snapshotAccount,
  viewAccount,
} from "./investing-math";

// Daily prices for /investing (I-4). Yahoo Finance's chart endpoint is unofficial and
// has no key; tested 2026-10-14. The page revalidates once a day.

const accounts = [data.tfsa, data.rrsp] as AccountInput[];
const FX = "CAD=X"; // CAD per USD

async function series(symbol: string): Promise<Series> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=2y&interval=1d`;
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error(`${symbol}: HTTP ${res.status}`);
  const json = await res.json();
  const r = json?.chart?.result?.[0];
  const t: number[] = r?.timestamp ?? [];
  const close: (number | null)[] = r?.indicators?.quote?.[0]?.close ?? [];
  const adj: (number | null)[] = r?.indicators?.adjclose?.[0]?.adjclose ?? close;
  const out: Series = { t: [], close: [], adj: [] };
  t.forEach((ts, i) => {
    if (close[i] == null || adj[i] == null) return;
    out.t.push(ts);
    out.close.push(close[i]!);
    out.adj.push(adj[i]!);
  });
  if (out.t.length < 2) throw new Error(`${symbol}: no price history`);
  return out;
}

export type InvestingView = {
  accounts: AccountView[];
  /** Date of the latest close used, or null when prices could not be loaded. */
  pricesAsOf: string | null;
};

export async function getInvesting(): Promise<InvestingView> {
  const symbols = [...new Set(accounts.flatMap((a) => a.holdings.map((h) => h.symbol)))];
  try {
    const [fx, ...all] = await Promise.all([series(FX), ...symbols.map(series)]);
    const prices = Object.fromEntries(symbols.map((s, i) => [s, all[i]]));
    // "Now" is the latest close any holding has, so every period ends on a trading day.
    const now = Math.max(...all.map((s) => s.t[s.t.length - 1]));
    return {
      accounts: accounts.map((a) => viewAccount(a, prices, fx, now)),
      pricesAsOf: new Date(now * 1000).toISOString().slice(0, 10),
    };
  } catch (err) {
    // During a revalidation, throwing keeps the last good page. A build has no last
    // good page, so it falls back to the snapshot rather than failing the deploy.
    if (process.env.NEXT_PHASE !== "phase-production-build") throw err;
    console.warn(`investing: prices unavailable, using snapshot (${err})`);
    return { accounts: accounts.map(snapshotAccount), pricesAsOf: null };
  }
}
