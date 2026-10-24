import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GraduationCap, CandlestickChart, BookOpen, Trophy, X, Info } from "lucide-react";
import type { ContractsResponse, OptionQuote } from "../lib/options/types";
import { LESSONS } from "../lib/options/academy";
import { describeContract } from "../lib/options/occ";
import { expirationCutoff, getMarketStatus } from "../lib/options/marketHours";
import {
  createChallenge,
  enforceLossLimit,
  endChallenge,
  processWorkingOrders,
  recordEquity,
  settleExpirations,
  submitOrder,
  summarizeChallenge,
  cancelOrder,
  updateMarks,
  type ChallengeState,
  type ChallengeSummary,
  type Fill,
  type OrderRequest,
  type OrderSide,
  type Position,
  type SubmitResult,
  type Tier,
} from "../lib/options/challenge";
import { theme, fmtMoney, fmtPrice, providerLabel, delayLabel } from "./components/ui";
import { fetchJson, useSpyMarketData } from "./components/useSpyMarketData";
import { useNow } from "./components/common";
import { SpyQuoteCard } from "./components/SpyQuoteCard";
import { OptionChain } from "./components/OptionChain";
import { OrderTicket, type TicketResult } from "./components/OrderTicket";
import { AccountPanel } from "./components/AccountPanel";
import { PositionsPanel } from "./components/PositionsPanel";
import { Academy } from "./components/Academy";
import { GlossaryPanel } from "./components/GlossaryPanel";
import { ResultsPanel } from "./components/ResultsPanel";

type TrainerTab = "academy" | "desk" | "glossary" | "results";

interface TrainerStore {
  version: 1;
  completedLessons: string[];
  challenge: ChallengeState | null;
  history: ChallengeSummary[];
}

const EMPTY_STORE: TrainerStore = { version: 1, completedLessons: [], challenge: null, history: [] };

function loadStore(key: string): TrainerStore {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return EMPTY_STORE;
    const parsed = JSON.parse(raw);
    if (parsed?.version !== 1) return EMPTY_STORE;
    return {
      version: 1,
      completedLessons: Array.isArray(parsed.completedLessons) ? parsed.completedLessons : [],
      challenge: parsed.challenge?.version === 1 ? parsed.challenge : null,
      history: Array.isArray(parsed.history) ? parsed.history : [],
    };
  } catch {
    return EMPTY_STORE;
  }
}

/** Records a summary the moment a challenge stops being active. */
function withHistory(prev: TrainerStore, next: TrainerStore): TrainerStore {
  const c = next.challenge;
  if (!c || c.status === "active" || prev.challenge?.status !== "active" || prev.challenge.id !== c.id) return next;
  if (next.history.some((h) => h.id === c.id)) return next;
  return { ...next, history: [...next.history, summarizeChallenge(c)] };
}

function placeholderQuote(p: Position): OptionQuote {
  return {
    symbol: p.symbol,
    type: p.type,
    strike: p.strike,
    expiration: p.expiration,
    bid: 0,
    ask: 0,
    bidSize: 0,
    askSize: 0,
    last: null,
    change: null,
    volume: 0,
    openInterest: 0,
    iv: null,
    delta: null,
    gamma: null,
    theta: null,
    vega: null,
    rho: null,
    greeksSource: "none",
  };
}

function fillMessage(fill: Fill): string {
  const name = describeContract(fill);
  if (fill.reason === "expiration") {
    return fill.price > 0
      ? `${name} expired in the money and settled at $${fill.price.toFixed(2)} (SPY closed at ${fmtPrice(fill.settlementPrice)}).`
      : `${name} expired worthless (SPY closed at ${fmtPrice(fill.settlementPrice)}).`;
  }
  const verb = fill.side === "buy_to_open" ? "Bought" : "Sold";
  return `${verb} ${fill.qty} ${name} at $${fill.price.toFixed(2)}${fill.realizedPnl !== null ? ` · P&L ${fmtMoney(fill.realizedPnl, { sign: true })}` : ""}.`;
}

const STORAGE_KEY = "spy_options_trainer_v1";

