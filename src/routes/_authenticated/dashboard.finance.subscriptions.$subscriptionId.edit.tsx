import { createFileRoute } from '@tanstack/react-router'
import { SubscriptionCreateView } from '@/features/subscriptions/components/subscription-create-view'

// Reuse create view for editing
export const Route = createFileRoute('/_authenticated/dashboard/finance/subscriptions/$subscriptionId/edit')({
  component: SubscriptionCreateView,
})
