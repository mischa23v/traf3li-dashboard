import { createFileRoute } from '@tanstack/react-router'
import { SuccessionPlanningListView } from '@/features/hr/components/succession-planning-list-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/succession-planning/')({
  component: SuccessionPlanningListView,
})
