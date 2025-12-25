import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { VerifyEmail } from '@/features/auth/email-verification'

const searchSchema = z.object({
  token: z.string().optional(),
})

export const Route = createFileRoute('/(auth)/verify-email')({
  component: VerifyEmail,
  validateSearch: searchSchema,
})
