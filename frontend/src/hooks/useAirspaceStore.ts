import { useEffect, useState, useSyncExternalStore } from "react";
import type {
  ActiveAircraft,
  AircraftEvent,
  AirspaceMetrics,
  SseStatus,
  TransitionAction,
} from "@/types/event";

const MAX_RECENT_EVENTS = 100;
const RECENT_WINDOW_MS = 60_000;

// Self-healing reconnect — native EventSource auto-retry is unreliable across
// proxies and process restarts. We close explicitly and try again with capped
// exponential backoff.
const RECONNECT_BASE_MS = 1_000;
const RECONNECT_MAX_MS = 30_000;

export type ReceivedEvent = AircraftEvent & { _receivedAt: number };

export interface UseAirspaceStoreResult {
  status: SseStatus;
  lastError: string | null;
  aircraft: ActiveAircraft[];
  metrics: AirspaceMetrics;
  recentEvents: ReceivedEvent[];
}

// Single active connection — always `/v1/events`, no query params.
//
// External subscription (EventSource) is exposed via useSyncExternalStore so we
// never trigger "setState in effect". The store mutates internally and lets
// React read immutable snapshots via subscriptions.
export function useAirspaceStore(): UseAirspaceStoreResult {
  const [store] = useState(() => new AirspaceStore());

  const status = useSyncExternalStore(store.subscribe, store.getStatus, store.getStatusServer);
  const lastError = useSyncExternalStore(store.subscribe, store.getLastError, store.getLastErrorServer);
  const aircraft = useSyncExternalStore(store.subscribe, store.getAircraft, store.getAircraftServer);
  const metrics = useSyncExternalStore(store.subscribe, store.getMetrics, store.getMetricsServer);
  const recentEvents = useSyncExternalStore(store.subscribe, store.getRecentEvents, store.getRecentEventsServer);

  useEffect(() => {
    store.connect();
    return () => {
      store.disconnect();
    };
  }, [store]);

  return { status, lastError, aircraft, metrics, recentEvents };
}

type Listener = () => void;

class AirspaceStore {
  private source: EventSource | null = null;
  private status: SseStatus = "idle";
  private lastError: string | null = null;
  private aircraftMap = new Map<string, ActiveAircraft>();
  private aircraftSnapshot: ActiveAircraft[] = [];
  private takeoffs = 0;
  private landings = 0;
  private recentEvents: ReceivedEvent[] = [];
  private recentTimestamps: number[] = [];
  private metricsSnapshot: AirspaceMetrics = { active: 0, takeoffs: 0, landings: 0, recentEvents: 0 };
  private listeners = new Set<Listener>();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private intentionallyClosed = false;

  // --- React bindings ---
  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  getStatus = (): SseStatus => this.status;
  getStatusServer = (): SseStatus => "idle";
  getLastError = (): string | null => this.lastError;
  getLastErrorServer = (): string | null => null;
  getAircraft = (): ActiveAircraft[] => this.aircraftSnapshot;
  getAircraftServer = (): ActiveAircraft[] => [];
  getMetrics = (): AirspaceMetrics => this.metricsSnapshot;
  getMetricsServer = (): AirspaceMetrics => ({ active: 0, takeoffs: 0, landings: 0, recentEvents: 0 });
  getRecentEvents = (): ReceivedEvent[] => this.recentEvents;
  getRecentEventsServer = (): ReceivedEvent[] => [];

  private emit() {
    for (const l of this.listeners) l();
  }

  // --- Connection lifecycle ---
  connect() {
    // If we're reconnecting after an error, source is already null and the
    // intentionallyClosed flag is false. If we're mounting fresh after an
    // unmount, intentionallyClosed may be true from the prior disconnect —
    // clear it so the new mount can connect.
    this.intentionallyClosed = false;
    if (this.source) return;
    this.status = "connecting";
    this.lastError = null;
    this.emit();

    const source = new EventSource("/v1/events");
    this.source = source;

    source.onopen = () => {
      this.reconnectAttempts = 0;
      this.status = "connected";
      this.lastError = null;
      this.emit();
    };
    source.onerror = () => {
      // EventSource fires onerror on transient hiccups too; we close and
      // schedule our own retry so we control the cadence and can detect
      // permanent process restarts.
      this.detachSource();
      this.status = "disconnected";
      this.lastError = "Conexão perdida. Reconectando…";
      this.emit();
      this.scheduleReconnect();
    };
    source.onmessage = (ev: MessageEvent<string>) => {
      if (ev.data === "heartbeat" || ev.data.length === 0) return;
      try {
        const parsed = JSON.parse(ev.data) as AircraftEvent;
        this.ingest(parsed);
      } catch {
        // ignore malformed payload — keep status unchanged
      }
    };
  }

  private detachSource() {
    if (!this.source) return;
    // Strip handlers so the close() doesn't re-enter onerror.
    this.source.onopen = null;
    this.source.onerror = null;
    this.source.onmessage = null;
    this.source.close();
    this.source = null;
  }

