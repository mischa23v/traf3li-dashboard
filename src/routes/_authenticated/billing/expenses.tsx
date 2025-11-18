import { createFileRoute } from '@tanstack/react-router'
import ExpensesPage from '@/features/expenses'

export const Route = createFileRoute('/_authenticated/billing/expenses')({
  component: ExpensesPage,
})
