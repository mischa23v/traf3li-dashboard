import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { ChevronDownIcon } from '@radix-ui/react-icons'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { fonts } from '@/config/fonts'
import { cn } from '@/lib/utils'
import { useFont } from '@/context/font-provider'
import { useTheme } from '@/context/theme-provider'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useSettings, useUpdateAppearanceSettings } from '@/hooks/useSettings'
import { Skeleton } from '@/components/ui/skeleton'

const appearanceFormSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  font: z.enum(fonts).optional(),
})

type AppearanceFormValues = z.infer<typeof appearanceFormSchema>

export function AppearanceForm() {
  const { t } = useTranslation()
  const { font, setFont } = useFont()
  const { theme, setTheme } = useTheme()
  const { data: settings, isLoading: loadingSettings } = useSettings()
  const { mutate: updateSettings, isPending } = useUpdateAppearanceSettings()

  const form = useForm<AppearanceFormValues>({
    resolver: zodResolver(appearanceFormSchema),
    defaultValues: {
      theme: theme as 'light' | 'dark' | 'system',
      font,
    },
  })

  // Update form when settings load
  useEffect(() => {
    if (settings) {
      form.reset({
        theme: settings.appearance.theme || (theme as 'light' | 'dark' | 'system'),
        font: font,
      })
    }
  }, [settings, theme, font, form])

  function onSubmit(data: AppearanceFormValues) {
    // Update contexts immediately for UX
    if (data.font && data.font !== font) setFont(data.font)
    if (data.theme !== theme) setTheme(data.theme)

    // Save to API
    updateSettings({
      theme: data.theme,
    })
  }

  if (loadingSettings) {
    return (
      <div className='space-y-8'>
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
          name='font'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('settings.appearance.font')}</FormLabel>
              <div className='relative w-max'>
                <FormControl>
                  <select
                    className={cn(
                      buttonVariants({ variant: 'outline' }),
                      'w-[200px] appearance-none font-normal capitalize',
                      'dark:bg-background dark:hover:bg-background'
                    )}
                    {...field}
                  >
                    {fonts.map((font) => (
                      <option key={font} value={font}>
                        {font}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <ChevronDownIcon className='absolute end-3 top-2.5 h-4 w-4 opacity-50' />
              </div>
              <FormDescription className='font-manrope'>
                {t('settings.appearance.fontDescription')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='theme'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('settings.appearance.theme')}</FormLabel>
              <FormDescription>
                {t('settings.appearance.themeDescription')}
              </FormDescription>
              <FormMessage />
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className='grid max-w-md grid-cols-2 gap-8 pt-2'
              >
                <FormItem>
                  <FormLabel className='[&:has([data-state=checked])>div]:border-primary'>
                    <FormControl>
                      <RadioGroupItem value='light' className='sr-only' />
                    </FormControl>
                    <div className='border-muted hover:border-accent items-center rounded-md border-2 p-1'>
                      <div className='space-y-2 rounded-sm bg-[#ecedef] p-2'>
                        <div className='space-y-2 rounded-md bg-white p-2 shadow-xs'>
                          <div className='h-2 w-[80px] rounded-lg bg-[#ecedef]' />
                          <div className='h-2 w-[100px] rounded-lg bg-[#ecedef]' />
                        </div>
                        <div className='flex items-center space-x-2 rounded-md bg-white p-2 shadow-xs'>
                          <div className='h-4 w-4 rounded-full bg-[#ecedef]' />
                          <div className='h-2 w-[100px] rounded-lg bg-[#ecedef]' />
                        </div>
                        <div className='flex items-center space-x-2 rounded-md bg-white p-2 shadow-xs'>
                          <div className='h-4 w-4 rounded-full bg-[#ecedef]' />
                          <div className='h-2 w-[100px] rounded-lg bg-[#ecedef]' />
                        </div>
                      </div>
                    </div>
                    <span className='block w-full p-2 text-center font-normal'>
                      {t('settings.appearance.light')}
                    </span>
                  </FormLabel>
                </FormItem>
                <FormItem>
                  <FormLabel className='[&:has([data-state=checked])>div]:border-primary'>
                    <FormControl>
                      <RadioGroupItem value='dark' className='sr-only' />
                    </FormControl>
                    <div className='border-muted bg-popover hover:bg-accent hover:text-accent-foreground items-center rounded-md border-2 p-1'>
                      <div className='space-y-2 rounded-sm bg-slate-950 p-2'>
                        <div className='space-y-2 rounded-md bg-slate-800 p-2 shadow-xs'>
                          <div className='h-2 w-[80px] rounded-lg bg-slate-400' />
                          <div className='h-2 w-[100px] rounded-lg bg-slate-400' />
                        </div>
                        <div className='flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-xs'>
                          <div className='h-4 w-4 rounded-full bg-slate-400' />
                          <div className='h-2 w-[100px] rounded-lg bg-slate-400' />
                        </div>
                        <div className='flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-xs'>
                          <div className='h-4 w-4 rounded-full bg-slate-400' />
                          <div className='h-2 w-[100px] rounded-lg bg-slate-400' />
                        </div>
                      </div>
                    </div>
                    <span className='block w-full p-2 text-center font-normal'>
                      {t('settings.appearance.dark')}
                    </span>
                  </FormLabel>
                </FormItem>
              </RadioGroup>
            </FormItem>
          )}
        />

        <Button type='submit' disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className='me-2 h-4 w-4 animate-spin' />
              {t('settings.appearance.updating')}
            </>
          ) : (
            t('settings.appearance.updatePreferences')
          )}
        </Button>
      </form>
    </Form>
  )
}
