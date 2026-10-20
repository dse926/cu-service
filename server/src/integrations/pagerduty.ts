import { env, pagerDutyConfigured } from "../config.js";
import type { IntegrationResult, Team, TicketPayload } from "../types.js";

export async function pageCritical(
  ticket: TicketPayload,
  team: Team
): Promise<IntegrationResult> {
  if (ticket.priority !== "critical") {
    return {
      mode: env.mockIntegrations || !pagerDutyConfigured() ? "mock" : "live",
      ok: true,
      detail: "PagerDuty skipped — priority is not critical.",
    };
  }

  const summary = `[${ticket.number}] ${ticket.title}`;
  const payload = {
    routing_key: env.pagerDutyRoutingKey,
    event_action: "trigger",
    dedup_key: `mcu-servicedesk-${ticket.id}`,
    payload: {
      summary: summary.slice(0, 1024),
      source: "meridian-cu-service-desk",
      severity: team.pagerDutySeverity || "critical",
      component: team.name,
      group: ticket.type,
      class: ticket.category || ticket.changeType || ticket.type,
      custom_details: {
        ticketNumber: ticket.number,
        team: team.name,
        requester: ticket.requester.email,
        description: ticket.description.slice(0, 2000),
      },
    },
  };

  if (!pagerDutyConfigured() || env.mockIntegrations) {
    return {
      mode: "mock",
      ok: true,
      detail: `Mock PagerDuty trigger for ${team.name}: ${summary}. Set PAGERDUTY_ROUTING_KEY and MOCK_INTEGRATIONS=false for live alerts.`,
      externalId: `mock-pd-${ticket.id}`,
    };
  }

  const res = await fetch("https://events.pagerduty.com/v2/enqueue", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = (await res.json().catch(() => ({}))) as {
    status?: string;
    message?: string;
    dedup_key?: string;
  };

  if (!res.ok || json.status !== "success") {
    return {
      mode: "live",
      ok: false,
      detail: `PagerDuty error: ${json.message || res.status}`,
    };
  }

  return {
    mode: "live",
    ok: true,
    detail: `PagerDuty incident triggered for ${team.name}`,
    externalId: json.dedup_key,
  };
}
