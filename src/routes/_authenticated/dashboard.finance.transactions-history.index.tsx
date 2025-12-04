import { createFileRoute } from '@tanstack/react-router'
import { GLTransactionsView } from '@/features/finance/components/gl-transactions-view'

export const Route = createFileRoute('/_authenticated/dashboard/finance/transactions-history/')({
    component: GLTransactionsView,
})
