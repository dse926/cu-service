targetScope = 'subscription'

@minLength(3)
@maxLength(24)
@description('Short unique suffix so names never collide with existing Azure apps.')
param nameSuffix string = uniqueString(subscription().subscriptionId, 'mcu-servicedesk')

@description('Azure region for the NEW resource group.')
param location string = 'eastus'

@description('NEW resource group name — leave default to avoid clashing with existing projects.')
param resourceGroupName string = 'rg-mcu-servicedesk-${nameSuffix}'

@description('App Service plan SKU.')
param skuName string = 'B1'

@secure()
@description('Azure DevOps PAT (optional at deploy; can set later in portal).')
param azureDevOpsPat string = ''

@secure()
@description('PagerDuty Events API v2 routing key (optional).')
param pagerDutyRoutingKey string = ''

@secure()
@description('SMTP password or leave empty when using EMAIL_WEBHOOK_URL.')
param smtpPass string = ''

param azureDevOpsOrg string = ''
param azureDevOpsProject string = ''
param smtpHost string = ''
param smtpUser string = ''
param smtpFrom string = 'servicedesk@meridiancu.org'
param emailWebhookUrl string = ''
param corsOrigin string = '*'
param mockIntegrations string = 'true'

resource rg 'Microsoft.Resources/resourceGroups@2024-03-01' = {
  name: resourceGroupName
  location: location
  tags: {
    application: 'meridian-cu-service-desk'
    purpose: 'new-stack-do-not-reuse-existing-projects'
  }
}

module app 'app.bicep' = {
  name: 'mcu-servicedesk-app'
  scope: rg
  params: {
    location: location
    nameSuffix: nameSuffix
    skuName: skuName
    azureDevOpsOrg: azureDevOpsOrg
    azureDevOpsProject: azureDevOpsProject
    azureDevOpsPat: azureDevOpsPat
    pagerDutyRoutingKey: pagerDutyRoutingKey
    smtpHost: smtpHost
    smtpUser: smtpUser
    smtpPass: smtpPass
    smtpFrom: smtpFrom
    emailWebhookUrl: emailWebhookUrl
    corsOrigin: corsOrigin
    mockIntegrations: mockIntegrations
  }
}

output resourceGroup string = rg.name
output apiAppName string = app.outputs.apiAppName
output apiUrl string = app.outputs.apiUrl
output note string = 'New stack only — existing Azure projects were not modified.'
