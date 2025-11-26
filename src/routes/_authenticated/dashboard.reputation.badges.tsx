import { createFileRoute } from '@tanstack/react-router'
import { BadgesView } from '@/features/reputation/components/badges-view'

export const Route = createFileRoute('/_authenticated/dashboard/reputation/badges')({
  component: BadgesView,
})
