import { createFileRoute } from '@tanstack/react-router'
import { ActivityDetailsView } from '@/features/crm'

export const Route = createFileRoute('/_authenticated/dashboard/crm/activities/$activityId')({
  component: ActivityDetailsView,
})
