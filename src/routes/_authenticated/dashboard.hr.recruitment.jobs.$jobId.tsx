import { createFileRoute } from '@tanstack/react-router'
import { JobPostingDetailsView } from '@/features/hr/components/job-posting-details-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/recruitment/jobs/$jobId')({
  component: JobPostingDetailsView,
})
