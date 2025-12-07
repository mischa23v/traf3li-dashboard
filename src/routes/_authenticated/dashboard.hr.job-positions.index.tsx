import { createFileRoute } from '@tanstack/react-router'
import { JobPositionsListView } from '@/features/hr/components/job-positions-list-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/job-positions/')({
  component: JobPositionsListView,
})
