import { createFileRoute } from '@tanstack/react-router'
import FiscalPeriodsDashboard from '@/features/finance/components/fiscal-periods-dashboard'

export const Route = createFileRoute('/_authenticated/dashboard/finance/fiscal-periods/')({
    component: FiscalPeriodsDashboard,
})
