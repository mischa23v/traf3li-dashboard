import { createFileRoute } from '@tanstack/react-router'
import AccountsDashboard from '@/features/finance/components/accounts-dashboard'

export const Route = createFileRoute('/_authenticated/dashboard/finance/overview')({
    component: AccountsDashboard,
})
