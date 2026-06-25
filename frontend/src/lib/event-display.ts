import type { AircraftAction, AircraftCategory } from "@/types/event";
import { categoryMeta } from "@/lib/categories";

// Friendly title — what a 15-year-old would understand.
// Returns e.g. "Flight LATAM123 entered the area" or "An aircraft entered the area".
export function friendlyTitle(action: AircraftAction, callsign?: string): string {
  const subject = callsign ? `Flight ${callsign}` : "An aircraft";
  switch (action) {
    case "entered":
      return `${subject} entered the area`;
    case "left":
      return `${subject} left the area`;
    case "landed":
      return `${subject} landed`;
    case "took_off":
      return `${subject} took off`;
    default:
      return subject;
  }
}

// One-line plain-English subtitle.
export function friendlySubtitle(action: AircraftAction): string {
  switch (action) {
    case "entered":
      return "New aircraft detected in the monitored area";
    case "left":
      return "Aircraft flew out of the monitored area";
    case "landed":
      return "Touched down on the ground";
    case "took_off":
      return "Lifted off and is now airborne";
    default:
      return "";
  }
}

// User-facing category label (e.g. "Light aircraft" → "Light aircraft").
export function friendlyCategory(category: AircraftCategory): string {
  return categoryMeta(category).label;
}
