import { createFileRoute } from '@tanstack/react-router'
import { TransactionDetailsView } from '@/features/finance/components/transaction-details-view'

export const Route = createFileRoute('/_authenticated/dashboard/finance/transactions/$transactionId')({
    component: TransactionDetailsView,
})
