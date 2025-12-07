import { createFileRoute } from '@tanstack/react-router'
import { JobPositionsCreateView } from '@/features/hr/components/job-positions-create-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/job-positions/new')({
  component: JobPositionsCreateView,
})
