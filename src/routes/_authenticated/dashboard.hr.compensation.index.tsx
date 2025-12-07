import { createFileRoute } from '@tanstack/react-router'
import { CompensationListView } from '@/features/hr/components/compensation-list-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/compensation/')({
  component: CompensationListView,
})
