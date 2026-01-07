import { createFileRoute } from '@tanstack/react-router'
import { SubscriptionsListView } from '@/features/subscriptions/components/subscriptions-list-view'

export const Route = createFileRoute('/_authenticated/dashboard/finance/subscriptions/')({
  component: SubscriptionsListView,
})
