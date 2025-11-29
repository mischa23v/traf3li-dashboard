import { createFileRoute } from '@tanstack/react-router'
import { AttendancePage } from '@/features/hr/attendance'

export const Route = createFileRoute('/_authenticated/dashboard/hr/attendance/')({
    component: AttendancePage,
})
