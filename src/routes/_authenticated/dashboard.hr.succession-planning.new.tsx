import { createFileRoute } from '@tanstack/react-router'
import { SuccessionPlanningCreateView } from '@/features/hr/components/succession-planning-create-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/succession-planning/new')({
  component: SuccessionPlanningCreateView,
})
