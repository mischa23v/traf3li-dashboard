import { createFileRoute } from '@tanstack/react-router'
import { TrainingCreateView } from '@/features/hr/components/training-create-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/training/new')({
  component: TrainingCreateView,
})
