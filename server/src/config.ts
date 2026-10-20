import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { TeamsConfig } from "./types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Prefer writable data dir on App Service; fall back to repo config. */
function teamsPath() {
  const data = process.env.TEAMS_CONFIG_PATH;
  if (data) return data;
  const azureHome = process.env.HOME
    ? join(process.env.HOME, "site", "wwwroot", "data", "teams.json")
    : null;
  if (azureHome && existsSync(dirname(azureHome))) return azureHome;
  return join(__dirname, "..", "config", "teams.json");
}

const seedPath = join(__dirname, "..", "config", "teams.json");

export function loadTeams(): TeamsConfig {
  const path = teamsPath();
  const file = existsSync(path) ? path : seedPath;
  const raw = readFileSync(file, "utf8");
  return JSON.parse(raw) as TeamsConfig;
}

export function saveTeams(config: TeamsConfig) {
  const path = teamsPath();
  mkdirSync(dirname(path), { recursive: true });
  const next = { ...config, updatedAt: new Date().toISOString() };
  writeFileSync(path, JSON.stringify(next, null, 2) + "\n", "utf8");
  return next;
}

export const env = {
  port: Number(process.env.PORT || 8787),
  corsOrigin: process.env.CORS_ORIGIN || "*",
  mockIntegrations: process.env.MOCK_INTEGRATIONS !== "false",

  adoOrg: process.env.AZURE_DEVOPS_ORG || "",
  adoProject: process.env.AZURE_DEVOPS_PROJECT || "",
  adoPat: process.env.AZURE_DEVOPS_PAT || "",
  adoWorkItemType: process.env.AZURE_DEVOPS_WORK_ITEM_TYPE || "User Story",

  smtpHost: process.env.SMTP_HOST || "",
  smtpPort: Number(process.env.SMTP_PORT || 587),
  smtpUser: process.env.SMTP_USER || "",
  smtpPass: process.env.SMTP_PASS || "",
  smtpFrom: process.env.SMTP_FROM || "servicedesk@meridiancu.org",

  acsEndpoint: process.env.ACS_EMAIL_ENDPOINT || "",
  acsAccessKey: process.env.ACS_EMAIL_ACCESS_KEY || "",
  acsFrom: process.env.ACS_EMAIL_FROM || "",

  pagerDutyRoutingKey: process.env.PAGERDUTY_ROUTING_KEY || "",
};

export function adoConfigured() {
  return Boolean(env.adoOrg && env.adoProject && env.adoPat);
}

export function emailConfigured() {
  return Boolean(
    process.env.EMAIL_WEBHOOK_URL ||
      (env.smtpHost && env.smtpUser && env.smtpPass) ||
      (env.acsEndpoint && env.acsAccessKey && env.acsFrom)
  );
}

export function pagerDutyConfigured() {
  return Boolean(env.pagerDutyRoutingKey);
}
