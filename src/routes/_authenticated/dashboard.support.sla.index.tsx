import { createFileRoute } from '@tanstack/react-router'
import { SLAListView } from '@/features/support/components'

export const Route = createFileRoute('/_authenticated/dashboard/support/sla/')({
  component: SLAListView,
})
