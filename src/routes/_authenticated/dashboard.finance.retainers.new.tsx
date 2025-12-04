import { createFileRoute } from '@tanstack/react-router'
import { CreateRetainerView } from '@/features/finance/components/create-retainer-view'

export const Route = createFileRoute(
    '/_authenticated/dashboard/finance/retainers/new',
)({
    component: CreateRetainerView,
})
