import { test } from "node:test";
import assert from "node:assert/strict";
import {
  availableToClose,
  buyingPower,
  cancelOrder,
  computeEquity,
  createChallenge,
  endChallenge,
  enforceLossLimit,
  equityFloor,
  processWorkingOrders,
  recordEquity,
  settleExpirations,
  submitOrder,
  summarizeChallenge,
  updateMarks,
  type ChallengeState,
  type OrderRequest,
} from "../../src/lib/options/challenge";
import { getMarketStatus } from "../../src/lib/options/marketHours";
import { tradeCoaching } from "../../src/lib/options/coaching";
import type { OptionQuote } from "../../src/lib/options/types";

const OPEN = new Date("2026-10-23T15:00:00Z"); // Friday 11:00 AM ET
const CLOSED = new Date("2026-10-24T15:00:00Z"); // Saturday
const SYMBOL = "SPY261030C00585000";
const contract = { symbol: SYMBOL, type: "call" as const, strike: 585, expiration: "2026-10-30" };

function quote(bid: number, ask: number, extra: Partial<OptionQuote> = {}): OptionQuote {
  return {
    ...contract,
    bid,
    ask,
    bidSize: 50,
    askSize: 50,
    last: null,
    change: null,
    volume: 1200,
    openInterest: 5000,
    iv: 0.15,
    delta: 0.35,
    gamma: 0.04,
    theta: -0.12,
    vega: 0.2,
    rho: 0.03,
    greeksSource: "feed",
    ...extra,
  };
}

const ctx = (q: OptionQuote | null, now = OPEN, quoteAgeMs = 0) => ({ quote: q, quoteAgeMs, market: getMarketStatus(now), now });
const buy = (qty: number, kind: "market" | "limit" = "market", limitPrice?: number): OrderRequest => ({
  contract,
  side: "buy_to_open",
  qty,
  kind,
  limitPrice,
});
const sell = (qty: number, kind: "market" | "limit" = "market", limitPrice?: number): OrderRequest => ({
  contract,
  side: "sell_to_close",
  qty,
  kind,
  limitPrice,
});

function bought(tier: "hard" | "medium" | "easy" = "medium", ask = 1.0): ChallengeState {
  const res = submitOrder(createChallenge(tier, 0.65, OPEN), buy(1), ctx(quote(ask - 0.02, ask)));
  assert.equal(res.error, null);
  return res.state;
}

test("tiers set the equity floor from the $300 start", () => {
  assert.equal(equityFloor(createChallenge("hard")), 270);
  assert.equal(equityFloor(createChallenge("medium")), 225);
  assert.equal(equityFloor(createChallenge("easy")), 150);
  assert.equal(createChallenge("easy").cash, 300);
});

test("market buy fills at the ask and charges commission", () => {
  const s = bought("medium", 1.0);
  assert.equal(s.cash, 199.35);
  assert.equal(s.positions[0].qty, 1);
  assert.equal(s.positions[0].avgPrice, 1.0);
  assert.equal(s.fills[0].price, 1.0);
  assert.equal(s.fills[0].commission, 0.65);
});

