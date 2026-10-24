// Parser and route tests for server/spyMarketData.ts. The payloads below are
// test fixtures shaped like each provider's documented response format.
import { test, beforeEach, after } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import type { AddressInfo } from "node:net";
import type { InternalAxiosRequestConfig } from "axios";
import {
  buildCboeSnapshot,
  clearMarketDataCache,
  marketHttp,
  normalizeTradierOption,
  normalizeTradierQuote,
  normalizeYahooDaily,
  normalizeYahooIntraday,
  normalizeYahooQuote,
  parseCboeTimestamp,
  registerSpyMarketRoutes,
} from "../../server/spyMarketData";

const cboeOption = (option: string, extra: Record<string, unknown> = {}) => ({
  option,
  bid: 5.1,
  bid_size: 120,
  ask: 5.14,
  ask_size: 98,
  iv: 0.1432,
  open_interest: 15321,
  volume: 8452,
  delta: 0.5821,
  gamma: 0.0412,
  vega: 0.2845,
  theta: -0.2311,
  rho: 0.0612,
  theo: 5.12,
  change: 0.45,
  open: 4.8,
  high: 5.6,
  low: 4.5,
  tick: "up",
  last_trade_price: 5.12,
  last_trade_time: "2026-10-23T11:47:00",
  percent_change: 9.6,
  prev_day_close: 4.67,
  ...extra,
});

const CBOE_PAYLOAD = {
  timestamp: "2026-10-23 11:47:28",
  data: {
    symbol: "SPY",
    current_price: 582.31,
    price_change: 1.12,
    price_change_percent: 0.1927,
    bid: 582.3,
    ask: 582.32,
    bid_size: 5,
    ask_size: 7,
    open: 580.5,
    high: 583.1,
    low: 579.8,
    close: 582.31,
    prev_day_close: 581.19,
    volume: 41234567,
    iv30: 15.2,
    last_trade_time: "2026-10-23T11:47:27",
    options: [
      cboeOption("SPY261022C00580000"), // already expired relative to the fetch time
      cboeOption("SPY261030C00580000"),
      cboeOption("SPY261030P00580000", { bid: 2.71, ask: 2.74, delta: -0.4179 }),
      cboeOption("SPY261030C00600000", { bid: 0.03, ask: 0.05, iv: 0, delta: 0, gamma: 0, vega: 0, theta: 0, rho: 0, last_trade_price: 0 }),
      cboeOption("SPY261106C00590000"),
      cboeOption("SPXW261030C05800000"), // other roots are ignored
    ],
  },
};

const YAHOO_INTRADAY = {
  chart: {
    result: [
      {
        meta: {
          symbol: "SPY",
          regularMarketPrice: 582.4,
          regularMarketTime: 1792770448,
          previousClose: 581.19,
          chartPreviousClose: 581.19,
          regularMarketDayHigh: 583.1,
          regularMarketDayLow: 579.8,
          regularMarketVolume: 41500000,
        },
        timestamp: [1792762200, 1792762260, 1792762320],
        indicators: { quote: [{ open: [580.5, 580.7, null], high: [580.9, 581, null], low: [580.4, 580.6, null], close: [580.7, 580.95, null], volume: [512000, 300100, null] }] },
      },
    ],
    error: null,
  },
};

const YAHOO_DAILY = {
  chart: {
    result: [
      {
        meta: { symbol: "SPY", regularMarketPrice: 582.4 },
        timestamp: [1792589400, 1792675800],
        indicators: { quote: [{ open: [578, 581], high: [581.5, 582], low: [577.2, 580], close: [580.12, 581.19], volume: [1, 2] }] },
      },
    ],
    error: null,
  },
};

const TRADIER_CHAIN = {
  options: {
    option: [
      {
        symbol: "SPY261030C00580000",
        option_type: "call",
        strike: 580,
        expiration_date: "2026-10-30",
        bid: 5.11,
        ask: 5.13,
        bidsize: 40,
        asksize: 25,
        last: 5.12,
        change: 0.44,
        volume: 9001,
        open_interest: 15321,
        greeks: { delta: 0.58, gamma: 0.041, theta: -0.23, vega: 0.28, rho: 0.06, mid_iv: 0.1431 },
      },
      {
        symbol: "SPY261030P00580000",
        option_type: "put",
        strike: 580,
        expiration_date: "2026-10-30",
        bid: 2.7,
        ask: 2.72,
        bidsize: 31,
        asksize: 12,
        last: 2.71,
        change: -0.3,
        volume: 7000,
        open_interest: 12000,
        greeks: { delta: -0.42, gamma: 0.041, theta: -0.21, vega: 0.28, rho: -0.05, mid_iv: 0.1502 },
      },
    ],
  },
};

