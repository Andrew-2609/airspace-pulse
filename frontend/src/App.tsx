import { useCallback, useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { SearchView } from "@/components/SearchView";
import { MonitoringView } from "@/components/MonitoringView";
import { EventDetailsSheet } from "@/components/EventDetailsSheet";
import { useCitySearch } from "@/hooks/useCitySearch";
import { useEventStream, type ReceivedEvent } from "@/hooks/useEventStream";
import { useIsMobile } from "@/hooks/useIsMobile";
import { bboxFromCity } from "@/lib/bbox";
import type { CityResult } from "@/types/event";

export default function App() {
  const [selected, setSelected] = useState<CityResult | null>(null);
  const [mobileDetailsEvent, setMobileDetailsEvent] = useState<ReceivedEvent | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const isMobile = useIsMobile();

  const { results, loading, error, search, reset } = useCitySearch();
  const bbox = useMemo(() => (selected ? bboxFromCity(selected) : null), [selected]);
  const { status, events, lastError } = useEventStream(bbox);

  const handleSelectCity = useCallback((city: CityResult) => {
    setSelected(city);
    reset();
  }, [reset]);

  const handleChangeCity = useCallback(() => {
    setSelected(null);
    setMobileDetailsEvent(null);
    setSheetOpen(false);
    reset();
  }, [reset]);

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

      {selected ? (
        <MonitoringView
          city={selected}
          status={status}
          events={events}
          lastError={lastError}
          onChangeCity={handleChangeCity}
          onOpenMobileDetails={handleOpenMobileDetails}
        />
      ) : (
        <SearchView
          results={results}
          loading={loading}
          error={error}
          onSearch={search}
          onSelect={handleSelectCity}
        />
      )}

      {isMobile && (
        <EventDetailsSheet
          event={sheetOpen ? mobileDetailsEvent : null}
          onOpenChange={handleSheetOpenChange}
        />
      )}
    </div>
  );
}
