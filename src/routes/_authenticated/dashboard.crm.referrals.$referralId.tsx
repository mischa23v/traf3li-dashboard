import { createFileRoute } from '@tanstack/react-router'
import { ReferralDetailsView } from '@/features/crm'

export const Route = createFileRoute('/_authenticated/dashboard/crm/referrals/$referralId')({
  component: ReferralDetailsView,
})
