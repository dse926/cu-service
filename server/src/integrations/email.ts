import { connect as tlsConnect } from "node:tls";
import { emailConfigured, env } from "../config.js";
import type { IntegrationResult, Team, TicketPayload } from "../types.js";

/**
 * Lightweight SMTP AUTH LOGIN client (port 465 implicit TLS).
 * Prefer EMAIL_WEBHOOK_URL → Azure Logic App / Power Automate for Azure-native mail.
 */
async function sendSmtp(
  recipients: string[],
  subject: string,
  text: string
): Promise<IntegrationResult> {
  if (env.smtpPort !== 465) {
    return {
      mode: "live",
      ok: false,
      detail:
        "Built-in SMTP client supports port 465 (TLS). Use EMAIL_WEBHOOK_URL for Logic Apps, or port 465.",
    };
  }

  return new Promise((resolve) => {
    const socket = tlsConnect({
      host: env.smtpHost,
      port: env.smtpPort,
      servername: env.smtpHost,
    });

    let buf = "";
    let phase:
      | "greet"
      | "ehlo"
      | "auth"
      | "user"
      | "pass"
      | "mail"
      | "rcpt"
      | "data"
      | "body"
      | "quit" = "greet";
    const rcptQueue = [...recipients];

    const write = (line: string) => socket.write(line + "\r\n");
    const done = (ok: boolean, detail: string) => {
      try {
        socket.end();
      } catch {
        /* ignore */
      }
      resolve({ mode: "live", ok, detail });
    };

    const timer = setTimeout(() => done(false, "SMTP timeout"), 25000);

    socket.setEncoding("utf8");
    socket.on("error", (err) => {
      clearTimeout(timer);
      done(false, `SMTP error: ${err.message}`);
    });

    socket.on("data", (chunk: string) => {
      buf += chunk;
      const lines = buf.split(/\r?\n/);
      buf = lines.pop() || "";
      for (const line of lines) {
        if (!/^\d{3}/.test(line)) continue;
        const code = line.slice(0, 3);

        if (phase === "greet" && code === "220") {
          phase = "ehlo";
          write("EHLO meridian-cu-api");
        } else if (phase === "ehlo" && code === "250" && !line.startsWith("250-")) {
          phase = "auth";
          write("AUTH LOGIN");
        } else if (phase === "auth" && code === "334") {
          phase = "user";
          write(Buffer.from(env.smtpUser).toString("base64"));
        } else if (phase === "user" && code === "334") {
          phase = "pass";
          write(Buffer.from(env.smtpPass).toString("base64"));
        } else if (phase === "pass" && code === "235") {
          phase = "mail";
          write(`MAIL FROM:<${env.smtpFrom}>`);
        } else if (phase === "mail" && code === "250") {
          phase = "rcpt";
          write(`RCPT TO:<${rcptQueue[0]}>`);
        } else if (phase === "rcpt" && (code === "250" || code === "251")) {
          rcptQueue.shift();
          if (rcptQueue.length) {
            write(`RCPT TO:<${rcptQueue[0]}>`);
          } else {
            phase = "data";
            write("DATA");
          }
        } else if (phase === "data" && code === "354") {
          phase = "body";
          write(
            [
              `From: ${env.smtpFrom}`,
              `To: ${recipients.join(", ")}`,
              `Subject: ${subject}`,
              "Content-Type: text/plain; charset=utf-8",
              "",
              text,
              ".",
            ].join("\r\n")
          );
        } else if (phase === "body" && code === "250") {
          phase = "quit";
          write("QUIT");
          clearTimeout(timer);
          done(true, `Email accepted for ${recipients.join(", ")}`);
        } else if (code.startsWith("4") || code.startsWith("5")) {
          clearTimeout(timer);
          done(false, `SMTP rejected: ${line}`);
        }
      }
    });
  });
}

async function sendWebhook(
  recipients: string[],
  subject: string,
  text: string,
  ticket: TicketPayload,
  team: Team,
  kind: string
): Promise<IntegrationResult> {
  const url = process.env.EMAIL_WEBHOOK_URL;
  if (!url) {
    return { mode: "live", ok: false, detail: "EMAIL_WEBHOOK_URL not set" };
  }
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      to: recipients,
      subject,
      text,
      kind,
      ticket,
      team: { id: team.id, name: team.name },
    }),
  });
  if (!res.ok) {
    return {
      mode: "live",
      ok: false,
      detail: `Email webhook ${res.status}: ${(await res.text()).slice(0, 300)}`,
    };
  }
  return {
    mode: "live",
    ok: true,
    detail: `Email webhook accepted for ${recipients.join(", ")}`,
  };
}

export async function sendTicketEmail(
  ticket: TicketPayload,
  team: Team,
  kind: "created" | "critical" | "ado_linked"
): Promise<IntegrationResult> {
  const to = team.notifyEmails.length
    ? team.notifyEmails
    : [ticket.requester.email];
  const subject = `[${ticket.priority.toUpperCase()}] ${ticket.number}: ${ticket.title}`;
  const text = [
    `Meridian CU Service Desk notification (${kind})`,
    "",
    `Ticket: ${ticket.number}`,
    `Title: ${ticket.title}`,
    `Priority: ${ticket.priority}`,
    `Routed team: ${team.name}`,
    `Requester: ${ticket.requester.name} <${ticket.requester.email}>`,
    "",
    ticket.description,
    "",
    "— Meridian CU Service Desk",
  ].join("\n");

  if (
    env.mockIntegrations ||
    (!emailConfigured() && !process.env.EMAIL_WEBHOOK_URL)
  ) {
    return {
      mode: "mock",
      ok: true,
      detail: `Mock email → ${to.join(", ")} | ${subject}`,
    };
  }

  if (process.env.EMAIL_WEBHOOK_URL) {
    return sendWebhook(to, subject, text, ticket, team, kind);
  }
  return sendSmtp(to, subject, text);
}
