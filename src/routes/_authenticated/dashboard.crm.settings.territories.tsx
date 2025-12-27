import { createFileRoute } from '@tanstack/react-router'
import { TerritoriesView } from '@/features/crm/views'

export const Route = createFileRoute('/_authenticated/dashboard/crm/settings/territories')({
  component: TerritoriesView,
})
