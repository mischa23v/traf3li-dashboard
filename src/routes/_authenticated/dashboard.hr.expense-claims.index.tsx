import { createFileRoute } from '@tanstack/react-router'
import { ExpenseClaimsListView } from '@/features/hr/components/expense-claims-list-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/expense-claims/')({
  component: ExpenseClaimsListView,
})
