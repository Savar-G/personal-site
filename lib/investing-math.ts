// Pure return math for /investing (I-4). No I/O, so it can be tested on fixed series.
//
// Holding returns are in the holding's own currency. Account returns are in CAD.

export const PERIODS = ["1M", "YTD", "1Y", "ALL"] as const;
export type Period = (typeof PERIODS)[number];

export type HoldingInput = {
  ticker: string;
  symbol: string;
  name: string;
  currency: string;
  /** % of the account's value on the snapshot date. */
  weight: number;
  /** % of all money ever invested in the account (CAD), on the snapshot date. */
  investedShare: number;
  /** Value / money invested, on the snapshot date. Null when unknown. */
  valueRatio: number | null;
  /** All-time gain % on the snapshot date (price, dividends, sold gains). Null when unknown. */
  allTime: number | null;
  /** First buy (YYYY-MM-DD), when known. Earlier period starts use the gain since bought. */
  firstBuy?: string;
  /** One line on what a fund holds (ETFs only). */
  about?: string;
};

export type AccountInput = {
  id: string;
  name: string;
  fullName: string;
  asOf: string;
  placeholder: boolean;
  allTime: number | null;
  holdings: HoldingInput[];
};

/** Daily series, oldest first. `t` is seconds since epoch. */
export type Series = { t: number[]; close: number[]; adj: number[] };

export type HoldingView = {
  ticker: string;
  name: string;
  about?: string;
  weight: number;
  returns: Record<Period, number | null>;
  /** Periods that start before the first trade; the return runs from listing. */
  sinceListing: Period[];
  /** Periods that start before Savar's first buy; the return is the gain since bought. */
  sinceBought: Period[];
};

export type AccountView = {
  id: string;
  name: string;
  fullName: string;
  placeholder: boolean;
  holdingsAsOf: string;
  returns: Record<Period, number | null>;
  holdings: HoldingView[];
};

/** Index of the last point on or before `ts`, or -1 when the series starts later. */
export function indexAt(s: Series, ts: number): number {
  let lo = 0;
  let hi = s.t.length - 1;
  let found = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (s.t[mid] <= ts) {
      found = mid;
      lo = mid + 1;
    } else hi = mid - 1;
  }
  return found;
}

/** Start of each period, in seconds, measured back from `now` (UTC calendar). */
export function periodStarts(now: number): Record<Exclude<Period, "ALL">, number> {
  const d = new Date(now * 1000);
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth();
  const day = d.getUTCDate();
  return {
    "1M": Date.UTC(y, m - 1, day, 23, 59, 59) / 1000,
    // The last close of the previous year.
    YTD: Date.UTC(y - 1, 11, 31, 23, 59, 59) / 1000,
    "1Y": Date.UTC(y - 1, m, day, 23, 59, 59) / 1000,
  };
}

/** End of a YYYY-MM-DD day, in seconds (UTC, late enough to include that day's close). */
export const endOfDay = (date: string) => Date.parse(`${date}T23:59:59Z`) / 1000;

/** Growth factor of a series between two times; flags a start before the first point. */
function growth(s: Series, from: number, to: number, key: "close" | "adj") {
  let i = indexAt(s, from);
  const sinceListing = i === -1;
  if (sinceListing) i = 0;
  const j = indexAt(s, to);
  if (j === -1) return { g: 1, sinceListing };
  return { g: s[key][j] / s[key][i], sinceListing };
}

/**
 * Rolls one account forward from its snapshot to `now`.
 * `prices` holds a series per symbol; `fx` is the CAD price of one USD.
 */
