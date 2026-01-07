import { createFileRoute } from '@tanstack/react-router'
import { SubscriptionPlansListView } from '@/features/subscriptions/components/subscription-plans-list-view'

export const Route = createFileRoute('/_authenticated/dashboard/finance/subscription-plans/')({
  component: SubscriptionPlansListView,
})
