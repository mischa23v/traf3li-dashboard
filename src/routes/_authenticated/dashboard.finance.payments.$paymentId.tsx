import { createFileRoute } from '@tanstack/react-router'
import PaymentDetailsView from '@/features/finance/components/payment-details-view'

export const Route = createFileRoute('/_authenticated/dashboard/finance/payments/$paymentId')({
  component: PaymentDetailsView,
})
