import { createFileRoute } from '@tanstack/react-router'
import RetentionBonuses from '@/pages/dashboard/hr/compensation/RetentionBonuses'

export const Route = createFileRoute('/_authenticated/dashboard/hr/compensation/retention-bonuses')({
  component: RetentionBonuses,
})