const TRADIER_QUOTE = {
  quotes: {
    quote: {
      symbol: "SPY",
      last: 582.42,
      change: 1.23,
      change_percentage: 0.21,
      volume: 41600000,
      open: 580.5,
      high: 583.1,
      low: 579.8,
      prevclose: 581.19,
      bid: 582.41,
      ask: 582.43,
      bidsize: 3,
      asksize: 6,
      trade_date: 1792770450000,
    },
  },
};

const FETCHED_AT = new Date("2026-10-23T15:50:00Z"); // 11:50 AM ET

test("Cboe snapshot: contracts, expirations and model Greeks", () => {
  const snap = buildCboeSnapshot(CBOE_PAYLOAD, FETCHED_AT);
  assert.deepEqual(snap.expirations, ["2026-10-30", "2026-11-06"]);
  assert.equal(snap.contracts.filter((c) => c.symbol.startsWith("SPXW")).length, 0);
  const call = snap.contracts.find((c) => c.symbol === "SPY261030C00580000")!;
  assert.equal(call.type, "call");
  assert.equal(call.strike, 580);
  assert.equal(call.bid, 5.1);
  assert.equal(call.askSize, 98);
  assert.equal(call.openInterest, 15321);
  assert.equal(call.iv, 0.1432);
  assert.equal(call.delta, 0.5821);
  assert.equal(call.greeksSource, "feed");
  const wing = snap.contracts.find((c) => c.symbol === "SPY261030C00600000")!;
  assert.equal(wing.greeksSource, "model");
  assert.equal(wing.last, null);
  assert.ok(wing.iv! > 0 && wing.delta! > 0 && wing.delta! < 0.1);
  assert.equal(snap.quoteTime, "2026-10-23T15:47:28.000Z");
});

test("Cboe timestamps are read as New York time unless that lands in the future", () => {
  const now = new Date("2026-10-23T15:50:00Z");
  assert.equal(parseCboeTimestamp("2026-10-23 11:47:28", now), "2026-10-23T15:47:28.000Z");
  assert.equal(parseCboeTimestamp("2026-10-23 15:47:28", now), "2026-10-23T15:47:28.000Z");
  assert.equal(parseCboeTimestamp("garbage", now), null);
});

test("Yahoo chart payloads normalize to quote, intraday and daily bars", () => {
  const result = YAHOO_INTRADAY.chart.result[0];
  const q = normalizeYahooQuote(result, FETCHED_AT);
  assert.equal(q.last, 582.4);
  assert.equal(q.prevClose, 581.19);
  assert.equal(Number(q.change.toFixed(2)), 1.21);
  assert.equal(q.high, 583.1);
  assert.equal(q.source, "yahoo");
  assert.equal(q.delayMinutes, 0);
  assert.equal(normalizeYahooIntraday(result).length, 2, "null bars are skipped");
  const daily = normalizeYahooDaily(YAHOO_DAILY.chart.result[0]);
  assert.deepEqual(daily.map((d) => [d.date, d.close]), [["2026-10-21", 580.12], ["2026-10-22", 581.19]]);
});

test("Tradier payloads normalize options and quotes", () => {
  const call = normalizeTradierOption(TRADIER_CHAIN.options.option[0])!;
  assert.equal(call.iv, 0.1431);
  assert.equal(call.delta, 0.58);
  assert.equal(call.bidSize, 40);
  const quote = normalizeTradierQuote(TRADIER_QUOTE.quotes.quote, FETCHED_AT, 0);
  assert.equal(quote.last, 582.42);
  assert.equal(quote.bid, 582.41);
  assert.equal(quote.source, "tradier");
  assert.equal(normalizeTradierOption({ symbol: "not-an-option" }), null);
});

// ─── routes ──────────────────────────────────────────────────────────────────

