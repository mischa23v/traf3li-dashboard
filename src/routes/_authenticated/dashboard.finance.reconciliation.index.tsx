import { createFileRoute } from '@tanstack/react-router'
import { ReconciliationListView } from '@/features/finance/components/reconciliation-list-view'

export const Route = createFileRoute('/_authenticated/dashboard/finance/reconciliation/')({
  component: ReconciliationListView,
})
