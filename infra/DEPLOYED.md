# Azure deployment (new stack)

Resource group: `rg-mcu-servicedesk-swa` (does not modify existing projects)

| Surface | URL |
|--------|-----|
| UI (Static Web Apps) | https://salmon-sand-065c9bb0f.1.azurestaticapps.net/ |
| API (Container Apps, HTTPS) | https://mcu-api.agreeableground-9f0019fd.eastus.azurecontainerapps.io/ |
| Health | https://mcu-api.agreeableground-9f0019fd.eastus.azurecontainerapps.io/health |

Integrations run in **mock mode** until you set secrets on the Container App (`MOCK_INTEGRATIONS=false`, ADO/email/PagerDuty vars).

App Service plan SKUs were quota-blocked (F1/B1 = 0) on this subscription, so this stack uses Static Web Apps + Container Apps instead.
