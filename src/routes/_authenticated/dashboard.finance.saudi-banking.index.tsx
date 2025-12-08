import { createFileRoute } from '@tanstack/react-router'
import { SaudiBankingListView } from '@/features/finance/components/saudi-banking-list-view'

export const Route = createFileRoute('/_authenticated/dashboard/finance/saudi-banking/')({
    component: SaudiBankingListView,
})
