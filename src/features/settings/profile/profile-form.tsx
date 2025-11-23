import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useSettings, useUpdateAccountSettings } from '@/hooks/useSettings'
import { Skeleton } from '@/components/ui/skeleton'

const profileFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Please enter your name.')
    .min(2, 'Name must be at least 2 characters.')
    .max(30, 'Name must not be longer than 30 characters.'),
  email: z.string().email('Please enter a valid email address.'),
  bio: z.string().max(500, 'Bio must not be longer than 500 characters.').optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export function ProfileForm() {
  const { data: settings, isLoading: loadingSettings } = useSettings()
  const { mutate: updateSettings, isPending } = useUpdateAccountSettings()

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
      email: '',
      bio: '',
    },
  })

  // Update form when settings load
  useEffect(() => {
    if (settings) {
      form.reset({
        name: settings.account.name || '',
        email: settings.account.email || '',
        bio: '', // Bio not available in current API
      })
    }
  }, [settings, form])

  function onSubmit(data: ProfileFormValues) {
    updateSettings({
      name: data.name,
      // Email is typically not editable from profile for security reasons
      // Bio would need to be added to the backend API
    })
  }

  if (loadingSettings) {
    return (
      <div className='space-y-8'>
        <Skeleton className='h-20 w-full' />
        <Skeleton className='h-20 w-full' />
        <Skeleton className='h-32 w-full' />
        <Skeleton className='h-10 w-32' />
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder='Your name' {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name. It will be shown on your profile
                and in communications.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  placeholder='your.email@example.com'
                  {...field}
                  disabled
                  className='bg-muted'
                />
              </FormControl>
              <FormDescription>
                Your email address is used for account recovery and important
                notifications. Contact support to change your email.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='bio'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='Tell us a little bit about yourself'
                  className='resize-none'
                  rows={4}
                  {...field}
                  disabled
                />
              </FormControl>
              <FormDescription>
                A short bio about yourself. This feature is coming soon.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='bg-muted rounded-lg p-4'>
          <h3 className='text-sm font-medium mb-2'>Additional Settings</h3>
          <p className='text-muted-foreground text-sm mb-3'>
            Manage more detailed settings in the dedicated sections:
          </p>
          <ul className='text-muted-foreground text-sm space-y-1 list-disc list-inside'>
            <li>Update your language, timezone, and date of birth in <strong>Account</strong></li>
            <li>Customize theme and appearance in <strong>Appearance</strong></li>
            <li>Configure date format and currency in <strong>Display</strong></li>
            <li>Manage email and push notifications in <strong>Notifications</strong></li>
          </ul>
        </div>

        <Button type='submit' disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Updating...
            </>
          ) : (
            'Update profile'
          )}
        </Button>
      </form>
    </Form>
  )
}
