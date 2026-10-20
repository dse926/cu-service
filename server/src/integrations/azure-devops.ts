import { adoConfigured, env } from "../config.js";
import type { IntegrationResult, Team, TicketPayload } from "../types.js";

function basicAuth(pat: string) {
  return "Basic " + Buffer.from(`:${pat}`).toString("base64");
}

export async function createSprintItem(
  ticket: TicketPayload,
  team: Team
): Promise<IntegrationResult> {
  if (!adoConfigured() || env.mockIntegrations) {
    const fakeId = `MOCK-${ticket.number.replace(/\D/g, "") || Date.now()}`;
    return {
      mode: "mock",
      ok: true,
      detail: `Mock ADO ${env.adoWorkItemType} for ${team.name} (area ${team.adoAreaPath}). Set AZURE_DEVOPS_* and MOCK_INTEGRATIONS=false for live create.`,
      externalId: fakeId,
      externalUrl: `https://dev.azure.com/example/${encodeURIComponent(env.adoProject || "MeridianCU")}/_workitems/edit/${fakeId}`,
    };
  }

  const type = encodeURIComponent(env.adoWorkItemType);
  const url = `https://dev.azure.com/${encodeURIComponent(env.adoOrg)}/${encodeURIComponent(env.adoProject)}/_apis/wit/workitems/$${type}?api-version=7.1`;

  const descriptionHtml = [
    `<p><strong>Service Desk:</strong> ${ticket.number}</p>`,
    `<p><strong>Type:</strong> ${ticket.type}</p>`,
    `<p><strong>Priority:</strong> ${ticket.priority}</p>`,
    `<p><strong>Requester:</strong> ${ticket.requester.name} (${ticket.requester.email})</p>`,
    `<p>${ticket.description.replace(/\n/g, "<br/>")}</p>`,
  ].join("");

  const body = [
    { op: "add", path: "/fields/System.Title", value: `[${ticket.number}] ${ticket.title}` },
    { op: "add", path: "/fields/System.Description", value: descriptionHtml },
    { op: "add", path: "/fields/System.AreaPath", value: team.adoAreaPath },
    { op: "add", path: "/fields/System.IterationPath", value: team.adoIterationPath },
    {
      op: "add",
      path: "/fields/Microsoft.VSTS.Common.Priority",
      value: ticket.priority === "critical" ? 1 : ticket.priority === "high" ? 2 : 3,
    },
    {
      op: "add",
      path: "/fields/System.Tags",
      value: `ServiceDesk; ${ticket.type}; ${ticket.priority}`,
    },
  ];

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json-patch+json",
      Authorization: basicAuth(env.adoPat),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    return {
      mode: "live",
      ok: false,
      detail: `Azure DevOps error ${res.status}: ${text.slice(0, 400)}`,
    };
  }

  const json = (await res.json()) as { id: number; _links?: { html?: { href?: string } } };
  return {
    mode: "live",
    ok: true,
    detail: `Created ${env.adoWorkItemType} #${json.id} in ${team.adoAreaPath}`,
    externalId: String(json.id),
    externalUrl:
      json._links?.html?.href ||
      `https://dev.azure.com/${env.adoOrg}/${encodeURIComponent(env.adoProject)}/_workitems/edit/${json.id}`,
  };
}
