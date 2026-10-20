"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { NewTicketButtons } from "@/components/new-ticket-buttons";
import { TicketFilters } from "@/components/ticket-filters";
import { TicketTable } from "@/components/ticket-table";
import { useTicketStore } from "@/components/ticket-store";
import { Button } from "@/components/ui/button";
import { ORG } from "@/lib/labels";
import { filterTickets, getQueueStats } from "@/lib/tickets-logic";

function QueueContent() {
  const searchParams = useSearchParams();
  const view = searchParams.get("view") ?? undefined;
  const { tickets, ready, resetDemo } = useTicketStore();
  const visible = filterTickets(tickets, view);
  const stats = getQueueStats(tickets);

  return (
    <AppShell
      actions={
        <>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={resetDemo}
          >
            Reset demo
          </Button>
          <NewTicketButtons />
        </>
      }
    >
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
                {ready ? item.value : "—"}
              </dd>
            </div>
          ))}
        </dl>

        <TicketFilters />

        {ready ? (
          <TicketTable tickets={visible} />
        ) : (
          <div className="h-40 animate-pulse rounded-xl bg-white/60" />
        )}
      </div>
    </AppShell>
  );
}

export function QueuePage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-muted-foreground">
          Loading queue…
        </div>
      }
    >
      <QueueContent />
    </Suspense>
  );
}
