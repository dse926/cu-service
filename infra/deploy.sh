#!/usr/bin/env bash
# Deploys a NEW Azure resource group for Meridian CU Service Desk.
# Does NOT select, update, or delete any existing Azure project/RG.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SUFFIX="${NAME_SUFFIX:-$(openssl rand -hex 3)}"
LOCATION="${LOCATION:-eastus}"
RG="rg-mcu-servicedesk-${SUFFIX}"

if ! command -v az >/dev/null 2>&1; then
  echo "Azure CLI (az) is required. Install: https://learn.microsoft.com/cli/azure/install-azure-cli" >&2
  exit 1
fi

echo "Logging in (device code) if needed..."
az account show >/dev/null 2>&1 || az login

echo "Creating NEW resource group only: $RG in $LOCATION"
echo "(Existing resource groups and App Services will not be modified.)"

az deployment sub create \
  --name "mcu-servicedesk-${SUFFIX}" \
  --location "$LOCATION" \
  --template-file "$ROOT/infra/main.bicep" \
  --parameters \
    nameSuffix="$SUFFIX" \
    location="$LOCATION" \
    resourceGroupName="$RG" \
    mockIntegrations="${MOCK_INTEGRATIONS:-true}" \
    azureDevOpsOrg="${AZURE_DEVOPS_ORG:-}" \
    azureDevOpsProject="${AZURE_DEVOPS_PROJECT:-}" \
    azureDevOpsPat="${AZURE_DEVOPS_PAT:-}" \
    pagerDutyRoutingKey="${PAGERDUTY_ROUTING_KEY:-}" \
    smtpHost="${SMTP_HOST:-}" \
    smtpUser="${SMTP_USER:-}" \
    smtpPass="${SMTP_PASS:-}" \
    emailWebhookUrl="${EMAIL_WEBHOOK_URL:-}" \
    corsOrigin="${CORS_ORIGIN:-*}"

API_NAME=$(az deployment sub show -n "mcu-servicedesk-${SUFFIX}" --query properties.outputs.apiAppName.value -o tsv)
API_URL=$(az deployment sub show -n "mcu-servicedesk-${SUFFIX}" --query properties.outputs.apiUrl.value -o tsv)

echo
echo "Building API + static UI (no basePath for Azure host)..."
cd "$ROOT"
NEXT_PUBLIC_BASE_PATH= NEXT_PUBLIC_API_URL="$API_URL" npm run build
cd "$ROOT/server" && npm ci && npm run build

echo "Packaging and deploying to NEW App Service $API_NAME ..."
STAGE=$(mktemp -d)
cp -R "$ROOT/server/dist" "$STAGE/dist"
cp -R "$ROOT/server/config" "$STAGE/config"
cp "$ROOT/server/package.json" "$STAGE/package.json"
cp "$ROOT/server/package-lock.json" "$STAGE/package-lock.json" 2>/dev/null || true
mkdir -p "$STAGE/out" "$STAGE/data"
cp -R "$ROOT/out/." "$STAGE/out/"
cp "$ROOT/server/config/teams.json" "$STAGE/data/teams.json"
# Azure Oryx / startup
printf '%s\n' '{"name":"meridian-cu-api","scripts":{"start":"node dist/index.js"},"type":"module"}' > "$STAGE/package.json"
# merge deps — re-copy real package.json
cp "$ROOT/server/package.json" "$STAGE/package.json"
cd "$ROOT/server" && npm ci --omit=dev
cp -R "$ROOT/server/node_modules" "$STAGE/node_modules"

cd "$STAGE"
zip -r /tmp/mcu-api.zip . >/dev/null
az webapp deploy --resource-group "$RG" --name "$API_NAME" --src-path /tmp/mcu-api.zip --type zip

echo
echo "Deployed NEW stack:"
echo "  Resource group: $RG"
echo "  API / UI:       $API_URL"
echo "  Health:         $API_URL/health"
echo
echo "Set MOCK_INTEGRATIONS=false and secrets in the App Service configuration when ready for live ADO / email / PagerDuty."
