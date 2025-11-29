import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Employees } from '@/features/hr/employees'

const employeesSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  // Facet filters
  status: z
    .array(
      z.union([
        z.literal('active'),
        z.literal('on_leave'),
        z.literal('terminated'),
        z.literal('suspended'),
        z.literal('probation'),
      ])
    )
    .optional()
    .catch([]),
  department: z.array(z.string()).optional().catch([]),
  employmentType: z
    .array(
      z.union([
        z.literal('full_time'),
        z.literal('part_time'),
        z.literal('contract'),
        z.literal('intern'),
        z.literal('freelance'),
      ])
    )
    .optional()
    .catch([]),
  // Per-column text filter
  email: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/dashboard/hr/employees/')(
  {
    validateSearch: employeesSearchSchema,
    component: Employees,
  }
)
