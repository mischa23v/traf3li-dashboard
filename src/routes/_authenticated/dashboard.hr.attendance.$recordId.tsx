import { createFileRoute } from '@tanstack/react-router'
import { AttendanceRecordDetailsView } from '@/features/hr/components/attendance-record-details-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/attendance/$recordId')({
  component: AttendanceRecordDetailsView,
})
