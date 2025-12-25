import { createFileRoute } from '@tanstack/react-router'
import { ActionsListView } from '@/features/quality/components'

export const Route = createFileRoute('/_authenticated/dashboard/quality/actions/')({
  component: ActionsListView,
})
