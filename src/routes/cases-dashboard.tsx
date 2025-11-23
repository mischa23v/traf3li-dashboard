import { createFileRoute } from '@tanstack/react-router'
import CasesDashboard from '@/components/CasesDashboard'

export const Route = createFileRoute('/cases-dashboard')({
    component: CasesDashboard,
})
