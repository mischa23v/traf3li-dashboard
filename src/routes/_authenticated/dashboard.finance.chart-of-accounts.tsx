import { createFileRoute } from '@tanstack/react-router'
import ChartOfAccountsView from '@/features/finance/components/chart-of-accounts-view'

export const Route = createFileRoute('/_authenticated/dashboard/finance/chart-of-accounts')({
    component: ChartOfAccountsView,
})
