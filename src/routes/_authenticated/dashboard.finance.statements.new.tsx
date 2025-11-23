import { createFileRoute } from '@tanstack/react-router'
import { CreateStatementView } from '@/features/finance/components/create-statement-view'

export const Route = createFileRoute(
    '/_authenticated/dashboard/finance/statements/new',
)({
    component: CreateStatementView,
})
