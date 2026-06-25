import type { AircraftCategory } from "@/types/event";

export interface CategoryMeta {
  label: string;
  short: string;
}

const TABLE: Record<string, CategoryMeta> = {
  noInfo: { label: "No info", short: "?" },
  light: { label: "Light aircraft", short: "L" },
  small: { label: "Small", short: "S" },
  large: { label: "Large", short: "L" },
  heavy: { label: "Heavy", short: "H" },
  rotorcraft: { label: "Rotorcraft", short: "R" },
  glider: { label: "Glider", short: "G" },
  lighterThanAir: { label: "Lighter-than-air", short: "A" },
  unmannedAerialVehicle: { label: "UAV", short: "U" },
  space: { label: "Space", short: "SP" },
  emergency: { label: "Emergency", short: "E" },
  service: { label: "Service", short: "SV" },
};

export function categoryMeta(cat: AircraftCategory): CategoryMeta {
  const key = typeof cat === "string" ? cat : String(cat);
  return TABLE[key] ?? { label: key.replace(/^unknown/, "Unknown "), short: "X" };
}
