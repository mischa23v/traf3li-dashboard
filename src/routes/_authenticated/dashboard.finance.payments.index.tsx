import { createFileRoute } from '@tanstack/react-router'
import PaymentsDashboard from '@/features/finance/components/payments-dashboard'

export const Route = createFileRoute('/_authenticated/dashboard/finance/payments/')({
  component: PaymentsDashboard,
})
