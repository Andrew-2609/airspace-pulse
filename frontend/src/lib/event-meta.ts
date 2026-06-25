import {
  Plane,
  PlaneTakeoff,
  PlaneLanding,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import type { AircraftAction } from "@/types/event";

export interface EventMeta {
  Icon: LucideIcon;
  title: (callsign: string, icao: string) => string;
  description: string;
  accent: "primary" | "muted" | "success" | "warning" | "destructive";
}

export const EVENT_META: Record<AircraftAction, EventMeta> = {
  entered: {
    Icon: Plane,
    title: (c, i) => c ? `${c} entered the area` : `Aircraft ${i} entered the area`,
    description: "New aircraft detected inside the bounding box",
    accent: "primary",
  },
  left: {
    Icon: LogOut,
    title: (c, i) => c ? `${c} left the area` : `Aircraft ${i} left the area`,
    description: "Aircraft exited the monitored bounding box",
    accent: "muted",
  },
  landed: {
    Icon: PlaneLanding,
    title: (c, i) => c ? `${c} landed` : `Aircraft ${i} landed`,
    description: "Transitioned from airborne to on-ground",
    accent: "success",
  },
  took_off: {
    Icon: PlaneTakeoff,
    title: (c, i) => c ? `${c} took off` : `Aircraft ${i} took off`,
    description: "Transitioned from on-ground to airborne",
    accent: "warning",
  },
};

export const ACCENT_CLASSES: Record<EventMeta["accent"], { ring: string; bg: string; text: string; dot: string }> = {
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
};
