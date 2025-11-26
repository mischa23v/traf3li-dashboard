import { createFileRoute } from '@tanstack/react-router'
import { BrowseJobs } from '@/features/jobs/components/browse-jobs'

export const Route = createFileRoute('/_authenticated/dashboard/jobs/browse')({
  component: BrowseJobs,
})
