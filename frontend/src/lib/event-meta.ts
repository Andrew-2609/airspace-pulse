import {
  Plane,
  PlaneTakeoff,
  PlaneLanding,
  LogOut,
  Radio,
  type LucideIcon,
} from "lucide-react";
import type { AircraftAction } from "@/types/event";

export type AccentKey = "primary" | "muted" | "success" | "warning" | "destructive" | "accent";

export interface EventMeta {
  Icon: LucideIcon;
  title: (callsign: string, icao: string) => string;
  description: string;
  accent: AccentKey;
}

// `present` is defensive — Present events are filtered out of the timeline before
// reaching EventCard, but EventDetails' copy record is keyed by AircraftAction
// and must cover every variant to compile under Record<AircraftAction, string>.
export const EVENT_META: Record<AircraftAction, EventMeta> = {
  present: {
    Icon: Radio,
    title: (c, i) => c ? `${c} presente` : `Aeronave ${i} presente`,
    description: "Aeronave presente na área monitorada",
    accent: "muted",
  },
  entered: {
    Icon: Plane,
    title: (c, i) => c ? `${c} entrou na área` : `Aeronave ${i} entrou na área`,
    description: "Nova aeronave detectada na área monitorada",
    accent: "primary",
  },
  left: {
    Icon: LogOut,
    title: (c, i) => c ? `${c} saiu da área` : `Aeronave ${i} saiu da área`,
    description: "Aeronave deixou a área monitorada",
    accent: "muted",
  },
  landed: {
    Icon: PlaneLanding,
    title: (c, i) => c ? `${c} pousou` : `Aeronave ${i} pousou`,
    description: "Tocou o solo dentro da área monitorada",
    accent: "success",
  },
  took_off: {
    Icon: PlaneTakeoff,
    title: (c, i) => c ? `${c} decolou` : `Aeronave ${i} decolou`,
    description: "Decolou e está no ar dentro da área monitorada",
    accent: "warning",
  },
};

export const ACCENT_CLASSES: Record<AccentKey, { ring: string; bg: string; text: string; dot: string }> = {
  primary: {
    ring: "ring-primary/20",
    bg: "bg-primary/10",
    text: "text-primary",
    dot: "bg-primary",
  },
  muted: {
    ring: "ring-muted-foreground/20",
    bg: "bg-muted",
    text: "text-muted-foreground",
    dot: "bg-muted-foreground",
  },
  success: {
    ring: "ring-success/25",
    bg: "bg-success/10",
    text: "text-success",
    dot: "bg-success",
  },
  warning: {
    ring: "ring-warning/25",
    bg: "bg-warning/10",
    text: "text-warning",
    dot: "bg-warning",
  },
  destructive: {
    ring: "ring-destructive/25",
    bg: "bg-destructive/10",
    text: "text-destructive",
    dot: "bg-destructive",
  },
  accent: {
    ring: "ring-accent/25",
    bg: "bg-accent/10",
    text: "text-accent",
    dot: "bg-accent",
  },
};
