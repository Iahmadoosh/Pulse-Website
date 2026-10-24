import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  ChainResponse,
  ContractsResponse,
  DailyResponse,
  ExpirationsResponse,
  IntradayResponse,
  OptionQuote,
  ProviderStatus,
  UnderlyingQuote,
} from "../../lib/options/types";

export interface Polled<T> {
  data: T | null;
  error: string | null;
  /** Client time (ms) of the last successful response. */
  updatedAt: number | null;
  loading: boolean;
  refresh: () => Promise<T | null>;
}

export async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal, headers: { Accept: "application/json" } });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(body?.error || `Request failed (${res.status})`);
  return body as T;
}

/**
 * Polls `url` every `intervalMs` while the tab is visible. Changing `url`
 * clears the previous data; a null url pauses polling.
 */
export function usePolling<T>(url: string | null, intervalMs: number): Polled<T> {
  const [state, setState] = useState<{ data: T | null; error: string | null; updatedAt: number | null; loading: boolean }>(
    { data: null, error: null, updatedAt: null, loading: Boolean(url) },
  );
  const urlRef = useRef(url);
  urlRef.current = url;

  const load = useCallback(async (): Promise<T | null> => {
    const target = urlRef.current;
    if (!target) return null;
    try {
      const data = await fetchJson<T>(target);
      if (urlRef.current === target) {
        setState({ data, error: null, updatedAt: Date.now(), loading: false });
      }
      return data;
    } catch (error) {
      if (urlRef.current === target) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : String(error),
          loading: false,
        }));
      }
      return null;
    }
  }, []);

  useEffect(() => {
    setState({ data: null, error: null, updatedAt: null, loading: Boolean(url) });
    if (!url) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const tick = async () => {
      if (cancelled) return;
      if (typeof document === "undefined" || document.visibilityState !== "hidden") await load();
      if (!cancelled) timer = setTimeout(tick, intervalMs);
    };
    tick();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [url, intervalMs, load]);

  return { ...state, refresh: load };
}

export interface SpyMarketData {
  status: Polled<ProviderStatus>;
  quote: Polled<UnderlyingQuote>;
  intraday: Polled<IntradayResponse>;
  daily: Polled<DailyResponse>;
  expirations: Polled<ExpirationsResponse>;
  chain: Polled<ChainResponse>;
  watched: Polled<ContractsResponse>;
  /** Latest quote per OCC symbol from the chain and watched contracts. */
  quoteMap: Record<string, OptionQuote>;
}

/** All SPY data used by the trainer, polled from this app's /api/spy routes. */
export function useSpyMarketData(expiration: string | null, watchSymbols: string[]): SpyMarketData {
  const status = usePolling<ProviderStatus>("/api/spy/status", 300_000);
  const quote = usePolling<UnderlyingQuote>("/api/spy/quote", 5_000);
  const intraday = usePolling<IntradayResponse>("/api/spy/intraday", 60_000);
  const daily = usePolling<DailyResponse>("/api/spy/daily", 300_000);
  const expirations = usePolling<ExpirationsResponse>("/api/spy/expirations", 300_000);
  const chain = usePolling<ChainResponse>(
    expiration ? `/api/spy/chain?expiration=${expiration}` : null,
    10_000,
  );
  const watchKey = [...new Set(watchSymbols)].sort().join(",");
  const watched = usePolling<ContractsResponse>(
    watchKey ? `/api/spy/contracts?symbols=${encodeURIComponent(watchKey)}` : null,
    10_000,
  );

  const quoteMap = useMemo(() => {
    const map: Record<string, OptionQuote> = {};
    for (const c of chain.data?.contracts ?? []) map[c.symbol] = c;
    for (const c of watched.data?.contracts ?? []) map[c.symbol] = c;
    return map;
  }, [chain.data, watched.data]);

  return { status, quote, intraday, daily, expirations, chain, watched, quoteMap };
}
