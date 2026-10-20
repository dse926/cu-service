import { Badge } from "@/components/ui/badge";
import { statusLabel } from "@/lib/labels";
import type { Priority, TicketStatus, TicketType } from "@/lib/types";
import { cn } from "@/lib/utils";

const statusTone: Record<string, string> = {
  new: "bg-sky-100 text-sky-900 border-sky-200",
  assigned: "bg-slate-100 text-slate-800 border-slate-200",
  in_progress: "bg-amber-100 text-amber-950 border-amber-200",
  pending_user: "bg-orange-100 text-orange-950 border-orange-200",
  resolved: "bg-emerald-100 text-emerald-900 border-emerald-200",
  closed: "bg-zinc-100 text-zinc-700 border-zinc-200",
  draft: "bg-zinc-100 text-zinc-700 border-zinc-200",
  submitted: "bg-sky-100 text-sky-900 border-sky-200",
  cab_review: "bg-violet-100 text-violet-950 border-violet-200",
  approved: "bg-teal-100 text-teal-950 border-teal-200",
  scheduled: "bg-cyan-100 text-cyan-950 border-cyan-200",
  implementing: "bg-amber-100 text-amber-950 border-amber-200",
  completed: "bg-emerald-100 text-emerald-900 border-emerald-200",
  rejected: "bg-rose-100 text-rose-950 border-rose-200",
  rolled_back: "bg-rose-100 text-rose-950 border-rose-200",
};

const priorityTone: Record<Priority, string> = {
  low: "bg-transparent text-muted-foreground border-border",
  medium: "bg-slate-50 text-slate-800 border-slate-200",
  high: "bg-orange-50 text-orange-900 border-orange-200",
  critical: "bg-rose-50 text-rose-900 border-rose-200",
};

export function StatusBadge({ status }: { status: TicketStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn("rounded-md font-medium", statusTone[status])}
    >
      {statusLabel(status)}
    </Badge>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <Badge
      variant="outline"
      className={cn("rounded-md capitalize", priorityTone[priority])}
    >
      {priority}
    </Badge>
  );
}

export function TypeBadge({ type }: { type: TicketType }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-md",
        type === "change_request"
          ? "border-[#1a4a5c]/25 bg-[#1a4a5c]/8 text-[#143a48]"
          : "border-[#2f5d4a]/25 bg-[#2f5d4a]/8 text-[#1f3d32]"
      )}
    >
      {type === "change_request" ? "Change" : "Help Desk"}
    </Badge>
  );
}
