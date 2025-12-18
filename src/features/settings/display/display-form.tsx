import { useEffect, useMemo, useCallback, memo } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { CaretSortIcon, CheckIcon } from '@radix-ui/react-icons'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useSettings, useUpdateDisplaySettings } from '@/hooks/useSettings'
import { Skeleton } from '@/components/ui/skeleton'

const dateFormatValues = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD', 'DD MMM YYYY'] as const

const currencyValues = ['USD', 'EUR', 'SAR', 'AED', 'EGP', 'GBP'] as const

const displayFormSchema = z.object({
  dateFormat: z.string(),
  timeFormat: z.enum(['12h', '24h']),
  currency: z.string(),
  startOfWeek: z.enum(['sunday', 'monday']),
  compactMode: z.boolean(),
})

type DisplayFormValues = z.infer<typeof displayFormSchema>

// Memoized loading skeleton to prevent unnecessary re-renders
const LoadingSkeleton = memo(function LoadingSkeleton() {
  return (
    <div className='space-y-8'>
      <Skeleton className='h-20 w-full' />
      <Skeleton className='h-20 w-full' />
      <Skeleton className='h-20 w-full' />
      <Skeleton className='h-20 w-full' />
      <Skeleton className='h-10 w-32' />
    </div>
  )
})

