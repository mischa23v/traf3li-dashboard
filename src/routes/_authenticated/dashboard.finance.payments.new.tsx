import { createFileRoute } from '@tanstack/react-router'
import { CreatePaymentView } from '@/features/finance/components/create-payment-view'

export const Route = createFileRoute('/_authenticated/dashboard/finance/payments/new')({
  component: CreatePaymentView,
})
