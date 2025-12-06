import { createFileRoute } from '@tanstack/react-router'
import { LeaveRequestDetailsView } from '@/features/hr/components/leave-request-details-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/leave/$requestId')({
  component: LeaveRequestDetailsView,
})
