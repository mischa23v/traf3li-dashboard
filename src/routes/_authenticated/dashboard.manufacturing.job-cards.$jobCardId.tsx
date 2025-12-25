import { createFileRoute } from '@tanstack/react-router'
import { JobCardDetailsView } from '@/features/manufacturing/components'

export const Route = createFileRoute('/_authenticated/dashboard/manufacturing/job-cards/$jobCardId')({
  component: JobCardDetailsView,
})
