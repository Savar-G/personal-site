#!/usr/bin/env node
// Turns Savar's private account exports into lib/investing-data.json for /investing.
//
//   node scripts/investing-import.mjs --tfsa "<Snowball Holdings.csv>" --tfsa-date 2026-06-07 \
//     [--rrsp <rrsp.json>] [--placeholder]
//
// The repo is public (I-5). The output holds only fractions and percentages: each
// holding's share of the account's value, its share of the money invested, the ratio
// of the two, and its all-time return. Shares, prices paid, and dollar totals stay in the input files,
// which never go in the repo.
//
// rrsp.json (kept outside the repo):
//   { "asOf": "2026-10-14", "holdings": [ { "ticker": "VFV", "weight": 70, "allTime": 21.4 }, ... ] }
// weight is percent of the account, allTime is percent gain since bought. Instead of
// allTime, a holding may give "avgCost" (cost per unit, CAD). "firstBuy" (YYYY-MM-DD)
// makes periods that start earlier show the gain since bought. When only the account's
// gain is known, put "allTime" on the account and null on the holdings.

import { readFileSync, writeFileSync } from "node:fs";
import { parseArgs } from "node:util";

const OUT = new URL("../lib/investing-data.json", import.meta.url);

// Short display names; the CSV carries legal names ("Visa Inc").
const NAMES = {
  GOOGL: "Alphabet",
  AMZN: "Amazon",
  BN: "Brookfield",
  MELI: "MercadoLibre",
  ASML: "ASML",
  META: "Meta",
  MU: "Micron",
  MSFT: "Microsoft",
  SPGI: "S&P Global",
  TVK: "Terravest",
  V: "Visa",
  MA: "Mastercard",
  ISRG: "Intuitive Surgical",
  VFV: "Vanguard S&P 500 Index ETF",
  CASV: "Avantis CIBC Global Small Cap Value ETF",
};

// What each fund holds, from its stated aim (ETFs only).
const ABOUT = {
  VFV: "Tracks the S&P 500: about 500 large US companies.",
  CASV: "Small companies in developed markets, picked for profitability and value.",
};

// Yahoo Finance symbols. Canadian listings take ".TO"; everything else is as exported.
const symbolFor = (ticker, currency) => (currency === "CAD" ? `${ticker}.TO` : ticker);

const { values: args } = parseArgs({
  options: {
    tfsa: { type: "string" },
    "tfsa-date": { type: "string" },
    rrsp: { type: "string" },
    // TICKER=YYYY-MM-DD, repeatable: the first buy, or the day after the last export
    // that did not hold it (a safe lower bound).
    "first-buy": { type: "string", multiple: true, default: [] },
    placeholder: { type: "boolean", default: false },
  },
});
const FIRST_BUY = Object.fromEntries(args["first-buy"].map((s) => s.split("=")));
if (!args.tfsa || !args["tfsa-date"]) {
  console.error("usage: --tfsa <csv> --tfsa-date YYYY-MM-DD [--rrsp <json>] [--placeholder]");
  process.exit(1);
}

// Minimal RFC 4180 reader: Snowball quotes every field.
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += c;
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.length > 1);
}

const round = (x, dp) => Math.round(x * 10 ** dp) / 10 ** dp;

function readTfsa(path) {
  const [header, ...rows] = parseCsv(readFileSync(path, "utf8").replace(/^﻿/, ""));
  // Some headers repeat ("Total profit" is the amount, then the percent).
  const col = (name, nth = 0) => {
    const idx = header.reduce((acc, h, i) => (h === name ? [...acc, i] : acc), []);
    if (idx[nth] === undefined) throw new Error(`CSV has no column "${name}" #${nth + 1}`);
    return idx[nth];
  };
  const c = {
    ticker: col("Holding"),
    name: col("Holdings' name"),
    currency: col("Currency"),
    cost: col("Cost basis"),
    value: col("Current value"),
    profit: col("Total profit", 0),
    profitPct: col("Total profit", 1),
    share: col("Share in portfolio"),
  };
  const raw = rows.map((r) => ({
    ticker: r[c.ticker],
    name: r[c.name],
    currency: r[c.currency],
    cost: Number(r[c.cost]),
    value: Number(r[c.value]),
    profit: Number(r[c.profit]),
    allTime: Number(r[c.profitPct]),
    share: Number(r[c.share]),
  }));

  // Snowball's "Share in portfolio" is in CAD, so it gives each currency's rate to CAD
  // without a second source. A CAD holding fixes the account total.
  const anchor = raw.find((h) => h.currency === "CAD");
  if (!anchor) throw new Error("need at least one CAD holding to recover FX");
  const totalCad = anchor.value / (anchor.share / 100);
  const toCad = (h) => (h.currency === "CAD" ? 1 : ((h.share / 100) * totalCad) / h.value);

  // Snowball's total profit % divides by all money ever put into the holding, sold
  // shares included, so "invested" is recovered from it rather than from the open
  // cost basis (they differ for MU, ASML, TVK, SPGI, GOOGL after trims).
  const invested = (h) => (h.allTime ? h.profit / (h.allTime / 100) : h.cost);
  const investedCad = raw.reduce((s, h) => s + invested(h) * toCad(h), 0);
  const profitCad = raw.reduce((s, h) => s + h.profit * toCad(h), 0);
  const shareSum = raw.reduce((s, h) => s + h.share, 0);

  return {
    allTime: round((profitCad / investedCad) * 100, 2),
    holdings: raw
      .map((h) => ({
        ticker: h.ticker,
        symbol: symbolFor(h.ticker, h.currency),
        name: NAMES[h.ticker] ?? h.name,
        currency: h.currency,
        firstBuy: FIRST_BUY[h.ticker],
        weight: round((h.share / shareSum) * 100, 3),
        investedShare: round(((invested(h) * toCad(h)) / investedCad) * 100, 3),
        valueRatio: round(h.value / invested(h), 5),
        allTime: round(h.allTime, 2),
      }))
      .sort((a, b) => b.weight - a.weight),
  };
}

