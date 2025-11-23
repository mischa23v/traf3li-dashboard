import { createFileRoute } from '@tanstack/react-router'
import AccountActivityDashboard from '../../newdesigns/AccountActivityDashboard'

export const Route = createFileRoute('/account-activity')({
    component: AccountActivityDashboard,
})
