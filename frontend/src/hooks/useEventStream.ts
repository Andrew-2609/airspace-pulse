import { useEffect, useState, useSyncExternalStore } from "react";
import type { AircraftEvent, BoundingBox, SseStatus } from "@/types/event";

const MAX_EVENTS = 100;

export type ReceivedEvent = AircraftEvent & { _receivedAt: number };

export interface UseEventStreamResult {
  status: SseStatus;
  events: ReceivedEvent[];
  lastError: string | null;
}

// Single active connection. Pass null bbox to close.
//
// The EventSource is an external subscription, so we expose its state (status,
// events, lastError) through useSyncExternalStore. That avoids "setState in effect"
// — the store mutates internally and lets React read snapshots via subscriptions,
// which is the canonical React 18 pattern for external sources.
export function useEventStream(bbox: BoundingBox | null): UseEventStreamResult {
  // Lazy-init the store with useState so we get a stable instance per-mount without
  // touching a ref during render (which the react-hooks/refs rule forbids).
  const [store] = useState<EventSourceStore>(() => new EventSourceStore());

  const status = useSyncExternalStore(store.subscribe, store.getStatus, store.getStatusServer);
  const lastError = useSyncExternalStore(store.subscribe, store.getLastError, store.getLastErrorServer);
  const events = useSyncExternalStore(store.subscribe, store.getEvents, store.getEventsServer);

  useEffect(() => {
    store.setBbox(bbox);
    return () => {
      store.setBbox(null);
    };
  }, [store, bbox]);

  return { status, events, lastError };
}

type Listener = () => void;

class EventSourceStore {
  private bbox: BoundingBox | null = null;
  private source: EventSource | null = null;
  private status: SseStatus = "idle";
  private lastError: string | null = null;
  private events: ReceivedEvent[] = [];
  private listeners = new Set<Listener>();

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
  getEvents = (): ReceivedEvent[] => this.events;
  getEventsServer = (): ReceivedEvent[] => [];

  private emit() {
    for (const l of this.listeners) l();
  }

  // --- EventSource lifecycle ---
  setBbox(bbox: BoundingBox | null) {
    if (sameBbox(this.bbox, bbox)) return;
    this.bbox = bbox;
    this.detach();

    if (!bbox) {
      this.status = "idle";
      this.lastError = null;
      this.events = [];
      this.emit();
      return;
    }

    this.status = "connecting";
    this.lastError = null;
    this.events = [];
    this.emit();

    const params = new URLSearchParams({
      lamin: String(bbox.lamin),
      lamax: String(bbox.lamax),
      lomin: String(bbox.lomin),
      lomax: String(bbox.lomax),
    });
    const url = `/v1/events?${params.toString()}`;
    const source = new EventSource(url);
    this.source = source;

    source.onopen = () => {
      this.status = "connected";
      this.emit();
    };
    source.onerror = () => {
      this.status = "disconnected";
      this.lastError = "Connection lost. Reconnecting…";
      this.emit();
    };
    source.onmessage = (ev: MessageEvent<string>) => {
      if (ev.data === "heartbeat" || ev.data.length === 0) return;
      try {
        const parsed = JSON.parse(ev.data) as AircraftEvent;
        const stamped: ReceivedEvent = { ...parsed, _receivedAt: Date.now() } as ReceivedEvent;
        this.events = [stamped, ...this.events].slice(0, MAX_EVENTS);
        this.emit();
      } catch {
        // ignore malformed payload — keep status unchanged
      }
    };
  }

  private detach() {
    if (!this.source) return;
    this.source.close();
    this.source = null;
  }
}

function sameBbox(a: BoundingBox | null, b: BoundingBox | null): boolean {
  if (a === null || b === null) return a === b;
  return (
    a.lamin === b.lamin &&
    a.lamax === b.lamax &&
    a.lomin === b.lomin &&
    a.lomax === b.lomax
  );
}
