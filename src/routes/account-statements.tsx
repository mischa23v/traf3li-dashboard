import { createFileRoute } from '@tanstack/react-router'
import AccountStatementDashboard from '../../newdesigns/AccountStatementDashboard'

export const Route = createFileRoute('/account-statements')({
    component: AccountStatementDashboard,
})
