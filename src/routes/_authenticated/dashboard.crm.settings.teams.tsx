import { createFileRoute } from '@tanstack/react-router'
import { TeamsView } from '@/features/crm/views'

export const Route = createFileRoute('/_authenticated/dashboard/crm/settings/teams')({
  component: TeamsView,
})
