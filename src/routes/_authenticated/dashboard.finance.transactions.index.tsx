import { createFileRoute } from '@tanstack/react-router'
import TransactionsDashboard from '@/features/finance/components/transactions-dashboard'

export const Route = createFileRoute('/_authenticated/dashboard/finance/transactions/')({
    component: TransactionsDashboard,
})
