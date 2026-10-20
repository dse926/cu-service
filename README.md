# Meridian CU Service Desk

Help desk and change management ticketing for Meridian Credit Union ($5.2B assets), with optional Azure-hosted integrations for Azure DevOps sprint items, email notifications, and PagerDuty on critical requests.

**Live static demo:** https://dse926.github.io/cu-service/  
**GitHub:** https://github.com/dse926/cu-service

## Features

- Operations queue (help desk + change management)
- **Trainable team routing** — edit each team’s description; tickets score against that wording to pick the Azure DevOps area/iteration
- **Azure DevOps** — create sprint work items on the matched team backlog
- **Email** — notify team aliases (Logic App webhook or SMTP)
- **PagerDuty** — trigger on `critical` priority
- GitHub Pages static demo (client-only) **or** Azure App Service host (API + UI)

## Run locally

```bash
npm install
npm install --prefix server
npm run dev          # UI :3456
npm run dev:api      # API :8787 (mock integrations by default)
```

Point the UI at the API:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8787 npm run dev
```

Open ticket → **Azure integrations** to classify, create ADO item, email, and page.  
Open **Teams** to train routing descriptions.

## Azure hosting (NEW stack only)

Infrastructure under `infra/` creates a **new** resource group `rg-mcu-servicedesk-<suffix>` plus a new App Service plan/app and Application Insights. It does **not** modify or replace any existing Azure project, resource group, or App Service.

```bash
# Requires Azure CLI logged in
export MOCK_INTEGRATIONS=true   # keep mocks until secrets are set
# optional live secrets:
# export AZURE_DEVOPS_ORG=... AZURE_DEVOPS_PROJECT=... AZURE_DEVOPS_PAT=...
# export PAGERDUTY_ROUTING_KEY=... EMAIL_WEBHOOK_URL=...
npm run deploy:azure
```

After deploy, set `MOCK_INTEGRATIONS=false` and integration secrets on the **new** App Service configuration when ready for live ADO / mail / PagerDuty.

Copy `.env.example` for variable reference.

## GitHub Pages

```bash
npm run build:pages
bash scripts/publish-github-pages.sh
```

The Pages build stays static. Integrations activate when you rebuild with `NEXT_PUBLIC_API_URL` pointing at the Azure API.

## Train team routing

1. Edit `server/config/teams.json` **or** use **Teams** in the UI (when API is connected).
2. Put natural language in each `description` that matches how staff write tickets.
3. Classifier uses token overlap (+ light boosts for help desk / change / category).
4. Matched team supplies ADO area path, notify emails, and PagerDuty severity.
