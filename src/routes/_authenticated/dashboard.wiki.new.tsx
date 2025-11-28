import { createFileRoute } from '@tanstack/react-router'
import { WikiGlobalCreateView } from '@/features/wiki/components/wiki-global-create-view'

export const Route = createFileRoute('/_authenticated/dashboard/wiki/new')({
  component: WikiGlobalCreateView,
})
