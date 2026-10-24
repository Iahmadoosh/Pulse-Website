// SPY market data for the Options Trainer.
//
// Providers, in priority order:
//   1. Tradier (TRADIER_ACCESS_TOKEN): real-time quotes, chains and Greeks with
//      a Tradier brokerage token; 15-minute delayed with a sandbox token.
//   2. Cboe delayed quotes (no key): the full SPY chain with bid/ask, sizes,
//      volume, open interest, IV and Greeks, delayed 15 minutes.
//   3. Yahoo Finance chart API (no key): SPY last price and intraday/daily bars.
//
// Every response says which provider produced it and how delayed it is, so the
// client never presents delayed data as live.

import type { Express, Request, Response } from "express";
import axios from "axios";
import { parseOccSymbol } from "../src/lib/options/occ";
import { blackScholes, impliedVolatility } from "../src/lib/options/blackScholes";
import {
  addDays,
  etDateString,
  etWallTimeToDate,
  expirationCutoff,
  latestSessionDate,
  yearsToExpiration,
} from "../src/lib/options/marketHours";
import type {
  ChainResponse,
  ContractsResponse,
  DailyBar,
  DailyResponse,
  ExpirationsResponse,
  IntradayResponse,
  MarketDataProvider,
  OptionQuote,
  PriceBar,
  ProviderStatus,
  UnderlyingQuote,
} from "../src/lib/options/types";

const SYMBOL = "SPY";
const SPY_DIVIDEND_YIELD = 0.012;
const CBOE_DELAY_MINUTES = 15;
const CBOE_OPTIONS_URL = "https://cdn.cboe.com/api/global/delayed_quotes/options/SPY.json";
const CBOE_QUOTE_URL = "https://cdn.cboe.com/api/global/delayed_quotes/quotes/SPY.json";
const YAHOO_CHART_URL = "https://query1.finance.yahoo.com/v8/finance/chart/SPY";
const MAX_CONTRACT_SYMBOLS = 60;

/** Shared HTTP client (exported so tests can stub its adapter). */
export const marketHttp = axios.create({
  timeout: 20_000,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    Accept: "application/json",
  },
});

// ─── helpers ─────────────────────────────────────────────────────────────────

function num(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function round(value: number | null, digits = 4): number | null {
  if (value === null) return null;
  const f = 10 ** digits;
  return Math.round(value * f) / f;
}

function asArray<T>(value: T | T[] | null | undefined): T[] {
  if (value === null || value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

/** IV sometimes arrives as a percentage (18.5) instead of a decimal (0.185). */
function normalizeIv(value: unknown): number | null {
  const iv = num(value);
  if (iv === null || iv <= 0) return null;
  return iv > 5 ? iv / 100 : iv;
}

function riskFreeRate(): number {
  const r = Number(process.env.RISK_FREE_RATE);
  return Number.isFinite(r) && r >= 0 && r < 0.25 ? r : 0.04;
}

interface CacheEntry {
  expires: number;
  value?: unknown;
  pending?: Promise<unknown>;
}
const cache = new Map<string, CacheEntry>();

export function clearMarketDataCache() {
  cache.clear();
}

/** TTL cache with in-flight de-duplication so concurrent clients share one upstream request. */
async function cached<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  const entry = cache.get(key);
  if (entry && entry.value !== undefined && entry.expires > Date.now()) return entry.value as T;
  if (entry?.pending) return entry.pending as Promise<T>;
  const pending = load().then(
    (value) => {
      cache.set(key, { expires: Date.now() + ttlMs, value });
      return value;
    },
    (error) => {
      const current = cache.get(key);
      if (current) delete current.pending;
      throw error;
    },
  );
  cache.set(key, { expires: entry?.expires ?? 0, value: entry?.value, pending });
  return pending;
}

function describeError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    return status ? `HTTP ${status} from ${error.config?.url ?? "provider"}` : error.message;
  }
  return error instanceof Error ? error.message : String(error);
}

