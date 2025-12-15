import { createFileRoute } from '@tanstack/react-router'
import ExpensePoliciesSettings from '@/features/settings/components/expense-policies-settings'

export const Route = createFileRoute('/_authenticated/dashboard/settings/expense-policies')({
  component: ExpensePoliciesSettings,
})
