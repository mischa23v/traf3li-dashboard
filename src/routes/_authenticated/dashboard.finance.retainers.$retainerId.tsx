import { createFileRoute } from '@tanstack/react-router'
import RetainerDetailsView from '@/features/finance/components/retainer-details-view'

export const Route = createFileRoute(
    '/_authenticated/dashboard/finance/retainers/$retainerId',
)({
    component: RetainerDetailsView,
})
