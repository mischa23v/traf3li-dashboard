import { createFileRoute } from '@tanstack/react-router'
import TimeEntryApprovalsView from '@/features/finance/components/time-entry-approvals-view'

export const Route = createFileRoute('/_authenticated/dashboard/finance/time-tracking/approvals')({
    component: TimeEntryApprovalsView,
})
