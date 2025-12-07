import { createFileRoute } from '@tanstack/react-router'
import { JobPositionsDetailsView } from '@/features/hr/components/job-positions-details-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/job-positions/$positionId')({
  component: JobPositionsDetailsView,
})
