import { createFileRoute } from '@tanstack/react-router'
import { LeaveDetail } from '@/features/hr/leaves/leave-detail'

export const Route = createFileRoute('/_authenticated/dashboard/hr/leaves/$leaveId')({
    component: LeaveDetail,
})
