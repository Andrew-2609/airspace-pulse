import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ReceivedEvent } from "@/hooks/useEventStream";
import { EVENT_META, ACCENT_CLASSES } from "@/lib/event-meta";
import { friendlyTitle, friendlySubtitle, friendlyCategory } from "@/lib/event-display";
import { useDevMode } from "@/hooks/useDevMode";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface EventCardProps {
  event: ReceivedEvent;
  selected?: boolean;
  onSelect?: (event: ReceivedEvent) => void;
}

export function EventCard({ event, selected, onSelect }: EventCardProps) {
  const meta = EVENT_META[event.action];
  const accent = ACCENT_CLASSES[meta.accent];
  const callsign = event.callsign?.trim();
  const { devMode } = useDevMode();

  return (
    <motion.button
      type="button"
      onClick={() => onSelect?.(event)}
      layout
      initial={{ opacity: 0, y: -8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 34 }}
      className="block w-full text-left"
    >
      <Card
        className={cn(
          "relative overflow-hidden p-4 transition-colors hover:bg-accent/40",
          selected && "ring-2 ring-ring",
        )}
      >
        <div className={cn("absolute inset-y-0 left-0 w-1", accent.dot)} />
        <div className="flex items-start gap-3 pl-2">
          <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-md", accent.bg, accent.text)}>
            <meta.Icon className="h-5 w-5" strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-semibold">
                {friendlyTitle(event.action, callsign)}
              </p>
              <time className="shrink-0 font-mono text-[11px] text-muted-foreground tabular-nums">
                {format(event._receivedAt, "HH:mm:ss")}
              </time>
            </div>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {friendlySubtitle(event.action)}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {callsign ? (
                <Badge variant="secondary" className="px-2 py-0 font-mono text-[10px]">
                  {callsign}
                </Badge>
              ) : (
                <Badge variant="outline" className="px-2 py-0 text-[10px] text-muted-foreground">
                  Unknown flight
                </Badge>
              )}
              <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", accent.bg, accent.text)}>
                {friendlyCategory(event.category)}
              </span>
              {devMode && (
                <>
                  <Badge variant="outline" className="px-2 py-0 font-mono text-[10px] uppercase text-muted-foreground">
                    {event.icao24}
                  </Badge>
                  <span className="font-mono text-[10px] text-muted-foreground/70 tabular-nums">
                    {event.latitude.toFixed(3)}, {event.longitude.toFixed(3)}
                  </span>
                  <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[10px] uppercase text-muted-foreground">
                    {event.action}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.button>
  );
}
