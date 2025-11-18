import { createFileRoute } from '@tanstack/react-router'
import AccountActivityPage from '@/features/finance/account-activity'

export const Route = createFileRoute('/_authenticated/finance/account-activity' as any)({
  component: AccountActivityPage,
})
