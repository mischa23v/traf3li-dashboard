import { createFileRoute } from '@tanstack/react-router'
import { TagsView } from '@/features/crm/views'

export const Route = createFileRoute('/_authenticated/dashboard/crm/settings/tags')({
  component: TagsView,
})
