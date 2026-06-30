import type { AircraftStatus } from "@/types/event";
import { STATUS_META } from "@/lib/aircraft-status";
import { ACCENT_CLASSES } from "@/lib/event-meta";
import { cn } from "@/lib/utils";

interface AircraftStatusBadgeProps {
  status: AircraftStatus;
}

export function AircraftStatusBadge({ status }: AircraftStatusBadgeProps) {
  const meta = STATUS_META[status];
  const accent = ACCENT_CLASSES[meta.accent];
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", accent.bg, accent.text)}>
      {meta.label}
    </span>
  );
}
