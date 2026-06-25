import type { BoundingBox, CityResult } from "@/types/event";

// city.boundingbox is [south, north, west, east] as strings (Nominatim)
export function bboxFromCity(city: CityResult): BoundingBox {
  const [south, north, west, east] = city.boundingbox;
  return {
    lamin: parseFloat(south),
    lamax: parseFloat(north),
    lomin: parseFloat(west),
    lomax: parseFloat(east),
  };
}

const KM_PER_DEG_LAT = 111;
export function bboxDimensionsKm(bbox: BoundingBox): { widthKm: number; heightKm: number } {
  const widthKm = Math.abs(bbox.lomax - bbox.lomin) * KM_PER_DEG_LAT;
  const avgLat = (bbox.lamin + bbox.lamax) / 2;
  const cosLat = Math.cos((avgLat * Math.PI) / 180);
  const heightKm = Math.abs(bbox.lamax - bbox.lamin) * KM_PER_DEG_LAT * cosLat;
  return { widthKm, heightKm };
}

// Brazilian state names + common abbreviations, matched against display_name parts.
const BRAZILIAN_STATES = [
  "Acre", "Alagoas", "Amapá", "Amazonas", "Bahia", "Ceará",
  "Distrito Federal", "Espírito Santo", "Goiás", "Maranhão",
  "Mato Grosso", "Mato Grosso do Sul", "Minas Gerais", "Pará",
  "Paraíba", "Paraná", "Pernambuco", "Piauí", "Rio de Janeiro",
  "Rio Grande do Norte", "Rio Grande do Sul", "Rondônia", "Roraima",
  "Santa Catarina", "São Paulo", "Sergipe", "Tocantins",
];

const STATE_SET = new Set(BRAZILIAN_STATES);

// Walk a Nominatim display_name (comma-separated, trailing "Brasil") and return the
// first part that matches a known Brazilian state. Falls back to the second-to-last
// part (typically the state) if no explicit match is found.
export function extractState(displayName: string): string | null {
  const parts = displayName.split(",").map((p) => p.trim());
  for (const p of parts) {
    if (STATE_SET.has(p)) return p;
  }
  // Fallback: usually the part right before "Brasil"
  if (parts.length >= 2) {
    const candidate = parts[parts.length - 2];
    if (candidate && !candidate.toLowerCase().startsWith("região")) {
      return candidate;
    }
  }
  return null;
}
