import { createFileRoute } from '@tanstack/react-router'
import { ReconciliationCreateView } from '@/features/finance/components/reconciliation-create-view'

export const Route = createFileRoute(
    '/_authenticated/dashboard/finance/reconciliation/new',
)({
    component: ReconciliationCreateView,
})
