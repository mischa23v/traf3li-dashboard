'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { SelectDropdown } from '@/components/select-dropdown'
import { clientStatuses, contactMethods } from '../data/data'
import { type Client } from '../data/schema'
import { useCreateClient, useUpdateClient } from '@/hooks/useClients'
import { Lock } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const formSchema = z.object({
  fullNameArabic: z.string().min(2, 'الاسم مطلوب ويجب أن يكون حرفين على الأقل'),
  email: z.string().email('البريد الإلكتروني غير صالح').optional().or(z.literal('')),
  phone: z.string().min(9, 'رقم الهاتف مطلوب'),
  alternatePhone: z.string().optional(),
  nationalId: z.string().optional(),
  companyName: z.string().optional(),
  crNumber: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().default('SA'),
  notes: z.string().optional(),
  preferredContact: z.enum(['email', 'phone', 'sms', 'whatsapp']).default('phone'),
  language: z.string().default('ar'),
  status: z.enum(['active', 'inactive', 'archived', 'pending']).default('active'),
})

type ClientForm = z.infer<typeof formSchema>

type ClientActionDialogProps = {
  currentRow?: Client
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ClientsActionDialog({
  currentRow,
  open,
  onOpenChange,
}: ClientActionDialogProps) {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const isEdit = !!currentRow
  const { mutate: createClient, isPending: isCreating } = useCreateClient()
  const { mutate: updateClient, isPending: isUpdating } = useUpdateClient()
  const isPending = isCreating || isUpdating

  // Helper to get display name for edit form
  const getEditDisplayName = () => {
    if (!currentRow) return ''
    if (currentRow.clientType === 'individual' || !currentRow.clientType) {
      return currentRow.fullNameArabic || currentRow.fullNameEnglish ||
             [currentRow.firstName, currentRow.lastName].filter(Boolean).join(' ') || ''
    }
    return currentRow.companyName || currentRow.companyNameEnglish || ''
  }

  // Helper to get address as string
  const getAddressString = () => {
    if (!currentRow?.address) return ''
    if (typeof currentRow.address === 'string') return currentRow.address
    return currentRow.address.street || ''
  }

  const form = useForm<ClientForm>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: isEdit
      ? {
          fullNameArabic: getEditDisplayName(),
          email: currentRow.email || '',
          phone: currentRow.phone || '',
          alternatePhone: currentRow.alternatePhone || '',
          nationalId: currentRow.nationalId || '',
          companyName: currentRow.companyName || '',
          crNumber: currentRow.crNumber || '',
          address: getAddressString(),
          city: currentRow.city || '',
          country: currentRow.country || 'SA',
          notes: currentRow.notes || currentRow.generalNotes || '',
          preferredContact: currentRow.preferredContactMethod || currentRow.preferredContact || 'phone',
          language: currentRow.language || currentRow.preferredLanguage || 'ar',
          status: currentRow.status || 'active',
        }
      : {
          fullNameArabic: '',
          email: '',
          phone: '',
          alternatePhone: '',
          nationalId: '',
          companyName: '',
          crNumber: '',
          address: '',
          city: '',
          country: 'SA',
          notes: '',
          preferredContact: 'phone',
          language: 'ar',
          status: 'active',
        },
  })

  const onSubmit = (values: ClientForm) => {
    if (isEdit && currentRow) {
      updateClient(
        { clientId: currentRow._id, data: values },
        {
          onSuccess: () => {
            form.reset()
            onOpenChange(false)
          },
        }
      )
    } else {
      createClient(values, {
        onSuccess: () => {
          form.reset()
          onOpenChange(false)
        },
      })
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader className='text-start'>
          <DialogTitle>
            {isEdit ? t('clients.editClient') : t('clients.addClient')}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? t('clients.editClientDescription')
              : t('clients.addClientDescription')}
          </DialogDescription>
        </DialogHeader>
        <div className='max-h-[60vh] w-full overflow-y-auto py-1 pe-3'>
          <Form {...form}>
            <form
              id='client-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 px-0.5'
            >
              {/* Basic Info Section */}
              <div className='space-y-4'>
                <h4 className='text-sm font-medium text-muted-foreground'>
                  {t('clients.form.basicInfo')}
                </h4>
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='fullNameArabic'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('clients.form.fullName')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('clients.form.fullNamePlaceholder')}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='nationalId'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('clients.form.nationalId')}<Lock className="h-3 w-3 text-slate-500 inline ms-1" aria-hidden="true" /></FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('clients.form.nationalIdPlaceholder')}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Contact Info Section */}
              <div className='space-y-4'>
                <h4 className='text-sm font-medium text-muted-foreground'>
                  {t('clients.form.contactInfo')}
                </h4>
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='phone'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('clients.form.phone')}<Lock className="h-3 w-3 text-slate-500 inline ms-1" aria-hidden="true" /></FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('clients.form.phonePlaceholder')}
                            dir='ltr'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='alternatePhone'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('clients.form.alternatePhone')}<Lock className="h-3 w-3 text-slate-500 inline ms-1" aria-hidden="true" /></FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('clients.form.alternatePhonePlaceholder')}
                            dir='ltr'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='email'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('clients.form.email')}<Lock className="h-3 w-3 text-slate-500 inline ms-1" aria-hidden="true" /></FormLabel>
                        <FormControl>
                          <Input
                            type='email'
                            placeholder={t('clients.form.emailPlaceholder')}
                            dir='ltr'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='preferredContact'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('clients.form.preferredContactMethod')}</FormLabel>
                        <SelectDropdown
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                          placeholder={t('clients.form.selectContactMethod')}
                          items={contactMethods.map((m) => ({
                            label: isArabic ? m.label : m.labelEn,
                            value: m.value,
                          }))}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Company Info Section */}
              <div className='space-y-4'>
                <h4 className='text-sm font-medium text-muted-foreground'>
                  {t('clients.form.companyInfo')}
                </h4>
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='companyName'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('clients.form.companyName')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('clients.form.companyNamePlaceholder')}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='crNumber'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('clients.form.companyRegistration')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('clients.form.companyRegistrationPlaceholder')}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Address Section */}
              <div className='space-y-4'>
                <h4 className='text-sm font-medium text-muted-foreground'>
                  {t('clients.form.addressInfo')}
                </h4>
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='city'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('clients.form.city')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('clients.form.cityPlaceholder')}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='address'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('clients.form.address')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('clients.form.addressPlaceholder')}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Status Section */}
              <div className='space-y-4'>
                <h4 className='text-sm font-medium text-muted-foreground'>
                  {t('clients.form.statusSection')}
                </h4>
                <FormField
                  control={form.control}
                  name='status'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('clients.columns.status')}</FormLabel>
                      <SelectDropdown
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                        placeholder={t('clients.form.selectStatus')}
                        items={clientStatuses.map((s) => ({
                          label: isArabic ? s.label : s.labelEn,
                          value: s.value,
                        }))}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Notes Section */}
              <FormField
                control={form.control}
                name='notes'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('clients.form.notes')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('clients.form.notesPlaceholder')}
                        className='min-h-[100px]'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            {t('common.cancel')}
          </Button>
          <Button type='submit' form='client-form' disabled={isPending}>
            {isPending
              ? t('common.loading')
              : isEdit
                ? t('common.update')
                : t('common.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
