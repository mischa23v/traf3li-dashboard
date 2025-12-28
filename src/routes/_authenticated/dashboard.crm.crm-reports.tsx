/**
 * CRM Reports Dashboard Route
 * Ultimate enterprise-grade CRM analytics dashboard
 */
import { createFileRoute } from '@tanstack/react-router'
import { CrmReportsDashboardView } from '@/features/crm/views/crm-reports-dashboard-view'

export const Route = createFileRoute('/_authenticated/dashboard/crm/crm-reports')({
  component: CrmReportsDashboardView,
})
