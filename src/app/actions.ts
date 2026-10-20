"use server";

import { revalidatePath } from "next/cache";
import {
  addTicketComment,
  assignTicket,
  createChangeTicket,
  createHelpDeskTicket,
  recordCabDecision,
  updateStatus,
} from "@/lib/tickets-store";
import type {
  CreateChangeInput,
  CreateHelpDeskInput,
  TicketStatus,
} from "@/lib/types";

function refresh(id?: string) {
  revalidatePath("/");
  if (id) revalidatePath(`/tickets/${id}`);
}

export async function createHelpDeskAction(input: CreateHelpDeskInput) {
  const ticket = createHelpDeskTicket(input);
  refresh(ticket.id);
  return { id: ticket.id, number: ticket.number };
}

export async function createChangeAction(input: CreateChangeInput) {
  const ticket = createChangeTicket(input);
  refresh(ticket.id);
  return { id: ticket.id, number: ticket.number };
}

export async function assignTicketAction(id: string, agentEmail: string) {
  const ticket = assignTicket(id, agentEmail);
  if (!ticket) throw new Error("Unable to assign ticket");
  refresh(id);
}

export async function updateStatusAction(
  id: string,
  status: TicketStatus,
  note?: string
) {
  const ticket = updateStatus(id, status, note);
  if (!ticket) throw new Error("Unable to update status");
  refresh(id);
}

export async function addCommentAction(
  id: string,
  author: string,
  body: string
) {
  const ticket = addTicketComment(id, author, body);
  if (!ticket) throw new Error("Unable to add comment");
  refresh(id);
}

export async function cabDecisionAction(
  id: string,
  reviewer: string,
  decision: "approved" | "rejected",
  note?: string
) {
  const ticket = recordCabDecision(id, reviewer, decision, note);
  if (!ticket) throw new Error("Unable to record CAB decision");
  refresh(id);
}
