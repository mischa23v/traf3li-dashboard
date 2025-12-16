import { createFileRoute } from '@tanstack/react-router'
import SkillsPage from '@/pages/dashboard/hr/skills/Skills'

export const Route = createFileRoute('/_authenticated/dashboard/hr/skills/')({
  component: SkillsPage,
})
