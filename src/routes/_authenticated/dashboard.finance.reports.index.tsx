import { createFileRoute } from '@tanstack/react-router'
import { FinanceReportsListView } from '@/features/finance/components/finance-reports-list-view'

export const Route = createFileRoute('/_authenticated/dashboard/finance/reports/')({
    component: FinanceReportsListView,
})
