// The $300 SPY options challenge: a cash account that can buy calls and puts
// to open and sell them to close. Every function here is pure and returns the
// same state object when nothing changed, so React effects can call them on
// each quote refresh without looping.

import type { OptionQuote, OptionType } from "./types";
import { intrinsicValue } from "./blackScholes";
import { expirationCutoff, type MarketStatus } from "./marketHours";

export type Tier = "hard" | "medium" | "easy";

export const TIERS: Record<Tier, { label: string; maxLossPct: number; blurb: string }> = {
  hard: {
    label: "Hard",
    maxLossPct: 0.1,
    blurb: "Challenge ends once equity drops 10% ($30) below the start.",
  },
  medium: {
    label: "Medium",
    maxLossPct: 0.25,
    blurb: "Challenge ends once equity drops 25% ($75) below the start.",
  },
  easy: {
    label: "Easy",
    maxLossPct: 0.5,
    blurb: "Challenge ends once equity drops 50% ($150) below the start.",
  },
};

export const STARTING_BALANCE = 300;
export const CONTRACT_MULTIPLIER = 100;
export const DEFAULT_COMMISSION = 0.65;
export const MAX_CONTRACTS_PER_ORDER = 50;
/** Orders are refused when the contract quote is older than this. */
export const MAX_QUOTE_AGE_MS = 90_000;
const MAX_EQUITY_POINTS = 3000;

export type OrderSide = "buy_to_open" | "sell_to_close";
export type OrderKind = "market" | "limit";

export interface ContractRef {
  symbol: string;
  type: OptionType;
  strike: number;
  expiration: string;
}

export interface Position extends ContractRef {
  qty: number;
  /** Average premium paid per share (quote units). */
  avgPrice: number;
  /** Commissions paid to open the contracts still held. */
  entryCommission: number;
  openedAt: string;
}

export type OrderStatus = "working" | "filled" | "cancelled" | "expired";

export interface Order extends ContractRef {
  id: string;
  side: OrderSide;
  qty: number;
  kind: OrderKind;
  limitPrice: number | null;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  fillPrice: number | null;
}

export type FillReason = "order" | "expiration" | "liquidation" | "end";

export interface Fill extends ContractRef {
  id: string;
  orderId: string | null;
  side: OrderSide;
  qty: number;
  /** Premium per share. */
  price: number;
  commission: number;
  time: string;
  reason: FillReason;
  /** Net P&L for closing fills (after both entry and exit commissions). */
  realizedPnl: number | null;
  /** Underlying close used to settle an expiration. */
  settlementPrice?: number;
}

export interface EquityPoint {
  t: number;
  equity: number;
}

export type ChallengeStatus = "active" | "failed" | "ended";

export interface ChallengeState {
  version: 1;
  id: string;
  tier: Tier;
  startingBalance: number;
  commissionPerContract: number;
  cash: number;
  positions: Position[];
  orders: Order[];
  fills: Fill[];
  /** Last known mark (per share) for each held contract. */
  marks: Record<string, number>;
  equityHistory: EquityPoint[];
  peakEquity: number;
  status: ChallengeStatus;
  startedAt: string;
  endedAt: string | null;
  endReason: string | null;
}

export interface OrderRequest {
  contract: ContractRef;
  side: OrderSide;
  qty: number;
  kind: OrderKind;
  limitPrice?: number | null;
}

export interface OrderContext {
  quote: OptionQuote | null;
  quoteAgeMs: number;
  market: MarketStatus;
  now: Date;
}

export type QuoteMap = Record<string, OptionQuote | undefined>;

export const round2 = (n: number) => Math.round(n * 100) / 100;

