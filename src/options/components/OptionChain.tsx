import { Fragment, useMemo, useState } from "react";
import type { ChainResponse, OptionQuote } from "../../lib/options/types";
import { formatExpiration } from "../../lib/options/occ";
import { daysToExpiration } from "../../lib/options/marketHours";
import type { Polled } from "./useSpyMarketData";
import { DataBadge, SectionTitle, TermTip } from "./common";
import { fmtCompact, fmtGreek, fmtPrice, type OptionsTheme } from "./ui";

type ColKey = "bid" | "ask" | "mid" | "last" | "change" | "volume" | "oi" | "iv" | "delta" | "gamma" | "theta" | "vega" | "rho";

const COLS: Record<ColKey, { label: string; term: string; render: (c: OptionQuote) => string }> = {
  bid: { label: "Bid", term: "bid", render: (c) => fmtPrice(c.bid) },
  ask: { label: "Ask", term: "ask", render: (c) => fmtPrice(c.ask) },
  mid: { label: "Mid", term: "mid", render: (c) => (c.ask > 0 ? ((c.bid + c.ask) / 2).toFixed(3) : "—") },
  last: { label: "Last", term: "last", render: (c) => fmtPrice(c.last) },
  change: { label: "Chg", term: "change", render: (c) => (c.change === null ? "—" : `${c.change > 0 ? "+" : ""}${c.change.toFixed(2)}`) },
  volume: { label: "Vol", term: "volume", render: (c) => fmtCompact(c.volume) },
  oi: { label: "OI", term: "open-interest", render: (c) => fmtCompact(c.openInterest) },
  iv: { label: "IV", term: "implied-volatility", render: (c) => (c.iv === null ? "—" : `${(c.iv * 100).toFixed(1)}%`) },
  delta: { label: "Δ", term: "delta", render: (c) => fmtGreek(c.delta, 3) },
  gamma: { label: "Γ", term: "gamma", render: (c) => fmtGreek(c.gamma, 4) },
  theta: { label: "Θ", term: "theta", render: (c) => fmtGreek(c.theta, 3) },
  vega: { label: "Vega", term: "vega", render: (c) => fmtGreek(c.vega, 3) },
  rho: { label: "ρ", term: "rho", render: (c) => fmtGreek(c.rho, 3) },
};

const COLUMN_SETS: Record<"pricing" | "greeks" | "all", ColKey[]> = {
  pricing: ["bid", "ask", "last", "change", "volume", "oi", "iv", "delta"],
  greeks: ["bid", "ask", "iv", "delta", "gamma", "theta", "vega", "rho"],
  all: ["bid", "ask", "mid", "last", "change", "volume", "oi", "iv", "delta", "gamma", "theta", "vega"],
};

const WINDOWS = [
  { value: 8, label: "±8" },
  { value: 15, label: "±15" },
  { value: 30, label: "±30" },
  { value: 0, label: "All" },
];

interface StrikeRow {
  strike: number;
  call?: OptionQuote;
  put?: OptionQuote;
}

