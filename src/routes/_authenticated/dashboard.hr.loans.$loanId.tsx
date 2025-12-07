import { createFileRoute } from '@tanstack/react-router'
import { LoansDetailsView } from '@/features/hr/components/loans-details-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/loans/$loanId')({
  component: LoansDetailsView,
})
