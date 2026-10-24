// Burgundy-and-white theme for the standalone SPY Options Trainer. Every color
// the app uses is defined here so components stay on palette.

export const PALETTE = {
  burgundy: "#7A1F2E",
  burgundyDark: "#5A1420",
  burgundyDeep: "#3D0D16",
  tint: "#F7ECEE",
  wash: "#FBF6F7",
  line: "#E6D3D7",
  ink: "#2A1B1E",
  muted: "#5E4A4E",
  faint: "#86737A",
  /** Used only for positive P&L numbers, so gains and losses stay distinguishable. */
  gain: "#1E6B45",
} as const;

export const theme = {
  card: "bg-white rounded-xl border border-[#E6D3D7] shadow-[0_1px_3px_rgba(61,13,22,0.08)]",
  strong: "text-[#2A1B1E]",
  muted: "text-[#5E4A4E]",
  faint: "text-[#86737A]",
  accent: "text-[#7A1F2E]",
  subtleBg: "bg-[#FBF6F7]",
  hoverBg: "hover:bg-[#F7ECEE]",
  inputBg:
    "bg-white border border-[#D9C2C7] text-[#2A1B1E] focus:outline-none focus:ring-2 focus:ring-[#7A1F2E]/30 focus:border-[#7A1F2E]",
  border: "border-[#E6D3D7]",
  up: "text-[#1E6B45]",
  down: "text-[#7A1F2E]",
  itmBg: "bg-[#F7ECEE]",
  chip: "border border-[#D9C2C7] bg-white text-[#5A1420] hover:bg-[#F7ECEE]",
  chipActive: "border border-[#7A1F2E] bg-[#7A1F2E] text-white",
  primaryBtn: "bg-[#7A1F2E] hover:bg-[#5A1420] text-white",
  sellBtn: "bg-[#3D0D16] hover:bg-[#5A1420] text-white",
  badge:
    "bg-[#F7ECEE] text-[#7A1F2E] border border-[#E6D3D7] px-2.5 py-1 rounded-full text-[10.5px] font-bold uppercase tracking-wide",
  progressTrack: "bg-[#F1E4E7]",
  progressFill: "bg-[#7A1F2E]",
  infoBox: "bg-[#FBF6F7] border border-[#E6D3D7] text-[#4A3A3D]",
  warnBox: "bg-[#F7ECEE] border border-[#D9AEB6] text-[#5A1420]",
  dangerBox: "bg-[#7A1F2E] border border-[#5A1420] text-white",
  okBox: "bg-white border border-[#7A1F2E] text-[#7A1F2E]",
  tooltip: "bg-[#3D0D16] text-white",
  chartGrid: "#EFE3E6",
  chartAxis: "#86737A",
  chartLine: PALETTE.burgundy,
  chartRef: "#B98A93",
};

export type OptionsTheme = typeof theme;

export const chartTooltipStyle = {
  fontSize: 12,
  background: "#fff",
  border: `1px solid ${PALETTE.line}`,
  borderRadius: 8,
  color: PALETTE.ink,
};

export function fmtMoney(n: number | null | undefined, opts: { sign?: boolean } = {}): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return "—";
  const abs = Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (n < 0) return `-$${abs}`;
  return `${opts.sign && n > 0 ? "+" : ""}$${abs}`;
}

export function fmtPrice(n: number | null | undefined): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return "—";
  return n.toFixed(2);
}

export function fmtInt(n: number | null | undefined): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return "—";
  return Math.round(n).toLocaleString("en-US");
}

export function fmtCompact(n: number | null | undefined): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return "—";
  return Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

export function fmtPct(n: number | null | undefined, digits = 2, sign = true): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return "—";
  return `${sign && n > 0 ? "+" : ""}${n.toFixed(digits)}%`;
}

export function fmtGreek(n: number | null | undefined, digits = 3): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return "—";
  return n.toFixed(digits);
}

export function signClass(theme: OptionsTheme, n: number | null | undefined): string {
  if (!n) return theme.muted;
  return n > 0 ? theme.up : theme.down;
}

export function providerLabel(source: string): string {
  if (source === "tradier") return "Tradier";
  if (source === "cboe") return "Cboe";
  if (source === "yahoo") return "Yahoo Finance";
  return source;
}

export function delayLabel(delayMinutes: number): string {
  return delayMinutes > 0 ? `Delayed ${delayMinutes} min` : "Real-time";
}
