import { useState } from "react";
import { Download } from "lucide-react";
import type { OptionQuote } from "../../lib/options/types";
import { describeContract } from "../../lib/options/occ";
import { daysToExpiration, expirationCutoff } from "../../lib/options/marketHours";
import {
  CONTRACT_MULTIPLIER,
  positionMark,
  type ChallengeState,
  type Fill,
  type Position,
} from "../../lib/options/challenge";
import { SectionTitle, TermTip } from "./common";
import { fmtMoney, fmtPct, fmtPrice, signClass, type OptionsTheme } from "./ui";

const SIDE_LABEL = { buy_to_open: "Buy to open", sell_to_close: "Sell to close" } as const;
const REASON_LABEL: Record<Fill["reason"], string> = {
  order: "Order",
  expiration: "Expiration",
  liquidation: "Loss limit",
  end: "Challenge ended",
};

function exportCsv(challenge: ChallengeState) {
  const header = ["time", "contract", "symbol", "side", "qty", "price", "commission", "realized_pnl", "reason", "settlement_price"];
  const rows = challenge.fills.map((f) => [
    f.time,
    describeContract(f),
    f.symbol,
    SIDE_LABEL[f.side],
    f.qty,
    f.price.toFixed(2),
    f.commission.toFixed(2),
    f.realizedPnl === null ? "" : f.realizedPnl.toFixed(2),
    REASON_LABEL[f.reason],
    f.settlementPrice ?? "",
  ]);
  const csv = [header, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `spy-options-journal-${challenge.id}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function PositionsPanel({
  theme,
  challenge,
  quoteMap,
  now,
  onClosePosition,
  onCancelOrder,
}: {
  theme: OptionsTheme;
  challenge: ChallengeState;
  quoteMap: Record<string, OptionQuote>;
  now: Date;
  onClosePosition: (position: Position) => void;
  onCancelOrder: (orderId: string) => void;
}) {
  const [tab, setTab] = useState<"positions" | "orders" | "history">("positions");
  const working = challenge.orders.filter((o) => o.status === "working");
  const fills = [...challenge.fills].reverse();
  const th = `px-2 py-1.5 text-right font-semibold whitespace-nowrap`;
  const td = `px-2 py-1.5 text-right tabular-nums whitespace-nowrap`;

  return (
    <div className={`${theme.card} p-4 sm:p-5 min-w-0`}>
      <SectionTitle
        theme={theme}
        right={
          challenge.fills.length > 0 && (
            <button
              type="button"
              onClick={() => exportCsv(challenge)}
              className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-md ${theme.chip}`}
            >
              <Download className="w-3 h-3" /> Trade journal CSV
            </button>
          )
        }
      >
        Portfolio
      </SectionTitle>
      <div className="flex flex-wrap gap-1 mb-3">
        {(
          [
            ["positions", `Positions (${challenge.positions.length})`],
            ["orders", `Working orders (${working.length})`],
            ["history", `Trade history (${challenge.fills.length})`],
          ] as const
        ).map(([key, label]) => (
          <button
            type="button"
            key={key}
            onClick={() => setTab(key)}
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-md ${tab === key ? theme.chipActive : theme.chip}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className={`overflow-x-auto rounded-lg border ${theme.border}`}>
        {tab === "positions" && (
          <table className="w-full text-[11.5px]">
            <thead className={`${theme.subtleBg} text-[10px] uppercase tracking-wide ${theme.faint}`}>
              <tr>
                <th className={`${th} text-left`}>Contract</th>
                <th className={th}>Qty</th>
                <th className={th}>Avg cost</th>
                <th className={th}>Bid / Ask</th>
                <th className={th}>
                  <TermTip id="mark" theme={theme}>
                    Mark
                  </TermTip>
                </th>
                <th className={th}>Value</th>
                <th className={th}>Unrealized P&amp;L</th>
                <th className={th}>
                  <TermTip id="delta" theme={theme}>
                    Pos. Δ
                  </TermTip>
                </th>
                <th className={th}>
                  <TermTip id="theta" theme={theme}>
                    Θ / day
                  </TermTip>
                </th>
                <th className={th}>DTE</th>
                <th className={th} />
              </tr>
            </thead>
            <tbody>
              {challenge.positions.length === 0 && (
                <tr>
                  <td colSpan={11} className={`px-3 py-6 text-center ${theme.faint}`}>
                    No open positions. Click a contract in the chain to open an order ticket.
                  </td>
                </tr>
              )}
              {challenge.positions.map((p) => {
                const q = quoteMap[p.symbol];
                const mark = positionMark(challenge, p);
                const value = mark * CONTRACT_MULTIPLIER * p.qty;
                const cost = p.avgPrice * CONTRACT_MULTIPLIER * p.qty;
                const pnl = value - cost;
                const expired = now.getTime() >= expirationCutoff(p.expiration).getTime();
                return (
                  <tr key={p.symbol} className={`border-t ${theme.border}`}>
                    <td className={`${td} text-left font-semibold ${theme.strong}`}>{describeContract(p)}</td>
                    <td className={`${td} ${theme.strong}`}>{p.qty}</td>
                    <td className={`${td} ${theme.strong}`}>{fmtPrice(p.avgPrice)}</td>
                    <td className={`${td} ${theme.muted}`}>{q ? `${fmtPrice(q.bid)} / ${fmtPrice(q.ask)}` : "—"}</td>
                    <td className={`${td} ${theme.strong}`}>{fmtPrice(mark)}</td>
                    <td className={`${td} ${theme.strong}`}>{fmtMoney(value)}</td>
                    <td className={`${td} font-semibold ${signClass(theme, pnl)}`}>
                      {fmtMoney(pnl, { sign: true })} ({fmtPct(cost ? (pnl / cost) * 100 : 0, 1)})
                    </td>
                    <td className={`${td} ${theme.muted}`}>{q?.delta != null ? (q.delta * CONTRACT_MULTIPLIER * p.qty).toFixed(1) : "—"}</td>
                    <td className={`${td} ${theme.muted}`}>{q?.theta != null ? fmtMoney(q.theta * CONTRACT_MULTIPLIER * p.qty) : "—"}</td>
                    <td className={`${td} ${theme.muted}`}>{expired ? "Settling" : daysToExpiration(p.expiration, now)}</td>
                    <td className={td}>
                      {challenge.status === "active" && !expired && (
                        <button
                          type="button"
                          onClick={() => onClosePosition(p)}
                          className={`text-[10.5px] font-bold uppercase px-2 py-1 rounded-md ${theme.sellBtn}`}
                        >
                          Close
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {tab === "orders" && (
          <table className="w-full text-[11.5px]">
            <thead className={`${theme.subtleBg} text-[10px] uppercase tracking-wide ${theme.faint}`}>
              <tr>
                <th className={`${th} text-left`}>Contract</th>
                <th className={th}>Side</th>
                <th className={th}>Qty</th>
                <th className={th}>Limit</th>
                <th className={th}>Bid / Ask now</th>
                <th className={th}>Placed</th>
                <th className={th} />
              </tr>
            </thead>
            <tbody>
              {working.length === 0 && (
                <tr>
                  <td colSpan={7} className={`px-3 py-6 text-center ${theme.faint}`}>
                    No working orders. Limit orders that can't fill right away wait here until the market reaches your price.
                  </td>
                </tr>
              )}
              {working.map((o) => {
                const q = quoteMap[o.symbol];
                return (
                  <tr key={o.id} className={`border-t ${theme.border}`}>
                    <td className={`${td} text-left font-semibold ${theme.strong}`}>{describeContract(o)}</td>
                    <td className={`${td} font-semibold ${o.side === "buy_to_open" ? theme.strong : theme.accent}`}>{SIDE_LABEL[o.side]}</td>
                    <td className={`${td} ${theme.strong}`}>{o.qty}</td>
                    <td className={`${td} ${theme.strong}`}>{fmtPrice(o.limitPrice)}</td>
                    <td className={`${td} ${theme.muted}`}>{q ? `${fmtPrice(q.bid)} / ${fmtPrice(q.ask)}` : "—"}</td>
                    <td className={`${td} ${theme.muted}`}>{new Date(o.createdAt).toLocaleTimeString()}</td>
                    <td className={td}>
                      <button
                        type="button"
                        onClick={() => onCancelOrder(o.id)}
                        className={`text-[10.5px] font-bold uppercase px-2 py-1 rounded-md ${theme.chip}`}
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {tab === "history" && (
          <table className="w-full text-[11.5px]">
            <thead className={`${theme.subtleBg} text-[10px] uppercase tracking-wide ${theme.faint}`}>
              <tr>
                <th className={`${th} text-left`}>Time</th>
                <th className={`${th} text-left`}>Contract</th>
                <th className={th}>Side</th>
                <th className={th}>Qty</th>
                <th className={th}>Price</th>
                <th className={th}>Commission</th>
                <th className={th}>Realized P&amp;L</th>
                <th className={th}>Source</th>
              </tr>
            </thead>
            <tbody>
              {fills.length === 0 && (
                <tr>
                  <td colSpan={8} className={`px-3 py-6 text-center ${theme.faint}`}>
                    No trades yet.
                  </td>
                </tr>
              )}
              {fills.map((f) => (
                <tr key={f.id} className={`border-t ${theme.border}`}>
                  <td className={`${td} text-left ${theme.muted}`}>{new Date(f.time).toLocaleString()}</td>
                  <td className={`${td} text-left font-semibold ${theme.strong}`}>{describeContract(f)}</td>
                  <td className={`${td} font-semibold ${f.side === "buy_to_open" ? theme.strong : theme.accent}`}>{SIDE_LABEL[f.side]}</td>
                  <td className={`${td} ${theme.strong}`}>{f.qty}</td>
                  <td className={`${td} ${theme.strong}`}>{fmtPrice(f.price)}</td>
                  <td className={`${td} ${theme.muted}`}>{fmtMoney(f.commission)}</td>
                  <td className={`${td} font-semibold ${signClass(theme, f.realizedPnl)}`}>
                    {f.realizedPnl === null ? "—" : fmtMoney(f.realizedPnl, { sign: true })}
                  </td>
                  <td className={`${td} ${theme.muted}`}>
                    {REASON_LABEL[f.reason]}
                    {f.settlementPrice !== undefined ? ` @ SPY ${fmtPrice(f.settlementPrice)}` : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {tab === "positions" && challenge.positions.length > 0 && (
        <p className={`text-[11px] mt-2 ${theme.faint}`}>
          Positions are marked at the bid/ask midpoint. Selling at market fills at the bid, which is usually a little lower. Θ/day is the
          estimated dollar decay per day across the whole position.
        </p>
      )}
    </div>
  );
}
