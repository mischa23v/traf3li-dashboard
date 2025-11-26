import { createFileRoute } from '@tanstack/react-router'
import { HelpCenter } from '@/features/help'

export const Route = createFileRoute('/_authenticated/dashboard/help')({
  component: HelpCenter,
})
