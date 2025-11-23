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
import { Switch } from '@/components/ui/switch'
import { useSettings, useUpdateNotificationSettings } from '@/hooks/useSettings'
import { Skeleton } from '@/components/ui/skeleton'

const notificationsFormSchema = z.object({
  email: z.object({
    enabled: z.boolean(),
    newMessages: z.boolean(),
    taskReminders: z.boolean(),
    caseUpdates: z.boolean(),
    financialAlerts: z.boolean(),
  }),
  push: z.object({
    enabled: z.boolean(),
    newMessages: z.boolean(),
    taskReminders: z.boolean(),
    caseUpdates: z.boolean(),
  }),
  inApp: z.object({
    enabled: z.boolean(),
    sound: z.boolean(),
    desktop: z.boolean(),
  }),
})

type NotificationsFormValues = z.infer<typeof notificationsFormSchema>

export function NotificationsForm() {
  const { data: settings, isLoading: loadingSettings } = useSettings()
  const { mutate: updateSettings, isPending } = useUpdateNotificationSettings()

  const form = useForm<NotificationsFormValues>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues: {
      email: {
        enabled: true,
        newMessages: true,
        taskReminders: true,
        caseUpdates: true,
        financialAlerts: true,
      },
      push: {
        enabled: false,
        newMessages: false,
        taskReminders: false,
        caseUpdates: false,
      },
      inApp: {
        enabled: true,
        sound: true,
        desktop: false,
      },
    },
  })

  // Update form when settings load
  useEffect(() => {
    if (settings) {
      form.reset({
        email: settings.notifications.email,
        push: settings.notifications.push,
        inApp: settings.notifications.inApp,
      })
    }
  }, [settings, form])

  function onSubmit(data: NotificationsFormValues) {
    updateSettings({
      email: data.email,
      push: data.push,
      inApp: data.inApp,
    })
  }

  if (loadingSettings) {
    return (
      <div className='space-y-8'>
        <Skeleton className='h-32 w-full' />
        <Skeleton className='h-32 w-full' />
        <Skeleton className='h-32 w-full' />
        <Skeleton className='h-10 w-32' />
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        {/* Email Notifications Section */}
        <div className='space-y-4'>
          <div>
            <h3 className='text-lg font-medium'>Email Notifications</h3>
            <p className='text-muted-foreground text-sm'>
              Manage your email notification preferences.
            </p>
          </div>

          <FormField
            control={form.control}
            name='email.enabled'
            render={({ field }) => (
              <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                <div className='space-y-0.5'>
                  <FormLabel className='text-base'>Enable Email Notifications</FormLabel>
                  <FormDescription>
                    Receive notifications via email.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='email.newMessages'
            render={({ field }) => (
              <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                <div className='space-y-0.5'>
                  <FormLabel className='text-base'>New Messages</FormLabel>
                  <FormDescription>
                    Get notified when you receive new messages.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='email.taskReminders'
            render={({ field }) => (
              <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                <div className='space-y-0.5'>
                  <FormLabel className='text-base'>Task Reminders</FormLabel>
                  <FormDescription>
                    Get reminded about upcoming tasks and deadlines.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='email.caseUpdates'
            render={({ field }) => (
              <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                <div className='space-y-0.5'>
                  <FormLabel className='text-base'>Case Updates</FormLabel>
                  <FormDescription>
                    Receive updates about your cases.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='email.financialAlerts'
            render={({ field }) => (
              <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                <div className='space-y-0.5'>
                  <FormLabel className='text-base'>Financial Alerts</FormLabel>
                  <FormDescription>
                    Get notified about payments, invoices, and financial updates.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Push Notifications Section */}
        <div className='space-y-4'>
          <div>
            <h3 className='text-lg font-medium'>Push Notifications</h3>
            <p className='text-muted-foreground text-sm'>
              Manage your push notification preferences for mobile devices.
            </p>
          </div>

          <FormField
            control={form.control}
            name='push.enabled'
            render={({ field }) => (
              <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                <div className='space-y-0.5'>
                  <FormLabel className='text-base'>Enable Push Notifications</FormLabel>
                  <FormDescription>
                    Receive push notifications on your mobile device.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='push.newMessages'
            render={({ field }) => (
              <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                <div className='space-y-0.5'>
                  <FormLabel className='text-base'>New Messages</FormLabel>
                  <FormDescription>
                    Push notifications for new messages.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='push.taskReminders'
            render={({ field }) => (
              <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                <div className='space-y-0.5'>
                  <FormLabel className='text-base'>Task Reminders</FormLabel>
                  <FormDescription>
                    Push notifications for task reminders.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='push.caseUpdates'
            render={({ field }) => (
              <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                <div className='space-y-0.5'>
                  <FormLabel className='text-base'>Case Updates</FormLabel>
                  <FormDescription>
                    Push notifications for case updates.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* In-App Notifications Section */}
        <div className='space-y-4'>
          <div>
            <h3 className='text-lg font-medium'>In-App Notifications</h3>
            <p className='text-muted-foreground text-sm'>
              Manage your in-app notification preferences.
            </p>
          </div>

          <FormField
            control={form.control}
            name='inApp.enabled'
            render={({ field }) => (
              <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                <div className='space-y-0.5'>
                  <FormLabel className='text-base'>Enable In-App Notifications</FormLabel>
                  <FormDescription>
                    Show notifications within the application.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='inApp.sound'
            render={({ field }) => (
              <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                <div className='space-y-0.5'>
                  <FormLabel className='text-base'>Notification Sounds</FormLabel>
                  <FormDescription>
                    Play a sound when you receive notifications.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='inApp.desktop'
            render={({ field }) => (
              <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                <div className='space-y-0.5'>
                  <FormLabel className='text-base'>Desktop Notifications</FormLabel>
                  <FormDescription>
                    Show desktop notifications even when the app is in the background.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <Button type='submit' disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Updating...
            </>
          ) : (
            'Update notifications'
          )}
        </Button>
      </form>
    </Form>
  )
}
