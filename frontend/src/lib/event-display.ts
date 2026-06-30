import type { AircraftAction, AircraftCategory } from "@/types/event";
import { categoryMeta } from "@/lib/categories";

// Título amigável — o que um adolescente de 15 anos entenderia.
// Ex.: "Voo LATAM123 entrou na área" ou "Uma aeronave entrou na área".
export function friendlyTitle(action: AircraftAction, callsign?: string): string {
  const subject = callsign ? `Voo ${callsign}` : "Uma aeronave";
  switch (action) {
    case "present":
      return `${subject} está na área`;
    case "entered":
      return `${subject} entrou na área`;
    case "left":
      return `${subject} saiu da área`;
    case "landed":
      return `${subject} pousou`;
    case "took_off":
      return `${subject} decolou`;
    case "changed_address":
      return `${subject} mudou de local`;
    default:
      return subject;
  }
}

// Subtítulo em uma linha, linguagem simples.
export function friendlySubtitle(action: AircraftAction): string {
  switch (action) {
    case "present":
      return "Presente na área monitorada";
    case "entered":
      return "Nova aeronave detectada na área monitorada";
    case "left":
      return "A aeronave deixou a área monitorada";
    case "landed":
      return "Tocou o solo";
    case "took_off":
      return "Decolou e está no ar";
    case "changed_address":
      return "Cruzou para uma nova área de endereço";
    default:
      return "";
  }
}

// Rótulo amigável da categoria (ex.: "Aeronave leve").
export function friendlyCategory(category: AircraftCategory): string {
  return categoryMeta(category).label;
}
