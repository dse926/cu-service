import type { Ticket } from "./types";

const now = Date.now();
const hours = (h: number) => new Date(now - h * 60 * 60 * 1000).toISOString();
const daysAhead = (d: number, hour = 22) => {
  const date = new Date(now + d * 24 * 60 * 60 * 1000);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
};

export const seedTickets: Ticket[] = [
  {
    id: "t-hd-1001",
    number: "HD-4821",
    type: "help_desk",
    title: "Reset Symitar password for lending officer",
    description:
      "Unable to sign in to Symitar after returning from leave. Account shows locked after three failed attempts. Need reset before midday loan closings.",
    status: "new",
    priority: "high",
    category: "access",
    requester: {
      name: "Jordan Hale",
      email: "jordan.hale@meridiancu.org",
      department: "Consumer Lending",
      branch: "Westlake Branch",
    },
    assignee: null,
    createdAt: hours(1.2),
    updatedAt: hours(1.2),
    comments: [
      {
        id: "c1",
        author: "System",
        body: "Ticket opened from the member services portal.",
        createdAt: hours(1.2),
        kind: "status_change",
      },
    ],
  },
  {
    id: "t-hd-1002",
    number: "HD-4819",
    type: "help_desk",
    title: "Receipt printer offline at teller window 3",
    description:
      "Epson TM-T88VI at teller window 3 will not print. Cable seated, power LED on, queue shows jobs stuck. Members waiting for deposit receipts.",
    status: "in_progress",
    priority: "medium",
    category: "hardware",
    requester: {
      name: "Aisha Rahman",
      email: "aisha.rahman@meridiancu.org",
      department: "Branch Operations",
      branch: "Harborfront Branch",
    },
    assignee: {
      name: "Priya Nair",
      email: "priya.nair@meridiancu.org",
      department: "Service Desk",
    },
    createdAt: hours(4),
    updatedAt: hours(0.5),
    comments: [
      {
        id: "c2",
        author: "Priya Nair",
        body: "Remote spooler cleared. Dispatching branch support kit with spare USB cable.",
        createdAt: hours(0.5),
        kind: "comment",
      },
    ],
  },
  {
    id: "t-hd-1003",
    number: "HD-4814",
    type: "help_desk",
    title: "Outlook shared mailbox missing for collections",
    description:
      "Collections team lost access to collections@meridiancu.org this morning. Affects skip-trace workflow and member callback queue.",
    status: "pending_user",
    priority: "high",
    category: "email",
    requester: {
      name: "Chris Delgado",
      email: "chris.delgado@meridiancu.org",
      department: "Collections",
      branch: "Corporate Center",
    },
    assignee: {
      name: "Priya Nair",
      email: "priya.nair@meridiancu.org",
      department: "Service Desk",
    },
    createdAt: hours(26),
    updatedAt: hours(3),
    comments: [
      {
        id: "c3",
        author: "Priya Nair",
        body: "Permissions restored in Exchange. Waiting on requester confirmation.",
        createdAt: hours(3),
        kind: "comment",
      },
    ],
  },
  {
    id: "t-hd-1004",
    number: "HD-4802",
    type: "help_desk",
    title: "VPN dropouts for remote mortgage underwriters",
    description:
      "Three underwriters on Meridian VPN disconnect every 20–30 minutes since Friday. Reconnect works but breaks LOS sessions.",
    status: "assigned",
    priority: "medium",
    category: "network",
    requester: {
      name: "Sam Okonkwo",
      email: "sam.okonkwo@meridiancu.org",
      department: "Mortgage",
      branch: "Remote",
    },
    assignee: {
      name: "Marcus Webb",
      email: "marcus.webb@meridiancu.org",
      department: "Infrastructure",
    },
    createdAt: hours(48),
    updatedAt: hours(12),
    comments: [],
  },
  {
    id: "t-cr-2001",
    number: "CR-318",
    type: "change_request",
    title: "Core banking patch — Symitar release 2026.3",
    description:
      "Apply vendor-mandated Symitar 2026.3 patch across production A/B hosts. Includes ACH file format updates required before Nov settlement window.",
    status: "cab_review",
    priority: "critical",
    changeType: "normal",
    riskLevel: "high",
    impactSummary:
      "Online banking read-only for ~45 minutes. Branch teller and lending streams pause during cutover. ATM/debit continues via switch.",
    affectedSystems: ["Symitar", "Online Banking", "Branch Capture", "ACH"],
    plannedStart: daysAhead(3, 22),
    plannedEnd: daysAhead(4, 1),
    implementationPlan:
      "1) Freeze batch jobs 21:30\n2) Snapshot A/B hosts\n3) Patch standby, validate smoke suite\n4) Failover and patch primary\n5) Resume batch and monitor ACH",
    rollbackPlan:
      "Fail back to pre-patch snapshot within 30 minutes if smoke suite or first ACH file fails validation.",
    cabDecisions: [
      {
        reviewer: "Elena Soto",
        role: "Change Manager",
        decision: "approved",
        note: "Maintenance window confirmed with Ops.",
        decidedAt: hours(6),
      },
      {
        reviewer: "Derek Cho",
        role: "InfoSec",
        decision: "pending",
      },
      {
        reviewer: "Nina Patel",
        role: "Core Banking Owner",
        decision: "pending",
      },
    ],
    requester: {
      name: "Marcus Webb",
      email: "marcus.webb@meridiancu.org",
      department: "Infrastructure",
    },
    assignee: {
      name: "Elena Soto",
      email: "elena.soto@meridiancu.org",
      department: "Change Management",
    },
    createdAt: hours(72),
    updatedAt: hours(6),
    comments: [
      {
        id: "c4",
        author: "Elena Soto",
        body: "Moved to CAB review. Security questionnaire attached.",
        createdAt: hours(6),
        kind: "status_change",
      },
    ],
  },
  {
    id: "t-cr-2002",
    number: "CR-315",
    type: "change_request",
    title: "Replace edge firewall pair at data center A",
    description:
      "Swap aging Palo Alto HA pair with refreshed appliances. Same policy set; new management IPs documented in runbook R-441.",
    status: "scheduled",
    priority: "high",
    changeType: "normal",
    riskLevel: "medium",
    impactSummary:
      "Brief VPN and site-to-site flaps during HA failover (~2 minutes). Branch circuits stay up via secondary path.",
    affectedSystems: ["Edge Firewall", "Site-to-Site VPN", "Meridian VPN"],
    plannedStart: daysAhead(1, 23),
    plannedEnd: daysAhead(2, 1),
    implementationPlan:
      "Stage new appliances, import policy, failover HA, cut over management, monitor for 60 minutes.",
    rollbackPlan:
      "Fail back to prior active node; retain old pair powered for 72 hours.",
    cabDecisions: [
      {
        reviewer: "Elena Soto",
        role: "Change Manager",
        decision: "approved",
        decidedAt: hours(30),
      },
      {
        reviewer: "Derek Cho",
        role: "InfoSec",
        decision: "approved",
        decidedAt: hours(28),
      },
      {
        reviewer: "Marcus Webb",
        role: "Infrastructure Lead",
        decision: "approved",
        decidedAt: hours(27),
      },
    ],
    requester: {
      name: "Marcus Webb",
      email: "marcus.webb@meridiancu.org",
      department: "Infrastructure",
    },
    assignee: {
      name: "Marcus Webb",
      email: "marcus.webb@meridiancu.org",
      department: "Infrastructure",
    },
    createdAt: hours(120),
    updatedAt: hours(24),
    comments: [
      {
        id: "c5",
        author: "Elena Soto",
        body: "CAB approved. Scheduled for Sunday maintenance window.",
        createdAt: hours(24),
        kind: "approval",
      },
    ],
  },
  {
    id: "t-cr-2003",
    number: "CR-309",
    type: "change_request",
    title: "Enable MFA enforcement for contractor accounts",
    description:
      "Turn on mandatory MFA for all contractor Azure AD accounts after pilot with Facilities vendors.",
    status: "completed",
    priority: "medium",
    changeType: "standard",
    riskLevel: "low",
    impactSummary:
      "Contractors without enrolled MFA cannot sign in until enrollment completes. Help desk prepared with enrollment guide.",
    affectedSystems: ["Azure AD", "M365"],
    plannedStart: hours(96),
    plannedEnd: hours(94),
    implementationPlan:
      "Enable Conditional Access policy CA-22 for contractor group; monitor sign-in logs for 48 hours.",
    rollbackPlan: "Disable CA-22 and revert to MFA optional for contractor group.",
    cabDecisions: [
      {
        reviewer: "Elena Soto",
        role: "Change Manager",
        decision: "approved",
        decidedAt: hours(110),
      },
      {
        reviewer: "Derek Cho",
        role: "InfoSec",
        decision: "approved",
        decidedAt: hours(108),
      },
    ],
    requester: {
      name: "Derek Cho",
      email: "derek.cho@meridiancu.org",
      department: "Information Security",
    },
    assignee: {
      name: "Derek Cho",
      email: "derek.cho@meridiancu.org",
      department: "Information Security",
    },
    createdAt: hours(160),
    updatedAt: hours(90),
    comments: [
      {
        id: "c6",
        author: "Derek Cho",
        body: "Policy enabled. Zero lockouts in first hour. Closing change.",
        createdAt: hours(90),
        kind: "comment",
      },
    ],
  },
  {
    id: "t-cr-2004",
    number: "CR-321",
    type: "change_request",
    title: "Emergency: patch critical OpenSSL on payment gateways",
    description:
      "Vendor advisory MCU-ADV-118. Patch payment gateway hosts before Monday settlement. Follow emergency CAB path.",
    status: "submitted",
    priority: "critical",
    changeType: "emergency",
    riskLevel: "high",
    impactSummary:
      "Card-present and online ACH initiation pause for 20 minutes during rolling restart.",
    affectedSystems: ["Payment Gateway", "Online Banking ACH"],
    plannedStart: daysAhead(0, 20),
    plannedEnd: daysAhead(0, 21),
    implementationPlan:
      "Apply vendor package on canary host, validate auth and settle test, roll remaining hosts two at a time.",
    rollbackPlan: "Reinstall prior package from golden image; validate settle test before declaring rollback complete.",
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
    ],
    requester: {
      name: "Marcus Webb",
      email: "marcus.webb@meridiancu.org",
      department: "Infrastructure",
    },
    assignee: {
      name: "Elena Soto",
      email: "elena.soto@meridiancu.org",
      department: "Change Management",
    },
    createdAt: hours(2),
    updatedAt: hours(2),
    comments: [
      {
        id: "c7",
        author: "System",
        body: "Emergency change submitted — expedited CAB notified.",
        createdAt: hours(2),
        kind: "status_change",
      },
    ],
  },
];
