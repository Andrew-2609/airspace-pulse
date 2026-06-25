import { motion } from "framer-motion";
import { Radar, Plane } from "lucide-react";
import { SearchBar } from "./SearchBar";
import { CityCard } from "./CityCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Search as SearchIcon, MapPin } from "lucide-react";
import type { CityResult } from "@/types/event";

interface SearchViewProps {
  results: CityResult[];
  loading: boolean;
  error: string | null;
  onSearch: (q: string) => void;
  onSelect: (city: CityResult) => void;
}

export function SearchView({ results, loading, error, onSearch, onSelect }: SearchViewProps) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 pb-16 pt-10 sm:pt-16">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="flex flex-col items-center text-center"
      >
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg sm:h-20 sm:w-20">
          <Radar className="absolute h-8 w-8 opacity-40 sm:h-10 sm:w-10" />
          <Plane className="h-8 w-8 sm:h-10 sm:w-10" />
        </div>
        <h1 className="mt-5 text-2xl font-bold tracking-tight sm:text-4xl">
          Monitor Brazilian airspace
        </h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground sm:text-base">
          Search for any city in Brazil. We'll show you aircraft entering, leaving, landing, and taking off in real time.
        </p>
      </motion.div>

      <div className="mt-8 w-full">
        <SearchBar onSearch={onSearch} loading={loading} autoFocus />
      </div>

      <div className="mt-6 w-full">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Search failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading && (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        )}

        {!loading && !error && results.length > 0 && (
          <div className="space-y-3">
            <p className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {results.length} match{results.length === 1 ? "" : "es"}
            </p>
            {results.map((c) => (
              <CityCard key={c.place_id} city={c} onSelect={onSelect} />
            ))}
          </div>
        )}

        {!loading && !error && results.length === 0 && <EmptyHint />}
      </div>

      <div className="mt-10 flex items-center gap-2 text-xs text-muted-foreground/70">
        <MapPin className="h-3.5 w-3.5" />
        <span>Search powered by OpenStreetMap. Restricted to Brazil.</span>
      </div>
    </div>
  );
}

function EmptyHint() {
  return (
    <div className="rounded-lg border border-dashed border-border p-8 text-center">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <SearchIcon className="h-5 w-5" />
      </div>
      <p className="text-sm font-medium">No Brazilian cities matched your search.</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Try another city — e.g. Fortaleza, Recife, Campinas, São Paulo.
      </p>
    </div>
  );
}
