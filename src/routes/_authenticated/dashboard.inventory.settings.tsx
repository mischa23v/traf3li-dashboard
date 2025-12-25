import { createFileRoute } from '@tanstack/react-router'
import { InventorySettingsView } from '@/features/inventory/components'

export const Route = createFileRoute('/_authenticated/dashboard/inventory/settings')({
  component: InventorySettingsView,
})
