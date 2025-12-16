import { createFileRoute } from '@tanstack/react-router'
import { PromotionDetailsView } from '@/features/hr/components/promotion-details-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/promotions/$promotionId')({
  component: PromotionDetailsView,
})
