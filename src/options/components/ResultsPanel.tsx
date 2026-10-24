import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid } from "recharts";
import { TIERS, equityFloor, summarizeChallenge, type ChallengeState, type ChallengeSummary } from "../../lib/options/challenge";
import { SectionTitle } from "./common";
import { chartTooltipStyle, fmtMoney, fmtPct, signClass, type OptionsTheme } from "./ui";

export function ResultsPanel({
  theme,
  challenge,
  history,
}: {
  theme: OptionsTheme;
  challenge: ChallengeState | null;
  history: ChallengeSummary[];
}) {
  const current = challenge ? summarizeChallenge(challenge) : null;
  const curve = challenge?.equityHistory ?? [];
  const spanMs = curve.length > 1 ? curve[curve.length - 1].t - curve[0].t : 0;
  const tickLabel = (t: number) =>
    spanMs < 3_600_000
      ? new Date(t).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit", second: "2-digit" })
      : spanMs < 2 * 86_400_000
        ? new Date(t).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
        : new Date(t).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const rows = [...history].reverse();

  return (
    <div className="space-y-4">
      <div className={`${theme.card} p-4 sm:p-5 min-w-0`}>
        <SectionTitle theme={theme}>Current challenge</SectionTitle>
        {!challenge || !current ? (
          <p className={`text-sm ${theme.muted}`}>No challenge yet. Start one from the Trading Desk once the Academy is complete.</p>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 mb-4 text-xs">
              {[
                ["Tier", TIERS[challenge.tier].label],
                ["Status", challenge.status === "active" ? "Active" : challenge.status === "failed" ? "Loss limit hit" : "Ended"],
                ["Equity", fmtMoney(current.finalEquity)],
                ["P&L", fmtMoney(current.pnl, { sign: true })],
                ["Closed trades", String(current.closedTrades)],
                ["Win rate", current.winRate === null ? "—" : `${Math.round(current.winRate * 100)}%`],
                ["Max drawdown", fmtPct(current.maxDrawdownPct * 100, 1, false)],
                ["Commissions", fmtMoney(current.commissions)],
              ].map(([label, value]) => (
                <div key={label} className={`rounded-md px-2.5 py-1.5 ${theme.subtleBg}`}>
                  <div className={`text-[10px] uppercase tracking-wide font-semibold ${theme.faint}`}>{label}</div>
                  <div className={`font-semibold tabular-nums ${theme.strong}`}>{value}</div>
                </div>
              ))}
            </div>
            <div className="h-56">
              {curve.length > 1 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={curve} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
                    <CartesianGrid stroke={theme.chartGrid} strokeDasharray="3 3" />
                    <XAxis
                      dataKey="t"
                      type="number"
                      domain={["dataMin", "dataMax"]}
                      tickFormatter={tickLabel}
                      tick={{ fontSize: 10, fill: theme.chartAxis }}
                      minTickGap={40}
                    />
                    <YAxis tick={{ fontSize: 10, fill: theme.chartAxis }} width={48} domain={["auto", "auto"]} />
                    <Tooltip
                      labelFormatter={(t) => new Date(Number(t)).toLocaleString()}
                      formatter={(v: number) => [fmtMoney(v), "Equity"]}
                      contentStyle={chartTooltipStyle}
                    />
                    <ReferenceLine y={equityFloor(challenge)} stroke={theme.chartLine} strokeDasharray="4 4" label={{ value: "Loss floor", fontSize: 10, fill: theme.chartLine, position: "insideBottomLeft" }} />
                    <ReferenceLine y={challenge.startingBalance} stroke={theme.chartRef} strokeDasharray="2 4" />
                    <Line type="stepAfter" dataKey="equity" stroke={theme.chartLine} strokeWidth={2} dot={false} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className={`h-full flex items-center justify-center rounded-lg text-xs ${theme.subtleBg} ${theme.faint}`}>
                  The equity curve fills in as you trade.
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <div className={`${theme.card} p-4 sm:p-5 min-w-0`}>
        <SectionTitle theme={theme}>Past challenges</SectionTitle>
        {rows.length === 0 ? (
          <p className={`text-sm ${theme.muted}`}>Finished challenges appear here so you can compare attempts.</p>
        ) : (
          <div className={`overflow-x-auto rounded-lg border ${theme.border}`}>
            <table className="w-full text-xs">
              <thead className={`${theme.subtleBg} text-[10px] uppercase tracking-wide ${theme.faint}`}>
                <tr>
                  {["Started", "Ended", "Tier", "Result", "Final equity", "P&L", "Trades", "Win rate", "Max DD"].map((h) => (
                    <th key={h} className="px-2 py-1.5 text-right first:text-left font-semibold whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((s) => (
                  <tr key={s.id} className={`border-t ${theme.border}`}>
                    <td className={`px-2 py-1.5 text-left whitespace-nowrap ${theme.muted}`}>{new Date(s.startedAt).toLocaleDateString()}</td>
                    <td className={`px-2 py-1.5 text-right whitespace-nowrap ${theme.muted}`}>{s.endedAt ? new Date(s.endedAt).toLocaleDateString() : "—"}</td>
                    <td className={`px-2 py-1.5 text-right ${theme.strong}`}>{TIERS[s.tier].label}</td>
                    <td className={`px-2 py-1.5 text-right ${s.status === "failed" ? theme.down : theme.strong}`}>
                      {s.status === "failed" ? "Loss limit hit" : "Ended"}
                    </td>
                    <td className={`px-2 py-1.5 text-right tabular-nums ${theme.strong}`}>{fmtMoney(s.finalEquity)}</td>
                    <td className={`px-2 py-1.5 text-right tabular-nums font-semibold ${signClass(theme, s.pnl)}`}>
                      {fmtMoney(s.pnl, { sign: true })} ({fmtPct(s.pnlPct * 100, 1)})
                    </td>
                    <td className={`px-2 py-1.5 text-right tabular-nums ${theme.strong}`}>{s.closedTrades}</td>
                    <td className={`px-2 py-1.5 text-right tabular-nums ${theme.strong}`}>{s.winRate === null ? "—" : `${Math.round(s.winRate * 100)}%`}</td>
                    <td className={`px-2 py-1.5 text-right tabular-nums ${theme.strong}`}>{fmtPct(s.maxDrawdownPct * 100, 1, false)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