/** Fills Greeks with Black-Scholes when the feed left them blank. */
function withModelGreeks(quote: OptionQuote, spot: number | null, now: Date): OptionQuote {
  const feedHasGreeks = [quote.delta, quote.gamma, quote.theta, quote.vega].some(
    (g) => g !== null && g !== 0,
  );
  if (feedHasGreeks) return { ...quote, greeksSource: "feed" };
  if (!spot || spot <= 0) return { ...quote, greeksSource: "none" };
  const base = {
    type: quote.type,
    spot,
    strike: quote.strike,
    years: yearsToExpiration(quote.expiration, now),
    rate: riskFreeRate(),
    dividendYield: SPY_DIVIDEND_YIELD,
  };
  const mid = quote.ask > 0 ? (Math.max(quote.bid, 0) + quote.ask) / 2 : null;
  const vol = quote.iv ?? (mid ? impliedVolatility(mid, base) : null);
  if (!vol) return { ...quote, greeksSource: "none" };
  const g = blackScholes({ ...base, vol });
  return {
    ...quote,
    iv: quote.iv ?? round(vol),
    delta: round(g.delta),
    gamma: round(g.gamma),
    theta: round(g.theta),
    vega: round(g.vega),
    rho: round(g.rho),
    greeksSource: "model",
  };
}

function sortContracts(contracts: OptionQuote[]): OptionQuote[] {
  return contracts.sort(
    (a, b) =>
      a.expiration.localeCompare(b.expiration) ||
      a.strike - b.strike ||
      (a.type === b.type ? 0 : a.type === "call" ? -1 : 1),
  );
}

function isLiveExpiration(expiration: string, now: Date): boolean {
  return expirationCutoff(expiration).getTime() > now.getTime();
}

// ─── Tradier ─────────────────────────────────────────────────────────────────

interface TradierConfig {
  token: string;
  sandbox: boolean;
  baseUrl: string;
}

function tradierConfig(): TradierConfig | null {
  const token = process.env.TRADIER_ACCESS_TOKEN?.trim();
  if (!token) return null;
  const sandbox = /^(1|true|yes)$/i.test(process.env.TRADIER_SANDBOX?.trim() ?? "");
  return {
    token,
    sandbox,
    baseUrl: sandbox ? "https://sandbox.tradier.com/v1" : "https://api.tradier.com/v1",
  };
}

function tradierDelay(config: TradierConfig): number {
  return config.sandbox ? 15 : 0;
}

async function tradierGet<T>(config: TradierConfig, path: string, params: Record<string, string>): Promise<T> {
  const { data } = await marketHttp.get<T>(`${config.baseUrl}${path}`, {
    params,
    headers: { Authorization: `Bearer ${config.token}`, Accept: "application/json" },
  });
  return data;
}

function tradierTime(epochMs: unknown): string | null {
  const ms = num(epochMs);
  return ms ? new Date(ms).toISOString() : null;
}

export function normalizeTradierOption(raw: any): OptionQuote | null {
  const parsed = parseOccSymbol(String(raw?.symbol ?? ""));
  if (!parsed || parsed.root !== SYMBOL) return null;
  const greeks = raw.greeks ?? {};
  const last = num(raw.last);
  return {
    symbol: String(raw.symbol),
    type: raw.option_type === "put" || raw.option_type === "call" ? raw.option_type : parsed.type,
    strike: num(raw.strike) ?? parsed.strike,
    expiration: typeof raw.expiration_date === "string" ? raw.expiration_date : parsed.expiration,
    bid: num(raw.bid) ?? 0,
    ask: num(raw.ask) ?? 0,
    bidSize: num(raw.bidsize) ?? 0,
    askSize: num(raw.asksize) ?? 0,
    last: last !== null && last > 0 ? last : null,
    change: num(raw.change),
    volume: num(raw.volume) ?? 0,
    openInterest: num(raw.open_interest) ?? 0,
    iv: normalizeIv(greeks.mid_iv ?? greeks.smv_vol),
    delta: num(greeks.delta),
    gamma: num(greeks.gamma),
    theta: num(greeks.theta),
    vega: num(greeks.vega),
    rho: num(greeks.rho),
    greeksSource: "feed",
  };
}

