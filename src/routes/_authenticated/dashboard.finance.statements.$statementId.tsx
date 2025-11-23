import { createFileRoute } from '@tanstack/react-router'
import { StatementDetailsView } from '@/features/finance/components/statement-details-view'

export const Route = createFileRoute('/_authenticated/dashboard/finance/statements/$statementId')({
    component: StatementDetailsView,
})
