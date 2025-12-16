import { createFileRoute } from '@tanstack/react-router'
import HRSetupWizard from '@/features/hr/components/hr-setup-wizard'

export const Route = createFileRoute('/_authenticated/dashboard/hr/setup-wizard')({
  component: HRSetupWizard,
})
