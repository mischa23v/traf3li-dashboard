import { createFileRoute } from '@tanstack/react-router'
import { AccountsAgingReport } from '@/features/finance/components/reports'

export const Route = createFileRoute('/_authenticated/dashboard/finance/reports/accounts-aging')({
    component: AccountsAgingReport,
})
