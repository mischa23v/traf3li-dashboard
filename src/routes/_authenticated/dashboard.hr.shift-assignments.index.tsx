import { createFileRoute } from '@tanstack/react-router'
import { ShiftAssignmentsListView } from '@/features/hr/components/shift-assignments-list-view'

export const Route = createFileRoute(
  '/_authenticated/dashboard/hr/shift-assignments/'
)({
  component: ShiftAssignmentsListView,
})
