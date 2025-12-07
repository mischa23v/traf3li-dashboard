import { createFileRoute } from '@tanstack/react-router'
import { GrievancesCreateView } from '@/features/hr/components/grievances-create-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/grievances/new')({
  component: GrievancesCreateView,
})
