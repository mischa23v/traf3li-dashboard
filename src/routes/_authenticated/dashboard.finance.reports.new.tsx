import { createFileRoute } from '@tanstack/react-router'
import { FinanceReportsCreateView } from '@/features/finance/components/finance-reports-create-view'

export const Route = createFileRoute('/_authenticated/dashboard/finance/reports/new')({
  component: FinanceReportsCreateView,
})
