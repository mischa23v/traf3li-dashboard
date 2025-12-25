import { createFileRoute } from '@tanstack/react-router'
import { SupportListView } from '@/features/support/components'

export const Route = createFileRoute('/_authenticated/dashboard/support/')({
  component: SupportListView,
})
