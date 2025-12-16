import { createFileRoute } from '@tantml:react-router'
import { PromotionCreateView } from '@/features/hr/components/promotion-create-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/promotions/new')({
  component: PromotionCreateView,
})
