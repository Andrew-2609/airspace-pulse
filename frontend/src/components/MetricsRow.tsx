import { motion } from "framer-motion";
import { Plane, PlaneTakeoff, PlaneLanding, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { AirspaceMetrics } from "@/types/event";
import { ACCENT_CLASSES, type AccentKey } from "@/lib/event-meta";
import { cn } from "@/lib/utils";

interface MetricsRowProps {
  metrics: AirspaceMetrics;
}

interface MetricSpec {
  key: keyof AirspaceMetrics;
  label: string;
  Icon: LucideIcon;
  accent: AccentKey;
}

const SPECS: MetricSpec[] = [
  { key: "active", label: "Aeronaves Ativas", Icon: Plane, accent: "primary" },
  { key: "takeoffs", label: "Decolagens", Icon: PlaneTakeoff, accent: "warning" },
  { key: "landings", label: "Pousos", Icon: PlaneLanding, accent: "success" },
];

export function MetricsRow({ metrics }: MetricsRowProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {SPECS.map((spec, i) => (
        <MetricCard key={spec.key} spec={spec} value={metrics[spec.key]} index={i} />
      ))}
    </div>
  );
}

function MetricCard({ spec, value, index }: { spec: MetricSpec; value: number; index: number }) {
  const accent = ACCENT_CLASSES[spec.accent];
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 320, damping: 28, delay: index * 0.04 }}
    >
      <Card className="relative overflow-hidden p-4">
        <div className={cn("absolute inset-y-0 left-0 w-1", accent.dot)} />
        <div className="flex items-center gap-3 pl-2">
          <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-md", accent.bg, accent.text)}>
            <spec.Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {spec.label}
            </p>
            <p className="mt-0.5 text-2xl font-bold tabular-nums leading-none">{value}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
