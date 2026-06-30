import { AnimatePresence } from "framer-motion";
import { Loader2, Radio } from "lucide-react";
import type { ActiveAircraft as ActiveAircraftType, SseStatus } from "@/types/event";
import { AircraftCard } from "./AircraftCard";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ActiveAircraftProps {
  aircraft: ActiveAircraftType[];
  status: SseStatus;
}

export function ActiveAircraft({ aircraft, status }: ActiveAircraftProps) {
  const connecting = status === "connecting";
  const connected = status === "connected";
  const empty = aircraft.length === 0;

  return (
    <section className="flex h-full min-h-0 flex-col">
      <header className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Aeronaves ativas
        </h2>
        <span className="font-mono text-xs text-muted-foreground tabular-nums">
          {aircraft.length} aeronave{aircraft.length === 1 ? "" : "s"}
        </span>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin pr-1">
        {connecting && empty && <ConnectingState />}
        {connected && empty && (
          <EmptyState
            Icon={Loader2}
            spin
            title="Aguardando atividade aérea…"
            body="A aeronaves ativas aparecerão aqui assim que forem detectadas pelo monitoramento."
          />
        )}
        {status === "idle" && empty && (
          <EmptyState
            Icon={Radio}
            title="Monitoramento aguardando início"
            body="A conexão começará em instantes."
          />
        )}
        {status === "disconnected" && empty && (
          <EmptyState
            Icon={Radio}
            title="Conexão perdida"
            body="Tentando reconectar automaticamente ao monitoramento do espaço aéreo cearense."
          />
        )}

        {!empty && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence initial={false}>
              {aircraft.map((ac) => (
                <AircraftCard key={ac.event.icao24} aircraft={ac} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
}

function ConnectingState() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-24 w-full rounded-lg" />
      ))}
    </div>
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
