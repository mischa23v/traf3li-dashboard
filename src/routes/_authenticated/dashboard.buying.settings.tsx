import { createFileRoute } from '@tanstack/react-router'
import { BuyingSettingsView } from '@/features/buying/components'

export const Route = createFileRoute('/_authenticated/dashboard/buying/settings')({
  component: BuyingSettingsView,
})
