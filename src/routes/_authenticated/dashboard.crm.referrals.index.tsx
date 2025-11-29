import { createFileRoute } from '@tanstack/react-router'
import { ReferralsListView } from '@/features/crm'

export const Route = createFileRoute('/_authenticated/dashboard/crm/referrals/')({
  component: ReferralsListView,
})
