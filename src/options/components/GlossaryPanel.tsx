import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { GLOSSARY, type GlossaryTerm } from "../../lib/options/academy";
import type { OptionsTheme } from "./ui";

const CATEGORIES: GlossaryTerm["category"][] = [
  "Basics",
  "Quotes & Chain",
  "Greeks",
  "Volatility",
  "Orders",
  "Expiration",
  "Risk & Account",
];

export function GlossaryPanel({ theme }: { theme: OptionsTheme }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<GlossaryTerm["category"] | "All">("All");

  const terms = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GLOSSARY.filter(
      (t) =>
        (category === "All" || t.category === category) &&
        (!q || t.term.toLowerCase().includes(q) || t.definition.toLowerCase().includes(q)),
    ).sort((a, b) => a.term.localeCompare(b.term));
  }, [query, category]);

  return (
    <div className={`${theme.card} p-4 sm:p-5`}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <label className={`flex items-center gap-2 flex-1 px-3 py-2 rounded-lg ${theme.inputBg}`}>
          <Search className={`w-4 h-4 ${theme.faint}`} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search terms: bid, theta, open interest…"
            className="flex-1 bg-transparent outline-none text-sm"
            aria-label="Search glossary"
          />
        </label>
        <span className={`text-xs ${theme.faint}`}>{terms.length} terms</span>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {(["All", ...CATEGORIES] as const).map((c) => (
          <button
            type="button"
            key={c}
            onClick={() => setCategory(c)}
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-md ${category === c ? theme.chipActive : theme.chip}`}
          >
            {c}
          </button>
        ))}
      </div>
      <dl className="grid md:grid-cols-2 gap-3">
        {terms.map((t) => (
          <div key={t.id} className={`rounded-lg border p-3 ${theme.border}`}>
            <dt className="flex items-center justify-between gap-2">
              <span className={`font-display text-sm font-bold ${theme.accent}`}>{t.term}</span>
              <span className={`text-[10px] uppercase tracking-wide font-semibold ${theme.faint}`}>{t.category}</span>
            </dt>
            <dd className={`text-xs mt-1 leading-relaxed ${theme.muted}`}>{t.definition}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
