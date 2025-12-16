import { createFileRoute } from '@tanstack/react-router'
import SkillMatrix from '@/pages/dashboard/hr/skills/SkillMatrix'

export const Route = createFileRoute('/_authenticated/dashboard/hr/skills/matrix')({
  component: SkillMatrix,
})
