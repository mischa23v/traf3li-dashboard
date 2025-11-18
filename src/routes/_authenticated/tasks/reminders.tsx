import { createFileRoute } from '@tanstack/react-router'
import { Reminders } from '@/features/reminders'

export const Route = createFileRoute('/_authenticated/tasks/reminders')({
  component: Reminders,
})
