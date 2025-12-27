import { createFileRoute } from '@tanstack/react-router'
import { GeneralSettingsView } from '@/features/crm/views'

export const Route = createFileRoute('/_authenticated/dashboard/crm/settings/')({
  component: GeneralSettingsView,
})
