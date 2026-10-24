import { useEffect, useState, type ReactNode } from "react";
import { Radio, Clock3, AlertTriangle } from "lucide-react";
import { GLOSSARY_BY_ID } from "../../lib/options/academy";
import { delayLabel, providerLabel, type OptionsTheme } from "./ui";

/** A term with its glossary definition on hover/focus. */
export function TermTip({
  id,
  children,
  theme,
  align = "center",
}: {
  id: string;
  children: ReactNode;
  theme: OptionsTheme;
  align?: "center" | "left" | "right";
}) {
  const term = GLOSSARY_BY_ID[id];
  if (!term) return <>{children}</>;
  const position =
    align === "left" ? "left-0" : align === "right" ? "right-0" : "left-1/2 -translate-x-1/2";
  return (
    <span className="relative inline-flex group/tip">
      <span
        tabIndex={0}
        className="cursor-help underline decoration-dotted underline-offset-2 outline-none"
        aria-describedby={`tip-${id}`}
      >
        {children}
      </span>
      <span
        id={`tip-${id}`}
        role="tooltip"
        className={`pointer-events-none absolute top-full z-40 mt-1.5 hidden w-64 max-w-[calc(100vw-2rem)] rounded-md p-2.5 text-left text-[11px] font-normal normal-case tracking-normal leading-snug shadow-lg group-hover/tip:block group-focus-within/tip:block ${position} ${theme.tooltip}`}
      >
        <span className="block font-semibold mb-0.5">{term.term}</span>
        {term.definition}
      </span>
    </span>
  );
}

/** Re-renders every `ms` so relative ages stay current. */
export function useNow(ms = 1000): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}

export function ageLabel(updatedAt: number | null, now: Date): string {
  if (!updatedAt) return "waiting for data";
  const s = Math.max(0, Math.round((now.getTime() - updatedAt) / 1000));
  if (s < 60) return `updated ${s}s ago`;
  return `updated ${Math.floor(s / 60)}m ${s % 60}s ago`;
}

/** Shows which feed produced a dataset and whether it is real-time or delayed. */
export function DataBadge({
  theme,
  label,
  source,
  delayMinutes,
  updatedAt,
  error,
}: {
  theme: OptionsTheme;
  label: string;
  source?: string;
  delayMinutes?: number;
  updatedAt: number | null;
  error?: string | null;
}) {
  const now = useNow(1000);
  const realtime = delayMinutes === 0;
  const stale = updatedAt !== null && now.getTime() - updatedAt > 60_000;
  const tone =
    error || stale
      ? "border-[#7A1F2E] bg-[#7A1F2E] text-white"
      : realtime
        ? "border-[#7A1F2E]/50 bg-white text-[#7A1F2E]"
        : "border-[#D9AEB6] bg-[#F7ECEE] text-[#5A1420]";
  return (
    <span
      className={`inline-flex flex-wrap items-center gap-x-1.5 gap-y-0.5 rounded-full border px-2.5 py-1 text-[10.5px] font-semibold ${tone}`}
      title={error ?? undefined}
    >
      {error ? (
        <AlertTriangle className="w-3 h-3" />
      ) : realtime ? (
        <Radio className="w-3 h-3" />
      ) : (
        <Clock3 className="w-3 h-3" />
      )}
      <span>{label}:</span>
      {source ? (
        <span>
          {providerLabel(source)} · {delayLabel(delayMinutes ?? 0)}
        </span>
      ) : (
        <span>{error ? "unavailable" : "connecting…"}</span>
      )}
      <span className="font-normal opacity-80">· {error && !updatedAt ? "error" : ageLabel(updatedAt, now)}</span>
    </span>
  );
}

export function SectionTitle({
  theme,
  children,
  right,
}: {
  theme: OptionsTheme;
  children: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className={`flex flex-wrap items-center justify-between gap-2 border-b pb-2 mb-3 ${theme.border}`}>
      <h3 className={`font-display text-[12px] font-bold uppercase tracking-wider ${theme.accent}`}>{children}</h3>
      {right}
    </div>
  );
}

export function Callout({
  theme,
  tone,
  children,
}: {
  theme: OptionsTheme;
  tone: "tip" | "warning" | "danger" | "ok";
  children: ReactNode;
}) {
  const cls =
    tone === "tip" ? theme.infoBox : tone === "warning" ? theme.warnBox : tone === "danger" ? theme.dangerBox : theme.okBox;
  return <div className={`rounded-lg px-3 py-2 text-xs leading-relaxed ${cls}`}>{children}</div>;
}
