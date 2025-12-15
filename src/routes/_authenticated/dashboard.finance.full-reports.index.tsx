import { createFileRoute } from '@tanstack/react-router'
import { FullReportsView } from '@/features/finance/components/full-reports-view'

export const Route = createFileRoute('/_authenticated/dashboard/finance/full-reports/')({
    component: FullReportsView,
})
