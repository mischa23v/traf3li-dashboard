import { createFileRoute } from '@tanstack/react-router'
import { ExpenseClaimsDetailsView } from '@/features/hr/components/expense-claims-details-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/expense-claims/$claimId')({
  component: ExpenseClaimsDetailsView,
})
