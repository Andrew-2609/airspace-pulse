import { MapPin, Radar, ArrowLeft, Ruler, Compass, Globe2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CityResult, SseStatus } from "@/types/event";
import { bboxFromCity, bboxDimensionsKm, extractState } from "@/lib/bbox";
import { useDevMode } from "@/hooks/useDevMode";
import { cn } from "@/lib/utils";

interface SelectedCityCardProps {
  city: CityResult;
  status: SseStatus;
  onClear: () => void;
}

const STATUS_META: Record<SseStatus, { label: string; variant: "success" | "warning" | "destructive" | "secondary" }> = {
  connected: { label: "Connected", variant: "success" },
  connecting: { label: "Connecting", variant: "warning" },
  disconnected: { label: "Disconnected", variant: "destructive" },
  idle: { label: "Idle", variant: "secondary" },
};

export function SelectedCityCard({ city, status, onClear }: SelectedCityCardProps) {
  const { widthKm, heightKm } = bboxDimensionsKm(bboxFromCity(city));
  const state = extractState(city.display_name);
  const meta = STATUS_META[status];
  const { devMode } = useDevMode();

  return (
    <Card className="relative overflow-hidden p-6">
      <div className="absolute inset-x-0 top-0 h-1 bg-primary" />

      <Button
        variant="ghost"
        size="sm"
        onClick={onClear}
        className="mb-4 -ml-2 gap-1.5 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Change city
      </Button>

      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Radar className="h-7 w-7" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-5 w-5 shrink-0 text-primary" />
            <h2 className="text-2xl font-bold leading-tight sm:text-3xl">
              {city.name}
            </h2>
          </div>
          <p className="mt-1 text-sm font-medium text-muted-foreground">
            Monitoring airspace
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground/80">
            {state ? `${state}, Brasil` : "Brasil"}
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <Row icon={Ruler} label="Coverage area">
          <span className="font-semibold tabular-nums">
            {Math.round(widthKm)} km × {Math.round(heightKm)} km
          </span>
        </Row>
        <Row icon={Compass} label="Center coordinates">
          <span className="font-mono text-sm tabular-nums">
            {Number(city.lat).toFixed(4)}°, {Number(city.lon).toFixed(4)}°
          </span>
        </Row>
        <div className="flex items-center gap-3 rounded-lg border border-border/70 bg-muted/30 p-3">
          <Globe2 className="h-4 w-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Status
            </p>
          </div>
          <Badge variant={meta.variant} className="gap-1.5">
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full bg-current",
                status === "connected" && "animate-pulse-soft",
              )}
            />
            {meta.label}
          </Badge>
        </div>
      </div>

      {devMode && (
        <div className="mt-4 rounded-md border border-dashed border-border bg-muted/20 p-3">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Display name (raw)
          </p>
          <p className="text-xs leading-relaxed text-foreground/80 break-words">
            {city.display_name}
          </p>
        </div>
      )}
    </Card>
  );
}

function Row({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/70 bg-muted/30 p-3">
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <div className="mt-0.5 text-sm text-foreground">{children}</div>
      </div>
    </div>
  );
}
