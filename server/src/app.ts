import { Hono } from "hono";
import { cors } from "hono/cors";
import { z } from "zod";
import {
  adoConfigured,
  emailConfigured,
  env,
  loadTeams,
  pagerDutyConfigured,
  saveTeams,
} from "./config.js";
import { classifyTeam } from "./classify.js";
import { createSprintItem } from "./integrations/azure-devops.js";
import { sendTicketEmail } from "./integrations/email.js";
import { pageCritical } from "./integrations/pagerduty.js";
import type { TicketPayload } from "./types.js";

const ticketSchema = z.object({
  id: z.string().min(1),
  number: z.string().min(1),
  type: z.enum(["help_desk", "change_request"]),
  title: z.string().min(1),
  description: z.string().min(1),
  priority: z.enum(["low", "medium", "high", "critical"]),
  status: z.string(),
  category: z.string().optional(),
  requester: z.object({
    name: z.string(),
    email: z.string().email(),
    department: z.string(),
    branch: z.string().optional(),
  }),
  changeType: z.string().optional(),
  riskLevel: z.string().optional(),
});

export function buildApp() {
  const app = new Hono();

  app.use(
    "*",
    cors({
      origin: env.corsOrigin === "*" ? "*" : env.corsOrigin.split(","),
      allowMethods: ["GET", "POST", "PUT", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization"],
    })
  );

  app.get("/health", (c) =>
    c.json({
      ok: true,
      service: "meridian-cu-api",
      mockIntegrations: env.mockIntegrations,
      integrations: {
        azureDevOps: adoConfigured(),
        email: emailConfigured() || Boolean(process.env.EMAIL_WEBHOOK_URL),
        pagerDuty: pagerDutyConfigured(),
      },
    })
  );

  app.get("/teams", (c) => {
    const config = loadTeams();
    return c.json(config);
  });

  app.put("/teams", async (c) => {
    const body = await c.req.json();
    const schema = z.object({
      teams: z
        .array(
          z.object({
            id: z.string(),
            name: z.string(),
            adoAreaPath: z.string(),
            adoIterationPath: z.string(),
            description: z.string().min(20),
            notifyEmails: z.array(z.string().email()),
            pagerDutySeverity: z.enum(["info", "warning", "error", "critical"]),
          })
        )
        .min(1),
    });
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return c.json({ ok: false, error: parsed.error.flatten() }, 400);
    }
    const saved = saveTeams({
      updatedAt: new Date().toISOString(),
      teams: parsed.data.teams,
    });
    return c.json({ ok: true, config: saved });
  });

  app.post("/classify", async (c) => {
    const parsed = ticketSchema.safeParse(await c.req.json());
    if (!parsed.success) {
      return c.json({ ok: false, error: parsed.error.flatten() }, 400);
    }
    const config = loadTeams();
    const result = classifyTeam(config.teams, parsed.data as TicketPayload);
    return c.json({ ok: true, ...result });
  });

  /** Classify → ADO sprint item → email → PagerDuty (critical). */
  app.post("/integrations/sync", async (c) => {
    const body = await c.req.json();
    const parsed = ticketSchema
      .extend({
        teamId: z.string().optional(),
        createAdo: z.boolean().optional().default(true),
        sendEmail: z.boolean().optional().default(true),
        pageOnCritical: z.boolean().optional().default(true),
      })
      .safeParse(body);

    if (!parsed.success) {
      return c.json({ ok: false, error: parsed.error.flatten() }, 400);
    }

    const ticket = parsed.data as TicketPayload & {
      teamId?: string;
      createAdo: boolean;
      sendEmail: boolean;
      pageOnCritical: boolean;
    };

    const config = loadTeams();
    const classification = ticket.teamId
      ? {
          team:
            config.teams.find((t) => t.id === ticket.teamId) ||
            classifyTeam(config.teams, ticket).team,
          score: 0,
          rationale: ticket.teamId
            ? "Team selected manually."
            : "Auto-classified.",
          alternatives: [],
        }
      : classifyTeam(config.teams, ticket);

    if (ticket.teamId) {
      const forced = config.teams.find((t) => t.id === ticket.teamId);
      if (forced) classification.team = forced;
    }

    const ado = ticket.createAdo
      ? await createSprintItem(ticket, classification.team)
      : {
          mode: "mock" as const,
          ok: true,
          detail: "ADO create skipped",
        };

    const emailKind =
      ticket.priority === "critical"
        ? "critical"
        : ado.externalId
          ? "ado_linked"
          : "created";

    const email = ticket.sendEmail
      ? await sendTicketEmail(ticket, classification.team, emailKind)
      : { mode: "mock" as const, ok: true, detail: "Email skipped" };

    const pager =
      ticket.pageOnCritical && ticket.priority === "critical"
        ? await pageCritical(ticket, classification.team)
        : {
            mode: "mock" as const,
            ok: true,
            detail: "PagerDuty skipped",
          };

    return c.json({
      ok: ado.ok && email.ok && pager.ok,
      classification,
      azureDevOps: ado,
      email,
      pagerDuty: pager,
    });
  });

  return app;
}
