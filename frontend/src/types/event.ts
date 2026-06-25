// Types mirror the backend Serialize impl in airspace-pulse/src/event.rs
// and model.rs. Do not invent fields.

export type AircraftAction = "entered" | "left" | "landed" | "took_off";

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
}

export type SseStatus = "idle" | "connecting" | "connected" | "disconnected";

export interface BoundingBox {
  lamin: number;
  lamax: number;
  lomin: number;
  lomax: number;
}

export interface CityResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  name: string;
  addresstype: string;
  boundingbox: [string, string, string, string];
}
