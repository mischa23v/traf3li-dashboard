import { createFileRoute } from '@tanstack/react-router'
import { JobPostingsListView } from '@/features/hr/components/job-postings-list-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/recruitment/jobs/')({
  component: JobPostingsListView,
})
