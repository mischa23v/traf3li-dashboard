import { createFileRoute } from '@tanstack/react-router'
import { ReconciliationDetailsView } from '@/features/finance/components/reconciliation-details-view'

export const Route = createFileRoute('/_authenticated/dashboard/finance/reconciliation/$feedId')({
    component: ReconciliationDetailsView,
})
