import { createFileRoute } from '@tanstack/react-router'
import { LeaveCreate } from '@/features/hr/leaves/leave-create'

export const Route = createFileRoute('/_authenticated/dashboard/hr/leaves/new')({
    component: LeaveCreate,
})
