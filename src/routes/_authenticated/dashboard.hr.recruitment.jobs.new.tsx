import { createFileRoute } from '@tanstack/react-router'
import { JobPostingCreateView } from '@/features/hr/components/job-posting-create-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/recruitment/jobs/new')({
  component: JobPostingCreateView,
})
