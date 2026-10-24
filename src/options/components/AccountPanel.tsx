import { useState, type ReactNode } from "react";
import { LineChart, Line, ResponsiveContainer, YAxis, ReferenceLine } from "recharts";
import { Lock, Trophy, Flag, ShieldAlert, GraduationCap, Play } from "lucide-react";
import {
  DEFAULT_COMMISSION,
  STARTING_BALANCE,
  TIERS,
  buyingPower,
  computeEquity,
  equityFloor,
  positionsValue,
  summarizeChallenge,
  type ChallengeState,
  type Tier,
} from "../../lib/options/challenge";
import { Callout, SectionTitle, TermTip } from "./common";
import { fmtMoney, fmtPct, signClass, type OptionsTheme } from "./ui";

const TIER_ORDER: Tier[] = ["hard", "medium", "easy"];

function ChallengeSetup({
  theme,
  onStart,
}: {
  theme: OptionsTheme;
  onStart: (tier: Tier, commission: number) => void;
}) {
  const [tier, setTier] = useState<Tier>("medium");
  const [commission, setCommission] = useState(DEFAULT_COMMISSION);
  return (
    <div className="space-y-4">
      <p className={`text-xs leading-relaxed ${theme.muted}`}>
        You start with <b>{fmtMoney(STARTING_BALANCE)}</b> in a simulated cash account and trade real SPY calls and puts at the
        real bid and ask. Pick how much loss the challenge tolerates before it ends.
      </p>
      <div className="grid gap-2">
        {TIER_ORDER.map((t) => {
          const floor = equityFloor({ tier: t, startingBalance: STARTING_BALANCE });
          return (
            <button
              type="button"
              key={t}
              onClick={() => setTier(t)}
              className={`text-left rounded-lg p-3 transition-colors ${tier === t ? theme.chipActive : theme.chip}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold">{TIERS[t].label}</span>
                <span className="text-xs font-semibold tabular-nums">
                  −{Math.round(TIERS[t].maxLossPct * 100)}% · ends at {fmtMoney(floor)}
                </span>
              </div>
              <div className="text-[11px] opacity-80 mt-0.5">{TIERS[t].blurb}</div>
            </button>
          );
        })}
      </div>
      <div>
        <div className={`text-[11px] font-semibold mb-1 ${theme.faint}`}>
          <TermTip id="commission" theme={theme} align="left">
            Commission per contract
          </TermTip>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {[DEFAULT_COMMISSION, 0].map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => setCommission(c)}
              className={`text-xs font-semibold px-2 py-2 rounded-md ${commission === c ? theme.chipActive : theme.chip}`}
            >
              {c ? `${fmtMoney(c)} (typical broker)` : "$0.00 (commission-free)"}
            </button>
          ))}
        </div>
      </div>
      <div className={`rounded-lg p-3 text-[11px] leading-relaxed ${theme.subtleBg} ${theme.muted}`}>
        <div className={`font-bold uppercase tracking-wider mb-1 ${theme.faint}`}>Challenge standards</div>
        <ul className="list-disc pl-4 space-y-0.5">
          <li>Cash account: buy to open and sell to close calls and puts only. No naked selling or margin.</li>
          <li>Market orders fill at the ask (buy) or bid (sell). Limit orders fill when the market reaches your price.</li>
          <li>Orders only while SPY options trade: 9:30 AM–4:00 PM ET (1:00 PM on early-close days).</li>
          <li>Equity = cash + positions marked at the bid/ask midpoint.</li>
          <li>Reaching the loss floor ends the challenge and sells open positions at the bid.</li>
          <li>Expiring options settle to cash at intrinsic value using SPY's closing price.</li>
        </ul>
      </div>
      <button
        type="button"
        onClick={() => onStart(tier, commission)}
        className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#7A1F2E] hover:bg-[#5A1420] text-white text-xs font-bold uppercase tracking-wide px-4 py-3"
      >
        <Play className="w-4 h-4" /> Start {TIERS[tier].label} challenge with {fmtMoney(STARTING_BALANCE)}
      </button>
    </div>
  );
}

function ChallengeOver({ theme, challenge, onNew }: { theme: OptionsTheme; challenge: ChallengeState; onNew: () => void }) {
  const s = summarizeChallenge(challenge);
  const failed = challenge.status === "failed";
  return (
    <div className="space-y-3">
      <div className={`flex items-start gap-3 rounded-lg p-3 ${failed ? theme.dangerBox : theme.okBox}`}>
        {failed ? <ShieldAlert className="w-5 h-5 shrink-0" /> : <Flag className="w-5 h-5 shrink-0" />}
        <div>
          <div className="text-sm font-bold">{failed ? "Loss limit reached" : "Challenge ended"}</div>
          <div className="text-xs mt-0.5">{challenge.endReason}</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        {[
          ["Final equity", fmtMoney(s.finalEquity)],
          ["Total P&L", `${fmtMoney(s.pnl, { sign: true })} (${fmtPct(s.pnlPct * 100, 1)})`],
          ["Closed trades", String(s.closedTrades)],
          ["Win rate", s.winRate === null ? "—" : `${Math.round(s.winRate * 100)}%`],
          ["Best trade", fmtMoney(s.bestTrade, { sign: true })],
          ["Worst trade", fmtMoney(s.worstTrade, { sign: true })],
          ["Max drawdown", fmtPct(s.maxDrawdownPct * 100, 1, false)],
          ["Commissions", fmtMoney(s.commissions)],
        ].map(([label, value]) => (
          <div key={label} className={`rounded-md px-2.5 py-1.5 ${theme.subtleBg}`}>
            <div className={`text-[10px] uppercase tracking-wide font-semibold ${theme.faint}`}>{label}</div>
            <div className={`font-semibold tabular-nums ${theme.strong}`}>{value}</div>
          </div>
        ))}
      </div>
      <p className={`text-[11px] ${theme.faint}`}>Your trade history stays below. The Results tab keeps every past challenge.</p>
      <button
        type="button"
        onClick={onNew}
        className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#7A1F2E] hover:bg-[#5A1420] text-white text-xs font-bold uppercase tracking-wide px-4 py-3"
      >
        <Trophy className="w-4 h-4" /> Start a new challenge
      </button>
    </div>
  );
}

export function AccountPanel({
  theme,
  challenge,
  academyDone,
  academyTotal,
  setupOpen,
  onOpenSetup,
  onStart,
  onEnd,
  onGoToAcademy,
}: {
  theme: OptionsTheme;
  challenge: ChallengeState | null;
  academyDone: number;
  academyTotal: number;
  setupOpen: boolean;
  onOpenSetup: () => void;
  onStart: (tier: Tier, commission: number) => void;
  onEnd: () => void;
  onGoToAcademy: () => void;
}) {
  const [confirmEnd, setConfirmEnd] = useState(false);
  const locked = academyDone < academyTotal;

  let body: ReactNode;
  let title = "Challenge account";

  if (locked && (!challenge || challenge.status !== "active")) {
    title = "Challenge locked";
    body = (
      <div className="space-y-3 text-center py-2">
        <Lock className={`w-8 h-8 mx-auto ${theme.faint}`} />
        <p className={`text-sm font-semibold ${theme.strong}`}>Finish the Academy to unlock the $300 challenge</p>
        <p className={`text-xs ${theme.muted}`}>
          {academyDone} of {academyTotal} lessons passed. Each lesson ends with a short quiz. Meanwhile you can explore the live
          SPY chain and open order tickets to study contracts.
        </p>
        <div className={`h-2 rounded-full overflow-hidden ${theme.progressTrack}`}>
          <div className={`h-full ${theme.progressFill}`} style={{ width: `${(academyDone / academyTotal) * 100}%` }} />
        </div>
        <button
          type="button"
          onClick={onGoToAcademy}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#7A1F2E] hover:bg-[#5A1420] text-white text-xs font-bold uppercase tracking-wide px-4 py-3"
        >
          <GraduationCap className="w-4 h-4" /> Continue the Academy
        </button>
      </div>
    );
  } else if (!challenge || setupOpen) {
    title = "Start a challenge";
    body = <ChallengeSetup theme={theme} onStart={onStart} />;
  } else if (challenge.status !== "active") {
    body = <ChallengeOver theme={theme} challenge={challenge} onNew={onOpenSetup} />;
  } else {
    const equity = computeEquity(challenge);
    const floor = equityFloor(challenge);
    const pnl = equity - challenge.startingBalance;
    const buffer = equity - floor;
    const range = challenge.startingBalance - floor;
    const pct = Math.max(0, Math.min(1, buffer / range));
    const barColor = pct > 0.5 ? "bg-[#7A1F2E]" : pct > 0.25 ? "bg-[#5A1420]" : "bg-[#3D0D16]";
    const history = challenge.equityHistory.map((p) => ({ t: p.t, equity: p.equity }));
    body = (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className={theme.badge}>{TIERS[challenge.tier].label} tier</span>
          <span className={`text-[11px] ${theme.faint}`}>Started {new Date(challenge.startedAt).toLocaleDateString()}</span>
        </div>
        <div>
          <div className={`text-[11px] font-semibold uppercase tracking-wide ${theme.faint}`}>
            <TermTip id="equity" theme={theme} align="left">
              Equity
            </TermTip>
          </div>
          <div className={`font-display text-3xl font-bold tabular-nums ${theme.strong}`}>{fmtMoney(equity)}</div>
          <div className={`text-sm font-semibold tabular-nums ${signClass(theme, pnl)}`}>
            {fmtMoney(pnl, { sign: true })} ({fmtPct((pnl / challenge.startingBalance) * 100, 2)}) since start
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          {[
            ["Cash", fmtMoney(challenge.cash)],
            ["Buying power", fmtMoney(buyingPower(challenge))],
            ["Positions", fmtMoney(positionsValue(challenge))],
          ].map(([label, value]) => (
            <div key={label} className={`rounded-md px-2 py-1.5 ${theme.subtleBg}`}>
              <div className={`text-[10px] uppercase tracking-wide font-semibold ${theme.faint}`}>{label}</div>
              <div className={`font-semibold tabular-nums ${theme.strong}`}>{value}</div>
            </div>
          ))}
        </div>
        <div>
          <div className="flex justify-between text-[11px] mb-1">
            <span className={theme.muted}>
              Loss buffer <b className={theme.strong}>{fmtMoney(Math.max(buffer, 0))}</b>
            </span>
            <span className={theme.faint}>Ends at {fmtMoney(floor)}</span>
          </div>
          <div className={`h-2.5 rounded-full overflow-hidden ${theme.progressTrack}`} role="meter" aria-valuenow={Math.round(pct * 100)} aria-valuemin={0} aria-valuemax={100} aria-label="Remaining loss buffer">
            <div className={`h-full ${barColor} transition-all`} style={{ width: `${pct * 100}%` }} />
          </div>
        </div>
        {history.length > 1 && (
          <div className="h-20">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
                <YAxis hide domain={[(min: number) => Math.min(min, floor) - 2, (max: number) => Math.max(max, challenge.startingBalance) + 2]} />
                <ReferenceLine y={floor} stroke={theme.chartLine} strokeDasharray="3 3" />
                <ReferenceLine y={challenge.startingBalance} stroke={theme.chartRef} strokeDasharray="2 4" />
                <Line type="monotone" dataKey="equity" stroke={theme.chartLine} strokeWidth={1.75} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        {confirmEnd ? (
          <div className="space-y-2">
            <Callout theme={theme} tone="warning">
              Ending the challenge sells any open positions at the current bid and records the result. This can't be undone.
            </Callout>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setConfirmEnd(false)} className={`text-xs font-bold uppercase px-3 py-2 rounded-lg ${theme.chip}`}>
                Keep trading
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmEnd(false);
                  onEnd();
                }}
                className={`text-xs font-bold uppercase px-3 py-2 rounded-lg ${theme.sellBtn}`}
              >
                End challenge
              </button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => setConfirmEnd(true)} className={`w-full text-xs font-bold uppercase px-3 py-2 rounded-lg ${theme.chip}`}>
            End challenge
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`${theme.card} p-4 sm:p-5 min-w-0`}>
      <SectionTitle theme={theme}>{title}</SectionTitle>
      {body}
    </div>
  );
}
