import { createFileRoute } from '@tanstack/react-router'
import { LostReasonsView } from '@/features/crm/views'

export const Route = createFileRoute('/_authenticated/dashboard/crm/settings/lost-reasons')({
  component: LostReasonsView,
})
