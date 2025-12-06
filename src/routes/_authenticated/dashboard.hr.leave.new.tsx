import { createFileRoute } from '@tanstack/react-router'
import { LeaveRequestCreateView } from '@/features/hr/components/leave-request-create-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/leave/new')({
  component: LeaveRequestCreateView,
})
