import { createFileRoute } from '@tanstack/react-router'
import { AssetsListView } from '@/features/assets/components'

export const Route = createFileRoute('/_authenticated/dashboard/assets/')({
  component: AssetsListView,
})
