import { createFileRoute } from '@tanstack/react-router'
import { AccountActivity } from '@/features/finance/account-activity'

export const Route = createFileRoute('/_authenticated/finance/account-activity')({
  component: AccountActivity,
})
