import { MapPin, ArrowRight, Building2, Ruler } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CityResult } from "@/types/event";
import { bboxFromCity, bboxDimensionsKm, extractState } from "@/lib/bbox";
import { useDevMode } from "@/hooks/useDevMode";
import { cn } from "@/lib/utils";

interface CityCardProps {
  city: CityResult;
  onSelect: (city: CityResult) => void;
  compact?: boolean;
}

const TYPE_LABEL: Record<string, string> = {
  city: "City",
  municipality: "Municipality",
  town: "Town",
};

export function CityCard({ city, onSelect, compact }: CityCardProps) {
  const bbox = bboxFromCity(city);
  const { widthKm, heightKm } = bboxDimensionsKm(bbox);
  const state = extractState(city.display_name);
  const typeLabel = TYPE_LABEL[city.addresstype] ?? city.addresstype;
  const { devMode } = useDevMode();

  return (
    <motion.button
      type="button"
      onClick={() => onSelect(city)}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="group block w-full text-left"
    >
      <Card
        className={cn(
          "relative overflow-hidden transition-colors hover:border-primary/50 hover:shadow-md",
          compact ? "p-4" : "p-5",
        )}
      >
        <div className="absolute inset-y-0 left-0 w-1 bg-primary/0 transition-colors group-hover:bg-primary" />
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-primary" />
              <h3 className="truncate text-xl font-semibold">{city.name}</h3>
              <Badge variant="outline" className="ml-1 gap-1 px-2 py-0 text-[10px] uppercase tracking-wide text-muted-foreground">
                <Building2 className="h-3 w-3" />
                {typeLabel}
              </Badge>
            </div>
            <p className="truncate text-sm text-muted-foreground">
              {state ? `${state}, Brasil` : "Brasil"}
            </p>
            {devMode && (
              <p className="truncate text-[11px] text-muted-foreground/70">
                {city.display_name}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Ruler className="h-3 w-3" />
              <span>
                {Math.round(widthKm)} km × {Math.round(heightKm)} km
              </span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="opacity-0 transition-opacity group-hover:opacity-100"
              tabIndex={-1}
            >
              Select
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.button>
  );
}
