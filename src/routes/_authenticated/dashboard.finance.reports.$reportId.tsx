import { createFileRoute } from '@tanstack/react-router'
import { FinanceReportsDetailsView } from '@/features/finance/components/finance-reports-details-view'

export const Route = createFileRoute('/_authenticated/dashboard/finance/reports/$reportId')({
  component: FinanceReportsDetailsView,
})
