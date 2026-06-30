import { useCallback, useState } from "react";
import { AlertCircle, X } from "lucide-react";
import { MetricsRow } from "./MetricsRow";
import { Button } from "@/components/ui/button";
import { ActiveAircraft } from "./ActiveAircraft";
import { EventFeed } from "./EventFeed";
import { EventDetails } from "./EventDetails";
import type { ReceivedEvent } from "@/hooks/useAirspaceStore";
import type {
  ActiveAircraft as ActiveAircraftType,
  AirspaceMetrics,
  SseStatus,
} from "@/types/event";
import { useIsMobile } from "@/hooks/useIsMobile";

interface MonitoringViewProps {
  status: SseStatus;
  aircraft: ActiveAircraftType[];
  metrics: AirspaceMetrics;
  events: ReceivedEvent[];
  lastError: string | null;
  onOpenMobileDetails: (event: ReceivedEvent) => void;
}

export function MonitoringView({
  status,
  aircraft,
  metrics,
  events,
  lastError,
  onOpenMobileDetails,
}: MonitoringViewProps) {
  const [selectedEvent, setSelectedEvent] = useState<ReceivedEvent | null>(null);
  const isMobile = useIsMobile();

  const handleSelectEvent = useCallback(
    (event: ReceivedEvent) => {
      setSelectedEvent(event);
      if (isMobile) onOpenMobileDetails(event);
    },
    [isMobile, onOpenMobileDetails],
  );

  const handleCloseDetails = useCallback(() => setSelectedEvent(null), []);

  const showReconnectBanner = status === "disconnected" && lastError !== null;

  return (
    <>
      {showReconnectBanner && (
        <div className="border-b border-warning/30 bg-warning/5 px-4 py-2 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-warning">
              <AlertCircle className="h-4 w-4" />
              <span>{lastError}</span>
            </div>
          </div>
        </div>
      )}
      <main className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col gap-4 p-4 sm:gap-6 sm:p-6">
        <MetricsRow metrics={metrics} />

        <div className="grid gap-4 lg:grid-cols-[1fr_340px] lg:gap-6">
          <section className="flex min-h-[50vh] flex-col lg:min-h-0">
            <ActiveAircraft aircraft={aircraft} status={status} />
          </section>

          <section className="flex min-h-[40vh] flex-col lg:min-h-0">
            <EventFeed
              events={events}
              status={status}
              selectedIcao={selectedEvent?.icao24}
              onSelect={handleSelectEvent}
            />
          </section>
        </div>

        <section className="hidden lg:block">
          {selectedEvent ? (
            <div className="space-y-3">
              <header className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Detalhes do evento
                  </h2>
                  <p className="mt-0.5 text-xs text-muted-foreground/80">
                    Um resumo do que acabou de acontecer.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCloseDetails}
                  aria-label="Fechar detalhes"
                >
                  <X className="h-4 w-4" />
                </Button>
              </header>
              <EventDetails event={selectedEvent} />
            </div>
          ) : (
            <EmptyDetails />
          )}
        </section>

        <p className="text-center text-[10px] text-muted-foreground/70">
          Aviso: as informações de cidade/estado/país aparecem sem acentos devido a limitações do conjunto de dados.
        </p>
      </main>
    </>
  );
}

function EmptyDetails() {
  return (
    <div className="rounded-lg border border-dashed border-border p-8 text-center">
      <p className="text-sm font-medium">Nenhum evento selecionado</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Toque em um evento na lista para ver o que aconteceu.
      </p>
    </div>
  );
}