export function OptionsTrainerApp() {
  const storageKey = STORAGE_KEY;

  // A ref-backed store so async handlers and the engine loop always build on the latest state.
  const [store, setStore] = useState<TrainerStore>(() => loadStore(storageKey));
  const storeRef = useRef(store);
  const commit = useCallback((update: (s: TrainerStore) => TrainerStore) => {
    const prev = storeRef.current;
    const next = withHistory(prev, update(prev));
    if (next !== prev) {
      storeRef.current = next;
      setStore(next);
    }
    return next;
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(store));
    } catch {
      // Storage full or unavailable: the session still works, it just won't persist.
    }
  }, [store, storageKey]);

  const academyDone = LESSONS.filter((l) => store.completedLessons.includes(l.id)).length;
  const academyComplete = academyDone === LESSONS.length;
  const [tab, setTab] = useState<TrainerTab>(() => (academyComplete ? "desk" : "academy"));
  const [expiration, setExpiration] = useState<string | null>(null);
  const [setupOpen, setSetupOpen] = useState(false);
  const [ticket, setTicket] = useState<{ contract: OptionQuote; side: OrderSide } | null>(null);
  const [toasts, setToasts] = useState<{ id: number; text: string; tone: "ok" | "danger" }[]>([]);
  const now = useNow(1000);
  const market = getMarketStatus(now);
  const challenge = store.challenge;

  const pushToast = useCallback((text: string, tone: "ok" | "danger" = "ok") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-3), { id, text, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 8000);
  }, []);

  const watchSymbols = useMemo(() => {
    const symbols = new Set<string>();
    if (challenge) {
      challenge.positions.forEach((p) => symbols.add(p.symbol));
      challenge.orders.filter((o) => o.status === "working").forEach((o) => symbols.add(o.symbol));
    }
    if (ticket) symbols.add(ticket.contract.symbol);
    return [...symbols];
  }, [challenge, ticket]);

  const data = useSpyMarketData(expiration, watchSymbols);
  const expirationList = data.expirations.data?.expirations ?? [];

  useEffect(() => {
    if (expirationList.length && (!expiration || !expirationList.includes(expiration))) {
      setExpiration(expirationList[0]);
    }
  }, [expirationList, expiration]);

  // Settlement uses the official daily close, once it has had time to publish.
  const dailyData = data.daily.data;
  const closeLookup = useCallback(
    (date: string): number | null => {
      const bar = dailyData?.bars.find((b) => b.date === date);
      if (!bar || !dailyData) return null;
      const cutoff = expirationCutoff(date).getTime();
      if (Date.now() < cutoff + 15 * 60_000) return null;
      if (new Date(dailyData.fetchedAt).getTime() < cutoff + 5 * 60_000) return null;
      return bar.close;
    },
    [dailyData],
  );

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 15_000);
    return () => clearInterval(id);
  }, []);

  // Engine loop: settle expirations, work limit orders, mark positions and enforce the loss limit.
  useEffect(() => {
    const before = storeRef.current.challenge;
    if (!before || before.status !== "active") return;
    const at = new Date();
    const next = commit((s) => {
      if (!s.challenge || s.challenge.status !== "active") return s;
      let c = settleExpirations(s.challenge, closeLookup, at);
      c = processWorkingOrders(c, data.quoteMap, getMarketStatus(at), at);
      c = updateMarks(c, data.quoteMap);
      c = enforceLossLimit(c, data.quoteMap, at);
      c = recordEquity(c, at);
      return c === s.challenge ? s : { ...s, challenge: c };
    });
    const after = next.challenge;
    if (!after || after === before) return;
    for (const fill of after.fills.slice(before.fills.length)) {
      if (fill.reason === "order" || fill.reason === "expiration") pushToast(fillMessage(fill));
    }
    if (after.status === "failed") pushToast(after.endReason ?? "Loss limit reached.", "danger");
  }, [data.quoteMap, closeLookup, tick, commit, pushToast]);

  const handleSubmit = useCallback(
    async (request: OrderRequest): Promise<TicketResult> => {
      let fresh: OptionQuote | undefined;
      let fetchedAt = Date.now();
      try {
        const res = await fetchJson<ContractsResponse>(`/api/spy/contracts?symbols=${encodeURIComponent(request.contract.symbol)}`);
        fresh = res.contracts.find((c) => c.symbol === request.contract.symbol);
        fetchedAt = new Date(res.fetchedAt).getTime();
      } catch (error) {
        return {
          ok: false,
          message: `Couldn't refresh the quote (${error instanceof Error ? error.message : String(error)}). The order was not sent.`,
        };
      }
      if (!fresh) return { ok: false, message: "The data feed returned no quote for this contract. The order was not sent." };
      const at = new Date();
      const holder: { result: SubmitResult | null } = { result: null };
      commit((s) => {
        if (!s.challenge) return s;
        holder.result = submitOrder(s.challenge, request, {
          quote: fresh as OptionQuote,
          quoteAgeMs: Math.max(0, at.getTime() - fetchedAt),
          market: getMarketStatus(at),
          now: at,
        });
        return holder.result.error ? s : { ...s, challenge: holder.result.state };
      });
      const result = holder.result;
      if (!result) return { ok: false, message: "Start a challenge before placing orders." };
      if (result.error) return { ok: false, message: result.error };
      const name = describeContract(request.contract);
      if (result.filled && result.order) {
        const msg = `${request.side === "buy_to_open" ? "Bought" : "Sold"} ${request.qty} ${name} at $${result.order.fillPrice?.toFixed(2)}.`;
        pushToast(msg);
        return { ok: true, message: `Filled. ${msg}` };
      }
      return {
        ok: true,
        message: `Limit order working at $${result.order?.limitPrice?.toFixed(2)}. It fills when the ${
          request.side === "buy_to_open" ? "ask drops" : "bid rises"
        } to your price; see Working orders.`,
      };
    },
    [commit, pushToast],
  );

  const startChallenge = (tier: Tier, commission: number) => {
    commit((s) => ({ ...s, challenge: createChallenge(tier, commission) }));
    setSetupOpen(false);
  };

  const live = useMemo(
    () => ({ spot: data.chain.data?.underlyingPrice ?? data.quote.data?.last ?? null, chain: data.chain.data }),
    [data.chain.data, data.quote.data],
  );

  const heldSymbols = useMemo(() => new Set(challenge?.positions.map((p) => p.symbol) ?? []), [challenge]);
  const status = data.status.data;

  const TABS: { id: TrainerTab; label: string; icon: typeof GraduationCap; badge?: string }[] = [
    { id: "academy", label: "Academy", icon: GraduationCap, badge: `${academyDone}/${LESSONS.length}` },
    { id: "desk", label: "Trading Desk", icon: CandlestickChart },
    { id: "glossary", label: "Glossary", icon: BookOpen },
    { id: "results", label: "Results", icon: Trophy },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6F7] text-[#2A1B1E]">
      <header className="bg-[#7A1F2E] text-white shadow-[0_2px_6px_rgba(61,13,22,0.25)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 pt-4 pb-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 shrink-0 rounded-lg bg-white text-[#7A1F2E] flex items-center justify-center">
                <CandlestickChart className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h1 className="font-display text-xl sm:text-2xl font-extrabold leading-tight tracking-tight">SPY Options Trainer</h1>
                <p className="text-[11px] sm:text-xs text-white/80">
                  Learn the fundamentals, then trade real SPY quotes in a $300 challenge.
                </p>
              </div>
            </div>
            <div className="text-[11px] leading-relaxed text-white/85 sm:text-right">
              <div className="font-semibold text-white">{market.label}</div>
              {status ? (
                <div>
                  SPY: {providerLabel(status.quoteProvider)} ({delayLabel(status.quoteDelayMinutes)}) · Options:{" "}
                  {providerLabel(status.optionsProvider)} ({delayLabel(status.optionsDelayMinutes)})
                </div>
              ) : (
                <div>{data.status.error ? `Market data unavailable: ${data.status.error}` : "Connecting to market data…"}</div>
              )}
            </div>
          </div>
          <nav className="flex gap-1 overflow-x-auto -mb-px" aria-label="Trainer sections">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  aria-current={active ? "page" : undefined}
                  className={`shrink-0 inline-flex items-center gap-1.5 text-[13px] font-semibold px-3.5 sm:px-4 py-2.5 rounded-t-lg transition-colors ${
                    active ? "bg-[#FAF6F7] text-[#7A1F2E]" : "text-white/90 hover:bg-white/10"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {t.label}
                  {t.badge && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        active ? "bg-[#7A1F2E] text-white" : "bg-white/15 text-white"
                      }`}
                    >
                      {t.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-6 space-y-5">
      {tab === "academy" && (
        <Academy
          theme={theme}
          completed={store.completedLessons}
          onComplete={(id) =>
            commit((s) => (s.completedLessons.includes(id) ? s : { ...s, completedLessons: [...s.completedLessons, id] }))
          }
          onGoToDesk={() => setTab("desk")}
          live={live}
        />
      )}

      {tab === "desk" && (
        <div className="space-y-4">
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 min-w-0">
              <SpyQuoteCard theme={theme} quote={data.quote} intraday={data.intraday} market={market} />
            </div>
            <AccountPanel
              theme={theme}
              challenge={challenge}
              academyDone={academyDone}
              academyTotal={LESSONS.length}
              setupOpen={setupOpen}
              onOpenSetup={() => setSetupOpen(true)}
              onStart={startChallenge}
              onEnd={() =>
                commit((s) => (s.challenge ? { ...s, challenge: endChallenge(s.challenge, data.quoteMap, new Date()) } : s))
              }
              onGoToAcademy={() => setTab("academy")}
            />
          </div>
          <OptionChain
            theme={theme}
            chain={data.chain}
            expirations={expirationList}
            expirationsError={data.expirations.error}
            expiration={expiration}
            onExpirationChange={setExpiration}
            heldSymbols={heldSymbols}
            onSelect={(contract) =>
              setTicket({ contract, side: heldSymbols.has(contract.symbol) ? "sell_to_close" : "buy_to_open" })
            }
            now={now}
          />
          {challenge && (
            <PositionsPanel
              theme={theme}
              challenge={challenge}
              quoteMap={data.quoteMap}
              now={now}
              onClosePosition={(p) =>
                setTicket({ contract: data.quoteMap[p.symbol] ?? placeholderQuote(p), side: "sell_to_close" })
              }
              onCancelOrder={(id) =>
                commit((s) => (s.challenge ? { ...s, challenge: cancelOrder(s.challenge, id) } : s))
              }
            />
          )}
        </div>
      )}

      {tab === "glossary" && <GlossaryPanel theme={theme} />}
      {tab === "results" && <ResultsPanel theme={theme} challenge={challenge} history={store.history} />}

      </main>

      <footer className="border-t-4 border-[#7A1F2E] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-start gap-2 text-[11px] text-[#5E4A4E]">
          <Info className="w-3.5 h-3.5 mt-px shrink-0 text-[#7A1F2E]" />
          <p>
            Educational simulator for training and coursework. Quotes come from live SPY market data, but no real orders are sent and
            nothing here is investment advice.
          </p>
        </div>
      </footer>

      {ticket && (
        <OrderTicket
          key={ticket.contract.symbol}
          theme={theme}
          contract={ticket.contract}
          liveQuote={data.quoteMap[ticket.contract.symbol]}
          delayMinutes={data.chain.data?.delayMinutes ?? data.watched.data?.delayMinutes ?? status?.optionsDelayMinutes ?? 0}
          challenge={challenge}
          initialSide={ticket.side}
          market={market}
          spot={live.spot}
          now={now}
          onSubmit={handleSubmit}
          onClose={() => setTicket(null)}
        />
      )}

      <div className="fixed bottom-4 right-4 left-4 sm:left-auto z-[60] flex flex-col gap-2 sm:max-w-sm" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`${theme.card} flex items-start gap-2 px-3 py-2.5 text-xs shadow-lg border-l-4 ${
              t.tone === "ok" ? "border-l-[#7A1F2E]" : "border-l-[#3D0D16] bg-[#F7ECEE]"
            } ${theme.strong}`}
          >
            <span className="flex-1">{t.text}</span>
            <button type="button" aria-label="Dismiss" onClick={() => setToasts((all) => all.filter((x) => x.id !== t.id))}>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