export function normalizeTradierQuote(raw: any, fetchedAt: Date, delayMinutes: number): UnderlyingQuote {
  const last = num(raw?.last);
  if (last === null) throw new Error("Tradier returned no SPY last price");
  const prevClose = num(raw.prevclose);
  const change = num(raw.change) ?? (prevClose !== null ? last - prevClose : 0);
  return {
    symbol: SYMBOL,
    last,
    change,
    changePercent: num(raw.change_percentage) ?? (prevClose ? (change / prevClose) * 100 : 0),
    bid: num(raw.bid),
    ask: num(raw.ask),
    bidSize: num(raw.bidsize),
    askSize: num(raw.asksize),
    open: num(raw.open),
    high: num(raw.high),
    low: num(raw.low),
    prevClose,
    volume: num(raw.volume),
    quoteTime: tradierTime(raw.trade_date),
    fetchedAt: fetchedAt.toISOString(),
    source: "tradier",
    delayMinutes,
  };
}

async function tradierQuote(config: TradierConfig): Promise<UnderlyingQuote> {
  const data = await tradierGet<any>(config, "/markets/quotes", { symbols: SYMBOL });
  const quote = asArray(data?.quotes?.quote).find((q: any) => q?.symbol === SYMBOL);
  return normalizeTradierQuote(quote, new Date(), tradierDelay(config));
}

async function tradierExpirations(config: TradierConfig): Promise<ExpirationsResponse> {
  const data = await tradierGet<any>(config, "/markets/options/expirations", {
    symbol: SYMBOL,
    includeAllRoots: "true",
  });
  const now = new Date();
  const expirations = asArray<string>(data?.expirations?.date)
    .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d) && isLiveExpiration(d, now))
    .sort();
  if (!expirations.length) throw new Error("Tradier returned no SPY expirations");
  return { source: "tradier", fetchedAt: now.toISOString(), expirations };
}

async function tradierChain(config: TradierConfig, expiration: string): Promise<ChainResponse> {
  const [chainData, quote] = await Promise.all([
    tradierGet<any>(config, "/markets/options/chains", {
      symbol: SYMBOL,
      expiration,
      greeks: "true",
    }),
    tradierQuote(config).catch(() => null),
  ]);
  const now = new Date();
  const spot = quote?.last ?? null;
  const contracts = asArray(chainData?.options?.option)
    .map(normalizeTradierOption)
    .filter((c): c is OptionQuote => c !== null && c.expiration === expiration)
    .map((c) => withModelGreeks(c, spot, now));
  if (!contracts.length) throw new Error(`Tradier returned no SPY contracts for ${expiration}`);
  return {
    symbol: SYMBOL,
    expiration,
    underlyingPrice: spot,
    quoteTime: quote?.quoteTime ?? null,
    fetchedAt: now.toISOString(),
    source: "tradier",
    delayMinutes: tradierDelay(config),
    contracts: sortContracts(contracts),
  };
}

async function tradierContracts(config: TradierConfig, symbols: string[]): Promise<ContractsResponse> {
  const [data, quote] = await Promise.all([
    tradierGet<any>(config, "/markets/quotes", { symbols: symbols.join(","), greeks: "true" }),
    tradierQuote(config).catch(() => null),
  ]);
  const now = new Date();
  const contracts = asArray(data?.quotes?.quote)
    .map(normalizeTradierOption)
    .filter((c): c is OptionQuote => c !== null)
    .map((c) => withModelGreeks(c, quote?.last ?? null, now));
  return {
    quoteTime: quote?.quoteTime ?? null,
    fetchedAt: now.toISOString(),
    source: "tradier",
    delayMinutes: tradierDelay(config),
    contracts,
  };
}

async function tradierIntraday(config: TradierConfig): Promise<IntradayResponse> {
  const session = latestSessionDate();
  const [data, quote] = await Promise.all([
    tradierGet<any>(config, "/markets/timesales", {
      symbol: SYMBOL,
      interval: "1min",
      start: `${session} 09:30`,
      end: `${session} 16:00`,
      session_filter: "open",
    }),
    tradierQuote(config).catch(() => null),
  ]);
  const bars: PriceBar[] = asArray(data?.series?.data)
    .map((row: any) => ({
      t: (num(row.timestamp) ?? 0) * 1000,
      close: num(row.close) ?? num(row.price) ?? NaN,
      volume: num(row.volume),
    }))
    .filter((b) => b.t > 0 && Number.isFinite(b.close));
  if (!bars.length) throw new Error("Tradier returned no SPY intraday bars");
  return { source: "tradier", fetchedAt: new Date().toISOString(), prevClose: quote?.prevClose ?? null, bars };
}

