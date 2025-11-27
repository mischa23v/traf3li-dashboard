import { createFileRoute } from '@tanstack/react-router'
import FinanceSettings from '@/features/settings/components/finance-settings'

export const Route = createFileRoute('/_authenticated/dashboard/settings/finance')({
  component: FinanceSettings,
})
