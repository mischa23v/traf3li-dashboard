import { createFileRoute } from '@tanstack/react-router'
import { EditAccountActivityView } from '@/features/finance/components/edit-account-activity-view'

export const Route = createFileRoute('/_authenticated/dashboard/finance/activity/$activityId/edit')({
    component: EditAccountActivityView,
})
