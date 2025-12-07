import { createFileRoute } from '@tanstack/react-router'
import { GrievancesDetailsView } from '@/features/hr/components/grievances-details-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/grievances/$grievanceId')({
  component: GrievancesDetailsView,
})