async function tradierDaily(config: TradierConfig): Promise<DailyResponse> {
  const end = etDateString(new Date());
  const data = await tradierGet<any>(config, "/markets/history", {
    symbol: SYMBOL,
    interval: "daily",
    start: addDays(end, -120),
    end,
  });
  const bars: DailyBar[] = asArray(data?.history?.day)
    .map((d: any) => ({
      date: String(d.date),
      open: num(d.open),
      high: num(d.high),
      low: num(d.low),
      close: num(d.close) ?? NaN,
    }))
    .filter((b) => /^\d{4}-\d{2}-\d{2}$/.test(b.date) && Number.isFinite(b.close));
  if (!bars.length) throw new Error("Tradier returned no SPY daily history");
  return { source: "tradier", fetchedAt: new Date().toISOString(), bars };
}

// ─── Cboe delayed quotes ─────────────────────────────────────────────────────

interface CboeSnapshot {
  quoteTime: string | null;
  fetchedAt: Date;
  underlying: any;
  contracts: OptionQuote[];
  expirations: string[];
}

/** Cboe stamps snapshots with a zone-less "YYYY-MM-DD HH:MM:SS"; accept either ET or UTC. */
export function parseCboeTimestamp(value: unknown, now: Date = new Date()): string | null {
  const match = /^(\d{4}-\d{2}-\d{2})[ T](\d{2}):(\d{2}):(\d{2})/.exec(String(value ?? ""));
  if (!match) return null;
  const [, date, hh, mm, ss] = match;
  const asEt = etWallTimeToDate(date, Number(hh), Number(mm)).getTime() + Number(ss) * 1000;
  // A UTC stamp read as New York time lands hours in the future.
  if (asEt <= now.getTime() + 120_000) return new Date(asEt).toISOString();
  return new Date(`${date}T${hh}:${mm}:${ss}Z`).toISOString();
}

export function normalizeCboeOption(raw: any): OptionQuote | null {
  const parsed = parseOccSymbol(String(raw?.option ?? ""));
  if (!parsed || parsed.root !== SYMBOL) return null;
  const last = num(raw.last_trade_price);
  return {
    symbol: String(raw.option),
    type: parsed.type,
    strike: parsed.strike,
    expiration: parsed.expiration,
    bid: num(raw.bid) ?? 0,
    ask: num(raw.ask) ?? 0,
    bidSize: num(raw.bid_size) ?? 0,
    askSize: num(raw.ask_size) ?? 0,
    last: last !== null && last > 0 ? last : null,
    change: num(raw.change),
    volume: num(raw.volume) ?? 0,
    openInterest: num(raw.open_interest) ?? 0,
    iv: normalizeIv(raw.iv),
    delta: num(raw.delta),
    gamma: num(raw.gamma),
    theta: num(raw.theta),
    vega: num(raw.vega),
    rho: num(raw.rho),
    greeksSource: "feed",
  };
}

export function buildCboeSnapshot(payload: any, fetchedAt: Date): CboeSnapshot {
  const data = payload?.data;
  if (!data || !Array.isArray(data.options)) throw new Error("Unexpected Cboe options payload");
  const spot = num(data.current_price);
  const contracts = sortContracts(
    data.options
      .map(normalizeCboeOption)
      .filter((c: OptionQuote | null): c is OptionQuote => c !== null)
      .map((c: OptionQuote) => withModelGreeks(c, spot, fetchedAt)),
  );
  const expirations = [...new Set(contracts.map((c) => c.expiration))]
    .filter((d) => isLiveExpiration(d, fetchedAt))
    .sort();
  return {
    quoteTime: parseCboeTimestamp(payload.timestamp, fetchedAt),
    fetchedAt,
    underlying: data,
    contracts,
    expirations,
  };
}

