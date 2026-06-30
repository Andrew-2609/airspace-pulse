import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import type { ReceivedEvent } from "@/hooks/useAirspaceStore";
import { EventDetails } from "./EventDetails";

interface EventDetailsSheetProps {
  event: ReceivedEvent | null;
  onOpenChange: (open: boolean) => void;
}

export function EventDetailsSheet({ event, onOpenChange }: EventDetailsSheetProps) {
  return (
    <Sheet open={!!event} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto scrollbar-thin">
        <SheetHeader className="mb-3">
          <SheetTitle>O que aconteceu</SheetTitle>
          <SheetDescription>Um resumo em linguagem simples deste evento.</SheetDescription>
        </SheetHeader>
        {event && <EventDetails event={event} />}
      </SheetContent>
    </Sheet>
  );
}
