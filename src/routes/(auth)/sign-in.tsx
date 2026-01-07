import { z } from 'zod'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { ROUTES } from '@/constants/routes'

const searchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/(auth)/sign-in')({
  validateSearch: searchSchema,
  beforeLoad: ({ search }) => {
    // Redirect to OTP login, preserving any redirect parameter
    throw redirect({
      to: ROUTES.auth.otpLogin,
      search: search.redirect ? { redirect: search.redirect } : undefined,
    })
  },
})
