import { createFileRoute } from '@tanstack/react-router'
import { PreferencesPage } from '@/features/dashboard-settings/preferences-page'

export const Route = createFileRoute('/_authenticated/dashboard/settings/preferences')({
  component: PreferencesPage,
})
