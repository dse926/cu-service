import { seedTickets } from "./seed";
import { agents } from "./labels";
import type {
  CreateChangeInput,
  CreateHelpDeskInput,
  Person,
  Ticket,
  TicketComment,
  TicketStatus,
} from "./types";

export type TicketStoreState = {
  tickets: Ticket[];
  hdCounter: number;
  crCounter: number;
};

export const STORAGE_KEY = "meridian-cu-service-desk-v1";

export function createInitialState(): TicketStoreState {
  return {
    tickets: structuredClone(seedTickets),
    hdCounter: 4822,
    crCounter: 322,
  };
}

function stamp(): string {
  return new Date().toISOString();
}

function newId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function withComment(
  ticket: Ticket,
  author: string,
  body: string,
  kind: TicketComment["kind"] = "comment"
): Ticket {
  return {
    ...ticket,
    comments: [
      ...ticket.comments,
      { id: newId("c"), author, body, createdAt: stamp(), kind },
    ],
  };
}

export function listTickets(state: TicketStoreState): Ticket[] {
  return [...state.tickets].sort(
    (a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)
  );
}

export function getTicket(
  state: TicketStoreState,
  id: string
): Ticket | undefined {
  return state.tickets.find((t) => t.id === id);
}

export function createHelpDeskTicket(
  state: TicketStoreState,
  input: CreateHelpDeskInput
): { state: TicketStoreState; ticket: Ticket } {
  const number = `HD-${state.hdCounter}`;
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
  return {
    state: {
      ...state,
      hdCounter: state.hdCounter + 1,
      tickets: [ticket, ...state.tickets],
    },
    ticket,
  };
}

export function createChangeTicket(
  state: TicketStoreState,
  input: CreateChangeInput
): { state: TicketStoreState; ticket: Ticket } {
  const number = `CR-${state.crCounter}`;
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
    status: "submitted",
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
  return {
    state: {
      ...state,
      crCounter: state.crCounter + 1,
      tickets: [ticket, ...state.tickets],
    },
    ticket,
  };
}

function updateTicket(
  state: TicketStoreState,
  id: string,
  updater: (ticket: Ticket) => Ticket | null
): TicketStoreState | null {
  const index = state.tickets.findIndex((t) => t.id === id);
  if (index < 0) return null;
  const next = updater(state.tickets[index]);
  if (!next) return null;
  const tickets = [...state.tickets];
  tickets[index] = next;
  return { ...state, tickets };
}

export function assignTicket(
  state: TicketStoreState,
  id: string,
  agentEmail: string
): TicketStoreState | null {
  const agent = agents.find((a) => a.email === agentEmail);
  if (!agent) return null;
  return updateTicket(state, id, (ticket) => {
    let next: Ticket = {
      ...ticket,
      assignee: agent as Person,
      updatedAt: stamp(),
    };
    if (next.type === "help_desk" && next.status === "new") {
      next = { ...next, status: "assigned" };
    }
    return withComment(next, "System", `Assigned to ${agent.name}.`, "status_change");
  });
}

export function updateStatus(
  state: TicketStoreState,
  id: string,
  status: TicketStatus,
  note?: string
): TicketStoreState | null {
  return updateTicket(state, id, (ticket) => {
    const prev = ticket.status;
    const next = { ...ticket, status, updatedAt: stamp() };
    return withComment(
      next,
      "System",
      note?.trim() || `Status changed from ${prev} to ${status}.`,
      "status_change"
    );
  });
}

export function addTicketComment(
  state: TicketStoreState,
  id: string,
  author: string,
  body: string
): TicketStoreState | null {
  if (!body.trim()) return null;
  return updateTicket(state, id, (ticket) =>
    withComment(
      { ...ticket, updatedAt: stamp() },
      author.trim() || "Agent",
      body.trim(),
      "comment"
    )
  );
}

export function recordCabDecision(
  state: TicketStoreState,
  id: string,
  reviewer: string,
  decision: "approved" | "rejected",
  note?: string
): TicketStoreState | null {
  return updateTicket(state, id, (ticket) => {
    if (ticket.type !== "change_request" || !ticket.cabDecisions) return null;
    const cabDecisions = ticket.cabDecisions.map((d) =>
      d.reviewer === reviewer
        ? {
            ...d,
            decision,
            note: note?.trim(),
            decidedAt: stamp(),
          }
        : d
    );
    let next: Ticket = {
      ...ticket,
      cabDecisions,
      updatedAt: stamp(),
    };
    const entry = cabDecisions.find((d) => d.reviewer === reviewer);
    next = withComment(
      next,
      reviewer,
      `${decision === "approved" ? "Approved" : "Rejected"} as ${entry?.role}.${note ? ` ${note}` : ""}`,
      "approval"
    );

    if (decision === "rejected") {
      next = { ...next, status: "rejected" };
    } else {
      const allDecided = cabDecisions.every((d) => d.decision !== "pending");
      const anyRejected = cabDecisions.some((d) => d.decision === "rejected");
      if (anyRejected) {
        next = { ...next, status: "rejected" };
      } else if (allDecided) {
        next = withComment(
          { ...next, status: "approved" },
          "System",
          "All CAB votes recorded — change approved.",
          "status_change"
        );
      } else if (next.status === "submitted") {
        next = { ...next, status: "cab_review" };
      }
    }
    return next;
  });
}

export function getQueueStats(tickets: Ticket[]) {
  return {
    openHelpDesk: tickets.filter(
      (t) =>
        t.type === "help_desk" && !["resolved", "closed"].includes(t.status)
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

export function filterTickets(
  tickets: Ticket[],
  view: string | undefined
): Ticket[] {
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
        (t) => t.priority === "critical" && (openHelp(t) || openChange(t))
      );
    default:
      return tickets.filter((t) => openHelp(t) || openChange(t));
  }
}

export function loadStateFromStorage(): TicketStoreState {
  if (typeof window === "undefined") return createInitialState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    const parsed = JSON.parse(raw) as TicketStoreState;
    if (!parsed?.tickets || !Array.isArray(parsed.tickets)) {
      return createInitialState();
    }
    return parsed;
  } catch {
    return createInitialState();
  }
}

export function saveStateToStorage(state: TicketStoreState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function ticketPath(id: string) {
  return `/tickets/view/?id=${encodeURIComponent(id)}`;
}
