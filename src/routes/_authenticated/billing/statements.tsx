import { createFileRoute } from '@tanstack/react-router'
import StatementsPage from '@/features/statements'

export const Route = createFileRoute('/_authenticated/billing/statements')({
  component: StatementsPage,
})
