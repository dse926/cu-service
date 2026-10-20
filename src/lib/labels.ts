import type {
  ChangeStatus,
  ChangeType,
  HelpDeskCategory,
  HelpDeskStatus,
  Priority,
  RiskLevel,
  TicketStatus,
  TicketType,
} from "./types";

export const ORG = {
  name: "Meridian Credit Union",
  shortName: "Meridian CU",
  product: "Service Desk",
  assets: "$5.2B",
  tagline: "IT operations for 186 branches and shared services",
} as const;

export const typeLabels: Record<TicketType, string> = {
  help_desk: "Help Desk",
  change_request: "Change Request",
};

export const priorityLabels: Record<Priority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

export const helpDeskStatusLabels: Record<HelpDeskStatus, string> = {
  new: "New",
  assigned: "Assigned",
  in_progress: "In Progress",
  pending_user: "Pending User",
  resolved: "Resolved",
  closed: "Closed",
};

export const changeStatusLabels: Record<ChangeStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  cab_review: "CAB Review",
  approved: "Approved",
  scheduled: "Scheduled",
  implementing: "Implementing",
  completed: "Completed",
  rejected: "Rejected",
  rolled_back: "Rolled Back",
};

export function statusLabel(status: TicketStatus): string {
  return (
    helpDeskStatusLabels[status as HelpDeskStatus] ??
    changeStatusLabels[status as ChangeStatus] ??
    status
  );
}

export const categoryLabels: Record<HelpDeskCategory, string> = {
  access: "Access & Identity",
  hardware: "Hardware",
  software: "Software",
  network: "Network",
  email: "Email & Collaboration",
  telephony: "Telephony",
  other: "Other",
};

export const riskLabels: Record<RiskLevel, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export const changeTypeLabels: Record<ChangeType, string> = {
  standard: "Standard",
  normal: "Normal",
  emergency: "Emergency",
};

export const agents: { name: string; email: string; department: string }[] = [
  {
    name: "Priya Nair",
    email: "priya.nair@meridiancu.org",
    department: "Service Desk",
  },
  {
    name: "Marcus Webb",
    email: "marcus.webb@meridiancu.org",
    department: "Infrastructure",
  },
  {
    name: "Elena Soto",
    email: "elena.soto@meridiancu.org",
    department: "Change Management",
  },
];
