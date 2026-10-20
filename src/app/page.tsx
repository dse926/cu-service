import { Suspense } from "react";
import { AppShell } from "@/components/app-shell";
import { NewTicketButtons } from "@/components/new-ticket-buttons";
import { TicketFilters } from "@/components/ticket-filters";
import { TicketTable } from "@/components/ticket-table";
import { ORG } from "@/lib/labels";
import { getQueueStats, listTickets } from "@/lib/tickets-store";
import type { Ticket } from "@/lib/types";

function filterTickets(tickets: Ticket[], view: string | undefined): Ticket[] {
  const openHelp = (t: Ticket) =>
    t.type === "help_desk" && !["resolved", "closed"].includes(t.status);
  const openChange = (t: Ticket) =>
    t.type === "change_request" &&
    !["completed", "rejected", "rolled_back"].includes(t.status);

  switch (view) {
    case "help_desk":
      return tickets.filter(openHelp);
    case "change_request":
      return tickets.filter(openChange);
    case "cab":
      return tickets.filter(
        (t) =>
          t.type === "change_request" &&
          ["submitted", "cab_review"].includes(t.status)
      );
    case "critical":
      return tickets.filter(
        (t) =>
          t.priority === "critical" &&
          (openHelp(t) || openChange(t))
      );
    default:
      return tickets.filter((t) => openHelp(t) || openChange(t));
  }
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view } = await searchParams;
  const stats = getQueueStats();
  const tickets = filterTickets(listTickets(), view);

  return (
    <AppShell actions={<NewTicketButtons />}>
      <div className="space-y-6">
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <p className="text-sm font-medium tracking-wide text-[#1a4a5c]/75 uppercase">
            {ORG.product}
          </p>
          <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl tracking-tight text-[#143a48] sm:text-4xl">
            Operations queue
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[#5a6f78] sm:text-base">
            {ORG.tagline}. Start with help desk requests and change management —
            CAB review, scheduling, and resolution in one place.
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4 animate-in fade-in duration-700 delay-100 fill-mode-both">
          {[
            { label: "Open help desk", value: stats.openHelpDesk },
            { label: "Open changes", value: stats.openChanges },
            { label: "CAB pending", value: stats.cabPending },
            { label: "Critical", value: stats.critical },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-[#1a4a5c]/10 bg-white/70 px-4 py-3"
            >
              <dt className="text-xs text-muted-foreground">{item.label}</dt>
              <dd className="mt-1 font-[family-name:var(--font-display)] text-2xl text-[#143a48]">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>

        <Suspense
          fallback={
            <div className="h-9 w-full max-w-md animate-pulse rounded-md bg-white/60" />
          }
        >
          <TicketFilters />
        </Suspense>

        <TicketTable tickets={tickets} />
      </div>
    </AppShell>
  );
}
