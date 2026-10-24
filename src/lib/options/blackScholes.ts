import type { OptionType } from "./types";

// Black-Scholes-Merton pricing with a continuous dividend yield.
// Used for the Academy's interactive Greeks lab and to fill Greeks when a
// data feed leaves them blank. Feed-supplied values always take precedence.

export interface BsInputs {
  type: OptionType;
  /** Underlying price */
  spot: number;
  strike: number;
  /** Time to expiration in years */
  years: number;
  /** Annualized volatility as a decimal (0.18 = 18%) */
  vol: number;
  /** Annualized risk-free rate as a decimal */
  rate: number;
  /** Annualized dividend yield as a decimal */
  dividendYield?: number;
}

export interface BsResult {
  price: number;
  delta: number;
  gamma: number;
  /** Per calendar day */
  theta: number;
  /** Per 1 vol point */
  vega: number;
  /** Per 1 rate point */
  rho: number;
}

export function normPdf(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

// Abramowitz & Stegun 26.2.17, |error| < 7.5e-8.
export function normCdf(x: number): number {
  if (x < 0) return 1 - normCdf(-x);
  const t = 1 / (1 + 0.2316419 * x);
  const poly =
    t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return 1 - normPdf(x) * poly;
}

export function intrinsicValue(type: OptionType, spot: number, strike: number): number {
  return Math.max(type === "call" ? spot - strike : strike - spot, 0);
}

export function blackScholes(inputs: BsInputs): BsResult {
  const { type, spot: S, strike: K, rate: r } = inputs;
  const q = inputs.dividendYield ?? 0;
  const T = Math.max(inputs.years, 1e-8);
  const sigma = Math.max(inputs.vol, 1e-6);
  const sqrtT = Math.sqrt(T);
  const d1 = (Math.log(S / K) + (r - q + 0.5 * sigma * sigma) * T) / (sigma * sqrtT);
  const d2 = d1 - sigma * sqrtT;
  const dq = Math.exp(-q * T);
  const dr = Math.exp(-r * T);
  const pdf = normPdf(d1);

  const gamma = (dq * pdf) / (S * sigma * sqrtT);
  const vega = (S * dq * pdf * sqrtT) / 100;
  const decay = -(S * dq * pdf * sigma) / (2 * sqrtT);

  if (type === "call") {
    const Nd1 = normCdf(d1);
    const Nd2 = normCdf(d2);
    return {
      price: S * dq * Nd1 - K * dr * Nd2,
      delta: dq * Nd1,
      gamma,
      theta: (decay - r * K * dr * Nd2 + q * S * dq * Nd1) / 365,
      vega,
      rho: (K * T * dr * Nd2) / 100,
    };
  }
  const Nmd1 = normCdf(-d1);
  const Nmd2 = normCdf(-d2);
  return {
    price: K * dr * Nmd2 - S * dq * Nmd1,
    delta: dq * (normCdf(d1) - 1),
    gamma,
    theta: (decay + r * K * dr * Nmd2 - q * S * dq * Nmd1) / 365,
    vega,
    rho: -(K * T * dr * Nmd2) / 100,
  };
}

/** Solves for the volatility that reproduces `price`; null when no solution exists. */
export function impliedVolatility(
  price: number,
  inputs: Omit<BsInputs, "vol">,
): number | null {
  if (!(price > 0) || !(inputs.spot > 0) || !(inputs.strike > 0)) return null;
  const priceAt = (vol: number) => blackScholes({ ...inputs, vol }).price;
  let lo = 0.001;
  let hi = 5;
  if (price < priceAt(lo) - 1e-6 || price > priceAt(hi)) return null;
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    if (priceAt(mid) > price) hi = mid;
    else lo = mid;
    if (hi - lo < 1e-6) break;
  }
  return (lo + hi) / 2;
}

/** One-standard-deviation expected move over `days` calendar days. */
export function expectedMove(spot: number, vol: number, days: number): number {
  return spot * vol * Math.sqrt(Math.max(days, 0) / 365);
}
