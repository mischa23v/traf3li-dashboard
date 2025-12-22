import { createFileRoute } from '@tanstack/react-router'
import { IntegrationsSettings } from '@/features/settings/components/integrations-settings'

export const Route = createFileRoute('/_authenticated/settings/integrations')({
  component: IntegrationsSettings,
})
