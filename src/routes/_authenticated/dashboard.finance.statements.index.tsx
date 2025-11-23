import { createFileRoute } from '@tanstack/react-router'
import StatementsHistoryDashboard from '@/features/finance/components/statements-history-dashboard'

export const Route = createFileRoute('/_authenticated/dashboard/finance/statements/')({
    component: StatementsHistoryDashboard,
})
