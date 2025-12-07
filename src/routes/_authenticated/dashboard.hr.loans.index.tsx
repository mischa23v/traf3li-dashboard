import { createFileRoute } from '@tanstack/react-router'
import { LoansListView } from '@/features/hr/components/loans-list-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/loans/')({
  component: LoansListView,
})
