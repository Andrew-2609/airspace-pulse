import { useCallback, useRef, useState } from "react";
import type { CityResult } from "@/types/event";

const ALLOWED_ADDRESSTYPES = new Set(["city", "municipality", "town"]);

export interface UseCitySearchResult {
  results: CityResult[];
  loading: boolean;
  error: string | null;
  search: (query: string) => Promise<void>;
  reset: () => void;
}

export function useCitySearch(): UseCitySearchResult {
  const [results, setResults] = useState<CityResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const search = useCallback(async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setError(null);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        city: trimmed,
        country: "Brazil",
        format: "jsonv2",
      });
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?${params.toString()}`,
        { signal: controller.signal, headers: { Accept: "application/json" } },
      );
      if (!res.ok) throw new Error(`Search failed (${res.status})`);
      const data = (await res.json()) as CityResult[];
      const filtered = data.filter((c) => ALLOWED_ADDRESSTYPES.has(c.addresstype));
      setResults(filtered);
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setError((err as Error).message || "Search failed");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setResults([]);
    setError(null);
    setLoading(false);
  }, []);

  return { results, loading, error, search, reset };
}
