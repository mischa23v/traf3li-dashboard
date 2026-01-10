import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { VerifyEmailRequired } from '@/features/auth/email-verification/verify-email-required'

const searchSchema = z.object({
  email: z.string().optional(),
  verificationSent: z.boolean().optional(),
})

export const Route = createFileRoute('/(auth)/verify-email-required')({
  component: VerifyEmailRequired,
  validateSearch: searchSchema,
})
