import { createFileRoute } from '@tanstack/react-router'
import { BillDetailsView } from '@/features/finance/components/bill-details-view'

export const Route = createFileRoute('/_authenticated/dashboard/finance/bills/$billId')({
    component: BillDetailsView,
})
