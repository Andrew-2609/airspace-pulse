import { AnimatePresence } from "framer-motion";
import { Radio, Loader2 } from "lucide-react";
import type { AircraftEvent, SseStatus } from "@/types/event";
import type { ReceivedEvent } from "@/hooks/useEventStream";
import { EventCard } from "./EventCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface EventFeedProps {
  events: ReceivedEvent[];
  status: SseStatus;
  hasCity: boolean;
  loadingResults: boolean;
  selectedIcao?: string;
  onSelect: (event: ReceivedEvent) => void;
}

export function EventFeed({
  events,
  status,
  hasCity,
  loadingResults,
  selectedIcao,
  onSelect,
}: EventFeedProps) {
  const empty = events.length === 0;

  if (loadingResults) {
    return (
      <FeedShell title="Event Feed">
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      </FeedShell>
    );
  }

  if (!hasCity) {
    return (
      <FeedShell title="Event Feed">
        <EmptyState
          Icon={Radio}
          title="No city selected"
          body="Search for a Brazilian city to begin monitoring airspace activity."
        />
      </FeedShell>
    );
  }

  if (empty) {
    const listening = status === "connected" || status === "connecting";
    const idle = status === "idle";
    if (idle) {
      return (
        <FeedShell title="Event Feed">
          <EmptyState
            Icon={Radio}
            title="No city selected"
            body="Search for a Brazilian city to begin monitoring airspace activity."
          />
        </FeedShell>
      );
    }
    return (
      <FeedShell title="Event Feed">
        <EmptyState
          Icon={listening ? Loader2 : Radio}
          spin={listening}
          title={listening ? "Listening for airspace activity…" : "Waiting to connect"}
          body={listening ? "Events will appear here the moment aircraft enter, leave, land, or take off inside the monitored area." : "The connection is currently down. We'll retry automatically."}
        />
      </FeedShell>
    );
  }

  return (
    <FeedShell title="Event Feed" count={events.length}>
      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {events.map((ev) => (
            <EventCard
              key={`${ev.icao24}-${ev.action}-${ev._receivedAt}`}
              event={ev}
              selected={ev.icao24 === selectedIcao}
              onSelect={onSelect}
            />
          ))}
        </AnimatePresence>
      </div>
    </FeedShell>
  );
}

function FeedShell({
  title,
  count,
  children,
}: {
  title: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <section className="flex h-full min-h-0 flex-col">
      <header className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
        {typeof count === "number" && (
          <span className="font-mono text-xs text-muted-foreground tabular-nums">{count} event{count === 1 ? "" : "s"}</span>
        )}
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin pr-1">{children}</div>
    </section>
  );
}

function EmptyState({
  Icon,
  title,
  body,
  spin,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
  spin?: boolean;
}) {
  return (
    <Card className="flex flex-col items-center justify-center gap-3 border-dashed p-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className={cn("h-7 w-7", spin && "animate-spin")} />
      </div>
      <div>
        <p className="text-base font-semibold">{title}</p>
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{body}</p>
      </div>
    </Card>
  );
}

// Re-export for clarity when used elsewhere
export type { AircraftEvent, ReceivedEvent };
