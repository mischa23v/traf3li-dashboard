import { createFileRoute } from '@tanstack/react-router'
import { LeavePoliciesListView } from '@/features/hr/components/leave-policies-list-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/leave/policies')({
  component: LeavePoliciesListView,
})
