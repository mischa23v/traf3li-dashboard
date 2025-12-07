/**
 * User Authentication Form (Sign In)
 * Connects to Traf3li backend for authentication
 */

import { HTMLAttributes, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconBrandGoogle } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { PasswordInput } from '@/components/password-input'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'

interface UserAuthFormProps extends HTMLAttributes<HTMLDivElement> {}

/**
 * Form validation schema factory
 * We'll create this dynamically to support i18n messages
 */
const createFormSchema = (t: any) =>
  z.object({
    username: z
      .string()
      .min(1, { message: t('auth.signIn.validation.usernameOrEmailRequired') }),
    password: z
      .string()
      .min(1, { message: t('auth.signIn.validation.passwordRequired') })
      .min(6, { message: t('auth.signIn.validation.passwordMinLength') }),
  })

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { login, error: authError, clearError } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)

  const formSchema = createFormSchema(t)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      username: '',
      password: '',
    },
  })

  /**
   * Handle form submission
   */
  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)
    clearError()

    try {
      await login(data)

      // Get user from store to determine redirect
      const user = useAuthStore.getState().user

      if (!user) {
        throw new Error(t('auth.signIn.error'))
      }

      // Redirect based on role
      // No firm check needed - lawyers without firm are treated as solo lawyers
      if (user.role === 'admin') {
        navigate({ to: '/users' })
      } else if (user.role === 'lawyer') {
        navigate({ to: '/' }) // Dashboard home
      } else {
        navigate({ to: '/' }) // Client dashboard
      }
    } catch (error: any) {
      // Error is handled by the store
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('grid gap-6', className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className='grid gap-4'>
            {/* Username/Email Field */}
            <FormField
              control={form.control}
              name='username'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>{t('auth.signIn.usernameOrEmail')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('auth.signIn.usernameOrEmailPlaceholder')}
                      dir='auto'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password Field */}
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <div className='flex items-center justify-between'>
                    <FormLabel>{t('auth.signIn.password')}</FormLabel>
                    <Button
                      variant='link'
                      className='h-auto p-0 text-sm font-normal'
                      onClick={() => navigate({ to: '/forgot-password' })}
                      type='button'
                    >
                      {t('auth.signIn.forgotPassword')}
                    </Button>
                  </div>
                  <FormControl>
                    <PasswordInput
                      placeholder={t('auth.signIn.passwordPlaceholder')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Display API Error */}
            {authError && (
              <div className='rounded-md bg-destructive/15 p-3 text-sm text-destructive'>
                {authError}
              </div>
            )}

            {/* Submit Button */}
            <Button type='submit' className='mt-2' disabled={isLoading}>
              {isLoading
                ? t('auth.signIn.signingIn')
                : t('auth.signIn.signInButton')}
            </Button>

            {/* Divider */}
            <div className='relative my-2'>
              <div className='absolute inset-0 flex items-center'>
                <span className='w-full border-t' />
              </div>
              <div className='relative flex justify-center text-xs uppercase'>
                <span className='bg-background px-2 text-muted-foreground'>
                  {t('auth.signIn.orContinueWith')}
                </span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <Button
              variant='outline'
              className='w-full'
              type='button'
              disabled={isLoading}
            >
              <IconBrandGoogle className='me-2 h-4 w-4' />
              {t('auth.signIn.google')}
            </Button>
          </div>
        </form>
      </Form>

      {/* Sign Up Link */}
      <p className='text-center text-sm text-muted-foreground'>
        {t('auth.signIn.noAccount')}{' '}
        <Button
          variant='link'
          className='h-auto p-0 font-semibold underline-offset-4 hover:underline'
          onClick={() => navigate({ to: '/sign-up' })}
          type='button'
        >
          {t('auth.signIn.registerNow')}
        </Button>
      </p>
    </div>
  )
}