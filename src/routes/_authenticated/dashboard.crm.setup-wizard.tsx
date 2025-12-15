import { createFileRoute } from '@tanstack/react-router'
import CRMSetupWizard from '@/features/crm/components/crm-setup-wizard'

export const Route = createFileRoute('/_authenticated/dashboard/crm/setup-wizard')({
  component: CRMSetupWizard,
})
