import { createFileRoute } from '@tanstack/react-router'
import { ManufacturingSettingsView } from '@/features/manufacturing/components'

export const Route = createFileRoute('/_authenticated/dashboard/manufacturing/settings')({
  component: ManufacturingSettingsView,
})