test("orders are rejected outside the standards", () => {
  const fresh = createChallenge("medium", 0.65, OPEN);
  assert.match(submitOrder(fresh, buy(1), ctx(quote(0.98, 1), CLOSED)).error!, /market is closed/);
  assert.match(submitOrder(fresh, buy(1), ctx(quote(3.4, 3.5))).error!, /Not enough buying power/);
  assert.match(submitOrder(fresh, sell(1), ctx(quote(0.98, 1))).error!, /don't hold this contract/);
  assert.match(submitOrder(fresh, buy(1), ctx(quote(0.98, 1), OPEN, 120_000)).error!, /stale/);
  assert.match(submitOrder(fresh, buy(1, "limit", 1.005), ctx(quote(0.98, 1))).error!, /\$0\.01 increments/);
  assert.match(submitOrder(fresh, buy(1.5), ctx(quote(0.98, 1))).error!, /whole number/);
  assert.match(submitOrder(fresh, buy(1), ctx(quote(0, 0))).error!, /no ask/);
});

test("limit buy waits, reserves cash, then fills when the ask reaches it", () => {
  const start = createChallenge("medium", 0.65, OPEN);
  const res = submitOrder(start, buy(2, "limit", 0.9), ctx(quote(0.95, 1.0)));
  assert.equal(res.filled, false);
  assert.equal(res.order!.status, "working");
  assert.equal(buyingPower(res.state), 118.7);

  const closedMarket = getMarketStatus(CLOSED);
  assert.equal(processWorkingOrders(res.state, { [SYMBOL]: quote(0.85, 0.88) }, closedMarket, CLOSED), res.state);

  const unchanged = processWorkingOrders(res.state, { [SYMBOL]: quote(0.92, 0.95) }, getMarketStatus(OPEN), OPEN);
  assert.equal(unchanged, res.state, "no fill while the ask is above the limit");

  const filled = processWorkingOrders(res.state, { [SYMBOL]: quote(0.85, 0.88) }, getMarketStatus(OPEN), OPEN);
  assert.equal(filled.orders[0].status, "filled");
  assert.equal(filled.orders[0].fillPrice, 0.88, "fills at the better ask");
  assert.equal(filled.cash, 122.7);
});

test("marketable limit fills immediately and cancel releases reserved cash", () => {
  const start = createChallenge("medium", 0.65, OPEN);
  assert.equal(submitOrder(start, buy(1, "limit", 1.05), ctx(quote(0.98, 1.0))).filled, true);
  const working = submitOrder(start, buy(1, "limit", 0.5), ctx(quote(0.98, 1.0))).state;
  const cancelled = cancelOrder(working, working.orders[0].id, OPEN);
  assert.equal(cancelled.orders[0].status, "cancelled");
  assert.equal(buyingPower(cancelled), 300);
});

test("selling to close realizes P&L net of both commissions", () => {
  const s = bought("medium", 1.0);
  const res = submitOrder(s, sell(1), ctx(quote(1.5, 1.52)));
  assert.equal(res.error, null);
  assert.equal(res.state.positions.length, 0);
  const close = res.state.fills[1];
  assert.equal(close.price, 1.5);
  assert.equal(close.realizedPnl, 48.7);
  assert.equal(res.state.cash, 348.7);
});

test("working sell orders reserve contracts so they can't be sold twice", () => {
  let s = submitOrder(createChallenge("easy", 0.65, OPEN), buy(2), ctx(quote(0.98, 1.0))).state;
  s = submitOrder(s, sell(2, "limit", 2.0), ctx(quote(0.98, 1.0))).state;
  assert.equal(availableToClose(s, SYMBOL), 0);
  assert.match(submitOrder(s, sell(1), ctx(quote(0.98, 1.0))).error!, /don't hold|at most/);
});

test("positions are marked at the mid and the loss limit ends the challenge", () => {
  const s = bought("hard", 0.4); // cash 259.35
  const q = { [SYMBOL]: quote(0.05, 0.07) };
  const marked = updateMarks(s, q);
  assert.equal(computeEquity(marked), 265.35);
  assert.equal(updateMarks(marked, q), marked, "unchanged marks keep the same state object");

  const failed = enforceLossLimit(marked, q, OPEN);
  assert.equal(failed.status, "failed");
  assert.equal(failed.positions.length, 0);
  assert.equal(failed.fills.at(-1)!.reason, "liquidation");
  assert.equal(failed.fills.at(-1)!.price, 0.05, "liquidated at the bid");
  assert.equal(failed.cash, 263.7);
  assert.match(failed.endReason!, /Hard tier limit of \$270\.00/);
  assert.equal(enforceLossLimit(failed, q, OPEN), failed);
  assert.match(submitOrder(failed, buy(1), ctx(quote(0.05, 0.07))).error!, /challenge is over/);
});

test("the same drop does not end an easy-tier challenge", () => {
  const s = updateMarks(bought("easy", 0.4), { [SYMBOL]: quote(0.05, 0.07) });
  assert.equal(enforceLossLimit(s, {}, OPEN).status, "active");
});

test("expired contracts settle to cash at intrinsic value using the close", () => {
  const s = bought("medium", 1.0);
  const afterExpiry = new Date("2026-10-30T21:00:00Z");
  assert.equal(settleExpirations(s, () => null, afterExpiry), s, "waits for a closing price");
  assert.equal(settleExpirations(s, () => 590, OPEN), s, "nothing settles before the cutoff");

  const itm = settleExpirations(s, (date) => (date === "2026-10-30" ? 587.4 : null), afterExpiry);
  assert.equal(itm.positions.length, 0);
  const fill = itm.fills.at(-1)!;
  assert.equal(fill.reason, "expiration");
  assert.equal(fill.price, 2.4);
  assert.equal(fill.commission, 0);
  assert.equal(fill.settlementPrice, 587.4);
  assert.equal(itm.cash, 439.35);

  const otm = settleExpirations(s, () => 580, afterExpiry);
  assert.equal(otm.fills.at(-1)!.price, 0);
  assert.equal(otm.fills.at(-1)!.realizedPnl, -100.65);
});

test("working orders expire with their contract", () => {
  const s = submitOrder(createChallenge("medium", 0.65, OPEN), buy(1, "limit", 0.5), ctx(quote(0.98, 1))).state;
  const later = processWorkingOrders(s, {}, getMarketStatus(new Date("2026-10-30T21:00:00Z")), new Date("2026-10-30T21:00:00Z"));
  assert.equal(later.orders[0].status, "expired");
});

test("ending a challenge sells at the bid and summarizes results", () => {
  let s = bought("medium", 1.0);
  s = submitOrder(s, sell(1), ctx(quote(1.2, 1.22))).state;
  s = submitOrder(s, buy(1), ctx(quote(0.98, 1.0))).state;
  const ended = endChallenge(s, { [SYMBOL]: quote(0.7, 0.72) }, OPEN);
  assert.equal(ended.status, "ended");
  assert.equal(ended.positions.length, 0);
  const summary = summarizeChallenge(ended);
  assert.equal(summary.closedTrades, 2);
  assert.equal(summary.wins, 1);
  assert.equal(summary.winRate, 0.5);
  assert.equal(summary.bestTrade, 18.7);
  assert.equal(summary.worstTrade, -31.3);
  assert.equal(summary.commissions, 2.6);
  assert.equal(summary.finalEquity, 287.4);
});

test("equity history is throttled but records fills right away", () => {
  const s = createChallenge("medium", 0.65, OPEN);
  assert.equal(recordEquity(s, new Date(OPEN.getTime() + 5_000)), s);
  const traded = submitOrder(s, buy(1), ctx(quote(0.98, 1.0), new Date(OPEN.getTime() + 10_000))).state;
  const recorded = recordEquity(traded, new Date(OPEN.getTime() + 10_000));
  assert.equal(recorded.equityHistory.length, 2);
  assert.equal(recordEquity(recorded, new Date(OPEN.getTime() + 20_000)), recorded);
});

test("coaching flags risk beyond the loss buffer and wide spreads", () => {
  const s = createChallenge("hard", 0.65, OPEN);
  const tips = tradeCoaching({
    quote: quote(0.3, 0.45, { volume: 3, openInterest: 10 }),
    side: "buy_to_open",
    kind: "market",
    qty: 1,
    limitPrice: null,
    state: s,
    market: getMarketStatus(OPEN),
    delayMinutes: 15,
    now: OPEN,
  }).map((c) => c.text);
  assert.ok(tips.some((t) => /loss buffer is only \$30\.00/.test(t)));
  assert.ok(tips.some((t) => /Wide spread/.test(t)));
  assert.ok(tips.some((t) => /Thin liquidity/.test(t)));
  assert.ok(tips.some((t) => /delayed 15 minutes/.test(t)));
});