let idCounter = 0;
function newId(prefix: string): string {
  idCounter += 1;
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}${idCounter}${random}`;
}

function contractOf(c: ContractRef): ContractRef {
  return { symbol: c.symbol, type: c.type, strike: c.strike, expiration: c.expiration };
}

export function createChallenge(
  tier: Tier,
  commissionPerContract: number = DEFAULT_COMMISSION,
  now: Date = new Date(),
): ChallengeState {
  return {
    version: 1,
    id: newId("chl"),
    tier,
    startingBalance: STARTING_BALANCE,
    commissionPerContract,
    cash: STARTING_BALANCE,
    positions: [],
    orders: [],
    fills: [],
    marks: {},
    equityHistory: [{ t: now.getTime(), equity: STARTING_BALANCE }],
    peakEquity: STARTING_BALANCE,
    status: "active",
    startedAt: now.toISOString(),
    endedAt: null,
    endReason: null,
  };
}

/** Equity at or below this ends the challenge. */
export function equityFloor(state: Pick<ChallengeState, "tier" | "startingBalance">): number {
  return round2(state.startingBalance * (1 - TIERS[state.tier].maxLossPct));
}

/** Broker-style mark: the bid/ask midpoint. Null when the contract has no usable quote. */
export function markPrice(quote: OptionQuote | null | undefined): number | null {
  if (!quote) return null;
  if (quote.ask > 0) return round2((Math.max(quote.bid, 0) + quote.ask) / 2);
  if (quote.bid > 0) return quote.bid;
  return null;
}

export function positionMark(state: ChallengeState, position: Position): number {
  return state.marks[position.symbol] ?? position.avgPrice;
}

export function positionsValue(state: ChallengeState): number {
  return round2(
    state.positions.reduce(
      (sum, p) => sum + positionMark(state, p) * CONTRACT_MULTIPLIER * p.qty,
      0,
    ),
  );
}

export function computeEquity(state: ChallengeState): number {
  return round2(state.cash + positionsValue(state));
}

/** Cash held back for working buy limit orders. */
export function reservedCash(state: ChallengeState): number {
  return round2(
    state.orders
      .filter((o) => o.status === "working" && o.side === "buy_to_open")
      .reduce(
        (sum, o) =>
          sum + (o.limitPrice ?? 0) * CONTRACT_MULTIPLIER * o.qty + state.commissionPerContract * o.qty,
        0,
      ),
  );
}

export function buyingPower(state: ChallengeState): number {
  return round2(state.cash - reservedCash(state));
}

function pendingCloseQty(state: ChallengeState, symbol: string): number {
  return state.orders
    .filter((o) => o.status === "working" && o.side === "sell_to_close" && o.symbol === symbol)
    .reduce((sum, o) => sum + o.qty, 0);
}

export function availableToClose(state: ChallengeState, symbol: string): number {
  const position = state.positions.find((p) => p.symbol === symbol);
  return position ? position.qty - pendingCloseQty(state, symbol) : 0;
}

/** Total cash needed to buy `qty` contracts at `price`, including commission. */
export function orderCost(state: ChallengeState, price: number, qty: number): number {
  return round2(price * CONTRACT_MULTIPLIER * qty + state.commissionPerContract * qty);
}

function isPennyIncrement(price: number): boolean {
  return Math.abs(price * 100 - Math.round(price * 100)) < 1e-6;
}

/** Returns a human-readable reason the order cannot be placed, or null when it is valid. */
export function validateOrder(
  state: ChallengeState,
  request: OrderRequest,
  ctx: OrderContext,
): string | null {
  const { contract, side, qty, kind } = request;
  const limitPrice = request.limitPrice ?? null;
  if (state.status !== "active") return "This challenge is over. Start a new one to keep trading.";
  if (!ctx.market.isOpen) {
    return "The options market is closed. SPY options trade 9:30 AM - 4:00 PM ET on market days.";
  }
  if (ctx.now.getTime() >= expirationCutoff(contract.expiration).getTime()) {
    return "This contract has stopped trading for expiration.";
  }
  if (!Number.isInteger(qty) || qty < 1) return "Quantity must be a whole number of contracts (1 or more).";
  if (qty > MAX_CONTRACTS_PER_ORDER) return `Maximum ${MAX_CONTRACTS_PER_ORDER} contracts per order.`;
  if (!ctx.quote) return "No live quote for this contract. Wait for the chain to refresh.";
  if (ctx.quoteAgeMs > MAX_QUOTE_AGE_MS) {
    return "The quote for this contract is stale. Wait for fresh market data before trading.";
  }
  if (kind === "limit") {
    if (limitPrice === null || !(limitPrice > 0)) return "Enter a limit price above $0.00.";
    if (!isPennyIncrement(limitPrice)) return "SPY options are quoted in $0.01 increments.";
  }

  if (side === "buy_to_open") {
    if (kind === "market" && !(ctx.quote.ask > 0)) {
      return "There is no ask (no sellers) for this contract right now.";
    }
    const price = kind === "market" ? ctx.quote.ask : (limitPrice as number);
    const cost = orderCost(state, price, qty);
    const bp = buyingPower(state);
    if (cost > bp + 1e-9) {
      return `Not enough buying power: this order needs $${cost.toFixed(2)} and you have $${bp.toFixed(2)}. Cash accounts must pay the full premium up front.`;
    }
    return null;
  }

  const closable = availableToClose(state, contract.symbol);
  if (closable <= 0) {
    return "You don't hold this contract. This is a cash account: you can only sell contracts you own (no naked short options).";
  }
  if (qty > closable) return `You can close at most ${closable} contract(s) of this position.`;
  if (kind === "market" && !(ctx.quote.bid > 0)) {
    return "There is no bid (no buyers) for this contract right now. Use a limit order or hold to expiration.";
  }
  return null;
}

function applyFill(
  state: ChallengeState,
  contract: ContractRef,
  side: OrderSide,
  qty: number,
  price: number,
  reason: FillReason,
  orderId: string | null,
  now: Date,
  options: { commission?: number; settlementPrice?: number } = {},
): ChallengeState {
  const commission = round2(options.commission ?? state.commissionPerContract * qty);
  const time = now.toISOString();
  const premium = round2(price * CONTRACT_MULTIPLIER * qty);
  const fill: Fill = {
    ...contractOf(contract),
    id: newId("fill"),
    orderId,
    side,
    qty,
    price,
    commission,
    time,
    reason,
    realizedPnl: null,
    ...(options.settlementPrice !== undefined ? { settlementPrice: options.settlementPrice } : {}),
  };

  if (side === "buy_to_open") {
    const existing = state.positions.find((p) => p.symbol === contract.symbol);
    const positions = existing
      ? state.positions.map((p) =>
          p.symbol === contract.symbol
            ? {
                ...p,
                avgPrice: (p.avgPrice * p.qty + price * qty) / (p.qty + qty),
                qty: p.qty + qty,
                entryCommission: round2(p.entryCommission + commission),
              }
            : p,
        )
      : [
          ...state.positions,
          { ...contractOf(contract), qty, avgPrice: price, entryCommission: commission, openedAt: time },
        ];
    return {
      ...state,
      cash: round2(state.cash - premium - commission),
      positions,
      marks: { ...state.marks, [contract.symbol]: state.marks[contract.symbol] ?? price },
      fills: [...state.fills, fill],
    };
  }

  const position = state.positions.find((p) => p.symbol === contract.symbol);
  if (!position) return state;
  const closingQty = Math.min(qty, position.qty);
  const allocatedEntry = round2((position.entryCommission * closingQty) / position.qty);
  fill.qty = closingQty;
  fill.realizedPnl = round2(
    (price - position.avgPrice) * CONTRACT_MULTIPLIER * closingQty - commission - allocatedEntry,
  );
  const remaining = position.qty - closingQty;
  const positions =
    remaining > 0
      ? state.positions.map((p) =>
          p.symbol === contract.symbol
            ? { ...p, qty: remaining, entryCommission: round2(p.entryCommission - allocatedEntry) }
            : p,
        )
      : state.positions.filter((p) => p.symbol !== contract.symbol);
  const marks = { ...state.marks };
  if (remaining === 0) delete marks[contract.symbol];
  return {
    ...state,
    cash: round2(state.cash + round2(price * CONTRACT_MULTIPLIER * closingQty) - commission),
    positions,
    marks,
    fills: [...state.fills, fill],
  };
}

export interface SubmitResult {
  state: ChallengeState;
  order: Order | null;
  filled: boolean;
  error: string | null;
}

export function submitOrder(
  state: ChallengeState,
  request: OrderRequest,
  ctx: OrderContext,
): SubmitResult {
  const error = validateOrder(state, request, ctx);
  if (error) return { state, order: null, filled: false, error };
  const quote = ctx.quote as OptionQuote;
  const time = ctx.now.toISOString();
  const limitPrice = request.kind === "limit" ? round2(request.limitPrice as number) : null;
  const order: Order = {
    ...contractOf(request.contract),
    id: newId("ord"),
    side: request.side,
    qty: request.qty,
    kind: request.kind,
    limitPrice,
    status: "working",
    createdAt: time,
    updatedAt: time,
    fillPrice: null,
  };

  // Market orders take the other side of the quote; limit orders fill right away
  // only when they are marketable (buy limit >= ask, sell limit <= bid).
  let fillPrice: number | null = null;
  if (request.side === "buy_to_open") {
    if (request.kind === "market" || (quote.ask > 0 && quote.ask <= (limitPrice as number))) {
      fillPrice = quote.ask;
    }
  } else if (request.kind === "market" || (quote.bid > 0 && quote.bid >= (limitPrice as number))) {
    fillPrice = quote.bid;
  }

  if (fillPrice === null) {
    return { state: { ...state, orders: [...state.orders, order] }, order, filled: false, error: null };
  }
  const filledOrder: Order = { ...order, status: "filled", fillPrice };
  const next = applyFill(
    { ...state, orders: [...state.orders, filledOrder] },
    request.contract,
    request.side,
    request.qty,
    fillPrice,
    "order",
    order.id,
    ctx.now,
  );
  return { state: next, order: filledOrder, filled: true, error: null };
}

export function cancelOrder(state: ChallengeState, orderId: string, now: Date = new Date()): ChallengeState {
  if (!state.orders.some((o) => o.id === orderId && o.status === "working")) return state;
  return {
    ...state,
    orders: state.orders.map((o) =>
      o.id === orderId ? { ...o, status: "cancelled", updatedAt: now.toISOString() } : o,
    ),
  };
}

/** Fills working limit orders whose price the market has reached. */
export function processWorkingOrders(
  state: ChallengeState,
  quotes: QuoteMap,
  market: MarketStatus,
  now: Date = new Date(),
): ChallengeState {
  if (state.status !== "active") return state;
  let next = state;
  for (const order of state.orders) {
    if (order.status !== "working") continue;
    if (now.getTime() >= expirationCutoff(order.expiration).getTime()) {
      next = {
        ...next,
        orders: next.orders.map((o) =>
          o.id === order.id ? { ...o, status: "expired", updatedAt: now.toISOString() } : o,
        ),
      };
      continue;
    }
    const quote = quotes[order.symbol];
    if (!market.isOpen || !quote || order.limitPrice === null) continue;
    let fillPrice: number | null = null;
    if (order.side === "buy_to_open" && quote.ask > 0 && quote.ask <= order.limitPrice) {
      fillPrice = quote.ask;
    } else if (order.side === "sell_to_close" && quote.bid > 0 && quote.bid >= order.limitPrice) {
      fillPrice = quote.bid;
    }
    if (fillPrice === null) continue;
    next = {
      ...next,
      orders: next.orders.map((o) =>
        o.id === order.id
          ? { ...o, status: "filled", fillPrice, updatedAt: now.toISOString() }
          : o,
      ),
    };
    next = applyFill(next, order, order.side, order.qty, fillPrice as number, "order", order.id, now);
  }
  return next;
}

/** Records the latest mark for every held contract that has a usable quote. */
export function updateMarks(state: ChallengeState, quotes: QuoteMap): ChallengeState {
  let marks: Record<string, number> | null = null;
  for (const position of state.positions) {
    const mark = markPrice(quotes[position.symbol]);
    if (mark !== null && mark !== state.marks[position.symbol]) {
      marks = marks ?? { ...state.marks };
      marks[position.symbol] = mark;
    }
  }
  return marks ? { ...state, marks } : state;
}

/**
 * Settles contracts past their expiration cutoff at intrinsic value using the
 * SPY closing price for that date. Real SPY options are American-style and
 * physically settled (ITM contracts become 100 shares); a $300 cash account
 * could not take delivery, so the simulator settles to cash instead.
 */
export function settleExpirations(
  state: ChallengeState,
  closePriceFor: (date: string) => number | null,
  now: Date = new Date(),
): ChallengeState {
  let next = state;
  for (const position of state.positions) {
    if (now.getTime() < expirationCutoff(position.expiration).getTime()) continue;
    const close = closePriceFor(position.expiration);
    if (close === null) continue;
    const value = round2(intrinsicValue(position.type, close, position.strike));
    next = applyFill(next, position, "sell_to_close", position.qty, value, "expiration", null, now, {
      commission: 0,
      settlementPrice: close,
    });
  }
  return next;
}

function liquidateAll(
  state: ChallengeState,
  quotes: QuoteMap,
  reason: FillReason,
  now: Date,
): ChallengeState {
  let next: ChallengeState = {
    ...state,
    orders: state.orders.map((o) =>
      o.status === "working" ? { ...o, status: "cancelled", updatedAt: now.toISOString() } : o,
    ),
  };
  for (const position of state.positions) {
    const quote = quotes[position.symbol];
    if (quote && quote.bid > 0) {
      next = applyFill(next, position, "sell_to_close", position.qty, quote.bid, reason, null, now);
    } else if (!quote) {
      // No quote available: book it at the last mark so the record stays complete.
      next = applyFill(next, position, "sell_to_close", position.qty, positionMark(state, position), reason, null, now, {
        commission: 0,
      });
    } else {
      // Quote exists but nobody is bidding: the contract is worthless to sell.
      next = applyFill(next, position, "sell_to_close", position.qty, 0, reason, null, now, { commission: 0 });
    }
  }
  return next;
}

/** Ends the challenge once equity reaches the tier's loss limit. */
export function enforceLossLimit(
  state: ChallengeState,
  quotes: QuoteMap,
  now: Date = new Date(),
): ChallengeState {
  if (state.status !== "active") return state;
  const equity = computeEquity(state);
  const floor = equityFloor(state);
  const peakEquity = Math.max(state.peakEquity, equity);
  if (equity > floor + 1e-9) {
    return peakEquity === state.peakEquity ? state : { ...state, peakEquity };
  }
  const liquidated = liquidateAll(state, quotes, "liquidation", now);
  const pct = Math.round(TIERS[state.tier].maxLossPct * 100);
  return {
    ...liquidated,
    status: "failed",
    endedAt: now.toISOString(),
    endReason: `Equity reached $${equity.toFixed(2)}, at or below the ${TIERS[state.tier].label} tier limit of $${floor.toFixed(2)} (-${pct}%). Open positions were sold at the bid.`,
  };
}

export function endChallenge(
  state: ChallengeState,
  quotes: QuoteMap,
  now: Date = new Date(),
): ChallengeState {
  if (state.status !== "active") return state;
  const liquidated = liquidateAll(state, quotes, "end", now);
  return {
    ...liquidated,
    status: "ended",
    endedAt: now.toISOString(),
    endReason: "You ended the challenge. Open positions were sold at the bid.",
  };
}

/** Appends an equity sample at most once a minute, or right away after a fill. */
export function recordEquity(state: ChallengeState, now: Date = new Date()): ChallengeState {
  const equity = computeEquity(state);
  const last = state.equityHistory[state.equityHistory.length - 1];
  const t = now.getTime();
  if (last) {
    const lastFill = state.fills[state.fills.length - 1];
    const fillSinceLast = lastFill ? new Date(lastFill.time).getTime() > last.t : false;
    if (last.equity === equity && !fillSinceLast) return state;
    if (t - last.t < 60_000 && !fillSinceLast && state.status === "active") return state;
  }
  const equityHistory = [...state.equityHistory, { t, equity }];
  if (equityHistory.length > MAX_EQUITY_POINTS) equityHistory.splice(1, equityHistory.length - MAX_EQUITY_POINTS);
  return { ...state, equityHistory };
}

export interface ChallengeSummary {
  id: string;
  tier: Tier;
  status: ChallengeStatus;
  startedAt: string;
  endedAt: string | null;
  endReason: string | null;
  startingBalance: number;
  finalEquity: number;
  pnl: number;
  pnlPct: number;
  closedTrades: number;
  wins: number;
  winRate: number | null;
  bestTrade: number | null;
  worstTrade: number | null;
  commissions: number;
  maxDrawdownPct: number;
}

export function summarizeChallenge(state: ChallengeState): ChallengeSummary {
  const finalEquity = computeEquity(state);
  const closes = state.fills.filter((f) => f.realizedPnl !== null);
  const pnls = closes.map((f) => f.realizedPnl as number);
  const wins = pnls.filter((p) => p > 0).length;
  let peak = state.startingBalance;
  let maxDd = 0;
  for (const point of [...state.equityHistory, { t: Date.now(), equity: finalEquity }]) {
    peak = Math.max(peak, point.equity);
    if (peak > 0) maxDd = Math.max(maxDd, (peak - point.equity) / peak);
  }
  return {
    id: state.id,
    tier: state.tier,
    status: state.status,
    startedAt: state.startedAt,
    endedAt: state.endedAt,
    endReason: state.endReason,
    startingBalance: state.startingBalance,
    finalEquity,
    pnl: round2(finalEquity - state.startingBalance),
    pnlPct: (finalEquity - state.startingBalance) / state.startingBalance,
    closedTrades: closes.length,
    wins,
    winRate: closes.length ? wins / closes.length : null,
    bestTrade: pnls.length ? Math.max(...pnls) : null,
    worstTrade: pnls.length ? Math.min(...pnls) : null,
    commissions: round2(state.fills.reduce((sum, f) => sum + f.commission, 0)),
    maxDrawdownPct: maxDd,
  };
}
