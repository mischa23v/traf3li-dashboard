import { createFileRoute } from '@tanstack/react-router'
import { LeavesPage } from '@/features/hr/leaves'

export const Route = createFileRoute('/_authenticated/dashboard/hr/leaves/')({
    component: LeavesPage,
})
