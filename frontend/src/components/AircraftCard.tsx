import { motion } from "framer-motion";
import { Plane, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AircraftStatusBadge } from "./AircraftStatusBadge";
import { deriveStatus } from "@/lib/aircraft-status";
import { friendlyCategory } from "@/lib/event-display";
import { useDevMode } from "@/hooks/useDevMode";
import { format } from "date-fns";
import type { ActiveAircraft } from "@/types/event";
import { cn } from "@/lib/utils";

// Statuses depend on elapsed time since the last transition ("Recém-Pousado"
// becomes "Pousado" after 60s, "Decolando" becomes "Recém-Decolado" after 30s,
// etc.). Cards tick every 5s to re-derive — cheap, and only the label pill
// re-renders thanks to React's bail-out on equal primitives.
const TICK_MS = 5_000;

interface AircraftCardProps {
  aircraft: ActiveAircraft;
}

export function AircraftCard({ aircraft }: AircraftCardProps) {
  const now = useNow(TICK_MS);
  const { devMode } = useDevMode();
  const status = deriveStatus(aircraft, now);
  const callsign = aircraft.event.callsign.trim();
  const event = aircraft.event;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 320, damping: 30 }}
    >
      <Card className="relative overflow-hidden p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Plane className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-semibold">
                {callsign ? `Voo ${callsign}` : "Voo desconhecido"}
              </p>
              <AircraftStatusBadge status={status} />
            </div>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {friendlyCategory(event.category)}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1 font-mono tabular-nums">
                <MapPin className="h-3 w-3" />
                {event.latitude.toFixed(3)}°, {event.longitude.toFixed(3)}°
              </span>
              <time className="font-mono tabular-nums">
                {format(aircraft.event._receivedAt, "HH:mm:ss")}
              </time>
            </div>
            <p className="mt-1.5 truncate text-[11px] text-muted-foreground">
              {[event.city, event.state, event.country].filter(Boolean).join(", ") || "Localização desconhecida"}
            </p>
            {devMode && (
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <Badge variant="outline" className="px-2 py-0 font-mono text-[10px] uppercase text-muted-foreground">
                  {event.icao24}
                </Badge>
                <Badge variant="outline" className="px-2 py-0 font-mono text-[10px] text-muted-foreground">
                  {String(event.category)}
                </Badge>
                {aircraft.lastTransitionAction && (
                  <span className={cn("rounded-full bg-muted px-2 py-0.5 font-mono text-[10px] uppercase text-muted-foreground")}>
                    {aircraft.lastTransitionAction} {aircraft.lastTransitionAt ? format(aircraft.lastTransitionAt, "HH:mm:ss") : ""}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// Lightweight ticking clock — triggers re-derive of recency-based status.
function useNow(intervalMs: number): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
