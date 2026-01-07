import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { Otp } from '@/features/auth/otp'

// Search params schema for OTP page
const otpSearchSchema = z.object({
  email: z.string().optional(),
  purpose: z.enum(['login', 'registration', 'verify_email']).optional().default('login'),
  token: z.string().optional(), // loginSessionToken for login flow
})

export type OtpSearchParams = z.infer<typeof otpSearchSchema>

export const Route = createFileRoute('/(auth)/otp')({
  validateSearch: otpSearchSchema,
  component: Otp,
})
