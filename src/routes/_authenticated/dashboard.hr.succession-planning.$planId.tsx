import { createFileRoute } from '@tanstack/react-router'
import { SuccessionPlanningDetailsView } from '@/features/hr/components/succession-planning-details-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/succession-planning/$planId')({
  component: SuccessionPlanningDetailsView,
})
