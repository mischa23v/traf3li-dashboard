import { createFileRoute } from '@tanstack/react-router'
import { SecurityPage } from '@/features/dashboard-settings/security-page'

export const Route = createFileRoute('/_authenticated/dashboard/settings/security')({
  component: SecurityPage,
})
