import { Plane, Radar, Terminal, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDevMode } from "@/hooks/useDevMode";
import type { SseStatus } from "@/types/event";
import { cn } from "@/lib/utils";

interface HeaderProps {
  status: SseStatus;
}

const STATUS_META: Record<
  SseStatus,
  { label: string; variant: "success" | "warning" | "destructive" | "secondary"; pulse: boolean }
> = {
  idle: { label: "Inativo", variant: "secondary", pulse: false },
  connected: { label: "Conectado", variant: "success", pulse: true },
  connecting: { label: "Conectando", variant: "warning", pulse: true },
  disconnected: { label: "Desconectado", variant: "destructive", pulse: false },
};

export function Header({ status }: HeaderProps) {
  const meta = STATUS_META[status];
  const { devMode, toggle } = useDevMode();
  return (
    <header className="sticky top-0 z-40 h-[72px] border-b border-border bg-background/80 backdrop-blur-md">
      <div className="flex h-full items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="relative flex h-10 w-10 items-center justify-center rounded-xl text-primary-foreground shadow-sm"
            style={{
              background:
                "linear-gradient(135deg, hsl(var(--brand-sky)) 0%, hsl(var(--brand-serra)) 100%)",
            }}
          >
            <Radar className="absolute h-5 w-5 opacity-40" />
            <Plane className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-base font-bold leading-tight sm:text-lg">
              Airspace Pulse
            </h1>
            <p className="truncate text-[11px] text-muted-foreground sm:text-xs">
              Atividade aérea em tempo real
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={devMode ? "default" : "outline"}
            size="sm"
            onClick={toggle}
            className="gap-1.5"
            aria-pressed={devMode}
            title={devMode ? "Modo Dev ativo — exibindo payload bruto e campos técnicos" : "Ative o Modo Dev para ver payloads brutos e campos técnicos"}
          >
            {devMode ? <Terminal className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">Modo Dev</span>
          </Button>
          <Badge variant={meta.variant} className="gap-2 px-3 py-1 text-xs">
            <span
              className={cn(
                "h-2 w-2 rounded-full bg-current",
                meta.pulse && "animate-pulse-soft",
              )}
            />
            {meta.label}
          </Badge>
        </div>
      </div>
    </header>
  );
}
