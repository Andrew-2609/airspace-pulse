// Types mirror the backend Serialize impl in airspace-pulse/src/event.rs
// and model.rs. Do not invent fields.

export type AircraftAction =
  | "present"
  | "entered"
  | "left"
  | "landed"
  | "took_off"
  | "changed_address";

export type AircraftCategory =
  | "noInfo"
  | "light"
  | "small"
  | "large"
  | "heavy"
  | "rotorcraft"
  | "glider"
  | "lighterThanAir"
  | "unmannedAerialVehicle"
  | "space"
  | "emergency"
  | "service"
  // backend serializes Unknown(n) as `unknown{n}`; kept permissive
  | `unknown${number}`
  | string;

export interface AircraftEvent {
  action: AircraftAction;
  icao24: string;
  callsign: string;
  latitude: number;
  longitude: number;
  category: AircraftCategory;
  on_ground: boolean;
  // Backend reverses geocode (lat, lon) via a local geocoder. The underlying
  // dataset strips diacritics, so city/state/country values arrive unaccented
  // (e.g. "Sao Paulo" instead of "São Paulo"). Display as-is.
  city: string;
  state: string;
  country: string;
  // Present only on `changed_address` events — the previous address before the
  // aircraft crossed into a new reverse-geocoded cell. Absent on every other
  // action.
  prev_city?: string;
  prev_state?: string;
  prev_country?: string;
}

export type SseStatus = "idle" | "connecting" | "connected" | "disconnected";

// Lifecycle transitions tracked client-side for status derivation.
// Present is a discovery event, not a transition — excluded from this union.
export type TransitionAction = Exclude<AircraftAction, "present">;

export type AircraftStatus =
  | "em-voo"
  | "pousado"
  | "decolando"
  | "recem-pousado"
  | "recem-decolado";

export interface ActiveAircraft {
  // event is the raw backend envelope plus a client-stamped _receivedAt.
  event: AircraftEvent & { _receivedAt: number };
  lastTransitionAt: number | null;
  lastTransitionAction: TransitionAction | null;
}

export interface AirspaceMetrics {
  active: number;
  takeoffs: number;
  landings: number;
  recentEvents: number;
}
