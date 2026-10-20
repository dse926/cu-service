import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import {
  PriorityBadge,
  StatusBadge,
  TypeBadge,
} from "@/components/status-badge";
import { TicketActions } from "@/components/ticket-actions";
import { buttonVariants } from "@/components/ui/button";
import {
  categoryLabels,
  changeTypeLabels,
  riskLabels,
} from "@/lib/labels";
import { getTicket } from "@/lib/tickets-store";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function TicketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ticket = getTicket(id);
  if (!ticket) notFound();

  return (
    <AppShell
      actions={
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "border-[#1a4a5c]/20 bg-white/80"
          )}
        >
          <ArrowLeft data-icon="inline-start" />
          Queue
        </Link>
      }
    >
      <article className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <header className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-semibold text-[#1a4a5c]">
              {ticket.number}
            </span>
            <TypeBadge type={ticket.type} />
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-[#143a48] sm:text-4xl">
            {ticket.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            Opened {formatWhen(ticket.createdAt)} · Updated{" "}
            {formatWhen(ticket.updatedAt)}
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
          <div className="space-y-6">
            <section className="rounded-xl border border-[#1a4a5c]/12 bg-white/85 p-5">
              <h2 className="font-[family-name:var(--font-display)] text-lg text-[#143a48]">
                Description
              </h2>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[#143a48]/90">
                {ticket.description}
              </p>
            </section>

            {ticket.type === "change_request" ? (
              <>
                <section className="rounded-xl border border-[#1a4a5c]/12 bg-white/85 p-5 space-y-4">
                  <h2 className="font-[family-name:var(--font-display)] text-lg text-[#143a48]">
                    Change details
                  </h2>
                  <dl className="grid gap-3 sm:grid-cols-2 text-sm">
                    <div>
                      <dt className="text-muted-foreground">Type</dt>
                      <dd className="font-medium">
                        {ticket.changeType
                          ? changeTypeLabels[ticket.changeType]
                          : "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Risk</dt>
                      <dd className="font-medium">
                        {ticket.riskLevel ? riskLabels[ticket.riskLevel] : "—"}
                      </dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-muted-foreground">Impact</dt>
                      <dd className="mt-1 whitespace-pre-wrap">
                        {ticket.impactSummary}
                      </dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-muted-foreground">Affected systems</dt>
                      <dd className="mt-1.5 flex flex-wrap gap-1.5">
                        {ticket.affectedSystems?.map((sys) => (
                          <span
                            key={sys}
                            className="rounded-md bg-[#1a4a5c]/8 px-2 py-0.5 text-xs text-[#143a48]"
                          >
                            {sys}
                          </span>
                        ))}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Planned start</dt>
                      <dd className="font-medium">
                        {ticket.plannedStart
                          ? formatWhen(ticket.plannedStart)
                          : "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Planned end</dt>
                      <dd className="font-medium">
                        {ticket.plannedEnd
                          ? formatWhen(ticket.plannedEnd)
                          : "—"}
                      </dd>
                    </div>
                  </dl>
                </section>

                <section className="rounded-xl border border-[#1a4a5c]/12 bg-white/85 p-5 space-y-4">
                  <h2 className="font-[family-name:var(--font-display)] text-lg text-[#143a48]">
                    Implementation & rollback
                  </h2>
                  <div>
                    <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Implementation
                    </h3>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
                      {ticket.implementationPlan}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Rollback
                    </h3>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
                      {ticket.rollbackPlan}
                    </p>
                  </div>
                </section>

                {ticket.cabDecisions && ticket.cabDecisions.length > 0 ? (
                  <section className="rounded-xl border border-[#1a4a5c]/12 bg-white/85 p-5">
                    <h2 className="font-[family-name:var(--font-display)] text-lg text-[#143a48]">
                      CAB board
                    </h2>
                    <ul className="mt-4 divide-y divide-[#1a4a5c]/8">
                      {ticket.cabDecisions.map((vote) => (
                        <li
                          key={vote.reviewer}
                          className="flex flex-wrap items-start justify-between gap-2 py-3 first:pt-0 last:pb-0"
                        >
                          <div>
                            <p className="text-sm font-medium">
                              {vote.reviewer}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {vote.role}
                            </p>
                            {vote.note ? (
                              <p className="mt-1 text-sm text-[#143a48]/80">
                                {vote.note}
                              </p>
                            ) : null}
                          </div>
                          <StatusBadge
                            status={
                              vote.decision === "pending"
                                ? "cab_review"
                                : vote.decision === "approved"
                                  ? "approved"
                                  : "rejected"
                            }
                          />
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}
              </>
            ) : (
              <section className="rounded-xl border border-[#1a4a5c]/12 bg-white/85 p-5">
                <h2 className="font-[family-name:var(--font-display)] text-lg text-[#143a48]">
                  Request details
                </h2>
                <dl className="mt-3 grid gap-3 sm:grid-cols-2 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Category</dt>
                    <dd className="font-medium">
                      {ticket.category
                        ? categoryLabels[ticket.category]
                        : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Branch</dt>
                    <dd className="font-medium">
                      {ticket.requester.branch || "—"}
                    </dd>
                  </div>
                </dl>
              </section>
            )}

            <section className="rounded-xl border border-[#1a4a5c]/12 bg-white/85 p-5">
              <h2 className="font-[family-name:var(--font-display)] text-lg text-[#143a48]">
                Timeline
              </h2>
              {ticket.comments.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  No activity yet.
                </p>
              ) : (
                <ol className="mt-4 space-y-4">
                  {[...ticket.comments]
                    .sort(
                      (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
                    )
                    .map((c) => (
                      <li key={c.id} className="relative pl-4 border-l-2 border-[#1a4a5c]/15">
                        <p className="text-xs text-muted-foreground">
                          {c.author} · {formatWhen(c.createdAt)} · {c.kind.replace("_", " ")}
                        </p>
                        <p className="mt-1 text-sm whitespace-pre-wrap">
                          {c.body}
                        </p>
                      </li>
                    ))}
                </ol>
              )}
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-xl border border-[#1a4a5c]/12 bg-white/85 p-5">
              <h2 className="font-[family-name:var(--font-display)] text-lg text-[#143a48]">
                People
              </h2>
              <dl className="mt-3 space-y-3 text-sm">
                <div>
                  <dt className="text-muted-foreground">Requester</dt>
                  <dd className="font-medium">{ticket.requester.name}</dd>
                  <dd className="text-xs text-muted-foreground">
                    {ticket.requester.email}
                  </dd>
                  <dd className="text-xs text-muted-foreground">
                    {ticket.requester.department}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Assignee</dt>
                  <dd className="font-medium">
                    {ticket.assignee?.name ?? "Unassigned"}
                  </dd>
                  {ticket.assignee ? (
                    <dd className="text-xs text-muted-foreground">
                      {ticket.assignee.department}
                    </dd>
                  ) : null}
                </div>
              </dl>
            </section>

            <section className="rounded-xl border border-[#1a4a5c]/12 bg-white/85 p-5">
              <h2 className="font-[family-name:var(--font-display)] text-lg text-[#143a48]">
                Actions
              </h2>
              <div className="mt-4">
                <TicketActions ticket={ticket} />
              </div>
            </section>
          </aside>
        </div>
      </article>
    </AppShell>
  );
}