function cboeSnapshot(): Promise<CboeSnapshot> {
  return cached("cboe:options", 15_000, async () => {
    const { data } = await marketHttp.get(CBOE_OPTIONS_URL, { timeout: 45_000 });
    return buildCboeSnapshot(data, new Date());
  });
}

export function normalizeCboeQuote(data: any, quoteTime: string | null, fetchedAt: Date): UnderlyingQuote {
  const last = num(data?.current_price);
  if (last === null) throw new Error("Cboe returned no SPY price");
  const prevClose = num(data.prev_day_close);
  return {
    symbol: SYMBOL,
    last,
    change: num(data.price_change) ?? (prevClose !== null ? last - prevClose : 0),
    changePercent: num(data.price_change_percent) ?? 0,
    bid: num(data.bid),
    ask: num(data.ask),
    bidSize: num(data.bid_size),
    askSize: num(data.ask_size),
    open: num(data.open),
    high: num(data.high),
    low: num(data.low),
    prevClose,
    volume: num(data.volume),
    quoteTime,
    fetchedAt: fetchedAt.toISOString(),
    source: "cboe",
    delayMinutes: CBOE_DELAY_MINUTES,
  };
}

async function cboeQuote(): Promise<UnderlyingQuote> {
  return cached("cboe:quote", 10_000, async () => {
    const { data } = await marketHttp.get(CBOE_QUOTE_URL);
    const fetchedAt = new Date();
    return normalizeCboeQuote(data?.data, parseCboeTimestamp(data?.timestamp, fetchedAt), fetchedAt);
  });
}

// ─── Yahoo Finance chart API ─────────────────────────────────────────────────

function yahooChart(params: Record<string, string>, ttlMs: number): Promise<any> {
  const key = `yahoo:${new URLSearchParams(params).toString()}`;
  return cached(key, ttlMs, async () => {
    const { data } = await marketHttp.get(YAHOO_CHART_URL, { params });
    const result = data?.chart?.result?.[0];
    if (!result?.meta) throw new Error(data?.chart?.error?.description ?? "Unexpected Yahoo chart payload");
    return result;
  });
}

export function normalizeYahooQuote(result: any, fetchedAt: Date): UnderlyingQuote {
  const meta = result.meta;
  const last = num(meta.regularMarketPrice);
  if (last === null) throw new Error("Yahoo returned no SPY price");
  const prevClose = num(meta.previousClose) ?? num(meta.chartPreviousClose);
  const quote = result.indicators?.quote?.[0] ?? {};
  const highs = asArray<number | null>(quote.high).filter((v): v is number => num(v) !== null);
  const lows = asArray<number | null>(quote.low).filter((v): v is number => num(v) !== null);
  const opens = asArray<number | null>(quote.open).filter((v): v is number => num(v) !== null);
  const volumes = asArray<number | null>(quote.volume).filter((v): v is number => num(v) !== null);
  const change = prevClose !== null ? last - prevClose : 0;
  const marketTime = num(meta.regularMarketTime);
  return {
    symbol: SYMBOL,
    last,
    change,
    changePercent: prevClose ? (change / prevClose) * 100 : 0,
    bid: null,
    ask: null,
    bidSize: null,
    askSize: null,
    open: num(meta.regularMarketOpen) ?? opens[0] ?? null,
    high: num(meta.regularMarketDayHigh) ?? (highs.length ? Math.max(...highs) : null),
    low: num(meta.regularMarketDayLow) ?? (lows.length ? Math.min(...lows) : null),
    prevClose,
    volume: num(meta.regularMarketVolume) ?? (volumes.length ? volumes.reduce((a, b) => a + b, 0) : null),
    quoteTime: marketTime ? new Date(marketTime * 1000).toISOString() : null,
    fetchedAt: fetchedAt.toISOString(),
    source: "yahoo",
    delayMinutes: 0,
  };
}

async function yahooIntradayResult(): Promise<any> {
  return yahooChart({ interval: "1m", range: "1d", includePrePost: "false" }, 5_000);
}

