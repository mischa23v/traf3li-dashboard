import { createFileRoute } from '@tanstack/react-router'
import { AttendanceDetail } from '@/features/hr/attendance/attendance-detail'

export const Route = createFileRoute('/_authenticated/dashboard/hr/attendance/$attendanceId')({
    component: AttendanceDetail,
})
