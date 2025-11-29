import { createFileRoute } from '@tanstack/react-router'
import { EvaluationsPage } from '@/features/hr/evaluations'

export const Route = createFileRoute('/_authenticated/dashboard/hr/evaluations/')({
    component: EvaluationsPage,
})
