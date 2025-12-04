import { createFileRoute } from '@tanstack/react-router'
import RecurringTransactionsDashboard from '@/features/finance/components/recurring-transactions-dashboard'

export const Route = createFileRoute('/_authenticated/dashboard/finance/recurring/')({
    component: RecurringTransactionsDashboard,
})