export function viewAccount(
  account: AccountInput,
  prices: Record<string, Series>,
  fx: Series,
  now: number,
): AccountView {
  const snap = endOfDay(account.asOf);
  const starts = periodStarts(now);
  // CAD growth of a holding between two times, on adjusted or plain closes.
  const cad = (h: HoldingInput, from: number, to: number, key: "close" | "adj") => {
    const local = growth(prices[h.symbol], from, to, key);
    const f = h.currency === "USD" ? growth(fx, from, to, "close").g : 1;
    return { local: local.g, cad: local.g * f, sinceListing: local.sinceListing };
  };

  // Today's weights: snapshot weights moved by each holding's price change in CAD.
  // Plain closes, because dividends left as cash and are not in the account's stock value.
  const drifted = account.holdings.map((h) => h.weight * cad(h, snap, now, "close").cad);
  const total = drifted.reduce((a, b) => a + b, 0);
  const weights = drifted.map((w) => w / total);

  // All time: the snapshot gain plus the price move since, on money invested.
  const allTime = (h: HoldingInput) =>
    h.allTime === null || h.valueRatio === null
      ? null
      : h.allTime / 100 + h.valueRatio * (cad(h, snap, now, "adj").local - 1);

  // Growth over a period. A period that starts before the first buy would credit
  // moves Savar did not own, so it is the gain since bought (All time) instead.
  const periodGrowth = (h: HoldingInput, p: Exclude<Period, "ALL">) => {
    const all = allTime(h);
    if (h.firstBuy && all !== null && starts[p] < endOfDay(h.firstBuy)) {
      const f = h.currency === "USD" ? growth(fx, endOfDay(h.firstBuy), now, "close").g : 1;
      return { local: 1 + all, cad: (1 + all) * f, sinceListing: false, sinceBought: true };
    }
    return { ...cad(h, starts[p], now, "adj"), sinceBought: false };
  };

  const holdings: HoldingView[] = account.holdings.map((h, i) => {
    const returns = {} as Record<Period, number | null>;
    const sinceListing: Period[] = [];
    const sinceBought: Period[] = [];
    for (const p of ["1M", "YTD", "1Y"] as const) {
      const r = periodGrowth(h, p);
      returns[p] = r.local - 1;
      if (r.sinceListing) sinceListing.push(p);
      if (r.sinceBought) sinceBought.push(p);
    }
    returns.ALL = allTime(h);
    return { ticker: h.ticker, name: h.name, about: h.about, weight: weights[i], returns, sinceListing, sinceBought };
  });

  const returns = {} as Record<Period, number | null>;
  for (const p of ["1M", "YTD", "1Y"] as const) {
    // Value at the period start of today's holdings, with today's value = 1.
    const start = account.holdings.reduce(
      (s, h, i) => s + weights[i] / periodGrowth(h, p).cad,
      0,
    );
    returns[p] = 1 / start - 1;
  }
  const known = account.holdings.every((h) => h.allTime !== null && h.valueRatio !== null);
  if (known) {
    returns.ALL = account.holdings.reduce(
      (s, h) =>
        s +
        (h.investedShare / 100) *
          (h.allTime! / 100 + h.valueRatio! * (cad(h, snap, now, "adj").cad - 1)),
      0,
    );
  } else if (account.allTime !== null) {
    // Only the account's gain is known: grow its value by the holdings' CAD moves
    // since the snapshot, on the same money invested.
    const growth = account.holdings.reduce(
      (s, h) => s + (h.weight / 100) * cad(h, snap, now, "adj").cad,
      0,
    );
    returns.ALL = (1 + account.allTime / 100) * growth - 1;
  } else returns.ALL = null;

  return {
    id: account.id,
    name: account.name,
    fullName: account.fullName,
    placeholder: account.placeholder,
    holdingsAsOf: account.asOf,
    returns,
    // Snapshot order, not today's rank: each holding keeps its colour slot (I-13).
    holdings,
  };
}

/** The view without prices: snapshot weights and snapshot all-time returns only. */
export function snapshotAccount(account: AccountInput): AccountView {
  const none = { "1M": null, YTD: null, "1Y": null } as const;
  return {
    id: account.id,
    name: account.name,
    fullName: account.fullName,
    placeholder: account.placeholder,
    holdingsAsOf: account.asOf,
    returns: { ...none, ALL: account.allTime === null ? null : account.allTime / 100 },
    holdings: account.holdings.map((h) => ({
      ticker: h.ticker,
      name: h.name,
      about: h.about,
      weight: h.weight / 100,
      returns: { ...none, ALL: h.allTime === null ? null : h.allTime / 100 },
      sinceListing: [],
      sinceBought: [],
    })),
  };
}
