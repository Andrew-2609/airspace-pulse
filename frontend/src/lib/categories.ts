import type { AircraftCategory } from "@/types/event";

export interface CategoryMeta {
  label: string;
  short: string;
}

const TABLE: Record<string, CategoryMeta> = {
  noInfo: { label: "Sem informações", short: "?" },
  light: { label: "Aeronave leve", short: "L" },
  small: { label: "Pequena", short: "S" },
  large: { label: "Grande", short: "G" },
  heavy: { label: "Pesada", short: "P" },
  rotorcraft: { label: "Rotorcraft", short: "R" },
  glider: { label: "Planador", short: "PL" },
  lighterThanAir: { label: "Mais leve que o ar", short: "A" },
  unmannedAerialVehicle: { label: "VANT", short: "V" },
  space: { label: "Espacial", short: "E" },
  emergency: { label: "Emergência", short: "EM" },
  service: { label: "Serviço", short: "SV" },
};

export function categoryMeta(cat: AircraftCategory): CategoryMeta {
  const key = typeof cat === "string" ? cat : String(cat);
  return TABLE[key] ?? { label: key.replace(/^unknown/, "Desconhecida "), short: "X" };
}
