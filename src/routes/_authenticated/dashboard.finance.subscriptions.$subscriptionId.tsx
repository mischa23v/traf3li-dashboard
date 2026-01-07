import { createFileRoute } from '@tanstack/react-router'
import { SubscriptionDetailView } from '@/features/subscriptions/components/subscription-detail-view'

export const Route = createFileRoute('/_authenticated/dashboard/finance/subscriptions/$subscriptionId')({
  component: SubscriptionDetailView,
})
