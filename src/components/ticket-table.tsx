import Link from "next/link";
import { PriorityBadge, StatusBadge, TypeBadge } from "@/components/status-badge";
import { categoryLabels, changeTypeLabels } from "@/lib/labels";
import type { Ticket } from "@/lib/types";
import { cn } from "@/lib/utils";

function formatWhen(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function TicketTable({ tickets }: { tickets: Ticket[] }) {
  if (tickets.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[#1a4a5c]/20 bg-white/60 px-6 py-16 text-center animate-in fade-in duration-500">
        <p className="font-[family-name:var(--font-display)] text-xl text-[#143a48]">
          No tickets in this queue
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Open a help desk request or submit a change for CAB review.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[#1a4a5c]/12 bg-white/85 shadow-[0_1px_0_rgba(26,74,92,0.04)] animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="hidden grid-cols-[7rem_1fr_7rem_7rem_8rem_7rem] gap-3 border-b border-[#1a4a5c]/10 bg-[#1a4a5c]/[0.03] px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-[#1a4a5c]/65 md:grid">
        <span>Number</span>
        <span>Request</span>
        <span>Type</span>
        <span>Priority</span>
        <span>Status</span>
        <span>Updated</span>
      </div>
      <ul className="divide-y divide-[#1a4a5c]/8">
        {tickets.map((ticket, index) => (
          <li
            key={ticket.id}
            className={cn(
              "transition-colors duration-200 hover:bg-[#1a4a5c]/[0.03]",
              "animate-in fade-in slide-in-from-bottom-1 fill-mode-both"
            )}
            style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
          >
            <Link
              href={`/tickets/${ticket.id}`}
              className="grid gap-2 px-4 py-3.5 md:grid-cols-[7rem_1fr_7rem_7rem_8rem_7rem] md:items-center md:gap-3"
            >
              <span className="font-mono text-sm font-medium text-[#1a4a5c]">
                {ticket.number}
              </span>
              <span className="min-w-0">
                <span className="block truncate font-medium text-[#143a48]">
                  {ticket.title}
                </span>
                <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                  {ticket.requester.name}
                  {ticket.type === "help_desk" && ticket.category
                    ? ` · ${categoryLabels[ticket.category]}`
                    : null}
                  {ticket.type === "change_request" && ticket.changeType
                    ? ` · ${changeTypeLabels[ticket.changeType]}`
                    : null}
                </span>
              </span>
              <span>
                <TypeBadge type={ticket.type} />
              </span>
              <span>
                <PriorityBadge priority={ticket.priority} />
              </span>
              <span>
                <StatusBadge status={ticket.status} />
              </span>
              <span className="text-sm text-muted-foreground">
                {formatWhen(ticket.updatedAt)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
