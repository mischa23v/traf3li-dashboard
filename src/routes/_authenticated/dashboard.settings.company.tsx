import { createFileRoute } from '@tanstack/react-router'
import CompanySettings from '@/features/settings/components/company-settings'

export const Route = createFileRoute('/_authenticated/dashboard/settings/company')({
  component: CompanySettings,
})
