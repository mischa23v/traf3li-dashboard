import { createFileRoute } from '@tanstack/react-router'
import AccountActivityDashboard from '@/features/finance/components/account-activity-dashboard'

export const Route = createFileRoute('/_authenticated/dashboard/finance/activity/')({
    component: AccountActivityDashboard,
})
