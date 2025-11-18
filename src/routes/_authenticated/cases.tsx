import { createFileRoute } from '@tanstack/react-router'
import { Cases } from '@/features/cases'

export const Route = createFileRoute('/_authenticated/cases')({
  component: Cases,
})
