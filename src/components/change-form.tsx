"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTicketStore } from "@/components/ticket-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ChangeType, Priority, RiskLevel } from "@/lib/types";
import {
  changeTypeLabels,
  priorityLabels,
  riskLabels,
} from "@/lib/labels";
import { ticketPath } from "@/lib/tickets-logic";

const changeTypes = Object.keys(changeTypeLabels) as ChangeType[];
const priorities = Object.keys(priorityLabels) as Priority[];
const risks = Object.keys(riskLabels) as RiskLevel[];

function defaultWindow(startHour: number, endHour: number) {
  const start = new Date();
  start.setDate(start.getDate() + 2);
  start.setHours(startHour, 0, 0, 0);
  const end = new Date(start);
  end.setHours(endHour, 0, 0, 0);
  const toLocal = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };
  return { start: toLocal(start), end: toLocal(end) };
}

export function ChangeForm() {
  const router = useRouter();
  const { createChange } = useTicketStore();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const windowDefaults = defaultWindow(22, 1);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const fd = new FormData(e.currentTarget);
    try {
      const ticket = createChange({
        title: String(fd.get("title") || ""),
        description: String(fd.get("description") || ""),
        priority: String(fd.get("priority") || "medium") as Priority,
        changeType: String(fd.get("changeType") || "normal") as ChangeType,
        riskLevel: String(fd.get("riskLevel") || "medium") as RiskLevel,
        impactSummary: String(fd.get("impactSummary") || ""),
        affectedSystems: String(fd.get("affectedSystems") || ""),
        plannedStart: String(fd.get("plannedStart") || ""),
        plannedEnd: String(fd.get("plannedEnd") || ""),
        implementationPlan: String(fd.get("implementationPlan") || ""),
        rollbackPlan: String(fd.get("rollbackPlan") || ""),
        requesterName: String(fd.get("requesterName") || ""),
        requesterEmail: String(fd.get("requesterEmail") || ""),
        requesterDepartment: String(fd.get("requesterDepartment") || ""),
      });
      router.push(ticketPath(ticket.id));
    } catch {
      setError("Could not submit the change. Check required fields and try again.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <section className="space-y-4">
        <h2 className="font-[family-name:var(--font-display)] text-lg text-[#143a48]">
          Change summary
        </h2>
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            required
            placeholder="e.g. Upgrade branch capture servers to 4.12"
            className="bg-white"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Business justification</Label>
          <Textarea
            id="description"
            name="description"
            required
            rows={4}
            placeholder="Why this change is needed and what risk it addresses."
            className="bg-white"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="changeType">Change type</Label>
            <select
              id="changeType"
              name="changeType"
              defaultValue="normal"
              className="flex h-8 w-full rounded-lg border border-input bg-white px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {changeTypes.map((t) => (
                <option key={t} value={t}>
                  {changeTypeLabels[t]}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="riskLevel">Risk</Label>
            <select
              id="riskLevel"
              name="riskLevel"
              defaultValue="medium"
              className="flex h-8 w-full rounded-lg border border-input bg-white px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {risks.map((r) => (
                <option key={r} value={r}>
                  {riskLabels[r]}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <select
              id="priority"
              name="priority"
              defaultValue="high"
              className="flex h-8 w-full rounded-lg border border-input bg-white px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {priorities.map((p) => (
                <option key={p} value={p}>
                  {priorityLabels[p]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="space-y-4 border-t border-[#1a4a5c]/10 pt-6">
        <h2 className="font-[family-name:var(--font-display)] text-lg text-[#143a48]">
          Impact & window
        </h2>
        <div className="space-y-2">
          <Label htmlFor="impactSummary">Member / operations impact</Label>
          <Textarea
            id="impactSummary"
            name="impactSummary"
            required
            rows={3}
            placeholder="Expected outage, degraded service, or member-facing effects."
            className="bg-white"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="affectedSystems">Affected systems</Label>
          <Input
            id="affectedSystems"
            name="affectedSystems"
            required
            placeholder="Comma-separated, e.g. Symitar, Online Banking, ACH"
            className="bg-white"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="plannedStart">Planned start</Label>
            <Input
              id="plannedStart"
              name="plannedStart"
              type="datetime-local"
              required
              defaultValue={windowDefaults.start}
              className="bg-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="plannedEnd">Planned end</Label>
            <Input
              id="plannedEnd"
              name="plannedEnd"
              type="datetime-local"
              required
              defaultValue={windowDefaults.end}
              className="bg-white"
            />
          </div>
        </div>
      </section>

      <section className="space-y-4 border-t border-[#1a4a5c]/10 pt-6">
        <h2 className="font-[family-name:var(--font-display)] text-lg text-[#143a48]">
          Plans
        </h2>
        <div className="space-y-2">
          <Label htmlFor="implementationPlan">Implementation plan</Label>
          <Textarea
            id="implementationPlan"
            name="implementationPlan"
            required
            rows={4}
            placeholder="Ordered steps, owners, and validation checks."
            className="bg-white"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rollbackPlan">Rollback plan</Label>
          <Textarea
            id="rollbackPlan"
            name="rollbackPlan"
            required
            rows={3}
            placeholder="How to restore prior state if validation fails."
            className="bg-white"
          />
        </div>
      </section>

      <section className="space-y-4 border-t border-[#1a4a5c]/10 pt-6">
        <h2 className="font-[family-name:var(--font-display)] text-lg text-[#143a48]">
          Requested by
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="requesterName">Name</Label>
            <Input
              id="requesterName"
              name="requesterName"
              required
              defaultValue="Marcus Webb"
              className="bg-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="requesterEmail">Email</Label>
            <Input
              id="requesterEmail"
              name="requesterEmail"
              type="email"
              required
              defaultValue="marcus.webb@meridiancu.org"
              className="bg-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="requesterDepartment">Department</Label>
            <Input
              id="requesterDepartment"
              name="requesterDepartment"
              required
              defaultValue="Infrastructure"
              className="bg-white"
            />
          </div>
        </div>
      </section>

      {error ? (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-900" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button
          type="submit"
          disabled={pending}
          className="bg-[#1a4a5c] hover:bg-[#143a48]"
        >
          {pending ? "Submitting…" : "Submit to CAB"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={() => router.push("/")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
