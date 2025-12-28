/**
 * Sales Funnel Report Route
 */
import { createFileRoute } from '@tanstack/react-router'
import { SalesFunnelReport } from '@/features/crm/components/reports/sales-funnel-report'

export const Route = createFileRoute('/_authenticated/dashboard/crm/reports/funnel')({
  component: SalesFunnelReport,
})
