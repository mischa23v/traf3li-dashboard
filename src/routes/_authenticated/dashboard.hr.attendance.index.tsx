import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Attendance } from '@/features/hr/attendance'

const attendanceSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  // Facet filters
  status: z
    .array(
      z.union([
        z.literal('present'),
        z.literal('absent'),
        z.literal('late'),
        z.literal('half_day'),
        z.literal('on_leave'),
        z.literal('holiday'),
        z.literal('weekend'),
        z.literal('work_from_home'),
      ])
    )
    .optional()
    .catch([]),
  // Date filter
  date: z.string().optional().catch(''),
  startDate: z.string().optional().catch(''),
  endDate: z.string().optional().catch(''),
})

export const Route = createFileRoute(
  '/_authenticated/dashboard/hr/attendance/'
)({
  validateSearch: attendanceSearchSchema,
  component: Attendance,
})
