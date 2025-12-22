import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { MFAChallenge } from '@/features/auth/mfa-challenge'

const searchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/(auth)/mfa-challenge')({
  component: MFAChallenge,
  validateSearch: searchSchema,
})
