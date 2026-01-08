import { createFileRoute } from '@tanstack/react-router'
import { GOSIDashboardView } from '@/features/finance/components/gosi-dashboard-view'

export const Route = createFileRoute('/_authenticated/dashboard/finance/saudi-banking/gosi/')({
    component: GOSIDashboardView,
})
