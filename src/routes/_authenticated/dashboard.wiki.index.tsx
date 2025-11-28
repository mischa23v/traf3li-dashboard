import { createFileRoute } from '@tanstack/react-router'
import { WikiGlobalView } from '@/features/wiki/components/wiki-global-view'

export const Route = createFileRoute('/_authenticated/dashboard/wiki/')({
  component: WikiGlobalView,
})
