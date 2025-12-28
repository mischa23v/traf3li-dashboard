/**
 * CRM Reports Components
 * Ultimate CRM reporting system with enterprise-grade analytics
 */

// Original Reports
export { LostOpportunityReport } from './lost-opportunity-report'
export { CampaignEfficiencyReport } from './campaign-efficiency-report'
export { FirstResponseTimeReport } from './first-response-time-report'
export { LeadOwnerEfficiencyReport } from './lead-owner-efficiency-report'
export { ProspectsEngagedReport } from './prospects-engaged-report'
export { LeadConversionTimeReport } from './lead-conversion-time-report'
export { SalesPipelineAnalyticsReport } from './sales-pipeline-analytics-report'

// Ultimate CRM Reports (New)
export { LeadsBySourceReport } from './leads-by-source-report'
export { SalesFunnelReport } from './sales-funnel-report'
export { DealAgingReport } from './deal-aging-report'
export { WinLossAnalysisReport } from './win-loss-analysis-report'
export { ActivityAnalyticsReport } from './activity-analytics-report'
export { RevenueForecastReport } from './revenue-forecast-report'

// Report type definitions for dashboard navigation
export const ULTIMATE_CRM_REPORTS = [
  {
    id: 'sales-funnel',
    component: 'SalesFunnelReport',
    route: '/dashboard/crm/reports/funnel',
    icon: 'Funnel',
    category: 'pipeline',
  },
  {
    id: 'deal-aging',
    component: 'DealAgingReport',
    route: '/dashboard/crm/reports/aging',
    icon: 'Clock',
    category: 'pipeline',
  },
  {
    id: 'leads-by-source',
    component: 'LeadsBySourceReport',
    route: '/dashboard/crm/reports/leads-source',
    icon: 'Users',
    category: 'leads',
  },
  {
    id: 'win-loss',
    component: 'WinLossAnalysisReport',
    route: '/dashboard/crm/reports/win-loss',
    icon: 'Target',
    category: 'performance',
  },
  {
    id: 'activity-analytics',
    component: 'ActivityAnalyticsReport',
    route: '/dashboard/crm/reports/activities',
    icon: 'Activity',
    category: 'performance',
  },
  {
    id: 'revenue-forecast',
    component: 'RevenueForecastReport',
    route: '/dashboard/crm/reports/forecast',
    icon: 'DollarSign',
    category: 'revenue',
  },
] as const
