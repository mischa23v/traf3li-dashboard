import { createFileRoute } from '@tanstack/react-router'
import { AssetsListView } from '@/features/hr/components/assets-list-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/assets/')({
  component: AssetsListView,
})
