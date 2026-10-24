import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid } from "recharts";
import { RefreshCw } from "lucide-react";
import type { IntradayResponse, UnderlyingQuote } from "../../lib/options/types";
import type { MarketStatus } from "../../lib/options/marketHours";
import { formatEtTime } from "../../lib/options/marketHours";
import type { Polled } from "./useSpyMarketData";
import { DataBadge, TermTip } from "./common";
import { chartTooltipStyle, fmtCompact, fmtMoney, fmtPct, fmtPrice, signClass, type OptionsTheme } from "./ui";

const etClock = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  hour: "numeric",
  minute: "2-digit",
});

export function SpyQuoteCard({
  theme,
  quote,
  intraday,
  market,
}: {
  theme: OptionsTheme;
  quote: Polled<UnderlyingQuote>;
  intraday: Polled<IntradayResponse>;
  market: MarketStatus;
}) {
  const q = quote.data;
  const bars = intraday.data?.bars ?? [];
  const prevClose = q?.prevClose ?? intraday.data?.prevClose ?? null;

  const chartData = useMemo(() => bars.map((b) => ({ t: b.t, price: b.close })), [bars]);
  const [lo, hi] = useMemo(() => {
    const values = chartData.map((d) => d.price);
    if (prevClose) values.push(prevClose);
    if (!values.length) return [0, 1];
    const min = Math.min(...values);
    const max = Math.max(...values);
    const pad = Math.max((max - min) * 0.08, 0.25);
    return [Math.floor((min - pad) * 4) / 4, Math.ceil((max + pad) * 4) / 4];
  }, [chartData, prevClose]);

  const stroke = theme.chartLine;

  return (
    <div className={`${theme.card} p-4 sm:p-5 flex flex-col gap-4 min-w-0`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className={`font-display text-[12px] font-bold uppercase tracking-wider ${theme.accent}`}>
            SPY · SPDR S&amp;P 500 ETF Trust
          </div>
          {q ? (
            <div className="flex flex-wrap items-baseline gap-3 mt-1">
              <span className={`font-display text-3xl sm:text-4xl font-bold tabular-nums ${theme.strong}`}>{fmtMoney(q.last)}</span>
              <span className={`text-sm font-semibold tabular-nums ${signClass(theme, q.change)}`}>
                {q.change >= 0 ? "+" : ""}
                {q.change.toFixed(2)} ({fmtPct(q.changePercent)})
              </span>
            </div>
          ) : (
            <div className={`text-sm mt-2 ${theme.muted}`}>
              {quote.error ? `SPY quote unavailable: ${quote.error}` : "Loading SPY quote…"}
            </div>
          )}
          {q?.quoteTime && (
            <div className={`text-[11px] mt-1 ${theme.faint}`}>Last trade {formatEtTime(new Date(q.quoteTime), true)}</div>
          )}
        </div>
        <div className="flex flex-col items-start sm:items-end gap-1.5">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide ${
              market.isOpen ? "bg-[#7A1F2E] text-white" : `${theme.badge}`
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${market.isOpen ? "bg-white animate-pulse" : "bg-[#B98A93]"}`} />
            {market.label}
          </span>
          <DataBadge
            theme={theme}
            label="SPY"
            source={q?.source}
            delayMinutes={q?.delayMinutes}
            updatedAt={quote.updatedAt}
            error={quote.error}
          />
          {!market.isOpen && (
            <span className={`text-[10.5px] ${theme.faint}`}>Next open {formatEtTime(market.nextOpen, true)}</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 2xl:grid-cols-6 gap-2">
        {[
          // Some feeds (Yahoo) don't publish SPY's bid/ask; skip those tiles rather than show blanks.
          ...(q?.bid != null && q?.ask != null
            ? [
                { label: "Bid × Size", id: "bid", value: `${fmtPrice(q.bid)} × ${q.bidSize ?? "—"}` },
                { label: "Ask × Size", id: "ask", value: `${fmtPrice(q.ask)} × ${q.askSize ?? "—"}` },
              ]
            : []),
          { label: "Open", id: "", value: fmtPrice(q?.open) },
          { label: "Day range", id: "", value: q?.low != null && q?.high != null ? `${fmtPrice(q.low)} – ${fmtPrice(q.high)}` : "—" },
          { label: "Prev close", id: "", value: fmtPrice(prevClose) },
          { label: "Volume", id: "volume", value: fmtCompact(q?.volume) },
        ].map((item) => (
          <div key={item.label} className={`rounded-lg px-3 py-2 ${theme.subtleBg}`}>
            <div className={`text-[10px] uppercase tracking-wide font-semibold ${theme.faint}`}>
              {item.id ? (
                <TermTip id={item.id} theme={theme} align="left">
                  {item.label}
                </TermTip>
              ) : (
                item.label
              )}
            </div>
            <div className={`text-sm font-semibold tabular-nums ${theme.strong}`}>{item.value}</div>
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <span className={`text-[11px] font-semibold ${theme.faint}`}>
            Intraday (1-minute){intraday.data ? "" : intraday.error ? " · unavailable" : " · loading"}
          </span>
          <button
            type="button"
            onClick={() => {
              quote.refresh();
              intraday.refresh();
            }}
            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-md ${theme.chip}`}
          >
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>
        <div className="h-48">
          {chartData.length > 1 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="spyFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={stroke} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={stroke} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={theme.chartGrid} strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="t"
                  type="number"
                  domain={["dataMin", "dataMax"]}
                  tickFormatter={(t) => etClock.format(new Date(t))}
                  tick={{ fontSize: 10, fill: theme.chartAxis }}
                  minTickGap={40}
                  stroke={theme.chartGrid}
                />
                <YAxis
                  domain={[lo, hi]}
                  tick={{ fontSize: 10, fill: theme.chartAxis }}
                  width={52}
                  tickFormatter={(v) => v.toFixed(2)}
                  stroke={theme.chartGrid}
                />
                <Tooltip
                  labelFormatter={(t) => `${etClock.format(new Date(Number(t)))} ET`}
                  formatter={(v: number) => [fmtMoney(v), "SPY"]}
                  contentStyle={chartTooltipStyle}
                />
                {prevClose && (
                  <ReferenceLine
                    y={prevClose}
                    stroke={theme.chartRef}
                    strokeDasharray="4 4"
                    label={{ value: "Prev close", position: "insideTopLeft", fontSize: 10, fill: theme.chartAxis }}
                  />
                )}
                <Area type="monotone" dataKey="price" stroke={stroke} strokeWidth={1.75} fill="url(#spyFill)" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className={`h-full flex items-center justify-center rounded-lg text-xs ${theme.subtleBg} ${theme.faint}`}>
              {intraday.error ? `Intraday chart unavailable: ${intraday.error}` : "Loading intraday chart…"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
