/**
 * User Authentication Form (Sign In)
 * Connects to Traf3li backend for authentication
 */

import { HTMLAttributes, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconBrandGithub, IconBrandGoogle } from '@tabler/icons-react'
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
 * Form validation schema
 */
const formSchema = z.object({
  username: z
    .string()
    .min(1, { message: 'الرجاء إدخال اسم المستخدم أو البريد الإلكتروني' }),
  password: z
    .string()
    .min(1, { message: 'الرجاء إدخال كلمة المرور' })
    .min(6, { message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' }),
})

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const navigate = useNavigate()
  const { login, error: authError, clearError } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
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
        throw new Error('فشل تسجيل الدخول')
      }

      // Redirect based on role
      if (user.role === 'admin') {
        navigate({ to: '/users' })
      } else if (user.role === 'lawyer') {
        navigate({ to: '/' }) // Dashboard home
      } else {
        navigate({ to: '/' }) // Client dashboard
      }
    } catch (error: any) {
      console.error('Login error:', error)
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
                  <FormLabel>اسم المستخدم أو البريد الإلكتروني</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='ahmad_salem أو ahmad@example.com'
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
                    <FormLabel>كلمة المرور</FormLabel>
                    <Button
                      variant='link'
                      className='h-auto p-0 text-sm font-normal'
                      onClick={() => navigate({ to: '/forgot-password' })}
                      type='button'
                    >
                      نسيت كلمة المرور؟
                    </Button>
                  </div>
                  <FormControl>
                    <PasswordInput placeholder='••••••••' {...field} />
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
              {isLoading ? 'جارٍ تسجيل الدخول...' : 'تسجيل الدخول'}
            </Button>

            {/* Divider */}
            <div className='relative my-2'>
              <div className='absolute inset-0 flex items-center'>
                <span className='w-full border-t' />
              </div>
              <div className='relative flex justify-center text-xs uppercase'>
                <span className='bg-background px-2 text-muted-foreground'>
                  أو تابع بـ
                </span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className='flex gap-2'>
              <Button
                variant='outline'
                className='w-full'
                type='button'
                disabled={isLoading}
              >
                <IconBrandGithub className='mr-2 h-4 w-4' />
                GitHub
              </Button>
              <Button
                variant='outline'
                className='w-full'
                type='button'
                disabled={isLoading}
              >
                <IconBrandGoogle className='mr-2 h-4 w-4' />
                Google
              </Button>
            </div>
          </div>
        </form>
      </Form>

      {/* Sign Up Link */}
      <p className='text-center text-sm text-muted-foreground'>
        ليس لديك حساب؟{' '}
        <Button
          variant='link'
          className='h-auto p-0 font-semibold underline-offset-4 hover:underline'
          onClick={() => navigate({ to: '/sign-up' })}
          type='button'
        >
          سجل الآن
        </Button>
      </p>
    </div>
  )
}