export function DisplayForm() {
  const { t } = useTranslation()
  const { data: settings, isLoading: loadingSettings } = useSettings()
  const { mutate: updateSettings, isPending } = useUpdateDisplaySettings()

  const defaultValues = useMemo(() => ({
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h' as const,
    currency: 'USD',
    startOfWeek: 'sunday' as const,
    compactMode: false,
  }), [])

  const form = useForm<DisplayFormValues>({
    resolver: zodResolver(displayFormSchema) as any,
    defaultValues,
  })

  // Update form when settings load
  useEffect(() => {
    if (settings) {
      form.reset({
        dateFormat: settings.display.dateFormat || 'DD/MM/YYYY',
        timeFormat: settings.display.timeFormat || '24h',
        currency: settings.display.currency || 'USD',
        startOfWeek: settings.display.startOfWeek || 'sunday',
        compactMode: settings.display.compactMode || false,
      })
    }
  }, [settings, form])

  // Memoize submit handler to prevent recreation on every render
  const onSubmit = useCallback((data: DisplayFormValues) => {
    updateSettings({
      dateFormat: data.dateFormat,
      timeFormat: data.timeFormat,
      currency: data.currency,
      startOfWeek: data.startOfWeek,
      compactMode: data.compactMode,
    })
  }, [updateSettings])

  if (loadingSettings) {
    return <LoadingSkeleton />
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <FormField
          control={form.control}
          name='dateFormat'
          render={({ field }) => (
            <FormItem className='flex flex-col'>
              <FormLabel>{t('settings.display.dateFormat')}</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant='outline'
                      role='combobox'
                      className={cn(
                        'w-[200px] justify-between',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value || t('settings.display.selectFormat')}
                      <CaretSortIcon className='ms-2 h-4 w-4 shrink-0 opacity-50' />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className='w-[200px] p-0'>
                  <Command>
                    <CommandInput placeholder={t('settings.display.searchFormat')} />
                    <CommandEmpty>{t('settings.display.noFormatFound')}</CommandEmpty>
                    <CommandGroup>
                      <CommandList>
                        {dateFormatValues.map((format) => (
                          <CommandItem
                            value={format}
                            key={format}
                            onSelect={() => {
                              form.setValue('dateFormat', format)
                            }}
                          >
                            <CheckIcon
                              className={cn(
                                'size-4',
                                format === field.value
                                  ? 'opacity-100'
                                  : 'opacity-0'
                              )}
                            />
                            {format}
                          </CommandItem>
                        ))}
                      </CommandList>
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormDescription>
                {t('settings.display.dateFormatDescription')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='timeFormat'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('settings.display.timeFormat')}</FormLabel>
              <FormDescription>
                {t('settings.display.timeFormatDescription')}
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
                      <RadioGroupItem value='12h' className='sr-only' />
                    </FormControl>
                    <div className='border-muted hover:border-accent items-center rounded-md border-2 p-4 text-center'>
                      <div className='text-sm font-medium'>{t('settings.display.12hour')}</div>
                      <div className='text-muted-foreground text-xs mt-1'>
                        1:00 PM
                      </div>
                    </div>
                  </FormLabel>
                </FormItem>
                <FormItem>
                  <FormLabel className='[&:has([data-state=checked])>div]:border-primary'>
                    <FormControl>
                      <RadioGroupItem value='24h' className='sr-only' />
                    </FormControl>
                    <div className='border-muted hover:border-accent items-center rounded-md border-2 p-4 text-center'>
                      <div className='text-sm font-medium'>{t('settings.display.24hour')}</div>
                      <div className='text-muted-foreground text-xs mt-1'>
                        13:00
                      </div>
                    </div>
                  </FormLabel>
                </FormItem>
              </RadioGroup>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='currency'
          render={({ field }) => (
            <FormItem className='flex flex-col'>
              <FormLabel>{t('settings.display.currency')}</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant='outline'
                      role='combobox'
                      className={cn(
                        'w-[250px] justify-between',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value
                        ? t(`settings.display.currencies.${field.value}`)
                        : t('settings.display.selectCurrency')}
                      <CaretSortIcon className='ms-2 h-4 w-4 shrink-0 opacity-50' />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className='w-[250px] p-0'>
                  <Command>
                    <CommandInput placeholder={t('settings.display.searchCurrency')} />
                    <CommandEmpty>{t('settings.display.noCurrencyFound')}</CommandEmpty>
                    <CommandGroup>
                      <CommandList>
                        {currencyValues.map((currency) => (
                          <CommandItem
                            value={t(`settings.display.currencies.${currency}`)}
                            key={currency}
                            onSelect={() => {
                              form.setValue('currency', currency)
                            }}
                          >
                            <CheckIcon
                              className={cn(
                                'size-4',
                                currency === field.value
                                  ? 'opacity-100'
                                  : 'opacity-0'
                              )}
                            />
                            {t(`settings.display.currencies.${currency}`)}
                          </CommandItem>
                        ))}
                      </CommandList>
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormDescription>
                {t('settings.display.currencyDescription')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='startOfWeek'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('settings.display.startOfWeek')}</FormLabel>
              <FormDescription>
                {t('settings.display.startOfWeekDescription')}
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
                      <RadioGroupItem value='sunday' className='sr-only' />
                    </FormControl>
                    <div className='border-muted hover:border-accent items-center rounded-md border-2 p-4 text-center'>
                      <div className='text-sm font-medium'>{t('settings.display.sunday')}</div>
                    </div>
                  </FormLabel>
                </FormItem>
                <FormItem>
                  <FormLabel className='[&:has([data-state=checked])>div]:border-primary'>
                    <FormControl>
                      <RadioGroupItem value='monday' className='sr-only' />
                    </FormControl>
                    <div className='border-muted hover:border-accent items-center rounded-md border-2 p-4 text-center'>
                      <div className='text-sm font-medium'>{t('settings.display.monday')}</div>
                    </div>
                  </FormLabel>
                </FormItem>
              </RadioGroup>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='compactMode'
          render={({ field }) => (
            <FormItem className='flex flex-row items-start gap-x-3 space-y-0 rounded-md border p-4'>
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className='space-y-1 leading-none'>
                <FormLabel>{t('settings.display.compactMode')}</FormLabel>
                <FormDescription>
                  {t('settings.display.compactModeDescription')}
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <Button type='submit' disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className='me-2 h-4 w-4 animate-spin' />
              {t('settings.display.updating')}
            </>
          ) : (
            t('settings.display.updateDisplay')
          )}
        </Button>
      </form>
    </Form>
  )
}
