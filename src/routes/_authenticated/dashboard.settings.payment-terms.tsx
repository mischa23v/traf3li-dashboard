import { createFileRoute } from '@tanstack/react-router'
import PaymentTermsSettings from '@/features/settings/components/payment-terms-settings'

export const Route = createFileRoute('/_authenticated/dashboard/settings/payment-terms')({
  component: PaymentTermsSettings,
})
