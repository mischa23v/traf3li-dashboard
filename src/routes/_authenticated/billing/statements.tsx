import { createFileRoute } from '@tanstack/react-router'
import { Statements } from '@/features/statements'

export const Route = createFileRoute('/_authenticated/billing/statements')({
  component: Statements,
})
