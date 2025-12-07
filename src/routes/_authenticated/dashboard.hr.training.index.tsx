import { createFileRoute } from '@tanstack/react-router'
import { TrainingListView } from '@/features/hr/components/training-list-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/training/')({
  component: TrainingListView,
})
