import { createFileRoute } from '@tanstack/react-router'
import { GrievancesListView } from '@/features/hr/components/grievances-list-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/grievances/')({
  component: GrievancesListView,
})