  private scheduleReconnect() {
    if (this.intentionallyClosed) return;
    if (this.reconnectTimer !== null) return;
    const delay = Math.min(
      RECONNECT_BASE_MS * 2 ** this.reconnectAttempts,
      RECONNECT_MAX_MS,
    );
    this.reconnectAttempts += 1;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  disconnect() {
    this.intentionallyClosed = true;
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.detachSource();
    this.status = "idle";
    this.lastError = null;
    this.aircraftMap.clear();
    this.aircraftSnapshot = [];
    this.recentEvents = [];
    this.recentTimestamps = [];
    this.takeoffs = 0;
    this.landings = 0;
    this.reconnectAttempts = 0;
    this.emit();
  }

  // --- Event ingestion (the heart of the convergence model) ---
  private ingest(event: AircraftEvent) {
    const now = Date.now();
    const stamped: ReceivedEvent = { ...event, _receivedAt: now };
    let mapMutated = false;
    let timelineMutated = false;

    switch (event.action) {
      case "present": {
        // Discovery event. Aircraft move on every iteration, so coordinates
        // (and the reverse-geocoded address) change constantly — always
        // refresh the envelope to keep the card live. Present is not a
        // transition, so preserve prior transition state when known.
        const existing = this.aircraftMap.get(event.icao24);
        this.aircraftMap.set(event.icao24, {
          event: stamped,
          lastTransitionAt: existing?.lastTransitionAt ?? null,
          lastTransitionAction: existing?.lastTransitionAction ?? null,
        });
        mapMutated = true;
        // Present events are intentionally excluded from the timeline.
        break;
      }
      case "entered": {
        // Discovery + visibility. If we already know this aircraft, do not
        // touch the map — Entered is not a transition. The timeline still
        // records the event.
        if (!this.aircraftMap.has(event.icao24)) {
          this.aircraftMap.set(event.icao24, {
            event: stamped,
            lastTransitionAt: null,
            lastTransitionAction: null,
          });
          mapMutated = true;
        }
        timelineMutated = this.pushRecent(stamped);
        break;
      }
      case "left": {
        if (this.aircraftMap.delete(event.icao24)) mapMutated = true;
        timelineMutated = this.pushRecent(stamped);
        break;
      }
      case "landed": {
        this.aircraftMap.set(event.icao24, {
          event: stamped,
          lastTransitionAt: now,
          lastTransitionAction: "landed" as TransitionAction,
        });
        this.landings += 1;
        mapMutated = true;
        timelineMutated = this.pushRecent(stamped);
        break;
      }
      case "took_off": {
        this.aircraftMap.set(event.icao24, {
          event: stamped,
          lastTransitionAt: now,
          lastTransitionAction: "took_off" as TransitionAction,
        });
        this.takeoffs += 1;
        mapMutated = true;
        timelineMutated = this.pushRecent(stamped);
        break;
      }
      case "changed_address": {
        // Aircraft moved into a new reverse-geocoded cell. Update the envelope
        // (fresh coordinates + new address) and record as a transition so the
        // status pill reflects recent activity. Always pushed to the timeline
        // — these are meaningful, infrequent events worth surfacing.
        this.aircraftMap.set(event.icao24, {
          event: stamped,
          lastTransitionAt: now,
          lastTransitionAction: "changed_address" as TransitionAction,
        });
        mapMutated = true;
        timelineMutated = this.pushRecent(stamped);
        break;
      }
      default:
        // Unknown action — ignore defensively.
        return;
    }

    if (!mapMutated && !timelineMutated) return;
    if (mapMutated) this.rebuildSnapshots(now);
    else this.rebuildMetricsOnly(now);
    this.emit();
  }

  private pushRecent(event: ReceivedEvent): boolean {
    this.recentEvents = [event, ...this.recentEvents].slice(0, MAX_RECENT_EVENTS);
    this.recentTimestamps.push(event._receivedAt);
    return true;
  }

  private rebuildMetricsOnly(now: number) {
    const cutoff = now - RECENT_WINDOW_MS;
    while (this.recentTimestamps.length > 0 && this.recentTimestamps[0] < cutoff) {
      this.recentTimestamps.shift();
    }
    this.metricsSnapshot = {
      active: this.aircraftMap.size,
      takeoffs: this.takeoffs,
      landings: this.landings,
      recentEvents: this.recentTimestamps.length,
    };
  }

  private rebuildSnapshots(now: number) {
    // Array view sorted by callsign (empty callsigns last) then icao24 for stable display.
    const list = Array.from(this.aircraftMap.values());
    list.sort((a, b) => {
      const ca = a.event.callsign.trim();
      const cb = b.event.callsign.trim();
      if (ca && cb) return ca.localeCompare(cb);
      if (ca) return -1;
      if (cb) return 1;
      return a.event.icao24.localeCompare(b.event.icao24);
    });
    this.aircraftSnapshot = list;

    // Slide the recent-event window.
    const cutoff = now - RECENT_WINDOW_MS;
    while (this.recentTimestamps.length > 0 && this.recentTimestamps[0] < cutoff) {
      this.recentTimestamps.shift();
    }
    this.metricsSnapshot = {
      active: this.aircraftMap.size,
      takeoffs: this.takeoffs,
      landings: this.landings,
      recentEvents: this.recentTimestamps.length,
    };
  }
}
