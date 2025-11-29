import { createFileRoute } from '@tanstack/react-router'
import { CreateReferralView } from '@/features/crm'

export const Route = createFileRoute('/_authenticated/dashboard/crm/referrals/new')({
  component: CreateReferralView,
})
