import { createFileRoute } from '@tanstack/react-router'
import { SubscriptionPlanFormView } from '@/features/subscriptions/components/subscription-plan-form-view'

export const Route = createFileRoute('/_authenticated/dashboard/finance/subscription-plans/new')({
  component: SubscriptionPlanFormView,
})
