import { createFileRoute } from '@tanstack/react-router'
import { SubcontractingSettingsView } from '@/features/subcontracting/components'

export const Route = createFileRoute('/_authenticated/dashboard/subcontracting/settings')({
  component: SubcontractingSettingsView,
})
