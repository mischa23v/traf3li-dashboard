import { createFileRoute } from '@tanstack/react-router'
import { AssetsCreateView } from '@/features/hr/components/assets-create-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/assets/new')({
  component: AssetsCreateView,
})
