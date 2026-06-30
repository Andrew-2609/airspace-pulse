import { AnimatePresence } from "framer-motion";
import { Radio, Loader2 } from "lucide-react";
import type { SseStatus } from "@/types/event";
import type { ReceivedEvent } from "@/hooks/useAirspaceStore";
import { EventCard } from "./EventCard";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface EventFeedProps {
  events: ReceivedEvent[];
  status: SseStatus;
  selectedIcao?: string;
  onSelect: (event: ReceivedEvent) => void;
}

export function EventFeed({ events, status, selectedIcao, onSelect }: EventFeedProps) {
  const empty = events.length === 0;

  if (empty) {
    if (status === "connecting") {
      return (
        <FeedShell title="Eventos">
          <EmptyState
            Icon={Loader2}
            spin
            title="Conectando ao monitoramento do espaço aéreo cearense…"
            body="Os eventos aparecerão aqui assim que a conexão for estabelecida."
          />
        </FeedShell>
      );
    }
    if (status === "connected") {
      return (
        <FeedShell title="Eventos">
          <EmptyState
            Icon={Radio}
            title="Aguardando atividade aérea…"
            body="Os eventos aparecerão aqui assim que aeronaves entrarem, saírem, pousarem ou decolarem na área monitorada."
          />
        </FeedShell>
      );
    }
    if (status === "disconnected") {
      return (
        <FeedShell title="Eventos">
          <EmptyState
            Icon={Radio}
            title="Conexão perdida"
            body="Tentando reconectar automaticamente ao monitoramento do espaço aéreo cearense."
          />
        </FeedShell>
      );
    }
    return (
      <FeedShell title="Eventos">
        <EmptyState
          Icon={Radio}
          title="Monitoramento aguardando início"
          body="A conexão começará em instantes."
        />
      </FeedShell>
    );
  }

  return (
    <FeedShell title="Eventos" count={events.length}>
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
          <span className="font-mono text-xs text-muted-foreground tabular-nums">{count} evento{count === 1 ? "" : "s"}</span>
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
export type { ReceivedEvent };
