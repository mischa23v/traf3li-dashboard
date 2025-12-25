import { createFileRoute } from '@tanstack/react-router'
import { SupportSettingsView } from '@/features/support/components'

export const Route = createFileRoute('/_authenticated/dashboard/support/settings')({
  component: SupportSettingsView,
})
