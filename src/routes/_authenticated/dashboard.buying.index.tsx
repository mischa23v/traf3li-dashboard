import { createFileRoute } from '@tanstack/react-router'
import { BuyingListView } from '@/features/buying/components'

export const Route = createFileRoute('/_authenticated/dashboard/buying/')({
  component: BuyingListView,
})