type Responder = (config: InternalAxiosRequestConfig) => unknown;
let responder: Responder = () => {
  throw new Error("no responder");
};
marketHttp.defaults.adapter = async (config) => {
  const data = responder(config);
  if (data instanceof Error) throw Object.assign(data, { config, isAxiosError: false });
  return { data, status: 200, statusText: "OK", headers: {}, config };
};

const app = express();
registerSpyMarketRoutes(app);
const server = app.listen(0);
const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
after(() => server.close());

beforeEach(() => {
  clearMarketDataCache();
  delete process.env.TRADIER_ACCESS_TOKEN;
  delete process.env.TRADIER_SANDBOX;
});

const freshCboe = () => ({ ...CBOE_PAYLOAD, data: { ...CBOE_PAYLOAD.data } });

test("GET /api/spy/chain serves the Cboe chain without a Tradier token", async () => {
  responder = (config) => {
    if (config.url?.includes("cdn.cboe.com")) return freshCboe();
    throw new Error(`unexpected ${config.url}`);
  };
  const res = await fetch(`${base}/api/spy/chain?expiration=2026-10-30`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.source, "cboe");
  assert.equal(body.delayMinutes, 15);
  assert.equal(body.underlyingPrice, 582.31);
  assert.deepEqual(body.contracts.map((c: any) => c.symbol), ["SPY261030C00580000", "SPY261030P00580000", "SPY261030C00600000"]);
});

test("Tradier is preferred when configured and Cboe is the fallback", async () => {
  process.env.TRADIER_ACCESS_TOKEN = "test-token";
  responder = (config) => {
    if (config.url?.includes("api.tradier.com/v1/markets/options/chains")) {
      assert.equal(config.headers?.Authorization, "Bearer test-token");
      return TRADIER_CHAIN;
    }
    if (config.url?.includes("api.tradier.com/v1/markets/quotes")) return TRADIER_QUOTE;
    throw new Error(`unexpected ${config.url}`);
  };
  const live = await (await fetch(`${base}/api/spy/chain?expiration=2026-10-30`)).json();
  assert.equal(live.source, "tradier");
  assert.equal(live.delayMinutes, 0);
  assert.equal(live.underlyingPrice, 582.42);

  clearMarketDataCache();
  responder = (config) => {
    if (config.url?.includes("tradier.com")) return new Error("HTTP 401");
    if (config.url?.includes("cdn.cboe.com")) return freshCboe();
    throw new Error(`unexpected ${config.url}`);
  };
  const fallback = await (await fetch(`${base}/api/spy/chain?expiration=2026-10-30`)).json();
  assert.equal(fallback.source, "cboe");

  const status = await (await fetch(`${base}/api/spy/status`)).json();
  assert.equal(status.optionsProvider, "tradier");
  assert.equal(status.optionsDelayMinutes, 0);
});

test("GET /api/spy/quote falls back from Yahoo to Cboe", async () => {
  responder = (config) => {
    if (config.url?.includes("yahoo.com")) return new Error("HTTP 429");
    if (config.url?.includes("delayed_quotes/quotes/SPY.json")) return { timestamp: CBOE_PAYLOAD.timestamp, data: CBOE_PAYLOAD.data };
    throw new Error(`unexpected ${config.url}`);
  };
  const body = await (await fetch(`${base}/api/spy/quote`)).json();
  assert.equal(body.source, "cboe");
  assert.equal(body.last, 582.31);
});

test("routes validate input and report provider failures", async () => {
  assert.equal((await fetch(`${base}/api/spy/chain?expiration=tomorrow`)).status, 400);
  assert.equal((await fetch(`${base}/api/spy/contracts?symbols=AAPL`)).status, 400);
  responder = () => new Error("network down");
  const res = await fetch(`${base}/api/spy/expirations`);
  assert.equal(res.status, 502);
  assert.match((await res.json()).error, /All SPY data providers failed/);
});

test("GET /api/spy/contracts returns only the requested symbols", async () => {
  responder = (config) => {
    if (config.url?.includes("cdn.cboe.com")) return freshCboe();
    throw new Error(`unexpected ${config.url}`);
  };
  const body = await (await fetch(`${base}/api/spy/contracts?symbols=SPY261030P00580000,SPY261106C00590000`)).json();
  assert.deepEqual(body.contracts.map((c: any) => c.symbol).sort(), ["SPY261030P00580000", "SPY261106C00590000"]);
});
