import { createFileRoute } from '@tanstack/react-router'
import { EditTransactionView } from '@/features/finance/components/edit-transaction-view'

export const Route = createFileRoute('/_authenticated/dashboard/finance/transactions/$transactionId/edit')({
    component: EditTransactionView,
})
