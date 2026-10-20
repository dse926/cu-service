export type Priority = "low" | "medium" | "high" | "critical";

export interface Team {
  id: string;
  name: string;
  adoAreaPath: string;
  adoIterationPath: string;
  description: string;
  notifyEmails: string[];
  pagerDutySeverity: "info" | "warning" | "error" | "critical";
}

export interface TeamsConfig {
  updatedAt: string;
  teams: Team[];
}

export interface TicketPayload {
  id: string;
  number: string;
  type: "help_desk" | "change_request";
  title: string;
  description: string;
  priority: Priority;
  status: string;
  category?: string;
  requester: {
    name: string;
    email: string;
    department: string;
    branch?: string;
  };
  changeType?: string;
  riskLevel?: string;
}

export interface ClassifyResult {
  team: Team;
  score: number;
  rationale: string;
  alternatives: { teamId: string; name: string; score: number }[];
}

export interface IntegrationResult {
  mode: "live" | "mock";
  ok: boolean;
  detail: string;
  externalId?: string;
  externalUrl?: string;
}
