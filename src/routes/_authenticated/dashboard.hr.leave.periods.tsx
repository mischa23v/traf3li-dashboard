import { createFileRoute } from '@tanstack/react-router'
import { LeavePeriodsListView } from '@/features/hr/components/leave-periods-list-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/leave/periods')({
  component: LeavePeriodsListView,
})
