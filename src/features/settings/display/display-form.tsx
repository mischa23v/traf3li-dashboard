import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
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

const dateFormats = [
  { label: 'MM/DD/YYYY', value: 'MM/DD/YYYY' },
  { label: 'DD/MM/YYYY', value: 'DD/MM/YYYY' },
  { label: 'YYYY-MM-DD', value: 'YYYY-MM-DD' },
  { label: 'DD MMM YYYY', value: 'DD MMM YYYY' },
] as const

const currencies = [
  { label: 'US Dollar (USD)', value: 'USD' },
  { label: 'Euro (EUR)', value: 'EUR' },
  { label: 'Saudi Riyal (SAR)', value: 'SAR' },
  { label: 'UAE Dirham (AED)', value: 'AED' },
  { label: 'Egyptian Pound (EGP)', value: 'EGP' },
  { label: 'British Pound (GBP)', value: 'GBP' },
] as const

const displayFormSchema = z.object({
  dateFormat: z.string(),
  timeFormat: z.enum(['12h', '24h']),
  currency: z.string(),
  startOfWeek: z.enum(['sunday', 'monday']),
  compactMode: z.boolean(),
})

type DisplayFormValues = z.infer<typeof displayFormSchema>

export function DisplayForm() {
  const { data: settings, isLoading: loadingSettings } = useSettings()
  const { mutate: updateSettings, isPending } = useUpdateDisplaySettings()

  const form = useForm<DisplayFormValues>({
    resolver: zodResolver(displayFormSchema),
    defaultValues: {
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h',
      currency: 'USD',
      startOfWeek: 'sunday',
      compactMode: false,
    },
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

  function onSubmit(data: DisplayFormValues) {
    updateSettings({
      dateFormat: data.dateFormat,
      timeFormat: data.timeFormat,
      currency: data.currency,
      startOfWeek: data.startOfWeek,
      compactMode: data.compactMode,
    })
  }

  if (loadingSettings) {
    return (
      <div className='space-y-8'>
        <Skeleton className='h-20 w-full' />
        <Skeleton className='h-20 w-full' />
        <Skeleton className='h-20 w-full' />
        <Skeleton className='h-20 w-full' />
        <Skeleton className='h-10 w-32' />
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <FormField
          control={form.control}
          name='dateFormat'
          render={({ field }) => (
            <FormItem className='flex flex-col'>
              <FormLabel>Date Format</FormLabel>
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
                      {field.value
                        ? dateFormats.find(
                            (format) => format.value === field.value
                          )?.label
                        : 'Select format'}
                      <CaretSortIcon className='ms-2 h-4 w-4 shrink-0 opacity-50' />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className='w-[200px] p-0'>
                  <Command>
                    <CommandInput placeholder='Search format...' />
                    <CommandEmpty>No format found.</CommandEmpty>
                    <CommandGroup>
                      <CommandList>
                        {dateFormats.map((format) => (
                          <CommandItem
                            value={format.label}
                            key={format.value}
                            onSelect={() => {
                              form.setValue('dateFormat', format.value)
                            }}
                          >
                            <CheckIcon
                              className={cn(
                                'size-4',
                                format.value === field.value
                                  ? 'opacity-100'
                                  : 'opacity-0'
                              )}
                            />
                            {format.label}
                          </CommandItem>
                        ))}
                      </CommandList>
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormDescription>
                Select how dates should be displayed throughout the dashboard.
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
              <FormLabel>Time Format</FormLabel>
              <FormDescription>
                Select how time should be displayed.
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
                      <div className='text-sm font-medium'>12-hour</div>
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
                      <div className='text-sm font-medium'>24-hour</div>
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
              <FormLabel>Currency</FormLabel>
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
                        ? currencies.find(
                            (currency) => currency.value === field.value
                          )?.label
                        : 'Select currency'}
                      <CaretSortIcon className='ms-2 h-4 w-4 shrink-0 opacity-50' />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className='w-[250px] p-0'>
                  <Command>
                    <CommandInput placeholder='Search currency...' />
                    <CommandEmpty>No currency found.</CommandEmpty>
                    <CommandGroup>
                      <CommandList>
                        {currencies.map((currency) => (
                          <CommandItem
                            value={currency.label}
                            key={currency.value}
                            onSelect={() => {
                              form.setValue('currency', currency.value)
                            }}
                          >
                            <CheckIcon
                              className={cn(
                                'size-4',
                                currency.value === field.value
                                  ? 'opacity-100'
                                  : 'opacity-0'
                              )}
                            />
                            {currency.label}
                          </CommandItem>
                        ))}
                      </CommandList>
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormDescription>
                Select the currency for financial information.
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
              <FormLabel>Start of Week</FormLabel>
              <FormDescription>
                Select the first day of the week for calendar displays.
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
                      <div className='text-sm font-medium'>Sunday</div>
                    </div>
                  </FormLabel>
                </FormItem>
                <FormItem>
                  <FormLabel className='[&:has([data-state=checked])>div]:border-primary'>
                    <FormControl>
                      <RadioGroupItem value='monday' className='sr-only' />
                    </FormControl>
                    <div className='border-muted hover:border-accent items-center rounded-md border-2 p-4 text-center'>
                      <div className='text-sm font-medium'>Monday</div>
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
            <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4'>
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className='space-y-1 leading-none'>
                <FormLabel>Compact Mode</FormLabel>
                <FormDescription>
                  Reduce spacing and padding throughout the dashboard for a more
                  compact layout.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <Button type='submit' disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Updating...
            </>
          ) : (
            'Update display'
          )}
        </Button>
      </form>
    </Form>
  )
}
