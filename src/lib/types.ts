export type TicketType = "help_desk" | "change_request";

export type Priority = "low" | "medium" | "high" | "critical";

export type HelpDeskStatus =
  | "new"
  | "assigned"
  | "in_progress"
  | "pending_user"
  | "resolved"
  | "closed";

export type ChangeStatus =
  | "draft"
  | "submitted"
  | "cab_review"
  | "approved"
  | "scheduled"
  | "implementing"
  | "completed"
  | "rejected"
  | "rolled_back";

export type TicketStatus = HelpDeskStatus | ChangeStatus;

export type HelpDeskCategory =
  | "access"
  | "hardware"
  | "software"
  | "network"
  | "email"
  | "telephony"
  | "other";

export type RiskLevel = "low" | "medium" | "high";

export type ChangeType =
  | "standard"
  | "normal"
  | "emergency";

export interface Person {
  name: string;
  email: string;
  department: string;
  branch?: string;
}

export interface TicketComment {
  id: string;
  author: string;
  body: string;
  createdAt: string;
  kind: "comment" | "status_change" | "approval";
}

export interface CabDecision {
  reviewer: string;
  role: string;
  decision: "approved" | "rejected" | "pending";
  note?: string;
  decidedAt?: string;
}

export interface Ticket {
  id: string;
  number: string;
  type: TicketType;
  title: string;
  description: string;
  status: TicketStatus;
  priority: Priority;
  requester: Person;
  assignee: Person | null;
  createdAt: string;
  updatedAt: string;
  comments: TicketComment[];
  // Help desk
  category?: HelpDeskCategory;
  // Change management
  changeType?: ChangeType;
  riskLevel?: RiskLevel;
  impactSummary?: string;
  affectedSystems?: string[];
  plannedStart?: string;
  plannedEnd?: string;
  implementationPlan?: string;
  rollbackPlan?: string;
  cabDecisions?: CabDecision[];
}

export interface CreateHelpDeskInput {
  title: string;
  description: string;
  priority: Priority;
  category: HelpDeskCategory;
  requesterName: string;
  requesterEmail: string;
  requesterDepartment: string;
  requesterBranch?: string;
}

export interface CreateChangeInput {
  title: string;
  description: string;
  priority: Priority;
  changeType: ChangeType;
  riskLevel: RiskLevel;
  impactSummary: string;
  affectedSystems: string;
  plannedStart: string;
  plannedEnd: string;
  implementationPlan: string;
  rollbackPlan: string;
  requesterName: string;
  requesterEmail: string;
  requesterDepartment: string;
}
