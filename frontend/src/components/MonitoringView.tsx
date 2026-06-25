import { useCallback, useState } from "react";
import { AlertCircle } from "lucide-react";
import { SelectedCityCard } from "./SelectedCityCard";
import { EventFeed } from "./EventFeed";
import { EventDetails } from "./EventDetails";
import type { ReceivedEvent } from "@/hooks/useEventStream";
import { useIsMobile } from "@/hooks/useIsMobile";
import type { CityResult, SseStatus } from "@/types/event";

interface MonitoringViewProps {
  city: CityResult;
  status: SseStatus;
  events: ReceivedEvent[];
  lastError: string | null;
  onChangeCity: () => void;
  onOpenMobileDetails: (event: ReceivedEvent) => void;
}

export function MonitoringView({
  city,
  status,
  events,
  lastError,
  onChangeCity,
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
      <main className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col gap-6 p-4 sm:p-6 lg:flex-row lg:gap-6">
        <aside className="lg:w-[340px] lg:shrink-0">
          <SelectedCityCard city={city} status={status} onClear={onChangeCity} />
        </aside>

        <section className="flex min-h-[50vh] flex-1 flex-col lg:min-h-0">
          <EventFeed
            events={events}
            status={status}
            hasCity
            loadingResults={false}
            selectedIcao={selectedEvent?.icao24}
            onSelect={handleSelectEvent}
          />
        </section>

        <section className="hidden lg:block lg:w-[360px] lg:shrink-0">
          {selectedEvent ? (
            <div className="space-y-4">
              <header>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Event details
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground/80">
                  A summary of what just happened.
                </p>
              </header>
              <EventDetails event={selectedEvent} />
            </div>
          ) : (
            <EmptyDetails />
          )}
        </section>
      </main>
    </>
  );
}

function EmptyDetails() {
  return (
    <div className="rounded-lg border border-dashed border-border p-8 text-center">
      <p className="text-sm font-medium">No event selected yet</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Tap an event in the feed to see what happened.
      </p>
    </div>
  );
}
