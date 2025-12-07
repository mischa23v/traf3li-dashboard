import { createFileRoute } from '@tanstack/react-router'
import { ExpenseClaimsCreateView } from '@/features/hr/components/expense-claims-create-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/expense-claims/new')({
  component: ExpenseClaimsCreateView,
})
