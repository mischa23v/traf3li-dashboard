import { createFileRoute } from '@tanstack/react-router'
import { QualitySettingsView } from '@/features/quality/components'

export const Route = createFileRoute('/_authenticated/dashboard/quality/settings')({
  component: QualitySettingsView,
})
