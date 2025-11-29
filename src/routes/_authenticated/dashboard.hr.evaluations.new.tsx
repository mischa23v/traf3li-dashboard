import { createFileRoute } from '@tanstack/react-router'
import { EvaluationCreate } from '@/features/hr/evaluations/evaluation-create'

export const Route = createFileRoute('/_authenticated/dashboard/hr/evaluations/new')({
    component: EvaluationCreate,
})
