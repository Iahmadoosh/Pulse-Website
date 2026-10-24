import { useEffect, useMemo, useState } from "react";
import { X, Minus, Plus, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import type { OptionQuote } from "../../lib/options/types";
import { describeContract } from "../../lib/options/occ";
import { daysToExpiration, type MarketStatus } from "../../lib/options/marketHours";
import { intrinsicValue } from "../../lib/options/blackScholes";
import {
  CONTRACT_MULTIPLIER,
  MAX_CONTRACTS_PER_ORDER,
  availableToClose,
  buyingPower,
  orderCost,
  round2,
  type ChallengeState,
  type OrderKind,
  type OrderRequest,
  type OrderSide,
} from "../../lib/options/challenge";
import { tradeCoaching } from "../../lib/options/coaching";
import { Callout, TermTip } from "./common";
import { fmtCompact, fmtGreek, fmtMoney, fmtPrice, signClass, type OptionsTheme } from "./ui";

export interface TicketResult {
  ok: boolean;
  message: string;
}

export function OrderTicket({
  theme,
  contract,
  liveQuote,
  delayMinutes,
  challenge,
  initialSide,
  market,
  spot,
  now,
  onSubmit,
  onClose,
}: {
  theme: OptionsTheme;
  contract: OptionQuote;
  liveQuote: OptionQuote | undefined;
  delayMinutes: number;
  challenge: ChallengeState | null;
  initialSide: OrderSide;
  market: MarketStatus;
  spot: number | null;
  now: Date;
  onSubmit: (request: OrderRequest) => Promise<TicketResult>;
  onClose: () => void;
}) {
  const quote = liveQuote ?? contract;
  const active = challenge?.status === "active";
  const position = challenge?.positions.find((p) => p.symbol === quote.symbol) ?? null;
  const closable = challenge ? availableToClose(challenge, quote.symbol) : 0;

  const [side, setSide] = useState<OrderSide>(initialSide === "sell_to_close" && closable > 0 ? "sell_to_close" : "buy_to_open");
  const [qty, setQty] = useState(1);
  const [kind, setKind] = useState<OrderKind>("limit");
  const mid = quote.ask > 0 ? round2((Math.max(quote.bid, 0) + quote.ask) / 2) : quote.bid;
  const [limitText, setLimitText] = useState(() => (mid > 0 ? mid.toFixed(2) : ""));
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<TicketResult | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const limitPrice = kind === "limit" ? Number(limitText) : null;
  const estPrice =
    kind === "market" ? (side === "buy_to_open" ? quote.ask : quote.bid) : limitPrice && limitPrice > 0 ? limitPrice : 0;
  const commission = challenge ? challenge.commissionPerContract * qty : 0;
  const premium = estPrice * CONTRACT_MULTIPLIER * qty;
  const total = side === "buy_to_open" ? premium + commission : premium - commission;
  const dte = daysToExpiration(quote.expiration, now);
  const breakEven = quote.type === "call" ? quote.strike + estPrice : quote.strike - estPrice;
  const intrinsic = spot !== null ? intrinsicValue(quote.type, spot, quote.strike) : null;
  const spread = quote.ask > 0 && quote.bid > 0 ? quote.ask - quote.bid : null;

  const coaching = useMemo(
    () =>
      tradeCoaching({
        quote,
        side,
        kind,
        qty,
        limitPrice: limitPrice && limitPrice > 0 ? limitPrice : null,
        state: challenge,
        market,
        delayMinutes,
        now,
      }),
    [quote, side, kind, qty, limitPrice, challenge, market, delayMinutes, now],
  );

  const submit = async () => {
    setSubmitting(true);
    setResult(null);
    try {
      const res = await onSubmit({
        contract: { symbol: quote.symbol, type: quote.type, strike: quote.strike, expiration: quote.expiration },
        side,
        qty,
        kind,
        limitPrice,
      });
      setResult(res);
    } finally {
      setSubmitting(false);
    }
  };

  const stat = (label: string, value: string, term?: string, cls = theme.strong) => (
    <div className={`rounded-md px-2.5 py-1.5 ${theme.subtleBg}`}>
      <div className={`text-[9.5px] uppercase tracking-wide font-semibold ${theme.faint}`}>
        {term ? (
          <TermTip id={term} theme={theme} align="left">
            {label}
          </TermTip>
        ) : (
          label
        )}
      </div>
      <div className={`text-[13px] font-semibold tabular-nums ${cls}`}>{value}</div>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#3D0D16]/55 p-0 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Order ticket for ${describeContract(quote)}`}
    >
      <div
        className={`${theme.card} w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto p-4 sm:p-5 rounded-b-none sm:rounded-xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="-mx-4 -mt-4 sm:-mx-5 sm:-mt-5 mb-4 px-4 sm:px-5 py-4 bg-[#7A1F2E] text-white sm:rounded-t-xl flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11px] font-bold uppercase tracking-wider text-white/75">Order ticket</div>
            <h2 className="font-display text-lg font-bold">{describeContract(quote)}</h2>
            <div className="text-[11px] text-white/80 break-all">
              {quote.symbol} · {dte === 0 ? "Expires today (0DTE)" : `${dte} day${dte === 1 ? "" : "s"} to expiration`}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close order ticket"
            className="p-1.5 rounded-md border border-white/40 text-white hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 min-[420px]:grid-cols-3 sm:grid-cols-6 gap-2 mb-2">
          {stat("Bid × size", `${fmtPrice(quote.bid)} × ${quote.bidSize}`, "bid")}
          {stat("Ask × size", `${fmtPrice(quote.ask)} × ${quote.askSize}`, "ask")}
          {stat("Mid", fmtPrice(mid), "mid")}
          {stat("Spread", spread !== null ? fmtPrice(spread) : "—", "spread")}
          {stat("Volume", fmtCompact(quote.volume), "volume")}
          {stat("Open int.", fmtCompact(quote.openInterest), "open-interest")}
        </div>
        <div className="grid grid-cols-2 min-[420px]:grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
          {stat("IV", quote.iv !== null ? `${(quote.iv * 100).toFixed(1)}%` : "—", "implied-volatility")}
          {stat("Delta", fmtGreek(quote.delta), "delta")}
          {stat("Gamma", fmtGreek(quote.gamma, 4), "gamma")}
          {stat("Theta", fmtGreek(quote.theta), "theta")}
          {stat("Vega", fmtGreek(quote.vega), "vega")}
          {stat("Intrinsic", intrinsic !== null ? fmtPrice(intrinsic) : "—", "intrinsic-value")}
        </div>
        {quote.greeksSource === "model" && (
          <p className={`text-[11px] mb-3 ${theme.faint}`}>
            The feed didn't include Greeks for this contract, so they were calculated with Black-Scholes from its price.
          </p>
        )}

        {position && (
          <div className={`rounded-lg px-3 py-2 mb-4 text-xs ${theme.infoBox}`}>
            You hold <b>{position.qty}</b> contract(s) at an average of <b>{fmtMoney(position.avgPrice)}</b>.{" "}
            {quote.bid > 0 && (
              <>
                Selling at the bid now would realize{" "}
                <b className={signClass(theme, (quote.bid - position.avgPrice) * 100)}>
                  {fmtMoney((quote.bid - position.avgPrice) * CONTRACT_MULTIPLIER * position.qty, { sign: true })}
                </b>{" "}
                before commissions.
              </>
            )}
          </div>
        )}

        {!challenge || !active ? (
          <Callout theme={theme} tone="tip">
            {challenge
              ? "This challenge has finished. Start a new challenge from the account panel to place orders."
              : "Start a challenge from the account panel to trade. You can still use this ticket to study the contract."}
          </Callout>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <div className={`text-[11px] font-semibold mb-1 ${theme.faint}`}>Action</div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSide("buy_to_open")}
                    className={`text-xs font-semibold px-2 py-2 rounded-md ${side === "buy_to_open" ? theme.chipActive : theme.chip}`}
                  >
                    Buy to open
                  </button>
                  <button
                    type="button"
                    disabled={closable <= 0}
                    onClick={() => setSide("sell_to_close")}
                    className={`text-xs font-semibold px-2 py-2 rounded-md disabled:opacity-40 disabled:cursor-not-allowed ${
                      side === "sell_to_close" ? theme.chipActive : theme.chip
                    }`}
                    title={closable <= 0 ? "You can only sell contracts you hold" : undefined}
                  >
                    Sell to close
                  </button>
                </div>
              </div>
              <div>
                <div className={`text-[11px] font-semibold mb-1 ${theme.faint}`}>Contracts</div>
                <div className="flex items-center gap-1.5">
                  <button type="button" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))} className={`p-2 rounded-md ${theme.chip}`}>
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={side === "sell_to_close" ? closable : MAX_CONTRACTS_PER_ORDER}
                    value={qty}
                    onChange={(e) => setQty(Math.max(1, Math.floor(Number(e.target.value) || 1)))}
                    className={`w-20 text-center text-sm font-semibold px-2 py-1.5 rounded-md ${theme.inputBg}`}
                    aria-label="Quantity"
                  />
                  <button type="button" aria-label="Increase quantity" onClick={() => setQty((q) => q + 1)} className={`p-2 rounded-md ${theme.chip}`}>
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  {side === "sell_to_close" && (
                    <span className={`text-[11px] ${theme.faint}`}>of {closable} available</span>
                  )}
                </div>
              </div>
              <div>
                <div className={`text-[11px] font-semibold mb-1 ${theme.faint}`}>
                  Order type:{" "}
                  <TermTip id="limit-order" theme={theme} align="left">
                    limit
                  </TermTip>{" "}
                  or{" "}
                  <TermTip id="market-order" theme={theme} align="left">
                    market
                  </TermTip>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {(["limit", "market"] as const).map((k) => (
                    <button
                      type="button"
                      key={k}
                      onClick={() => setKind(k)}
                      className={`text-xs font-semibold px-2 py-2 rounded-md capitalize ${kind === k ? theme.chipActive : theme.chip}`}
                    >
                      {k}
                    </button>
                  ))}
                </div>
                {kind === "limit" && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`text-xs ${theme.faint}`}>Limit $</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={limitText}
                      onChange={(e) => setLimitText(e.target.value)}
                      className={`w-24 text-sm font-semibold px-2 py-1.5 rounded-md ${theme.inputBg}`}
                      aria-label="Limit price"
                    />
                    <div className="flex gap-1">
                      {[
                        { label: "Bid", v: quote.bid },
                        { label: "Mid", v: mid },
                        { label: "Ask", v: quote.ask },
                      ].map((b) => (
                        <button
                          type="button"
                          key={b.label}
                          disabled={!(b.v > 0)}
                          onClick={() => setLimitText(b.v.toFixed(2))}
                          className={`text-[10.5px] font-semibold px-1.5 py-1 rounded disabled:opacity-40 ${theme.chip}`}
                        >
                          {b.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className={`rounded-lg p-3 space-y-1.5 text-xs ${theme.subtleBg}`}>
              <div className={`text-[11px] font-bold uppercase tracking-wider mb-1 ${theme.faint}`}>Estimate</div>
              {[
                [kind === "market" ? `Fill at ${side === "buy_to_open" ? "ask" : "bid"}` : "Limit price", fmtMoney(estPrice)],
                [`Premium (× ${CONTRACT_MULTIPLIER} × ${qty})`, fmtMoney(premium)],
                ["Commission", fmtMoney(commission)],
                [side === "buy_to_open" ? "Total cost" : "Net proceeds", fmtMoney(total)],
                ...(side === "buy_to_open"
                  ? [
                      ["Buying power", fmtMoney(challenge ? buyingPower(challenge) : 0)],
                      ["After order", fmtMoney(challenge ? buyingPower(challenge) - orderCost(challenge, estPrice, qty) : 0)],
                      ["Break-even at expiration", estPrice > 0 ? `SPY ${fmtPrice(breakEven)}` : "—"],
                      ["Max loss", fmtMoney(total)],
                      ["Position delta", quote.delta !== null ? `${(quote.delta * CONTRACT_MULTIPLIER * qty).toFixed(1)} shares` : "—"],
                    ]
                  : []),
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-2">
                  <span className={theme.muted}>{label}</span>
                  <span className={`font-semibold tabular-nums ${theme.strong}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {coaching.length > 0 && (
          <div className="mt-4 space-y-1.5">
            {coaching.map((c, i) => (
              <Callout key={i} theme={theme} tone={c.tone}>
                {c.text}
              </Callout>
            ))}
          </div>
        )}

        {result && (
          <div
            className={`mt-4 flex items-start gap-2 rounded-lg px-3 py-2 text-sm ${result.ok ? theme.okBox : theme.dangerBox}`}
            role="status"
          >
            {result.ok ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> : <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />}
            <span>{result.message}</span>
          </div>
        )}

        {active && (
          <div className="mt-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <button type="button" onClick={onClose} className={`px-4 py-2.5 rounded-lg text-xs font-bold uppercase ${theme.chip}`}>
              {result?.ok ? "Done" : "Cancel"}
            </button>
            <button
              type="button"
              disabled={submitting || !market.isOpen}
              onClick={submit}
              className={`px-4 py-2.5 rounded-lg text-xs font-bold uppercase text-white disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 ${
                side === "buy_to_open" ? theme.primaryBtn : theme.sellBtn
              }`}
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {side === "buy_to_open" ? "Buy" : "Sell"} {qty} to {side === "buy_to_open" ? "open" : "close"} · {kind}
              {estPrice > 0 ? ` @ ${fmtPrice(estPrice)}` : ""}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
