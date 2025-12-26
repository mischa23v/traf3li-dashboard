import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { SignUpForm } from '@/features/auth/sign-up/components/sign-up-form'

// Search params schema for OAuth pre-fill
const signUpSearchSchema = z.object({
  email: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  avatar: z.string().optional(),
  oauthProvider: z.string().optional(),
  oauthVerified: z.string().optional(),
})

export type SignUpSearchParams = z.infer<typeof signUpSearchSchema>

export const Route = createFileRoute('/(auth)/sign-up')({
  component: SignUpForm,
  validateSearch: signUpSearchSchema,
})
