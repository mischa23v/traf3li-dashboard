import { createFileRoute } from '@tanstack/react-router'
import { FinanceSetupWizard } from '@/features/finance/components/finance-setup-wizard'

export const Route = createFileRoute('/_authenticated/dashboard/finance/setup-wizard')({
    component: FinanceSetupWizard,
})
