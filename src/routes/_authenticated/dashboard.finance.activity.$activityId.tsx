import { createFileRoute } from '@tanstack/react-router'
import { ActivityDetailsView } from '@/features/finance/components/activity-details-view'

export const Route = createFileRoute('/_authenticated/dashboard/finance/activity/$activityId')({
    component: ActivityDetailsView,
})
