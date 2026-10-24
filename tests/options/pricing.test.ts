import { test } from "node:test";
import assert from "node:assert/strict";
import { blackScholes, expectedMove, impliedVolatility, normCdf } from "../../src/lib/options/blackScholes";
import { buildOccSymbol, describeContract, parseOccSymbol } from "../../src/lib/options/occ";

const close = (a: number, b: number, tol: number) => assert.ok(Math.abs(a - b) <= tol, `${a} not within ${tol} of ${b}`);

test("normCdf matches known values", () => {
  close(normCdf(0), 0.5, 1e-7);
  close(normCdf(1.96), 0.975, 1e-4);
  close(normCdf(-1), 0.158655, 1e-5);
});

test("Black-Scholes matches the textbook example (Hull: S=42, K=40, r=10%, vol=20%, T=0.5)", () => {
  const base = { spot: 42, strike: 40, years: 0.5, vol: 0.2, rate: 0.1 };
  close(blackScholes({ type: "call", ...base }).price, 4.76, 0.01);
  close(blackScholes({ type: "put", ...base }).price, 0.81, 0.01);
});

test("put-call parity holds with a dividend yield", () => {
  const base = { spot: 580, strike: 585, years: 30 / 365, vol: 0.16, rate: 0.04, dividendYield: 0.012 };
  const c = blackScholes({ type: "call", ...base }).price;
  const p = blackScholes({ type: "put", ...base }).price;
  const parity = 580 * Math.exp(-0.012 * base.years) - 585 * Math.exp(-0.04 * base.years);
  close(c - p, parity, 1e-6);
});

test("Greeks have the expected signs and ATM delta near 0.5", () => {
  const g = blackScholes({ type: "call", spot: 580, strike: 580, years: 7 / 365, vol: 0.15, rate: 0.04 });
  close(g.delta, 0.5, 0.05);
  assert.ok(g.gamma > 0 && g.vega > 0 && g.theta < 0 && g.rho > 0);
  const p = blackScholes({ type: "put", spot: 580, strike: 580, years: 7 / 365, vol: 0.15, rate: 0.04 });
  assert.ok(p.delta < 0 && p.rho < 0);
  close(g.delta - p.delta, 1, 1e-6);
});

test("impliedVolatility inverts the pricing model", () => {
  const inputs = { type: "put" as const, spot: 580, strike: 570, years: 14 / 365, rate: 0.04, dividendYield: 0.012 };
  const price = blackScholes({ ...inputs, vol: 0.22 }).price;
  close(impliedVolatility(price, inputs)!, 0.22, 1e-4);
  assert.equal(impliedVolatility(0, inputs), null);
});

test("expected move matches the Academy quiz example", () => {
  close(expectedMove(600, 0.15, 30), 25.8, 0.1);
});

test("OCC symbols round-trip", () => {
  const symbol = buildOccSymbol("SPY", "2026-10-30", "call", 580);
  assert.equal(symbol, "SPY261030C00580000");
  assert.deepEqual(parseOccSymbol(symbol), { root: "SPY", expiration: "2026-10-30", type: "call", strike: 580 });
  assert.deepEqual(parseOccSymbol("SPY261030P00582500"), { root: "SPY", expiration: "2026-10-30", type: "put", strike: 582.5 });
  assert.equal(parseOccSymbol("SPY 580C"), null);
  assert.equal(describeContract({ expiration: "2026-10-30", strike: 582.5, type: "put" }), "SPY Oct 30 '26 582.5 Put");
});
