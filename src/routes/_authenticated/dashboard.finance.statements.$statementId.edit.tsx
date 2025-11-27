import { createFileRoute } from '@tanstack/react-router'
import { EditStatementView } from '@/features/finance/components/edit-statement-view'

export const Route = createFileRoute('/_authenticated/dashboard/finance/statements/$statementId/edit')({
    component: EditStatementView,
})
