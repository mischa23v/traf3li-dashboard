import { createFileRoute } from '@tanstack/react-router'
import { SettingsModules } from '@/features/settings/modules'

export const Route = createFileRoute('/_authenticated/settings/modules')({
  component: SettingsModules,
})
