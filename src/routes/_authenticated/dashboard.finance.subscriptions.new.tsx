import { createFileRoute } from '@tanstack/react-router'
import { SubscriptionCreateView } from '@/features/subscriptions/components/subscription-create-view'

export const Route = createFileRoute('/_authenticated/dashboard/finance/subscriptions/new')({
  component: SubscriptionCreateView,
})
