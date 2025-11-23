import { createFileRoute } from '@tanstack/react-router'
import StatementsHistoryDashboard from '../../newdesigns/StatementsHistoryDashboard'

export const Route = createFileRoute('/statements-history')({
    component: StatementsHistoryDashboard,
})
