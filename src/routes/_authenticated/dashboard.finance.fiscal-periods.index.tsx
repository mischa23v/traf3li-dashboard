import { createFileRoute } from '@tanstack/react-router'
import FiscalPeriodsView from '@/features/finance/components/fiscal-periods-view'

export const Route = createFileRoute('/_authenticated/dashboard/finance/fiscal-periods/')({
    component: FiscalPeriodsView,
})
