import { createFileRoute } from '@tanstack/react-router'
import { JobCardListView } from '@/features/manufacturing/components'

export const Route = createFileRoute('/_authenticated/dashboard/manufacturing/job-cards/')({
  component: JobCardListView,
})