// Last close on or before a date (YYYY-MM-DD), from Yahoo's chart endpoint.
async function closeOn(symbol, date) {
  const end = Date.parse(`${date}T23:59:59Z`) / 1000;
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?period1=${end - 14 * 86400}&period2=${end}&interval=1d`;
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  const r = (await res.json())?.chart?.result?.[0];
  const closes = (r?.indicators?.quote?.[0]?.close ?? []).filter((c) => c != null);
  if (!closes.length) throw new Error(`${symbol}: no close on or before ${date}`);
  return closes.at(-1);
}

async function readRrsp(path) {
  const { asOf, holdings, allTime = null } = JSON.parse(readFileSync(path, "utf8"));
  // An average cost per unit gives the all-time gain from the close on asOf. The cost
  // stays in the private input; only the percent goes out.
  for (const h of holdings) {
    if (h.avgCost != null) h.allTime = ((await closeOn(symbolFor(h.ticker, "CAD"), asOf)) / h.avgCost - 1) * 100;
  }
  const weightSum = holdings.reduce((s, h) => s + h.weight, 0);
  // Holding returns unknown: weights only. An account-level "allTime" (percent)
  // still gives the account's All time; the holdings show n/a.
  if (holdings.some((h) => h.allTime == null)) {
    return {
      asOf,
      allTime,
      holdings: holdings.map((h) => ({
        ticker: h.ticker,
        symbol: symbolFor(h.ticker, "CAD"),
        name: NAMES[h.ticker] ?? h.ticker,
        currency: "CAD",
        firstBuy: h.firstBuy,
        about: ABOUT[h.ticker],
        weight: round((h.weight / weightSum) * 100, 3),
        investedShare: round((h.weight / weightSum) * 100, 3),
        valueRatio: null,
        allTime: null,
      })),
    };
  }
  // Invested is value / (1 + gain); only the ratio between the two ETFs matters.
  const invested = holdings.map((h) => h.weight / (1 + h.allTime / 100));
  const investedSum = invested.reduce((a, b) => a + b, 0);
  return {
    asOf,
    allTime: round((weightSum / investedSum - 1) * 100, 2),
    holdings: holdings
      .map((h, i) => ({
        ticker: h.ticker,
        symbol: symbolFor(h.ticker, "CAD"),
        name: NAMES[h.ticker] ?? h.ticker,
        currency: "CAD",
        firstBuy: h.firstBuy,
        about: ABOUT[h.ticker],
        weight: round((h.weight / weightSum) * 100, 3),
        investedShare: round((invested[i] / investedSum) * 100, 3),
        valueRatio: round(1 + h.allTime / 100, 5),
        allTime: round(h.allTime, 2),
      }))
      .sort((a, b) => b.weight - a.weight),
  };
}

const tfsa = readTfsa(args.tfsa);
const rrsp = args.rrsp ? await readRrsp(args.rrsp) : null;

const data = {
  tfsa: {
    id: "tfsa",
    name: "TFSA",
    fullName: "Tax-Free Savings Account",
    asOf: args["tfsa-date"],
    placeholder: args.placeholder,
    ...tfsa,
  },
  rrsp: rrsp
    ? { id: "rrsp", name: "RRSP", fullName: "Registered Retirement Savings Plan", placeholder: args.placeholder, ...rrsp }
    : {
        // Until Savar sends the split: an even split, no all-time return, marked placeholder.
        id: "rrsp",
        name: "RRSP",
        fullName: "Registered Retirement Savings Plan",
        asOf: args["tfsa-date"],
        placeholder: true,
        allTime: null,
        holdings: ["VFV", "CASV"].map((t) => ({
          ticker: t,
          symbol: symbolFor(t, "CAD"),
          name: NAMES[t],
          currency: "CAD",
          weight: 50,
          investedShare: 50,
          valueRatio: null,
          allTime: null,
        })),
      },
};

writeFileSync(OUT, JSON.stringify(data, null, 2) + "\n");
console.log(`wrote ${OUT.pathname}: TFSA ${data.tfsa.holdings.length} holdings, RRSP ${data.rrsp.holdings.length}`);
