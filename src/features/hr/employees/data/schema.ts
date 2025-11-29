import { z } from 'zod'

export const employeeSchema = z.object({
  _id: z.string(),
  employeeId: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  firstNameAr: z.string().optional(),
  lastNameAr: z.string().optional(),
  fullName: z.string(),
  email: z.string().email(),
  phone: z.string(),
  gender: z.enum(['male', 'female']),
  department: z.enum([
    'legal',
    'finance',
    'hr',
    'admin',
    'it',
    'marketing',
    'operations',
    'other',
  ]),
  position: z.string(),
  employmentType: z.enum([
    'full_time',
    'part_time',
    'contract',
    'intern',
    'probation',
  ]),
  hireDate: z.string(),
  status: z.enum(['active', 'inactive', 'on_leave', 'terminated', 'resigned']),
  nationality: z.string().optional(),
  nationalId: z.string().optional(),
  dateOfBirth: z.string().optional(),
  maritalStatus: z
    .enum(['single', 'married', 'divorced', 'widowed'])
    .optional(),
  address: z
    .object({
      street: z.string().optional(),
      city: z.string().optional(),
      region: z.string().optional(),
      postalCode: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),
  bankName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  iban: z.string().optional(),
  emergencyContact: z
    .object({
      name: z.string(),
      relationship: z.string(),
      phone: z.string(),
    })
    .optional(),
  managerId: z.string().optional(),
  avatar: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type Employee = z.infer<typeof employeeSchema>

export const createEmployeeSchema = z.object({
  firstName: z
    .string()
    .min(2, 'الاسم الأول يجب أن يكون حرفين على الأقل')
    .max(50, 'الاسم الأول يجب ألا يتجاوز 50 حرفاً'),
  lastName: z
    .string()
    .min(2, 'الاسم الأخير يجب أن يكون حرفين على الأقل')
    .max(50, 'الاسم الأخير يجب ألا يتجاوز 50 حرفاً'),
  firstNameAr: z.string().optional(),
  lastNameAr: z.string().optional(),
  email: z.string().email('البريد الإلكتروني غير صالح'),
  phone: z.string().min(10, 'رقم الجوال يجب أن يكون 10 أرقام على الأقل'),
  gender: z.enum(['male', 'female'], {
    required_error: 'يرجى اختيار الجنس',
  }),
  department: z.enum(
    ['legal', 'finance', 'hr', 'admin', 'it', 'marketing', 'operations', 'other'],
    { required_error: 'يرجى اختيار القسم' }
  ),
  position: z.string().min(2, 'المسمى الوظيفي مطلوب'),
  hireDate: z.string().min(1, 'تاريخ التعيين مطلوب'),
  employmentType: z
    .enum(['full_time', 'part_time', 'contract', 'intern', 'probation'])
    .optional()
    .default('full_time'),
  nationality: z.string().optional(),
  nationalId: z.string().optional(),
  dateOfBirth: z.string().optional(),
  maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed']).optional(),
  address: z
    .object({
      street: z.string().optional(),
      city: z.string().optional(),
      region: z.string().optional(),
      postalCode: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),
  bankName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  iban: z.string().optional(),
  emergencyContact: z
    .object({
      name: z.string(),
      relationship: z.string(),
      phone: z.string(),
    })
    .optional(),
  managerId: z.string().optional(),
})

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>
