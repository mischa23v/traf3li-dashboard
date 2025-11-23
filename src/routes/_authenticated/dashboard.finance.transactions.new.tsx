import { createFileRoute } from '@tanstack/react-router'
import { CreateTransactionView } from '@/features/finance/components/create-transaction-view'

export const Route = createFileRoute(
    '/_authenticated/dashboard/finance/transactions/new',
)({
    component: CreateTransactionView,
})
