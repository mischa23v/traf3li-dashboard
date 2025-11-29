import { createFileRoute } from '@tanstack/react-router'
import { ActivitiesView } from '@/features/crm'

export const Route = createFileRoute('/_authenticated/dashboard/crm/activities')({
  component: ActivitiesView,
})
