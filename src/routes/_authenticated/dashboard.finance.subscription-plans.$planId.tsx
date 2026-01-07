import { createFileRoute } from '@tanstack/react-router'
import { SubscriptionPlanFormView } from '@/features/subscriptions/components/subscription-plan-form-view'

// For view/detail, we reuse the form view in read mode or create a separate detail view
// Using form view for edit functionality
export const Route = createFileRoute('/_authenticated/dashboard/finance/subscription-plans/$planId')({
  component: SubscriptionPlanFormView,
})
