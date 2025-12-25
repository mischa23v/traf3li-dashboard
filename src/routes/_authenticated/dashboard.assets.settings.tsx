import { createFileRoute } from '@tanstack/react-router'
import { AssetsSettingsView } from '@/features/assets/components'

export const Route = createFileRoute('/_authenticated/dashboard/assets/settings')({
  component: AssetsSettingsView,
})
