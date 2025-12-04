import { createFileRoute } from '@tanstack/react-router'
import BillsDashboard from '@/features/finance/components/bills-dashboard'

export const Route = createFileRoute('/_authenticated/dashboard/finance/bills/')({
    component: BillsDashboard,
})
