import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { OtpLogin } from '@/features/auth/otp-login'

const searchSchema = z.object({
  redirect: z.string().optional(),
  purpose: z.enum(['login', 'registration', 'password_reset', 'email_verification']).optional(),
})

export const Route = createFileRoute('/(auth)/otp-login')({
  component: OtpLogin,
  validateSearch: searchSchema,
})
