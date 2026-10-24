import type { OptionType } from "./types";

// OCC option symbology: ROOT + YYMMDD + C/P + strike * 1000 padded to 8 digits.
// e.g. SPY261030C00580000 = SPY Oct 30 2026 580 Call
const OCC_RE = /^([A-Z]{1,6})(\d{2})(\d{2})(\d{2})([CP])(\d{8})$/;

export interface ParsedOccSymbol {
  root: string;
  expiration: string;
  type: OptionType;
  strike: number;
}

export function parseOccSymbol(symbol: string): ParsedOccSymbol | null {
  const match = OCC_RE.exec(symbol.trim().toUpperCase());
  if (!match) return null;
  const [, root, yy, mm, dd, cp, strike] = match;
  return {
    root,
    expiration: `20${yy}-${mm}-${dd}`,
    type: cp === "C" ? "call" : "put",
    strike: Number(strike) / 1000,
  };
}

export function buildOccSymbol(
  root: string,
  expiration: string,
  type: OptionType,
  strike: number,
): string {
  const [yyyy, mm, dd] = expiration.split("-");
  const strikeDigits = String(Math.round(strike * 1000)).padStart(8, "0");
  return `${root.toUpperCase()}${yyyy.slice(2)}${mm}${dd}${type === "call" ? "C" : "P"}${strikeDigits}`;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "Oct 30 '26" */
export function formatExpiration(expiration: string): string {
  const [yyyy, mm, dd] = expiration.split("-");
  return `${MONTHS[Number(mm) - 1]} ${Number(dd)} '${yyyy.slice(2)}`;
}

/** "SPY Oct 30 '26 580 Call" */
export function describeContract(contract: {
  expiration: string;
  strike: number;
  type: OptionType;
}): string {
  const strike = Number.isInteger(contract.strike)
    ? String(contract.strike)
    : contract.strike.toFixed(1);
  return `SPY ${formatExpiration(contract.expiration)} ${strike} ${contract.type === "call" ? "Call" : "Put"}`;
}
