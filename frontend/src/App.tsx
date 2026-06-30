import { useCallback, useState } from "react";
import { Header } from "@/components/Header";
import { MonitoringView } from "@/components/MonitoringView";
import { EventDetailsSheet } from "@/components/EventDetailsSheet";
import { useAirspaceStore, type ReceivedEvent } from "@/hooks/useAirspaceStore";
import { useIsMobile } from "@/hooks/useIsMobile";

export default function App() {
  const [mobileDetailsEvent, setMobileDetailsEvent] = useState<ReceivedEvent | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const isMobile = useIsMobile();

  const { status, aircraft, metrics, recentEvents, lastError } = useAirspaceStore();

  const handleOpenMobileDetails = useCallback((event: ReceivedEvent) => {
    setMobileDetailsEvent(event);
    setSheetOpen(true);
  }, []);

  const handleSheetOpenChange = useCallback((open: boolean) => {
    setSheetOpen(open);
    if (!open) setMobileDetailsEvent(null);
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Header status={status} />
      <MonitoringView
        status={status}
        aircraft={aircraft}
        metrics={metrics}
        events={recentEvents}
        lastError={lastError}
        onOpenMobileDetails={handleOpenMobileDetails}
      />
      {isMobile && (
        <EventDetailsSheet
          event={sheetOpen ? mobileDetailsEvent : null}
          onOpenChange={handleSheetOpenChange}
        />
      )}
    </div>
  );
}
