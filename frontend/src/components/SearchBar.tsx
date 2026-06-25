import { useState } from "react";
import { Search, Loader2, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  onSearch: (q: string) => void;
  loading: boolean;
  autoFocus?: boolean;
}

export function SearchBar({ onSearch, loading, autoFocus }: SearchBarProps) {
  const [value, setValue] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    onSearch(value.trim());
  };

  return (
    <form onSubmit={submit} className="relative w-full">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          autoFocus={autoFocus}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search any city in Brazil…"
          className={cn(
            "h-12 rounded-xl border-border bg-card pl-11 pr-28 text-base shadow-sm",
            "transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0",
          )}
          autoComplete="off"
          spellCheck={false}
        />
        <Button
          type="submit"
          disabled={loading || !value.trim()}
          className="absolute right-1.5 top-1/2 -translate-y-1/2"
          size="sm"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
          <span>Search</span>
        </Button>
      </div>
    </form>
  );
}
