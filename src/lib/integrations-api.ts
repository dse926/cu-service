import type { Priority, Ticket, TicketType } from "./types";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

export function integrationsEnabled() {
  return Boolean(API_URL);
}

export type ApiTeam = {
  id: string;
  name: string;
  adoAreaPath: string;
  adoIterationPath: string;
  description: string;
  notifyEmails: string[];
  pagerDutySeverity: "info" | "warning" | "error" | "critical";
};

export type SyncResponse = {
  ok: boolean;
  classification: {
    team: ApiTeam;
    score: number;
    rationale: string;
    alternatives: { teamId: string; name: string; score: number }[];
  };
  azureDevOps: {
    mode: "live" | "mock";
    ok: boolean;
    detail: string;
    externalId?: string;
    externalUrl?: string;
  };
  email: { mode: "live" | "mock"; ok: boolean; detail: string };
  pagerDuty: {
    mode: "live" | "mock";
    ok: boolean;
    detail: string;
    externalId?: string;
  };
};

function ticketPayload(ticket: Ticket) {
  return {
    id: ticket.id,
    number: ticket.number,
    type: ticket.type as TicketType,
    title: ticket.title,
    description: ticket.description,
    priority: ticket.priority as Priority,
    status: ticket.status,
    category: ticket.category,
    requester: ticket.requester,
    changeType: ticket.changeType,
    riskLevel: ticket.riskLevel,
  };
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `API ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchTeams() {
  return api<{ updatedAt: string; teams: ApiTeam[] }>("/teams");
}

export async function saveTeams(teams: ApiTeam[]) {
  return api<{ ok: boolean; config: { teams: ApiTeam[] } }>("/teams", {
    method: "PUT",
    body: JSON.stringify({ teams }),
  });
}

export async function classifyTicket(ticket: Ticket) {
  return api<{
    ok: boolean;
    team: ApiTeam;
    score: number;
    rationale: string;
    alternatives: { teamId: string; name: string; score: number }[];
  }>("/classify", {
    method: "POST",
    body: JSON.stringify(ticketPayload(ticket)),
  });
}

export async function syncTicketIntegrations(
  ticket: Ticket,
  opts?: {
    teamId?: string;
    createAdo?: boolean;
    sendEmail?: boolean;
    pageOnCritical?: boolean;
  }
) {
  return api<SyncResponse>("/integrations/sync", {
    method: "POST",
    body: JSON.stringify({
      ...ticketPayload(ticket),
      teamId: opts?.teamId,
      createAdo: opts?.createAdo ?? true,
      sendEmail: opts?.sendEmail ?? true,
      pageOnCritical: opts?.pageOnCritical ?? true,
    }),
  });
}

export async function healthCheck() {
  if (!API_URL) return null;
  try {
    return await api<{
      ok: boolean;
      mockIntegrations: boolean;
      integrations: {
        azureDevOps: boolean;
        email: boolean;
        pagerDuty: boolean;
      };
    }>("/health");
  } catch {
    return null;
  }
}