export function normalizeYahooIntraday(result: any): PriceBar[] {
  const timestamps = asArray<number>(result.timestamp);
  const quote = result.indicators?.quote?.[0] ?? {};
  const closes = asArray<number | null>(quote.close);
  const volumes = asArray<number | null>(quote.volume);
  const bars: PriceBar[] = [];
  timestamps.forEach((ts, i) => {
    const close = num(closes[i]);
    if (close !== null) bars.push({ t: ts * 1000, close, volume: num(volumes[i]) });
  });
  return bars;
}

export function normalizeYahooDaily(result: any): DailyBar[] {
  const timestamps = asArray<number>(result.timestamp);
  const quote = result.indicators?.quote?.[0] ?? {};
  const bars: DailyBar[] = [];
  timestamps.forEach((ts, i) => {
    const close = num(quote.close?.[i]);
    if (close === null) return;
    bars.push({
      date: etDateString(new Date(ts * 1000)),
      open: num(quote.open?.[i]),
      high: num(quote.high?.[i]),
      low: num(quote.low?.[i]),
      close,
    });
  });
  return bars;
}

// ─── provider selection ──────────────────────────────────────────────────────

async function firstSuccessful<T>(attempts: Array<[string, () => Promise<T>]>): Promise<T> {
  const errors: string[] = [];
  for (const [name, attempt] of attempts) {
    try {
      return await attempt();
    } catch (error) {
      errors.push(`${name}: ${describeError(error)}`);
    }
  }
  throw new Error(`All SPY data providers failed (${errors.join("; ")})`);
}

export async function getUnderlyingQuote(): Promise<UnderlyingQuote> {
  const tradier = tradierConfig();
  const attempts: Array<[string, () => Promise<UnderlyingQuote>]> = [];
  if (tradier) attempts.push(["tradier", () => cached("tradier:quote", 2_000, () => tradierQuote(tradier))]);
  attempts.push(["yahoo", async () => normalizeYahooQuote(await yahooIntradayResult(), new Date())]);
  attempts.push(["cboe", cboeQuote]);
  return firstSuccessful(attempts);
}

export async function getExpirations(): Promise<ExpirationsResponse> {
  const tradier = tradierConfig();
  const attempts: Array<[string, () => Promise<ExpirationsResponse>]> = [];
  if (tradier) {
    attempts.push(["tradier", () => cached("tradier:expirations", 60_000, () => tradierExpirations(tradier))]);
  }
  attempts.push([
    "cboe",
    async () => {
      const snap = await cboeSnapshot();
      return { source: "cboe", fetchedAt: snap.fetchedAt.toISOString(), expirations: snap.expirations };
    },
  ]);
  return firstSuccessful(attempts);
}

export async function getChain(expiration: string): Promise<ChainResponse> {
  const tradier = tradierConfig();
  const attempts: Array<[string, () => Promise<ChainResponse>]> = [];
  if (tradier) {
    attempts.push(["tradier", () => cached(`tradier:chain:${expiration}`, 3_000, () => tradierChain(tradier, expiration))]);
  }
  attempts.push([
    "cboe",
    async () => {
      const snap = await cboeSnapshot();
      const contracts = snap.contracts.filter((c) => c.expiration === expiration);
      if (!contracts.length) throw new Error(`Cboe has no SPY contracts for ${expiration}`);
      return {
        symbol: SYMBOL,
        expiration,
        underlyingPrice: num(snap.underlying.current_price),
        quoteTime: snap.quoteTime,
        fetchedAt: snap.fetchedAt.toISOString(),
        source: "cboe",
        delayMinutes: CBOE_DELAY_MINUTES,
        contracts,
      };
    },
  ]);
  return firstSuccessful(attempts);
}

export async function getContracts(symbols: string[]): Promise<ContractsResponse> {
  const tradier = tradierConfig();
  const key = [...symbols].sort().join(",");
  const attempts: Array<[string, () => Promise<ContractsResponse>]> = [];
  if (tradier) {
    attempts.push(["tradier", () => cached(`tradier:contracts:${key}`, 3_000, () => tradierContracts(tradier, symbols))]);
  }
  attempts.push([
    "cboe",
    async () => {
      const snap = await cboeSnapshot();
      const wanted = new Set(symbols);
      return {
        quoteTime: snap.quoteTime,
        fetchedAt: snap.fetchedAt.toISOString(),
        source: "cboe",
        delayMinutes: CBOE_DELAY_MINUTES,
        contracts: snap.contracts.filter((c) => wanted.has(c.symbol)),
      };
    },
  ]);
  return firstSuccessful(attempts);
}

