import { createFileRoute } from '@tanstack/react-router'
import { JudgmentsView } from '@/features/knowledge/components/judgments-view'

export const Route = createFileRoute('/_authenticated/dashboard/knowledge/judgments')({
  component: JudgmentsView,
})
