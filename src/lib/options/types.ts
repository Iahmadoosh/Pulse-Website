// Shared types for the SPY Options Trainer. Used by both the Express server
// (server/spyMarketData.ts) and the React client.

export type OptionType = "call" | "put";

export type MarketDataProvider = "tradier" | "cboe" | "yahoo";

export interface OptionQuote {
  /** OCC symbol, e.g. SPY261030C00580000 */
  symbol: string;
  type: OptionType;
  strike: number;
  /** Expiration date in YYYY-MM-DD (America/New_York calendar date). */
  expiration: string;
  bid: number;
  ask: number;
  bidSize: number;
  askSize: number;
  last: number | null;
  change: number | null;
  volume: number;
  openInterest: number;
  /** Implied volatility as a decimal (0.18 = 18%). */
  iv: number | null;
  delta: number | null;
  gamma: number | null;
  /** Per calendar day, per share. */
  theta: number | null;
  /** Per 1 percentage-point change in IV, per share. */
  vega: number | null;
  /** Per 1 percentage-point change in rates, per share. */
  rho: number | null;
  /** "feed" when the provider supplied the Greeks, "model" when we filled them with Black-Scholes. */
  greeksSource: "feed" | "model" | "none";
}

export interface UnderlyingQuote {
  symbol: string;
  last: number;
  change: number;
  changePercent: number;
  bid: number | null;
  ask: number | null;
  bidSize: number | null;
  askSize: number | null;
  open: number | null;
  high: number | null;
  low: number | null;
  prevClose: number | null;
  volume: number | null;
  /** ISO timestamp of the provider's quote/trade time when known. */
  quoteTime: string | null;
  /** ISO timestamp of when this server fetched it. */
  fetchedAt: string;
  source: MarketDataProvider;
  delayMinutes: number;
}

export interface ChainResponse {
  symbol: string;
  expiration: string;
  underlyingPrice: number | null;
  quoteTime: string | null;
  fetchedAt: string;
  source: MarketDataProvider;
  delayMinutes: number;
  contracts: OptionQuote[];
}

export interface ContractsResponse {
  quoteTime: string | null;
  fetchedAt: string;
  source: MarketDataProvider;
  delayMinutes: number;
  contracts: OptionQuote[];
}

export interface ExpirationsResponse {
  source: MarketDataProvider;
  fetchedAt: string;
  expirations: string[];
}

export interface PriceBar {
  /** Epoch milliseconds. */
  t: number;
  close: number;
  volume: number | null;
}

export interface DailyBar {
  /** YYYY-MM-DD */
  date: string;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number;
}

export interface IntradayResponse {
  source: MarketDataProvider;
  fetchedAt: string;
  prevClose: number | null;
  bars: PriceBar[];
}

export interface DailyResponse {
  source: MarketDataProvider;
  fetchedAt: string;
  bars: DailyBar[];
}

export interface ProviderStatus {
  optionsProvider: MarketDataProvider;
  quoteProvider: MarketDataProvider;
  optionsDelayMinutes: number;
  quoteDelayMinutes: number;
  tradierConfigured: boolean;
  tradierSandbox: boolean;
}
