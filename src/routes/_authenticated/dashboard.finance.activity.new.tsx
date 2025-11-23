import { createFileRoute } from '@tanstack/react-router'
import { CreateAccountActivityView } from '@/features/finance/components/create-account-activity-view'

export const Route = createFileRoute(
    '/_authenticated/dashboard/finance/activity/new',
)({
    component: CreateAccountActivityView,
})
