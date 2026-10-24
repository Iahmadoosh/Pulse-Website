// US equity-options session calendar (America/New_York).
// Regular SPY options session: 9:30 AM - 4:00 PM ET, 1:00 PM ET on early-close days.

const ET_ZONE = "America/New_York";

// NYSE full-day closures.
const HOLIDAYS = new Set<string>([
  // 2025
  "2025-01-01", "2025-01-09", "2025-01-20", "2025-02-17", "2025-04-18", "2025-05-26",
  "2025-06-19", "2025-07-04", "2025-09-01", "2025-11-27", "2025-12-25",
  // 2026
  "2026-01-01", "2026-01-19", "2026-02-16", "2026-04-03", "2026-05-25", "2026-06-19",
  "2026-07-03", "2026-09-07", "2026-11-26", "2026-12-25",
  // 2027
  "2027-01-01", "2027-01-18", "2027-02-15", "2027-03-26", "2027-05-31", "2027-06-18",
  "2027-07-05", "2027-09-06", "2027-11-25", "2027-12-24",
  // 2028
  "2028-01-17", "2028-02-21", "2028-04-14", "2028-05-29", "2028-06-19", "2028-07-04",
  "2028-09-04", "2028-11-23", "2028-12-25",
]);

// NYSE 1:00 PM early closes.
const EARLY_CLOSES = new Set<string>([
  "2025-07-03", "2025-11-28", "2025-12-24",
  "2026-11-27", "2026-12-24",
  "2027-11-26",
  "2028-11-24",
]);

const OPEN_MINUTES = 9 * 60 + 30;
const REGULAR_CLOSE_MINUTES = 16 * 60;
const EARLY_CLOSE_MINUTES = 13 * 60;

const WEEKDAYS: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

const partsFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: ET_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  weekday: "short",
  hourCycle: "h23",
});

export interface EtParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  weekday: number;
}

export function etParts(date: Date): EtParts {
  const out: Record<string, string> = {};
  for (const part of partsFormatter.formatToParts(date)) out[part.type] = part.value;
  return {
    year: Number(out.year),
    month: Number(out.month),
    day: Number(out.day),
    hour: Number(out.hour) % 24,
    minute: Number(out.minute),
    second: Number(out.second),
    weekday: WEEKDAYS[out.weekday] ?? 0,
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Calendar date in New York, YYYY-MM-DD. */
export function etDateString(date: Date): string {
  const p = etParts(date);
  return `${p.year}-${pad(p.month)}-${pad(p.day)}`;
}

/** Converts a New York wall-clock time on a given date into an absolute Date. */
export function etWallTimeToDate(dateStr: string, hour: number, minute: number): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  const target = Date.UTC(y, m - 1, d, hour, minute);
  // ET is UTC-4 or UTC-5; start from UTC-5 and correct by the observed difference.
  let guess = target + 5 * 3600_000;
  for (let i = 0; i < 2; i++) {
    const p = etParts(new Date(guess));
    const observed = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute);
    guess += target - observed;
  }
  return new Date(guess);
}

export function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`;
}

export function calendarDaysBetween(from: string, to: string): number {
  const [y1, m1, d1] = from.split("-").map(Number);
  const [y2, m2, d2] = to.split("-").map(Number);
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86_400_000);
}

function weekdayOf(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function isTradingDay(dateStr: string): boolean {
  const wd = weekdayOf(dateStr);
  return wd !== 0 && wd !== 6 && !HOLIDAYS.has(dateStr);
}

export function isEarlyClose(dateStr: string): boolean {
  return EARLY_CLOSES.has(dateStr);
}

/** Minutes after midnight ET at which the options session closes on that date. */
export function sessionCloseMinutes(dateStr: string): number {
  return isEarlyClose(dateStr) ? EARLY_CLOSE_MINUTES : REGULAR_CLOSE_MINUTES;
}

export function nextTradingDay(dateStr: string): string {
  let d = addDays(dateStr, 1);
  while (!isTradingDay(d)) d = addDays(d, 1);
  return d;
}

export function previousTradingDay(dateStr: string): string {
  let d = addDays(dateStr, -1);
  while (!isTradingDay(d)) d = addDays(d, -1);
  return d;
}

/** The most recent session date whose regular session has started (today once 9:30 ET has passed). */
export function latestSessionDate(now: Date = new Date()): string {
  const p = etParts(now);
  const today = `${p.year}-${pad(p.month)}-${pad(p.day)}`;
  if (isTradingDay(today) && p.hour * 60 + p.minute >= OPEN_MINUTES) return today;
  return previousTradingDay(today);
}

/** The moment an option expiring on this date stops trading (session close ET). */
export function expirationCutoff(expiration: string): Date {
  const close = sessionCloseMinutes(expiration);
  return etWallTimeToDate(expiration, Math.floor(close / 60), close % 60);
}

/** Calendar days to expiration, using New York dates (0 on expiration day). */
export function daysToExpiration(expiration: string, now: Date = new Date()): number {
  return calendarDaysBetween(etDateString(now), expiration);
}

/** Time to expiration in years (calendar-time convention), floored at ~1 minute. */
export function yearsToExpiration(expiration: string, now: Date = new Date()): number {
  const ms = expirationCutoff(expiration).getTime() - now.getTime();
  return Math.max(ms, 60_000) / (365 * 86_400_000);
}

export type SessionState = "open" | "pre" | "after" | "closed";

export interface MarketStatus {
  state: SessionState;
  isOpen: boolean;
  /** Today's date in New York. */
  sessionDate: string;
  label: string;
  /** When the current session closes (only while open). */
  closesAt: Date | null;
  /** Next regular-session open. */
  nextOpen: Date;
}

export function getMarketStatus(now: Date = new Date()): MarketStatus {
  const p = etParts(now);
  const today = `${p.year}-${pad(p.month)}-${pad(p.day)}`;
  const minutes = p.hour * 60 + p.minute;
  const tradingDay = isTradingDay(today);
  const closeMinutes = sessionCloseMinutes(today);

  if (tradingDay && minutes >= OPEN_MINUTES && minutes < closeMinutes) {
    return {
      state: "open",
      isOpen: true,
      sessionDate: today,
      label: isEarlyClose(today) ? "Market open (early close 1:00 PM ET)" : "Market open",
      closesAt: etWallTimeToDate(today, Math.floor(closeMinutes / 60), closeMinutes % 60),
      nextOpen: etWallTimeToDate(nextTradingDay(today), 9, 30),
    };
  }

  const openDay = tradingDay && minutes < OPEN_MINUTES ? today : nextTradingDay(today);
  const nextOpen = etWallTimeToDate(openDay, 9, 30);
  let state: SessionState = "closed";
  let label = HOLIDAYS.has(today) ? "Market closed (holiday)" : "Market closed";
  if (tradingDay && minutes >= 4 * 60 && minutes < OPEN_MINUTES) {
    state = "pre";
    label = "Pre-market (options not trading)";
  } else if (tradingDay && minutes >= closeMinutes && minutes < 20 * 60) {
    state = "after";
    label = "After hours (options closed)";
  }
  return { state, isOpen: false, sessionDate: today, label, closesAt: null, nextOpen };
}

export function formatEtTime(date: Date, withDate = false): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: ET_ZONE,
    hour: "numeric",
    minute: "2-digit",
    second: withDate ? undefined : "2-digit",
    month: withDate ? "short" : undefined,
    day: withDate ? "numeric" : undefined,
    weekday: withDate ? "short" : undefined,
  }).format(date) + " ET";
}
