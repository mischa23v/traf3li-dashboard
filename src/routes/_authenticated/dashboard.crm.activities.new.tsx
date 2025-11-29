import { createFileRoute } from '@tanstack/react-router'
import { CreateActivityView } from '@/features/crm'

export const Route = createFileRoute('/_authenticated/dashboard/crm/activities/new')({
  component: CreateActivityView,
})
