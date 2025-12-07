import { createFileRoute } from '@tanstack/react-router'
import { LoansCreateView } from '@/features/hr/components/loans-create-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/loans/new')({
  component: LoansCreateView,
})
