import { createFileRoute } from '@tanstack/react-router'
import { CardReconciliationView } from '@/features/finance/components/card-reconciliation-view'

export const Route = createFileRoute('/_authenticated/dashboard/finance/corporate-cards/$cardId/reconcile')({
    component: CardReconciliationView,
})