export async function getIntraday(): Promise<IntradayResponse> {
  const tradier = tradierConfig();
  const attempts: Array<[string, () => Promise<IntradayResponse>]> = [];
  if (tradier) attempts.push(["tradier", () => cached("tradier:intraday", 30_000, () => tradierIntraday(tradier))]);
  attempts.push([
    "yahoo",
    async () => {
      const result = await yahooIntradayResult();
      return {
        source: "yahoo",
        fetchedAt: new Date().toISOString(),
        prevClose: num(result.meta.previousClose) ?? num(result.meta.chartPreviousClose),
        bars: normalizeYahooIntraday(result),
      };
    },
  ]);
  return firstSuccessful(attempts);
}

export async function getDaily(): Promise<DailyResponse> {
  const tradier = tradierConfig();
  const attempts: Array<[string, () => Promise<DailyResponse>]> = [];
  if (tradier) attempts.push(["tradier", () => cached("tradier:daily", 300_000, () => tradierDaily(tradier))]);
  attempts.push([
    "yahoo",
    () =>
      cached("yahoo:daily", 300_000, async () => {
        const result = await yahooChart({ interval: "1d", range: "6mo" }, 0);
        return { source: "yahoo", fetchedAt: new Date().toISOString(), bars: normalizeYahooDaily(result) };
      }),
  ]);
  return firstSuccessful(attempts);
}

export function getProviderStatus(): ProviderStatus {
  const tradier = tradierConfig();
  return {
    optionsProvider: tradier ? "tradier" : "cboe",
    quoteProvider: tradier ? "tradier" : "yahoo",
    optionsDelayMinutes: tradier ? tradierDelay(tradier) : CBOE_DELAY_MINUTES,
    quoteDelayMinutes: tradier ? tradierDelay(tradier) : 0,
    tradierConfigured: Boolean(tradier),
    tradierSandbox: Boolean(tradier?.sandbox),
  };
}

// ─── routes ──────────────────────────────────────────────────────────────────

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const SPY_OCC_RE = /^SPY\d{6}[CP]\d{8}$/;

function send<T>(res: Response, load: () => Promise<T>) {
  res.set("Cache-Control", "no-store");
  load().then(
    (body) => res.json(body),
    (error) => {
      console.error("[spy-market-data]", describeError(error));
      res.status(502).json({ error: describeError(error) });
    },
  );
}

export function registerSpyMarketRoutes(app: Express) {
  app.get("/api/spy/status", (_req: Request, res: Response) => {
    res.set("Cache-Control", "no-store");
    res.json(getProviderStatus());
  });

  app.get("/api/spy/quote", (_req, res) => send(res, getUnderlyingQuote));
  app.get("/api/spy/intraday", (_req, res) => send(res, getIntraday));
  app.get("/api/spy/daily", (_req, res) => send(res, getDaily));
  app.get("/api/spy/expirations", (_req, res) => send(res, getExpirations));

  app.get("/api/spy/chain", (req, res) => {
    const expiration = String(req.query.expiration ?? "");
    if (!DATE_RE.test(expiration)) {
      res.status(400).json({ error: "expiration must be YYYY-MM-DD" });
      return;
    }
    send(res, () => getChain(expiration));
  });

  app.get("/api/spy/contracts", (req, res) => {
    const symbols = [
      ...new Set(
        String(req.query.symbols ?? "")
          .split(",")
          .map((s) => s.trim().toUpperCase())
          .filter((s) => SPY_OCC_RE.test(s)),
      ),
    ];
    if (!symbols.length || symbols.length > MAX_CONTRACT_SYMBOLS) {
      res.status(400).json({ error: `symbols must list 1-${MAX_CONTRACT_SYMBOLS} SPY OCC option symbols` });
      return;
    }
    send(res, () => getContracts(symbols));
  });
}
