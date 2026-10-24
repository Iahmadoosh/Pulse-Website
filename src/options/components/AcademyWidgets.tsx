import { Fragment, useMemo, useState, type ReactNode } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
  Legend,
} from "recharts";
import type { ChainResponse, OptionQuote, OptionType } from "../../lib/options/types";
import { blackScholes, expectedMove, intrinsicValue } from "../../lib/options/blackScholes";
import { daysToExpiration } from "../../lib/options/marketHours";
import { describeContract } from "../../lib/options/occ";
import { STARTING_BALANCE, TIERS, equityFloor, type Tier } from "../../lib/options/challenge";
import type { LessonWidget } from "../../lib/options/academy";
import { PALETTE, chartTooltipStyle, fmtCompact, fmtGreek, fmtMoney, fmtPrice, type OptionsTheme } from "./ui";

const RATE = 0.04;
const DIV = 0.012;

export interface LiveContext {
  spot: number | null;
  chain: ChainResponse | null;
}

function Slider({
  theme,
  label,
  value,
  min,
  max,
  step,
  onChange,
  display,
}: {
  theme: OptionsTheme;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  display: string;
}) {
  return (
    <label className="block">
      <div className="flex justify-between text-[11px] mb-0.5">
        <span className={`font-semibold ${theme.muted}`}>{label}</span>
        <span className={`font-bold tabular-nums ${theme.strong}`}>{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[#7A1F2E]"
        aria-label={label}
      />
    </label>
  );
}

function Panel({ theme, children }: { theme: OptionsTheme; children: ReactNode }) {
  return <div className={`rounded-xl border p-4 ${theme.border} ${theme.subtleBg}`}>{children}</div>;
}

function Stat({ theme, label, value, cls }: { theme: OptionsTheme; label: string; value: string; cls?: string }) {
  return (
    <div className={`rounded-md px-2.5 py-1.5 bg-white border ${theme.border} min-w-0`}>
      <div className={`text-[9.5px] uppercase tracking-wide font-semibold ${theme.faint}`}>{label}</div>
      <div className={`text-[13px] font-semibold tabular-nums ${cls ?? theme.strong}`}>{value}</div>
    </div>
  );
}


/** Nearest-to-the-money call and put from a chain. */
export function atmPair(chain: ChainResponse | null): { call?: OptionQuote; put?: OptionQuote; spot: number | null } {
  if (!chain || !chain.contracts.length) return { spot: null };
  const spot = chain.underlyingPrice;
  const strikes = [...new Set(chain.contracts.map((c) => c.strike))];
  const ref = spot ?? strikes[Math.floor(strikes.length / 2)];
  const strike = strikes.reduce((best, s) => (Math.abs(s - ref) < Math.abs(best - ref) ? s : best), strikes[0]);
  return {
    call: chain.contracts.find((c) => c.strike === strike && c.type === "call"),
    put: chain.contracts.find((c) => c.strike === strike && c.type === "put"),
    spot,
  };
}

function PayoffWidget({ theme, type, live }: { theme: OptionsTheme; type: OptionType; live: LiveContext }) {
  const [base] = useState(() => Math.round(live.spot ?? 580));
  const [strike, setStrike] = useState(type === "call" ? base + 2 : base - 2);
  const [premium, setPremium] = useState(1.5);
  const [spot, setSpot] = useState(base);
  const data = useMemo(() => {
    const out = [];
    for (let p = base - 15; p <= base + 15; p += 0.5) {
      out.push({ price: p, pnl: Math.round((intrinsicValue(type, p, strike) - premium) * 100) });
    }
    return out;
  }, [base, type, strike, premium]);
  const breakEven = type === "call" ? strike + premium : strike - premium;
  const pnlAtSpot = (intrinsicValue(type, spot, strike) - premium) * 100;
  return (
    <Panel theme={theme}>
      <div className="grid md:grid-cols-[220px_1fr] gap-4">
        <div className="space-y-3">
          <Slider theme={theme} label="Strike" value={strike} min={base - 12} max={base + 12} step={1} onChange={setStrike} display={`$${strike}`} />
          <Slider theme={theme} label="Premium paid" value={premium} min={0.05} max={8} step={0.05} onChange={setPremium} display={`$${premium.toFixed(2)}`} />
          <Slider theme={theme} label="SPY at expiration" value={spot} min={base - 15} max={base + 15} step={0.5} onChange={setSpot} display={`$${spot.toFixed(2)}`} />
          <div className="grid grid-cols-2 gap-2">
            <Stat theme={theme} label="Cost (1 contract)" value={fmtMoney(premium * 100)} />
            <Stat theme={theme} label="Break-even" value={`$${breakEven.toFixed(2)}`} />
            <Stat theme={theme} label="Max loss" value={fmtMoney(-premium * 100)} cls={theme.down} />
            <Stat theme={theme} label="P&L at that price" value={fmtMoney(pnlAtSpot, { sign: true })} cls={pnlAtSpot >= 0 ? theme.up : theme.down} />
          </div>
        </div>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
              <CartesianGrid stroke={theme.chartGrid} strokeDasharray="3 3" />
              <XAxis dataKey="price" type="number" domain={["dataMin", "dataMax"]} tick={{ fontSize: 10, fill: theme.chartAxis }} tickFormatter={(v) => `$${v}`} />
              <YAxis tick={{ fontSize: 10, fill: theme.chartAxis }} tickFormatter={(v) => `$${v}`} width={48} />
              <Tooltip contentStyle={chartTooltipStyle} labelFormatter={(v) => `SPY $${Number(v).toFixed(2)}`} formatter={(v: number) => [fmtMoney(v, { sign: true }), "P&L per contract"]} />
              <ReferenceLine y={0} stroke={theme.chartAxis} />
              <ReferenceLine x={breakEven} stroke={PALETTE.burgundyDeep} strokeDasharray="4 4" label={{ value: "Break-even", fontSize: 10, fill: PALETTE.burgundyDeep, position: "top" }} />
              <ReferenceLine x={spot} stroke={theme.chartRef} strokeDasharray="2 3" />
              <Line type="linear" dataKey="pnl" stroke={theme.chartLine} strokeWidth={2.25} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Panel>
  );
}

function LiveContractWidget({ theme, live }: { theme: OptionsTheme; live: LiveContext }) {
  const { call, put, spot } = atmPair(live.chain);
  if (!call && !put) {
    return (
      <Panel theme={theme}>
        <p className={`text-xs ${theme.muted}`}>
          The live SPY chain hasn't loaded yet. Once it does, this panel breaks down a real at-the-money contract field by field.
        </p>
      </Panel>
    );
  }
  const dte = live.chain ? daysToExpiration(live.chain.expiration) : 0;
  const explain = (c: OptionQuote) => {
    const mid = c.ask > 0 ? (c.bid + c.ask) / 2 : null;
    const spread = c.ask > 0 && c.bid > 0 ? c.ask - c.bid : null;
    const intrinsic = spot !== null ? intrinsicValue(c.type, spot, c.strike) : null;
    const lines: [string, string][] = [
      ["Bid × size", `${fmtPrice(c.bid)} × ${c.bidSize}: selling 1 contract at market brings in ${fmtMoney(c.bid * 100)}.`],
      ["Ask × size", `${fmtPrice(c.ask)} × ${c.askSize}: buying 1 contract at market costs ${fmtMoney(c.ask * 100)} plus commission.`],
      [
        "Spread / mid",
        spread !== null && mid
          ? `${fmtPrice(spread)} wide (${((spread / mid) * 100).toFixed(1)}% of the ${mid.toFixed(3)} mid). A round trip at market costs ${fmtMoney(spread * 100)} per contract.`
          : "No two-sided market right now.",
      ],
      ["Volume / OI", `${fmtCompact(c.volume)} contracts traded today; ${fmtCompact(c.openInterest)} still open.`],
      [
        "Intrinsic / extrinsic",
        intrinsic !== null && mid !== null
          ? `${fmtPrice(intrinsic)} intrinsic + ${fmtPrice(Math.max(mid - intrinsic, 0))} extrinsic (time value), using the chain's SPY price of ${fmtPrice(spot)}.`
          : "—",
      ],
      [
        "Break-even",
        `SPY ${fmtPrice(c.type === "call" ? c.strike + c.ask : c.strike - c.ask)} at expiration if bought at the ask.`,
      ],
      [
        "Delta / theta",
        c.delta !== null
          ? `Δ ${fmtGreek(c.delta)}: about ${fmtMoney(Math.abs(c.delta) * 100)} per contract per $1 SPY move. Θ ${fmtGreek(c.theta)}: about ${fmtMoney(Math.abs(c.theta ?? 0) * 100)} of decay per day.`
          : "—",
      ],
      ["Implied vol", c.iv !== null ? `${(c.iv * 100).toFixed(1)}%` : "—"],
    ];
    return lines;
  };
  return (
    <Panel theme={theme}>
      <div className={`text-[11px] mb-3 ${theme.faint}`}>
        Live from the current chain ({live.chain?.source === "cboe" ? "Cboe, delayed 15 min" : live.chain?.delayMinutes ? `delayed ${live.chain.delayMinutes} min` : "real-time"}) ·{" "}
        {dte === 0 ? "expires today" : `${dte} days to expiration`}
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {[call, put].filter(Boolean).map((c) => (
          <div key={c!.symbol}>
            <div className={`font-display text-sm font-bold mb-2 ${theme.accent}`}>{describeContract(c!)}</div>
            <dl className="space-y-1.5">
              {explain(c!).map(([k, v]) => (
                <div key={k} className="text-xs">
                  <dt className={`font-semibold ${theme.strong}`}>{k}</dt>
                  <dd className={theme.muted}>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function MoneynessWidget({ theme, live }: { theme: OptionsTheme; live: LiveContext }) {
  const [base] = useState(() => Math.round(live.spot ?? 580));
  const [spot, setSpot] = useState(live.spot ? Number(live.spot.toFixed(2)) : base);
  const strikes = [-6, -4, -2, 0, 2, 4, 6].map((d) => base + d);
  const atm = strikes.reduce((b, s) => (Math.abs(s - spot) < Math.abs(b - spot) ? s : b), strikes[0]);
  const label = (type: OptionType, k: number) => {
    if (k === atm) return "ATM";
    return intrinsicValue(type, spot, k) > 0 ? "ITM" : "OTM";
  };
  const badge = (l: string) =>
    l === "ITM" ? "bg-[#7A1F2E] text-white" : l === "ATM" ? "bg-[#F7ECEE] text-[#7A1F2E] border border-[#D9AEB6]" : theme.faint;
  return (
    <Panel theme={theme}>
      <Slider theme={theme} label="SPY price" value={spot} min={base - 8} max={base + 8} step={0.25} onChange={setSpot} display={`$${spot.toFixed(2)}`} />
      <table className="w-full text-xs mt-3">
        <thead className={`text-[10px] uppercase tracking-wide ${theme.faint}`}>
          <tr>
            <th className="text-left py-1">Call</th>
            <th className="text-right py-1">Call intrinsic</th>
            <th className="text-center py-1">Strike</th>
            <th className="text-left py-1 pl-3">Put intrinsic</th>
            <th className="text-right py-1">Put</th>
          </tr>
        </thead>
        <tbody>
          {strikes.map((k) => (
            <tr key={k} className={`border-t ${theme.border}`}>
              <td className="py-1">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${badge(label("call", k))}`}>{label("call", k)}</span>
              </td>
              <td className={`text-right tabular-nums ${theme.strong}`}>{fmtPrice(intrinsicValue("call", spot, k))}</td>
              <td className={`text-center font-bold tabular-nums ${theme.strong}`}>{k}</td>
              <td className={`pl-3 tabular-nums ${theme.strong}`}>{fmtPrice(intrinsicValue("put", spot, k))}</td>
              <td className="text-right py-1">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${badge(label("put", k))}`}>{label("put", k)}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  );
}

function GreeksLab({ theme, live }: { theme: OptionsTheme; live: LiveContext }) {
  const [base] = useState(() => Math.round(live.spot ?? 580));
  const [type, setType] = useState<OptionType>("call");
  const [spot, setSpot] = useState(base);
  const [strike, setStrike] = useState(base);
  const [days, setDays] = useState(7);
  const [vol, setVol] = useState(16);
  const years = Math.max(days, 0.05) / 365;
  const g = blackScholes({ type, spot, strike, years, vol: vol / 100, rate: RATE, dividendYield: DIV });
  const data = useMemo(() => {
    const out = [];
    for (let p = base - 20; p <= base + 20; p += 0.5) {
      out.push({
        price: p,
        now: Number(blackScholes({ type, spot: p, strike, years, vol: vol / 100, rate: RATE, dividendYield: DIV }).price.toFixed(3)),
        expiration: Number(intrinsicValue(type, p, strike).toFixed(3)),
      });
    }
    return out;
  }, [base, type, strike, years, vol]);
  return (
    <Panel theme={theme}>
      <div className="grid md:grid-cols-[240px_1fr] gap-4">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-1.5">
            {(["call", "put"] as const).map((t) => (
              <button type="button" key={t} onClick={() => setType(t)} className={`text-xs font-semibold py-1.5 rounded-md capitalize ${type === t ? theme.chipActive : theme.chip}`}>
                {t}
              </button>
            ))}
          </div>
          <Slider theme={theme} label="SPY price" value={spot} min={base - 20} max={base + 20} step={0.5} onChange={setSpot} display={`$${spot.toFixed(2)}`} />
          <Slider theme={theme} label="Strike" value={strike} min={base - 20} max={base + 20} step={1} onChange={setStrike} display={`$${strike}`} />
          <Slider theme={theme} label="Days to expiration" value={days} min={0} max={120} step={1} onChange={setDays} display={days === 0 ? "0 (hours left)" : `${days}`} />
          <Slider theme={theme} label="Implied volatility" value={vol} min={5} max={80} step={1} onChange={setVol} display={`${vol}%`} />
        </div>
        <div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
            <Stat theme={theme} label="Price" value={fmtPrice(g.price)} />
            <Stat theme={theme} label="Delta" value={fmtGreek(g.delta)} />
            <Stat theme={theme} label="Gamma" value={fmtGreek(g.gamma, 4)} />
            <Stat theme={theme} label="Theta/day" value={fmtGreek(g.theta)} />
            <Stat theme={theme} label="Vega" value={fmtGreek(g.vega)} />
            <Stat theme={theme} label="Rho" value={fmtGreek(g.rho)} />
          </div>
          <p className={`text-[11px] mb-2 ${theme.faint}`}>
            One contract: {fmtMoney(g.price * 100)} · gains ≈ {fmtMoney(Math.abs(g.delta) * 100)} per $1 move · decays ≈{" "}
            {fmtMoney(Math.abs(g.theta) * 100)}/day. Model inputs: rate {RATE * 100}%, dividend yield {DIV * 100}%.
          </p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
                <CartesianGrid stroke={theme.chartGrid} strokeDasharray="3 3" />
                <XAxis dataKey="price" type="number" domain={["dataMin", "dataMax"]} tick={{ fontSize: 10, fill: theme.chartAxis }} />
                <YAxis tick={{ fontSize: 10, fill: theme.chartAxis }} width={40} />
                <Tooltip contentStyle={chartTooltipStyle} labelFormatter={(v) => `SPY $${Number(v).toFixed(2)}`} formatter={(v: number, name: string) => [fmtPrice(v), name === "now" ? "Value today" : "Value at expiration"]} />
                <Legend wrapperStyle={{ fontSize: 11 }} formatter={(v) => (v === "now" ? "Value today (model)" : "Value at expiration")} />
                <ReferenceLine x={spot} stroke={theme.chartRef} strokeDasharray="2 3" />
                <Line type="monotone" dataKey="now" stroke={theme.chartLine} strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line type="linear" dataKey="expiration" stroke={theme.chartRef} strokeDasharray="4 3" dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Panel>
  );
}

function ThetaDecayWidget({ theme, live }: { theme: OptionsTheme; live: LiveContext }) {
  const spot = Math.round(live.spot ?? 580);
  const [vol, setVol] = useState(16);
  const data = useMemo(() => {
    const out = [];
    for (let d = 60; d >= 0; d -= 1) {
      const years = Math.max(d, 0.02) / 365;
      const atm = blackScholes({ type: "call", spot, strike: spot, years, vol: vol / 100, rate: RATE, dividendYield: DIV }).price;
      const otm = blackScholes({ type: "call", spot, strike: spot + 10, years, vol: vol / 100, rate: RATE, dividendYield: DIV }).price;
      out.push({ days: d, atm: Number(atm.toFixed(3)), otm: Number(otm.toFixed(3)) });
    }
    return out;
  }, [spot, vol]);
  return (
    <Panel theme={theme}>
      <Slider theme={theme} label="Implied volatility" value={vol} min={8} max={60} step={1} onChange={setVol} display={`${vol}%`} />
      <div className="h-56 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 8, bottom: 16, left: 0 }}>
            <CartesianGrid stroke={theme.chartGrid} strokeDasharray="3 3" />
            <XAxis dataKey="days" reversed tick={{ fontSize: 10, fill: theme.chartAxis }} label={{ value: "Days to expiration", position: "insideBottom", offset: -8, fontSize: 10, fill: theme.chartAxis }} />
            <YAxis tick={{ fontSize: 10, fill: theme.chartAxis }} width={40} />
            <Tooltip contentStyle={chartTooltipStyle} labelFormatter={(v) => `${v} days left`} formatter={(v: number, name: string) => [fmtPrice(v), name === "atm" ? `ATM ${spot} call` : `OTM ${spot + 10} call`]} />
            <Legend wrapperStyle={{ fontSize: 11 }} verticalAlign="top" formatter={(v) => (v === "atm" ? `ATM ${spot} call` : `OTM ${spot + 10} call`)} />
            <Line type="monotone" dataKey="atm" stroke={theme.chartLine} strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="otm" stroke={theme.chartRef} strokeWidth={2} strokeDasharray="5 3" dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className={`text-[11px] ${theme.faint}`}>
        Value of a call with SPY held at ${spot}. The curve steepens near zero days, and that steepening is theta accelerating.
      </p>
    </Panel>
  );
}

function ExpectedMoveWidget({ theme, live }: { theme: OptionsTheme; live: LiveContext }) {
  const { call, put, spot } = atmPair(live.chain);
  const liveIv = [call?.iv, put?.iv].filter((v): v is number => typeof v === "number");
  const atmIv = liveIv.length ? liveIv.reduce((a, b) => a + b, 0) / liveIv.length : null;
  const liveDays = live.chain ? Math.max(daysToExpiration(live.chain.expiration), 0) : 7;
  const [days, setDays] = useState(Math.max(liveDays, 1));
  const [manualIv, setManualIv] = useState(16);
  const iv = atmIv ?? manualIv / 100;
  const price = spot ?? live.spot ?? 580;
  const move = expectedMove(price, iv, days);
  return (
    <Panel theme={theme}>
      <div className={`text-[11px] mb-2 ${theme.faint}`}>
        {atmIv !== null
          ? `Using live ATM implied volatility of ${(atmIv * 100).toFixed(1)}% from the ${live.chain?.expiration} chain and SPY at ${fmtPrice(price)}.`
          : "Live IV isn't available yet, so set it manually."}
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <Slider theme={theme} label="Days ahead" value={days} min={1} max={60} step={1} onChange={setDays} display={`${days}`} />
        {atmIv === null && (
          <Slider theme={theme} label="Implied volatility" value={manualIv} min={5} max={60} step={1} onChange={setManualIv} display={`${manualIv}%`} />
        )}
      </div>
      <div className="grid grid-cols-3 gap-2 mt-3">
        <Stat theme={theme} label="Expected move (1σ)" value={`±${fmtMoney(move)}`} />
        <Stat theme={theme} label="Low end" value={fmtMoney(price - move)} />
        <Stat theme={theme} label="High end" value={fmtMoney(price + move)} />
      </div>
      <p className={`text-[11px] mt-2 ${theme.faint}`}>
        {fmtPrice(price)} × {(iv * 100).toFixed(1)}% × √({days} ÷ 365) = {fmtPrice(move)}
      </p>
    </Panel>
  );
}

function OrderFillWidget({ theme, live }: { theme: OptionsTheme; live: LiveContext }) {
  const { call } = atmPair(live.chain);
  const [bid, setBid] = useState(call && call.bid > 0 ? call.bid : 1.42);
  const [ask, setAsk] = useState(call && call.ask > 0 ? call.ask : 1.45);
  const [message, setMessage] = useState<string | null>(null);
  const mid = (bid + ask) / 2;
  const safeAsk = Math.max(ask, bid);
  return (
    <Panel theme={theme}>
      <div className="grid sm:grid-cols-2 gap-3">
        <Slider theme={theme} label="Bid" value={bid} min={0.01} max={5} step={0.01} onChange={(v) => { setBid(v); setMessage(null); }} display={`$${bid.toFixed(2)}`} />
        <Slider theme={theme} label="Ask" value={safeAsk} min={0.01} max={5} step={0.01} onChange={(v) => { setAsk(v); setMessage(null); }} display={`$${safeAsk.toFixed(2)}`} />
      </div>
      <div className="flex flex-wrap gap-2 mt-3">
        <button type="button" className={`text-xs font-semibold px-3 py-1.5 rounded-md ${theme.chip}`} onClick={() => setMessage(`Market BUY fills at the ask: ${fmtMoney(safeAsk)} per share = ${fmtMoney(safeAsk * 100)} per contract.`)}>
          Market buy
        </button>
        <button type="button" className={`text-xs font-semibold px-3 py-1.5 rounded-md ${theme.chip}`} onClick={() => setMessage(`Market SELL fills at the bid: ${fmtMoney(bid)} per share = ${fmtMoney(bid * 100)} per contract.`)}>
          Market sell
        </button>
        <button type="button" className={`text-xs font-semibold px-3 py-1.5 rounded-md ${theme.chip}`} onClick={() => setMessage(`Limit BUY at the mid (${mid.toFixed(2)}) waits in the book. It fills only if a seller lowers the ask to ${mid.toFixed(2)}, which saves ${fmtMoney((safeAsk - mid) * 100)} per contract if it fills.`)}>
          Limit buy at mid
        </button>
      </div>
      <div className={`mt-3 text-xs rounded-md px-3 py-2 bg-white border ${theme.border} ${theme.muted}`}>
        {message ??
          `Spread ${fmtPrice(safeAsk - bid)}: buying at the ask and immediately selling at the bid loses ${fmtMoney((safeAsk - bid) * 100)} per contract, plus about $1.30 in round-trip commissions.`}
      </div>
    </Panel>
  );
}

function TierCalculator({ theme }: { theme: OptionsTheme }) {
  const [premium, setPremium] = useState(0.5);
  const tiers: Tier[] = ["hard", "medium", "easy"];
  return (
    <Panel theme={theme}>
      <Slider theme={theme} label="Option premium you're considering" value={premium} min={0.05} max={3} step={0.05} onChange={setPremium} display={`$${premium.toFixed(2)} (${fmtMoney(premium * 100)}/contract)`} />
      <table className="w-full text-xs mt-3">
        <thead className={`text-[10px] uppercase tracking-wide ${theme.faint}`}>
          <tr>
            <th className="text-left py-1">Tier</th>
            <th className="text-right py-1">Ends at</th>
            <th className="text-right py-1">Loss buffer</th>
            <th className="text-right py-1">Contracts whose total loss fits</th>
          </tr>
        </thead>
        <tbody>
          {tiers.map((t) => {
            const floor = equityFloor({ tier: t, startingBalance: STARTING_BALANCE });
            const buffer = STARTING_BALANCE - floor;
            const perContract = premium * 100 + 1.3;
            return (
              <tr key={t} className={`border-t ${theme.border}`}>
                <td className={`py-1.5 font-semibold ${theme.strong}`}>{TIERS[t].label} (−{Math.round(TIERS[t].maxLossPct * 100)}%)</td>
                <td className={`text-right tabular-nums ${theme.strong}`}>{fmtMoney(floor)}</td>
                <td className={`text-right tabular-nums ${theme.strong}`}>{fmtMoney(buffer)}</td>
                <td className={`text-right tabular-nums ${theme.strong}`}>{Math.floor(buffer / perContract)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className={`text-[11px] mt-2 ${theme.faint}`}>
        Counts assume the option goes to $0 and include ~$1.30 round-trip commission per contract. Sizing at a fraction of that
        number leaves room for more than one losing trade.
      </p>
    </Panel>
  );
}

export function LessonWidgetView({ widget, theme, live }: { widget: LessonWidget; theme: OptionsTheme; live: LiveContext }) {
  // Remount once live data arrives so slider ranges centre on the real SPY price.
  return <Fragment key={`${live.spot !== null}-${live.chain !== null}`}>{renderWidget(widget, theme, live)}</Fragment>;
}

function renderWidget(widget: LessonWidget, theme: OptionsTheme, live: LiveContext) {
  switch (widget) {
    case "payoff-call":
      return <PayoffWidget theme={theme} type="call" live={live} />;
    case "payoff-put":
      return <PayoffWidget theme={theme} type="put" live={live} />;
    case "live-contract":
      return <LiveContractWidget theme={theme} live={live} />;
    case "moneyness":
      return <MoneynessWidget theme={theme} live={live} />;
    case "greeks-lab":
      return <GreeksLab theme={theme} live={live} />;
    case "theta-decay":
      return <ThetaDecayWidget theme={theme} live={live} />;
    case "expected-move":
      return <ExpectedMoveWidget theme={theme} live={live} />;
    case "order-fill":
      return <OrderFillWidget theme={theme} live={live} />;
    case "tier-calculator":
      return <TierCalculator theme={theme} />;
  }
}
