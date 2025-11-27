import { createFileRoute } from '@tanstack/react-router'
import TaxSettings from '@/features/settings/components/tax-settings'

export const Route = createFileRoute('/_authenticated/dashboard/settings/taxes')({
  component: TaxSettings,
})
