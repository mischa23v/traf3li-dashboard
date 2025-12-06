import { createFileRoute } from '@tanstack/react-router'
import InvestmentsDashboard from '@/features/finance/components/investments-dashboard'

export const Route = createFileRoute('/_authenticated/dashboard/finance/investments/')({
    component: InvestmentsDashboard,
})
