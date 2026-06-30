import type {
  ActiveAircraft,
  AircraftStatus,
  TransitionAction,
} from "@/types/event";

// Recency windows (ms) — used to flag "recém-*" transitional states after a
// lifecycle event. The backend's on_ground is authoritative for the underlying
// Em Voo / Pousado split; these windows layer transient labels on top.
const TOOK_OFF_PEAK_MS = 30_000;
const TOOK_OFF_RECENT_MS = 90_000;
const LANDED_RECENT_MS = 60_000;

type AccentKey = "primary" | "muted" | "success" | "warning" | "accent";

export interface StatusMeta {
  label: string;
  accent: AccentKey;
}

export const STATUS_META: Record<AircraftStatus, StatusMeta> = {
  "em-voo": { label: "Em Voo", accent: "primary" },
  "pousado": { label: "Pousado", accent: "muted" },
  "decolando": { label: "Decolando", accent: "warning" },
  "recem-pousado": { label: "Recém-Pousado", accent: "success" },
  "recem-decolado": { label: "Recém-Decolado", accent: "accent" },
};

export function deriveStatus(aircraft: ActiveAircraft, now: number): AircraftStatus {
  const { event, lastTransitionAt, lastTransitionAction } = aircraft;
  const onGround = event.on_ground;

  // No transition observed yet — trust the backend's on_ground flag.
  if (lastTransitionAt === null || lastTransitionAction === null) {
    return onGround ? "pousado" : "em-voo";
  }

  const elapsed = now - lastTransitionAt;
  return transitionStatus(lastTransitionAction, elapsed, onGround);
}

function transitionStatus(action: TransitionAction, elapsedMs: number, onGround: boolean): AircraftStatus {
  switch (action) {
    case "took_off":
      if (elapsedMs < TOOK_OFF_PEAK_MS) return "decolando";
      if (elapsedMs < TOOK_OFF_RECENT_MS) return "recem-decolado";
      return "em-voo";
    case "landed":
      if (elapsedMs < LANDED_RECENT_MS) return "recem-pousado";
      return "pousado";
    case "entered":
      // Freshly entered — defer to the backend's on_ground flag.
      return onGround ? "pousado" : "em-voo";
    case "left":
      // Should not occur — Left removes the aircraft from the map.
      return "em-voo";
  }
}
