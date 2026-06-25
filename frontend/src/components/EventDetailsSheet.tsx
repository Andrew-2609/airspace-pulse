import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import type { AircraftEvent } from "@/types/event";
import { EventDetails } from "./EventDetails";

interface EventDetailsSheetProps {
  event: (AircraftEvent & { _receivedAt: number }) | null;
  onOpenChange: (open: boolean) => void;
}

export function EventDetailsSheet({ event, onOpenChange }: EventDetailsSheetProps) {
  return (
    <Sheet open={!!event} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto scrollbar-thin">
        <SheetHeader className="mb-3">
          <SheetTitle>What happened</SheetTitle>
          <SheetDescription>A plain-English summary of this event.</SheetDescription>
        </SheetHeader>
        {event && <EventDetails event={event} />}
      </SheetContent>
    </Sheet>
  );
}
