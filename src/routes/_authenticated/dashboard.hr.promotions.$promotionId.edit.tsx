import { createFileRoute } from '@tanstack/react-router'
import { PromotionCreateView } from '@/features/hr/components/promotion-create-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/promotions/$promotionId/edit')({
  component: PromotionCreateView,
})
