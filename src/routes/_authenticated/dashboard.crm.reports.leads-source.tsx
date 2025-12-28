/**
 * Leads by Source Report Route
 */
import { createFileRoute } from '@tanstack/react-router'
import { LeadsBySourceReport } from '@/features/crm/components/reports/leads-by-source-report'

export const Route = createFileRoute('/_authenticated/dashboard/crm/reports/leads-source')({
  component: LeadsBySourceReport,
})
