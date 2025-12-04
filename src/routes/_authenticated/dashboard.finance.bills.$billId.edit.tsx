import { createFileRoute } from '@tanstack/react-router'
import { CreateBillView } from '@/features/finance/components/create-bill-view'

export const Route = createFileRoute('/_authenticated/dashboard/finance/bills/$billId/edit')({
    component: () => <CreateBillView mode="edit" />,
})
