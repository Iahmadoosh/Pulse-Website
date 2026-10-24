// Pre-trade coaching shown on the order ticket. These never block an order
// (validateOrder does that); they explain what the trader is about to accept.

import type { OptionQuote } from "./types";
import {
  CONTRACT_MULTIPLIER,
  computeEquity,
  equityFloor,
  orderCost,
  type ChallengeState,
  type OrderKind,
  type OrderSide,
} from "./challenge";
import { daysToExpiration, formatEtTime, type MarketStatus } from "./marketHours";

export interface Coaching {
  tone: "tip" | "warning" | "danger";
  text: string;
}

export interface CoachingInput {
  quote: OptionQuote;
  side: OrderSide;
  kind: OrderKind;
  qty: number;
  limitPrice: number | null;
  state: ChallengeState | null;
  market: MarketStatus;
  delayMinutes: number;
  now: Date;
}

const money = (n: number) => `$${n.toFixed(2)}`;

export function tradeCoaching(input: CoachingInput): Coaching[] {
  const { quote, side, kind, qty, limitPrice, state, market, delayMinutes, now } = input;
  const out: Coaching[] = [];
  const hasBid = quote.bid > 0;
  const hasAsk = quote.ask > 0;
  const mid = hasAsk ? (Math.max(quote.bid, 0) + quote.ask) / 2 : null;

  if (!market.isOpen) {
    out.push({
      tone: "danger",
      text: `${market.label}. Orders can be placed when the session opens ${formatEtTime(market.nextOpen, true)}.`,
    });
  }
  if (delayMinutes > 0) {
    out.push({
      tone: "tip",
      text: `Option quotes are delayed ${delayMinutes} minutes, and simulated fills use that delayed bid/ask. Configure a real-time feed on the server for live fills.`,
    });
  }

  if (side === "buy_to_open") {
    if (!hasBid && hasAsk) {
      out.push({
        tone: "warning",
        text: "No bid: nobody is currently willing to buy this contract. If you buy it, you may not be able to sell it before it expires.",
      });
    }
    if (hasBid && hasAsk && mid) {
      const spread = quote.ask - quote.bid;
      const pct = spread / mid;
      if (pct > 0.1) {
        out.push({
          tone: "warning",
          text: `Wide spread: ${money(spread)} (${Math.round(pct * 100)}% of the mid). Buying at the ask and selling at the bid would cost ${money(spread * CONTRACT_MULTIPLIER * qty)} on ${qty} contract(s) before SPY moves at all.`,
        });
      }
    }
    if (quote.volume < 50 && quote.openInterest < 100) {
      out.push({
        tone: "warning",
        text: `Thin liquidity: ${quote.volume} contracts traded today and ${quote.openInterest} open interest. Expect wider fills when you exit.`,
      });
    }
    const dte = daysToExpiration(quote.expiration, now);
    if (dte === 0) {
      out.push({
        tone: "warning",
        text: "0DTE: this contract expires at today's close. Gamma and theta are extreme, so it can double or go to zero within minutes.",
      });
    }
    if (quote.delta !== null && Math.abs(quote.delta) < 0.1) {
      out.push({
        tone: "warning",
        text: `Delta ${quote.delta.toFixed(3)}: SPY needs a large move for this to finish in the money. Low-delta options often expire worthless.`,
      });
    }
    if (quote.theta !== null && quote.theta < 0) {
      out.push({
        tone: "tip",
        text: `Time decay: about ${money(Math.abs(quote.theta) * CONTRACT_MULTIPLIER * qty)} per day across ${qty} contract(s) if nothing else changes (theta ${quote.theta.toFixed(3)}).`,
      });
    }
    if (state) {
      const price = kind === "limit" && limitPrice ? limitPrice : quote.ask;
      if (price > 0) {
        const cost = orderCost(state, price, qty);
        const buffer = computeEquity(state) - equityFloor(state);
        if (cost >= buffer) {
          out.push({
            tone: "danger",
            text: `Risk check: this trade costs ${money(cost)} but your loss buffer is only ${money(Math.max(buffer, 0))}. If the option loses most of its value, your challenge ends.`,
          });
        } else if (cost > buffer * 0.5) {
          out.push({
            tone: "warning",
            text: `Risk check: this trade puts ${Math.round((cost / buffer) * 100)}% of your ${money(buffer)} loss buffer on one position.`,
          });
        }
      }
    }
    if (kind === "limit" && limitPrice) {
      if (hasAsk && limitPrice >= quote.ask) {
        out.push({ tone: "tip", text: `Your limit is at or above the ask, so it fills immediately at ${money(quote.ask)}.` });
      } else if (hasBid && limitPrice < quote.bid) {
        out.push({ tone: "tip", text: "Your limit is below the bid. It will wait unless sellers drop their price that far." });
      } else {
        out.push({ tone: "tip", text: "Your limit is inside the spread. It fills only if the ask drops to your price." });
      }
    }
  } else {
    if (!hasBid) {
      out.push({ tone: "warning", text: "No bid right now: a market sell can't fill. Use a limit order or wait for buyers." });
    }
    if (kind === "limit" && limitPrice) {
      if (hasBid && limitPrice <= quote.bid) {
        out.push({ tone: "tip", text: `Your limit is at or below the bid, so it fills immediately at ${money(quote.bid)}.` });
      } else {
        out.push({ tone: "tip", text: "Your limit is above the bid. It fills only if buyers raise their bid to your price." });
      }
    }
  }
  return out;
}
