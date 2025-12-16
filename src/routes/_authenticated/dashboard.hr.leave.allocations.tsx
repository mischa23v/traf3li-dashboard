import { createFileRoute } from '@tanstack/react-router'
import { LeaveAllocationsListView } from '@/features/hr/components/leave-allocations-list-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/leave/allocations')({
  component: LeaveAllocationsListView,
})
