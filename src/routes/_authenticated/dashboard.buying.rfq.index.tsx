import { createFileRoute } from '@tanstack/react-router'
import { RfqListView } from '@/features/buying/components'

export const Route = createFileRoute('/_authenticated/dashboard/buying/rfq/')({
  component: RfqListView,
})
