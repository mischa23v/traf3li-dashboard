import { createFileRoute } from '@tanstack/react-router'
import { LeaveRequestsListView } from '@/features/hr/components/leave-requests-list-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/leave/')({
  component: LeaveRequestsListView,
})
