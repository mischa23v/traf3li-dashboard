import { createFileRoute } from '@tanstack/react-router'
import CaseDetailsDashboard from '../../newdesigns/CaseDetailsDashboard'

export const Route = createFileRoute('/case-details')({
    component: CaseDetailsDashboard,
})
