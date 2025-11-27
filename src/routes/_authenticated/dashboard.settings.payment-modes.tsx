import { createFileRoute } from '@tanstack/react-router'
import PaymentModesSettings from '@/features/settings/components/payment-modes-settings'

export const Route = createFileRoute('/_authenticated/dashboard/settings/payment-modes')({
  component: PaymentModesSettings,
})
