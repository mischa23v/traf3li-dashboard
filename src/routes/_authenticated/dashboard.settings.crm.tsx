import { createFileRoute } from '@tanstack/react-router'
import CRMSettings from '@/features/settings/components/crm-settings'

export const Route = createFileRoute('/_authenticated/dashboard/settings/crm')({
  component: CRMSettings,
})
