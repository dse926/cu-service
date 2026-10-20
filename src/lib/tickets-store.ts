import { seedTickets } from "./seed";
import type {
  CreateChangeInput,
  CreateHelpDeskInput,
  Person,
  Ticket,
  TicketComment,
  TicketStatus,
} from "./types";
import { agents } from "./labels";

type Store = {
  tickets: Ticket[];
  hdCounter: number;
  crCounter: number;
};

const globalForStore = globalThis as unknown as { __meridianTickets?: Store };

function getStore(): Store {
  if (!globalForStore.__meridianTickets) {
    globalForStore.__meridianTickets = {
      tickets: structuredClone(seedTickets),
      hdCounter: 4822,
      crCounter: 322,
    };
  }
  return globalForStore.__meridianTickets;
}

function stamp(): string {
  return new Date().toISOString();
}

function newId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function addComment(
  ticket: Ticket,
  author: string,
  body: string,
  kind: TicketComment["kind"] = "comment"
) {
  ticket.comments = [
    ...ticket.comments,
    { id: newId("c"), author, body, createdAt: stamp(), kind },
  ];
}

export function listTickets(): Ticket[] {
  return [...getStore().tickets].sort(
    (a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)
  );
}

export function getTicket(id: string): Ticket | undefined {
  return getStore().tickets.find((t) => t.id === id);
}

export function createHelpDeskTicket(input: CreateHelpDeskInput): Ticket {
  const store = getStore();
  const number = `HD-${store.hdCounter++}`;
  const ticket: Ticket = {
    id: newId("t-hd"),
    number,
    type: "help_desk",
    title: input.title.trim(),
    description: input.description.trim(),
    status: "new",
    priority: input.priority,
    category: input.category,
    requester: {
      name: input.requesterName.trim(),
      email: input.requesterEmail.trim(),
      department: input.requesterDepartment.trim(),
      branch: input.requesterBranch?.trim() || undefined,
    },
    assignee: null,
    createdAt: stamp(),
    updatedAt: stamp(),
    comments: [
      {
        id: newId("c"),
        author: "System",
        body: "Help desk request opened.",
        createdAt: stamp(),
        kind: "status_change",
      },
    ],
  };
  store.tickets.unshift(ticket);
  return ticket;
}

export function createChangeTicket(input: CreateChangeInput): Ticket {
  const store = getStore();
  const number = `CR-${store.crCounter++}`;
  const systems = input.affectedSystems
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const ticket: Ticket = {
    id: newId("t-cr"),
    number,
    type: "change_request",
    title: input.title.trim(),
    description: input.description.trim(),
    status: input.changeType === "emergency" ? "submitted" : "submitted",
    priority: input.priority,
    changeType: input.changeType,
    riskLevel: input.riskLevel,
    impactSummary: input.impactSummary.trim(),
    affectedSystems: systems,
    plannedStart: new Date(input.plannedStart).toISOString(),
    plannedEnd: new Date(input.plannedEnd).toISOString(),
    implementationPlan: input.implementationPlan.trim(),
    rollbackPlan: input.rollbackPlan.trim(),
    cabDecisions: [
      {
        reviewer: "Elena Soto",
        role: "Change Manager",
        decision: "pending",
      },
      {
        reviewer: "Derek Cho",
        role: "InfoSec",
        decision: "pending",
      },
      ...(input.riskLevel === "high" || input.changeType === "emergency"
        ? [
            {
              reviewer: "Nina Patel",
              role: "Business Owner",
              decision: "pending" as const,
            },
          ]
        : []),
    ],
    requester: {
      name: input.requesterName.trim(),
      email: input.requesterEmail.trim(),
      department: input.requesterDepartment.trim(),
    },
    assignee: {
      name: "Elena Soto",
      email: "elena.soto@meridiancu.org",
      department: "Change Management",
    },
    createdAt: stamp(),
    updatedAt: stamp(),
    comments: [
      {
        id: newId("c"),
        author: "System",
        body:
          input.changeType === "emergency"
            ? "Emergency change submitted — expedited CAB notified."
            : "Change request submitted for CAB intake.",
        createdAt: stamp(),
        kind: "status_change",
      },
    ],
  };
  store.tickets.unshift(ticket);
  return ticket;
}

export function assignTicket(id: string, agentEmail: string): Ticket | null {
  const ticket = getTicket(id);
  if (!ticket) return null;
  const agent = agents.find((a) => a.email === agentEmail);
  if (!agent) return null;
  ticket.assignee = agent as Person;
  if (ticket.type === "help_desk" && ticket.status === "new") {
    ticket.status = "assigned";
  }
  ticket.updatedAt = stamp();
  addComment(
    ticket,
    "System",
    `Assigned to ${agent.name}.`,
    "status_change"
  );
  return ticket;
}

export function updateStatus(
  id: string,
  status: TicketStatus,
  note?: string
): Ticket | null {
  const ticket = getTicket(id);
  if (!ticket) return null;
  const prev = ticket.status;
  ticket.status = status;
  ticket.updatedAt = stamp();
  addComment(
    ticket,
    "System",
    note?.trim() || `Status changed from ${prev} to ${status}.`,
    "status_change"
  );
  return ticket;
}

export function addTicketComment(
  id: string,
  author: string,
  body: string
): Ticket | null {
  const ticket = getTicket(id);
  if (!ticket || !body.trim()) return null;
  ticket.updatedAt = stamp();
  addComment(ticket, author.trim() || "Agent", body.trim(), "comment");
  return ticket;
}

export function recordCabDecision(
  id: string,
  reviewer: string,
  decision: "approved" | "rejected",
  note?: string
): Ticket | null {
  const ticket = getTicket(id);
  if (!ticket || ticket.type !== "change_request" || !ticket.cabDecisions) {
    return null;
  }
  const entry = ticket.cabDecisions.find((d) => d.reviewer === reviewer);
  if (!entry) return null;
  entry.decision = decision;
  entry.note = note?.trim();
  entry.decidedAt = stamp();
  ticket.updatedAt = stamp();
  addComment(
    ticket,
    reviewer,
    `${decision === "approved" ? "Approved" : "Rejected"} as ${entry.role}.${note ? ` ${note}` : ""}`,
    "approval"
  );

  if (decision === "rejected") {
    ticket.status = "rejected";
  } else {
    const allDecided = ticket.cabDecisions.every((d) => d.decision !== "pending");
    const anyRejected = ticket.cabDecisions.some((d) => d.decision === "rejected");
    if (anyRejected) {
      ticket.status = "rejected";
    } else if (allDecided) {
      ticket.status = "approved";
      addComment(
        ticket,
        "System",
        "All CAB votes recorded — change approved.",
        "status_change"
      );
    } else if (ticket.status === "submitted") {
      ticket.status = "cab_review";
    }
  }
  return ticket;
}

export function getQueueStats() {
  const tickets = listTickets();
  return {
    openHelpDesk: tickets.filter(
      (t) =>
        t.type === "help_desk" &&
        !["resolved", "closed"].includes(t.status)
    ).length,
    openChanges: tickets.filter(
      (t) =>
        t.type === "change_request" &&
        !["completed", "rejected", "rolled_back"].includes(t.status)
    ).length,
    cabPending: tickets.filter(
      (t) =>
        t.type === "change_request" &&
        ["submitted", "cab_review"].includes(t.status)
    ).length,
    critical: tickets.filter(
      (t) =>
        t.priority === "critical" &&
        !["resolved", "closed", "completed", "rejected", "rolled_back"].includes(
          t.status
        )
    ).length,
  };
}
