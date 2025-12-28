/**
 * Deal Aging Report Route
 */
import { createFileRoute } from '@tanstack/react-router'
import { DealAgingReport } from '@/features/crm/components/reports/deal-aging-report'

export const Route = createFileRoute('/_authenticated/dashboard/crm/reports/aging')({
  component: DealAgingReport,
})
