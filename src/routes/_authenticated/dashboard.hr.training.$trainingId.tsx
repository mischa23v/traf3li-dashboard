import { createFileRoute } from '@tanstack/react-router'
import { TrainingDetailsView } from '@/features/hr/components/training-details-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/training/$trainingId')({
  component: TrainingDetailsView,
})
