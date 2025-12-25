import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { MagicLinkLogin } from '@/features/auth/magic-link'

const searchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/(auth)/magic-link')({
  component: MagicLinkLogin,
  validateSearch: searchSchema,
})
