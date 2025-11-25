import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { CaretSortIcon, CheckIcon } from '@radix-ui/react-icons'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
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
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { DatePicker } from '@/components/date-picker'
import { useSettings, useUpdateAccountSettings } from '@/hooks/useSettings'
import { Skeleton } from '@/components/ui/skeleton'

const languageValues = ['en', 'ar', 'fr', 'de', 'es', 'pt', 'ru', 'ja', 'ko', 'zh'] as const

type AccountFormValues = {
  name: string
  dob?: Date
  language: string
}

export function AccountForm() {
  const { t } = useTranslation()
  const { data: settings, isLoading: loadingSettings } = useSettings()
  const { mutate: updateSettings, isPending } = useUpdateAccountSettings()

  const accountFormSchema = z.object({
    name: z
      .string()
      .min(1, t('settings.account.validation.nameRequired'))
      .min(2, t('settings.account.validation.nameMinLength'))
      .max(30, t('settings.account.validation.nameMaxLength')),
    dob: z.date().optional(),
    language: z.string().min(1, t('settings.account.validation.languageRequired')),
  })

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      name: '',
      language: 'en',
    },
  })

  // Update form when settings load
  useEffect(() => {
    if (settings) {
      form.reset({
        name: settings.account.name || '',
        dob: settings.account.dob ? new Date(settings.account.dob) : undefined,
        language: settings.account.language || 'en',
      })
    }
  }, [settings, form])

  function onSubmit(data: AccountFormValues) {
    updateSettings({
      name: data.name,
      dob: data.dob?.toISOString(),
      language: data.language,
    })
  }

  if (loadingSettings) {
    return (
      <div className='space-y-8'>
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
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('settings.account.name')}</FormLabel>
              <FormControl>
                <Input placeholder={t('settings.account.namePlaceholder')} {...field} />
              </FormControl>
              <FormDescription>
                {t('settings.account.nameDescription')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='dob'
          render={({ field }) => (
            <FormItem className='flex flex-col'>
              <FormLabel>{t('settings.account.dob')}</FormLabel>
              <DatePicker selected={field.value} onSelect={field.onChange} />
              <FormDescription>
                {t('settings.account.dobDescription')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='language'
          render={({ field }) => (
            <FormItem className='flex flex-col'>
              <FormLabel>{t('settings.account.language')}</FormLabel>
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
                        ? t(`settings.account.languages.${field.value}`)
                        : t('settings.account.selectLanguage')}
                      <CaretSortIcon className='ms-2 h-4 w-4 shrink-0 opacity-50' />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className='w-[200px] p-0'>
                  <Command>
                    <CommandInput placeholder={t('settings.account.searchLanguage')} />
                    <CommandEmpty>{t('settings.account.noLanguageFound')}</CommandEmpty>
                    <CommandGroup>
                      <CommandList>
                        {languageValues.map((langValue) => (
                          <CommandItem
                            value={t(`settings.account.languages.${langValue}`)}
                            key={langValue}
                            onSelect={() => {
                              form.setValue('language', langValue)
                            }}
                          >
                            <CheckIcon
                              className={cn(
                                'size-4',
                                langValue === field.value
                                  ? 'opacity-100'
                                  : 'opacity-0'
                              )}
                            />
                            {t(`settings.account.languages.${langValue}`)}
                          </CommandItem>
                        ))}
                      </CommandList>
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormDescription>
                {t('settings.account.languageDescription')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type='submit' disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className='me-2 h-4 w-4 animate-spin' />
              {t('settings.account.updating')}
            </>
          ) : (
            t('settings.account.updateAccount')
          )}
        </Button>
      </form>
    </Form>
  )
}
