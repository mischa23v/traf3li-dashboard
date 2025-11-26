import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
  const { data: settings, isLoading: loadingSettings } = useSettings()
  const { mutate: updateSettings, isPending } = useUpdateNotificationSettings()

  const form = useForm<NotificationsFormValues>({
    resolver: zodResolver(notificationsFormSchema) as any,
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
            <h3 className='text-lg font-medium'>{t('settings.notifications.email.title')}</h3>
            <p className='text-muted-foreground text-sm'>
              {t('settings.notifications.email.description')}
            </p>
          </div>

          <FormField
            control={form.control}
            name='email.enabled'
            render={({ field }) => (
              <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                <div className='space-y-0.5'>
                  <FormLabel className='text-base'>{t('settings.notifications.email.enabled')}</FormLabel>
                  <FormDescription>
                    {t('settings.notifications.email.enabledDescription')}
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
                  <FormLabel className='text-base'>{t('settings.notifications.email.newMessages')}</FormLabel>
                  <FormDescription>
                    {t('settings.notifications.email.newMessagesDescription')}
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
                  <FormLabel className='text-base'>{t('settings.notifications.email.taskReminders')}</FormLabel>
                  <FormDescription>
                    {t('settings.notifications.email.taskRemindersDescription')}
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
                  <FormLabel className='text-base'>{t('settings.notifications.email.caseUpdates')}</FormLabel>
                  <FormDescription>
                    {t('settings.notifications.email.caseUpdatesDescription')}
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
                  <FormLabel className='text-base'>{t('settings.notifications.email.financialAlerts')}</FormLabel>
                  <FormDescription>
                    {t('settings.notifications.email.financialAlertsDescription')}
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
            <h3 className='text-lg font-medium'>{t('settings.notifications.push.title')}</h3>
            <p className='text-muted-foreground text-sm'>
              {t('settings.notifications.push.description')}
            </p>
          </div>

          <FormField
            control={form.control}
            name='push.enabled'
            render={({ field }) => (
              <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                <div className='space-y-0.5'>
                  <FormLabel className='text-base'>{t('settings.notifications.push.enabled')}</FormLabel>
                  <FormDescription>
                    {t('settings.notifications.push.enabledDescription')}
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
                  <FormLabel className='text-base'>{t('settings.notifications.push.newMessages')}</FormLabel>
                  <FormDescription>
                    {t('settings.notifications.push.newMessagesDescription')}
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
                  <FormLabel className='text-base'>{t('settings.notifications.push.taskReminders')}</FormLabel>
                  <FormDescription>
                    {t('settings.notifications.push.taskRemindersDescription')}
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
                  <FormLabel className='text-base'>{t('settings.notifications.push.caseUpdates')}</FormLabel>
                  <FormDescription>
                    {t('settings.notifications.push.caseUpdatesDescription')}
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
            <h3 className='text-lg font-medium'>{t('settings.notifications.inApp.title')}</h3>
            <p className='text-muted-foreground text-sm'>
              {t('settings.notifications.inApp.description')}
            </p>
          </div>

          <FormField
            control={form.control}
            name='inApp.enabled'
            render={({ field }) => (
              <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                <div className='space-y-0.5'>
                  <FormLabel className='text-base'>{t('settings.notifications.inApp.enabled')}</FormLabel>
                  <FormDescription>
                    {t('settings.notifications.inApp.enabledDescription')}
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
                  <FormLabel className='text-base'>{t('settings.notifications.inApp.sound')}</FormLabel>
                  <FormDescription>
                    {t('settings.notifications.inApp.soundDescription')}
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
                  <FormLabel className='text-base'>{t('settings.notifications.inApp.desktop')}</FormLabel>
                  <FormDescription>
                    {t('settings.notifications.inApp.desktopDescription')}
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
              <Loader2 className='me-2 h-4 w-4 animate-spin' />
              {t('settings.notifications.updating')}
            </>
          ) : (
            t('settings.notifications.updateNotifications')
          )}
        </Button>
      </form>
    </Form>
  )
}