export function OptionChain({
  theme,
  chain,
  expirations,
  expirationsError,
  expiration,
  onExpirationChange,
  heldSymbols,
  onSelect,
  now,
}: {
  theme: OptionsTheme;
  chain: Polled<ChainResponse>;
  expirations: string[];
  expirationsError: string | null;
  expiration: string | null;
  onExpirationChange: (expiration: string) => void;
  heldSymbols: Set<string>;
  onSelect: (contract: OptionQuote) => void;
  now: Date;
}) {
  const [strikeWindow, setStrikeWindow] = useState(8);
  // Phones show one side at a time so the chain fits without sideways scrolling.
  const [side, setSide] = useState<"both" | "calls" | "puts">(() =>
    typeof window !== "undefined" && window.innerWidth < 640 ? "calls" : "both",
  );
  const [columnSet, setColumnSet] = useState<"pricing" | "greeks" | "all">("pricing");

  const data = chain.data && chain.data.expiration === expiration ? chain.data : null;
  const spot = data?.underlyingPrice ?? null;
  const cols = COLUMN_SETS[columnSet];

  const rows = useMemo<StrikeRow[]>(() => {
    if (!data) return [];
    const byStrike = new Map<number, StrikeRow>();
    for (const c of data.contracts) {
      const row = byStrike.get(c.strike) ?? { strike: c.strike };
      row[c.type] = c;
      byStrike.set(c.strike, row);
    }
    return [...byStrike.values()].sort((a, b) => a.strike - b.strike);
  }, [data]);

  const { visible, spotIndex } = useMemo(() => {
    if (!rows.length) return { visible: [] as StrikeRow[], spotIndex: -1 };
    let atm = 0;
    if (spot !== null) {
      atm = rows.reduce((best, r, i) => (Math.abs(r.strike - spot) < Math.abs(rows[best].strike - spot) ? i : best), 0);
    } else {
      atm = Math.floor(rows.length / 2);
    }
    const slice = strikeWindow === 0 ? rows : rows.slice(Math.max(0, atm - strikeWindow), atm + strikeWindow + 1);
    // Index of the first strike above spot, where the SPY marker row goes.
    const idx = spot === null ? -1 : slice.findIndex((r) => r.strike > spot);
    return { visible: slice, spotIndex: idx };
  }, [rows, spot, strikeWindow]);

  const quickExpirations = expirations.slice(0, 8);
  // Side by side, calls mirror puts around the strike; one side alone reads strike-first.
  const strikeFirst = side !== "both";
  const callCols = strikeFirst ? cols : [...cols].reverse();

  const cellCls = "px-2 py-1.5 text-right tabular-nums whitespace-nowrap";

  const renderSide = (contract: OptionQuote | undefined, columns: ColKey[], itm: boolean, label: string) => {
    if (!contract) {
      return columns.map((k) => (
        <td key={k} className={`${cellCls} ${theme.faint}`}>
          —
        </td>
      ));
    }
    return columns.map((k, i) => {
      const held = heldSymbols.has(contract.symbol);
      const isEdge = label === "put" && !strikeFirst ? i === columns.length - 1 : i === 0;
      return (
        <td
          key={k}
          onClick={() => onSelect(contract)}
          className={`${cellCls} cursor-pointer ${itm ? theme.itmBg : ""} ${theme.strong} ${
            k === "bid" || k === "ask" ? "font-semibold" : ""
          }`}
          title={`Trade ${contract.symbol}`}
        >
          {isEdge && held && (
            <span className="mr-1 inline-block w-1.5 h-1.5 rounded-full bg-[#7A1F2E] align-middle" title="You hold this contract" />
          )}
          {COLS[k].render(contract)}
        </td>
      );
    });
  };

  const strikeHead = (
    <th className={`px-2 py-1.5 text-center border-b ${theme.border}`}>
      <TermTip id="strike" theme={theme} align={strikeFirst ? "left" : "center"}>
        Strike
      </TermTip>
    </th>
  );
  const strikeCell = (strike: number) => (
    <td
      className={`px-3 py-1.5 text-center font-bold tabular-nums bg-[#F7ECEE] text-[#7A1F2E] ${strikeFirst ? "sticky left-0" : ""}`}
    >
      {Number.isInteger(strike) ? strike : strike.toFixed(1)}
    </td>
  );

  const showCalls = side !== "puts";
  const showPuts = side !== "calls";
  const totalCols = (showCalls ? cols.length : 0) + (showPuts ? cols.length : 0) + 1;

  return (
    <div className={`${theme.card} p-4 sm:p-5 min-w-0`}>
      <SectionTitle
        theme={theme}
        right={
          <DataBadge
            theme={theme}
            label="Options"
            source={data?.source}
            delayMinutes={data?.delayMinutes}
            updatedAt={chain.updatedAt}
            error={chain.error}
          />
        }
      >
        <TermTip id="option-chain" theme={theme} align="left">
          SPY option chain
        </TermTip>
      </SectionTitle>

      <div className="flex flex-col gap-3 mb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`text-[11px] font-semibold ${theme.faint}`}>Expiration</span>
          {quickExpirations.map((exp) => {
            const dte = daysToExpiration(exp, now);
            return (
              <button
                type="button"
                key={exp}
                onClick={() => onExpirationChange(exp)}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-md ${exp === expiration ? theme.chipActive : theme.chip}`}
              >
                {formatExpiration(exp)} · {dte === 0 ? "0DTE" : `${dte}d`}
              </button>
            );
          })}
          {expirations.length > quickExpirations.length && (
            <select
              aria-label="All expirations"
              value={expiration ?? ""}
              onChange={(e) => onExpirationChange(e.target.value)}
              className={`text-[11px] font-semibold px-2 py-1 rounded-md ${theme.inputBg}`}
            >
              {expirations.map((exp) => (
                <option key={exp} value={exp}>
                  {formatExpiration(exp)} · {daysToExpiration(exp, now)}d
                </option>
              ))}
            </select>
          )}
          {!expirations.length && (
            <span className={`text-[11px] ${theme.faint}`}>
              {expirationsError ? `Expirations unavailable: ${expirationsError}` : "Loading expirations…"}
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1">
            {(["both", "calls", "puts"] as const).map((s) => (
              <button
                type="button"
                key={s}
                onClick={() => setSide(s)}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-md capitalize ${side === s ? theme.chipActive : theme.chip}`}
              >
                {s === "both" ? "Calls & puts" : s}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            {(["pricing", "greeks", "all"] as const).map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setColumnSet(c)}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-md capitalize ${columnSet === c ? theme.chipActive : theme.chip}`}
              >
                {c === "all" ? "All columns" : c}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <span className={`text-[11px] font-semibold ${theme.faint}`}>Strikes</span>
            {WINDOWS.map((w) => (
              <button
                type="button"
                key={w.value}
                onClick={() => setStrikeWindow(w.value)}
                className={`text-[11px] font-semibold px-2 py-1 rounded-md ${strikeWindow === w.value ? theme.chipActive : theme.chip}`}
              >
                {w.label}
              </button>
            ))}
          </div>
        </div>
        {data && data.delayMinutes > 0 && (
          <p className={`text-[11px] ${theme.faint}`}>
            Option quotes are delayed {data.delayMinutes} minutes. The chain's SPY reference price is{" "}
            <span className="font-semibold">{fmtPrice(spot)}</span>; in-the-money shading uses that price so it matches the
            quotes. Click any row to open an order ticket.
          </p>
        )}
        {data && data.delayMinutes === 0 && (
          <p className={`text-[11px] ${theme.faint}`}>Click any row to open an order ticket. Shaded cells are in the money.</p>
        )}
      </div>

      {!data ? (
        <div className={`rounded-lg p-8 text-center text-sm ${theme.subtleBg} ${theme.muted}`}>
          {chain.error ? `Option chain unavailable: ${chain.error}` : expiration ? "Loading option chain…" : "Waiting for expirations…"}
        </div>
      ) : (
        <div className={`overflow-x-auto rounded-lg border ${theme.border}`}>
          <table className="w-full text-[11.5px]">
            <thead>
              <tr className="bg-[#7A1F2E] text-white text-[10px] uppercase tracking-wider font-bold">
                {strikeFirst && strikeHead}
                {showCalls && (
                  <th colSpan={cols.length} className={`px-2 py-1.5 text-center border-b ${theme.border}`}>
                    <TermTip id="call" theme={theme}>
                      Calls
                    </TermTip>
                  </th>
                )}
                {!strikeFirst && strikeHead}
                {showPuts && (
                  <th colSpan={cols.length} className={`px-2 py-1.5 text-center border-b ${theme.border}`}>
                    <TermTip id="put" theme={theme}>
                      Puts
                    </TermTip>
                  </th>
                )}
              </tr>
              <tr className={`text-[10px] uppercase tracking-wide font-semibold ${theme.faint}`}>
                {strikeFirst && <th className={`px-2 py-1.5 border-b ${theme.border}`} />}
                {showCalls &&
                  callCols.map((k) => (
                    <th key={`c-${k}`} className={`px-2 py-1.5 text-right border-b ${theme.border}`}>
                      <TermTip id={COLS[k].term} theme={theme}>
                        {COLS[k].label}
                      </TermTip>
                    </th>
                  ))}
                {!strikeFirst && <th className={`px-2 py-1.5 border-b ${theme.border}`} />}
                {showPuts &&
                  cols.map((k) => (
                    <th key={`p-${k}`} className={`px-2 py-1.5 text-right border-b ${theme.border}`}>
                      <TermTip id={COLS[k].term} theme={theme} align="right">
                        {COLS[k].label}
                      </TermTip>
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((row, i) => (
                <Fragment key={row.strike}>
                  {i === spotIndex && spot !== null && (
                    <tr>
                      <td colSpan={totalCols} className="p-0">
                        <div className="flex items-center gap-2 px-2 py-0.5">
                          <div className="h-px flex-1 bg-[#7A1F2E]/50" />
                          <span className="text-[10px] font-bold text-[#7A1F2E]">SPY {fmtPrice(spot)}</span>
                          <div className="h-px flex-1 bg-[#7A1F2E]/50" />
                        </div>
                      </td>
                    </tr>
                  )}
                  <tr className={`border-b last:border-b-0 ${theme.border} ${theme.hoverBg}`}>
                    {strikeFirst && strikeCell(row.strike)}
                    {showCalls && renderSide(row.call, callCols, spot !== null && row.strike < spot, "call")}
                    {!strikeFirst && strikeCell(row.strike)}
                    {showPuts && renderSide(row.put, cols, spot !== null && row.strike > spot, "put")}
                  </tr>
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
