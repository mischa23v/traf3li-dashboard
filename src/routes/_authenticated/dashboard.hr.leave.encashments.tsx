import { createFileRoute } from '@tanstack/react-router'
import LeaveEncashments from '@/pages/dashboard/hr/leave/LeaveEncashments'

export const Route = createFileRoute('/_authenticated/dashboard/hr/leave/encashments')({
  component: LeaveEncashments,
})
