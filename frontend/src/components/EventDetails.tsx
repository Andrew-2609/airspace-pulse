import { motion } from "framer-motion";
import {
  Plane,
  PlaneTakeoff,
  PlaneLanding,
  LogOut,
  Clock,
  Tag,
  Compass,
  type LucideIcon,
} from "lucide-react";
import type { ReceivedEvent } from "@/hooks/useEventStream";
import { EVENT_META, ACCENT_CLASSES } from "@/lib/event-meta";
import { friendlyTitle, friendlySubtitle, friendlyCategory } from "@/lib/event-display";
import { Card } from "@/components/ui/card";
import { useDevMode } from "@/hooks/useDevMode";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface EventDetailsProps {
  event: ReceivedEvent;
}

export function EventDetails({ event }: EventDetailsProps) {
  const meta = EVENT_META[event.action];
  const accent = ACCENT_CLASSES[meta.accent];
  const callsign = event.callsign?.trim();
  const { devMode } = useDevMode();

  const SummaryIcon: LucideIcon = meta.Icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 36 }}
      className="space-y-4"
    >
      <Card className="overflow-hidden">
        <div className={cn("flex items-center gap-3 p-4", accent.bg)}>
          <div className={cn("flex h-11 w-11 items-center justify-center rounded-md bg-card", accent.text)}>
            <SummaryIcon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold">
              {friendlyTitle(event.action, callsign)}
            </p>
            <p className="text-xs text-muted-foreground">{friendlySubtitle(event.action)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-px bg-border sm:grid-cols-2">
          <FriendlyRow icon={Clock} label="When">
            <span className="tabular-nums">{format(event._receivedAt, "HH:mm:ss")}</span>
          </FriendlyRow>
          <FriendlyRow icon={Tag} label="Flight">
            {callsign ? <span className="font-mono">{callsign}</span> : <span className="text-muted-foreground">Unknown</span>}
          </FriendlyRow>
          <FriendlyRow icon={Plane} label="Aircraft type">
            {friendlyCategory(event.category)}
          </FriendlyRow>
          <FriendlyRow icon={Compass} label="Position">
            <span className="font-mono text-xs tabular-nums">
              {event.latitude.toFixed(4)}°, {event.longitude.toFixed(4)}°
            </span>
          </FriendlyRow>
        </div>
      </Card>

      <WhatHappenedCard action={event.action} Icon={SummaryIcon} />

      {devMode && <DevDetails event={event} />}
    </motion.div>
  );
}

function FriendlyRow({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5 bg-card p-3">
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
        <div className="mt-0.5 text-sm">{children}</div>
      </div>
    </div>
  );
}

function WhatHappenedCard({
  action,
  Icon,
}: {
  action: ReceivedEvent["action"];
  Icon: LucideIcon;
}) {
  const copy: Record<ReceivedEvent["action"], string> = {
    entered: "This aircraft just appeared inside the area you're monitoring. It may have taken off from a nearby airport or crossed into the bounding box from outside.",
    left: "This aircraft has flown out of the monitored area. It may still be airborne elsewhere — just no longer inside your zone.",
    landed: "This aircraft was airborne and has just touched down on the ground inside the monitored area.",
    took_off: "This aircraft was on the ground and has just lifted off — it's now airborne inside the monitored area.",
  };
  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">What happened</p>
          <p className="mt-1 text-sm leading-relaxed text-foreground/90">{copy[action]}</p>
        </div>
      </div>
    </Card>
  );
}

function DevDetails({ event }: { event: ReceivedEvent }) {
  const meta = EVENT_META[event.action];
  const accent = ACCENT_CLASSES[meta.accent];
  void accent;

  const { _receivedAt: _, ...payload } = event;
  void _;

  return (
    <>
      <Card className="overflow-hidden">
        <header className="border-b border-border bg-muted/40 px-4 py-2.5">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <PlaneTakeoff className="h-3.5 w-3.5" />
            Technical details
          </p>
        </header>
        <div className="grid grid-cols-2 gap-px bg-border">
          <DevRow label="action" value={event.action} mono />
          <DevRow label="icao24" value={event.icao24} mono />
          <DevRow label="callsign" value={event.callsign || "—"} mono />
          <DevRow label="category" value={String(event.category)} mono />
          <DevRow label="latitude" value={event.latitude.toString()} mono />
          <DevRow label="longitude" value={event.longitude.toString()} mono />
        </div>
      </Card>

      <Card className="overflow-hidden">
        <header className="border-b border-border bg-muted/40 px-4 py-2.5">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <PlaneLanding className="h-3.5 w-3.5" />
            Raw event payload
          </p>
        </header>
        <pre className="max-h-[40vh] overflow-auto scrollbar-thin p-4 font-mono text-[12px] leading-relaxed text-foreground/90">
{JSON.stringify(payload, null, 2)}
        </pre>
      </Card>

      <div className="rounded-md border border-dashed border-border bg-muted/20 p-3 text-[11px] text-muted-foreground">
        <p className="flex items-center gap-1.5 font-medium uppercase tracking-wide">
          <LogOut className="h-3 w-3" />
          Dev Mode
        </p>
        <p className="mt-1">You're seeing internal event fields and the raw JSON payload because Dev Mode is on. Toggle it off from the header.</p>
      </div>
    </>
  );
}

function DevRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="bg-card p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className={cn("mt-0.5 text-sm", mono && "font-mono")}>{value}</div>
    </div>
  );
}
