"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  addCommentAction,
  assignTicketAction,
  cabDecisionAction,
  updateStatusAction,
} from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { agents } from "@/lib/labels";
import type { Ticket, TicketStatus } from "@/lib/types";

const helpDeskNext: Partial<Record<TicketStatus, TicketStatus[]>> = {
  new: ["assigned", "in_progress"],
  assigned: ["in_progress", "pending_user", "resolved"],
  in_progress: ["pending_user", "resolved"],
  pending_user: ["in_progress", "resolved"],
  resolved: ["closed", "in_progress"],
};

const changeNext: Partial<Record<TicketStatus, TicketStatus[]>> = {
  submitted: ["cab_review", "rejected"],
  cab_review: ["approved", "rejected"],
  approved: ["scheduled", "rejected"],
  scheduled: ["implementing", "rejected"],
  implementing: ["completed", "rolled_back"],
};

export function TicketActions({ ticket }: { ticket: Ticket }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [note, setNote] = useState("");
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const nextStatuses =
    ticket.type === "help_desk"
      ? helpDeskNext[ticket.status] ?? []
      : changeNext[ticket.status] ?? [];

  const pendingCab =
    ticket.type === "change_request"
      ? ticket.cabDecisions?.filter((d) => d.decision === "pending") ?? []
      : [];

  function run(action: () => Promise<void>, ok: string) {
    setMessage(null);
    startTransition(async () => {
      try {
        await action();
        setMessage(ok);
        setNote("");
        setComment("");
        router.refresh();
      } catch {
        setMessage("Action failed. Try again.");
      }
    });
  }

  return (
    <div className="space-y-6">
      {ticket.type === "help_desk" ? (
        <section className="space-y-3">
          <h3 className="text-sm font-medium text-[#143a48]">Assign agent</h3>
          <div className="flex flex-wrap gap-2">
            {agents.map((agent) => (
              <Button
                key={agent.email}
                type="button"
                size="sm"
                variant="outline"
                disabled={pending || ticket.assignee?.email === agent.email}
                onClick={() =>
                  run(
                    () => assignTicketAction(ticket.id, agent.email),
                    `Assigned to ${agent.name}`
                  )
                }
              >
                {agent.name}
              </Button>
            ))}
          </div>
        </section>
      ) : null}

      {nextStatuses.length > 0 ? (
        <section className="space-y-3">
          <h3 className="text-sm font-medium text-[#143a48]">Advance status</h3>
          <div className="space-y-2">
            <Label htmlFor="status-note">Optional note</Label>
            <Textarea
              id="status-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="bg-white"
              placeholder="Add context for the status change"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {nextStatuses.map((status) => (
              <Button
                key={status}
                type="button"
                size="sm"
                disabled={pending}
                variant={
                  status === "rejected" || status === "rolled_back"
                    ? "destructive"
                    : "default"
                }
                className={
                  status === "rejected" || status === "rolled_back"
                    ? undefined
                    : "bg-[#1a4a5c] hover:bg-[#143a48]"
                }
                onClick={() =>
                  run(
                    () => updateStatusAction(ticket.id, status, note || undefined),
                    `Status → ${status}`
                  )
                }
              >
                {status.replaceAll("_", " ")}
              </Button>
            ))}
          </div>
        </section>
      ) : null}

      {pendingCab.length > 0 ? (
        <section className="space-y-3">
          <h3 className="text-sm font-medium text-[#143a48]">CAB decisions</h3>
          <ul className="space-y-3">
            {pendingCab.map((vote) => (
              <li
                key={vote.reviewer}
                className="rounded-lg border border-[#1a4a5c]/12 bg-white/80 p-3"
              >
                <p className="text-sm font-medium text-[#143a48]">
                  {vote.reviewer}{" "}
                  <span className="font-normal text-muted-foreground">
                    · {vote.role}
                  </span>
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    disabled={pending}
                    className="bg-[#2f5d4a] hover:bg-[#244839]"
                    onClick={() =>
                      run(
                        () =>
                          cabDecisionAction(
                            ticket.id,
                            vote.reviewer,
                            "approved",
                            note || undefined
                          ),
                        `${vote.reviewer} approved`
                      )
                    }
                  >
                    Approve
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    disabled={pending}
                    onClick={() =>
                      run(
                        () =>
                          cabDecisionAction(
                            ticket.id,
                            vote.reviewer,
                            "rejected",
                            note || undefined
                          ),
                        `${vote.reviewer} rejected`
                      )
                    }
                  >
                    Reject
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="space-y-3">
        <h3 className="text-sm font-medium text-[#143a48]">Add comment</h3>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          className="bg-white"
          placeholder="Work notes visible on the ticket timeline"
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={pending || !comment.trim()}
          onClick={() =>
            run(
              () =>
                addCommentAction(
                  ticket.id,
                  ticket.assignee?.name || "Service Desk",
                  comment
                ),
              "Comment added"
            )
          }
        >
          Post comment
        </Button>
      </section>

      {message ? (
        <p className="text-sm text-[#2f5d4a]" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
