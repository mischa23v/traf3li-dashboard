import { createFileRoute } from '@tanstack/react-router'
import { EvaluationDetail } from '@/features/hr/evaluations/evaluation-detail'

export const Route = createFileRoute('/_authenticated/dashboard/hr/evaluations/$evaluationId')({
    component: EvaluationDetail,
})
