param location string
param nameSuffix string
param skuName string
param azureDevOpsOrg string
param azureDevOpsProject string
@secure()
param azureDevOpsPat string
@secure()
param pagerDutyRoutingKey string
param smtpHost string
param smtpUser string
@secure()
param smtpPass string
param smtpFrom string
param emailWebhookUrl string
param corsOrigin string
param mockIntegrations string

var apiName = 'app-mcu-api-${nameSuffix}'
var planName = 'plan-mcu-${nameSuffix}'
var insightsName = 'ai-mcu-${nameSuffix}'

resource plan 'Microsoft.Web/serverfarms@2023-12-01' = {
  name: planName
  location: location
  sku: {
    name: skuName
    tier: skuName == 'F1' || skuName == 'D1' ? 'Free' : 'Basic'
    capacity: 1
  }
  kind: 'linux'
  properties: {
    reserved: true
  }
  tags: {
    application: 'meridian-cu-service-desk'
  }
}

resource insights 'Microsoft.Insights/components@2020-02-02' = {
  name: insightsName
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    Request_Source: 'rest'
  }
  tags: {
    application: 'meridian-cu-service-desk'
  }
}

resource api 'Microsoft.Web/sites@2023-12-01' = {
  name: apiName
  location: location
  kind: 'app,linux'
  properties: {
    serverFarmId: plan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'NODE|20-lts'
      appCommandLine: 'node dist/index.js'
      alwaysOn: skuName != 'F1'
      appSettings: [
        { name: 'SCM_DO_BUILD_DURING_DEPLOYMENT', value: 'true' }
        { name: 'MOCK_INTEGRATIONS', value: mockIntegrations }
        { name: 'CORS_ORIGIN', value: corsOrigin }
        { name: 'AZURE_DEVOPS_ORG', value: azureDevOpsOrg }
        { name: 'AZURE_DEVOPS_PROJECT', value: azureDevOpsProject }
        { name: 'AZURE_DEVOPS_PAT', value: azureDevOpsPat }
        { name: 'AZURE_DEVOPS_WORK_ITEM_TYPE', value: 'User Story' }
        { name: 'PAGERDUTY_ROUTING_KEY', value: pagerDutyRoutingKey }
        { name: 'SMTP_HOST', value: smtpHost }
        { name: 'SMTP_PORT', value: '465' }
        { name: 'SMTP_USER', value: smtpUser }
        { name: 'SMTP_PASS', value: smtpPass }
        { name: 'SMTP_FROM', value: smtpFrom }
        { name: 'EMAIL_WEBHOOK_URL', value: emailWebhookUrl }
        { name: 'STATIC_ROOT', value: '/home/site/wwwroot/out' }
        { name: 'TEAMS_CONFIG_PATH', value: '/home/site/wwwroot/data/teams.json' }
        { name: 'APPINSIGHTS_INSTRUMENTATIONKEY', value: insights.properties.InstrumentationKey }
        { name: 'APPLICATIONINSIGHTS_CONNECTION_STRING', value: insights.properties.ConnectionString }
        { name: 'WEBSITE_NODE_DEFAULT_VERSION', value: '~20' }
      ]
    }
  }
  tags: {
    application: 'meridian-cu-service-desk'
    role: 'api-and-static'
  }
}

output apiAppName string = api.name
output apiUrl string = 'https://${api.properties.defaultHostName}'
