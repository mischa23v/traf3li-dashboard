'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { User, Lock } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { createContactSchema, type CreateContactInput, type Contact } from '../data/schema'
import { contactTypes, contactCategories, contactStatuses } from '../data/data'
import { useCreateContact, useUpdateContact } from '@/hooks/useContacts'
import { useTranslation } from 'react-i18next'

type ContactsActionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Contact
}

export function ContactsActionDialog({
  open,
  onOpenChange,
  currentRow,
}: ContactsActionDialogProps) {
  const { t } = useTranslation()
  const isEdit = !!currentRow
  const { mutate: createContact, isPending: isCreating } = useCreateContact()
  const { mutate: updateContact, isPending: isUpdating } = useUpdateContact()

  const form = useForm<CreateContactInput>({
    resolver: zodResolver(createContactSchema) as any,
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      alternatePhone: '',
      title: '',
      company: '',
      type: 'individual',
      category: undefined,
      address: '',
      city: '',
      postalCode: '',
      country: '',
      notes: '',
      status: 'active',
    },
  })

  useEffect(() => {
    if (currentRow) {
      form.reset({
        firstName: currentRow.firstName,
        lastName: currentRow.lastName,
        email: currentRow.email || '',
        phone: currentRow.phone || '',
        alternatePhone: currentRow.alternatePhone || '',
        title: currentRow.title || '',
        company: currentRow.company || '',
        type: currentRow.type,
        category: currentRow.category,
        address: currentRow.address || '',
        city: currentRow.city || '',
        postalCode: currentRow.postalCode || '',
        country: currentRow.country || '',
        notes: currentRow.notes || '',
        status: currentRow.status,
      })
    } else {
      form.reset({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        alternatePhone: '',
        title: '',
        company: '',
        type: 'individual',
        category: undefined,
        address: '',
        city: '',
        postalCode: '',
        country: '',
        notes: '',
        status: 'active',
      })
    }
  }, [currentRow, form])

  const onSubmit = (data: CreateContactInput) => {
    if (isEdit && currentRow) {
      updateContact(
        { id: currentRow._id, data },
        {
          onSuccess: () => {
            onOpenChange(false)
            form.reset()
          },
        }
      )
    } else {
      createContact(data, {
        onSuccess: () => {
          onOpenChange(false)
          form.reset()
        },
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <User className='h-5 w-5' />
            {isEdit ? t('contacts.editContact') : t('contacts.addContact')}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? t('contacts.editContactDescription')
              : t('contacts.addContactDescription')}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className='max-h-[60vh] pe-4'>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              {/* Basic Information */}
              <div className='space-y-4'>
                <h4 className='text-sm font-medium'>{t('contacts.form.basicInfo')}</h4>
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='firstName'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('contacts.form.firstName')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('contacts.form.firstNamePlaceholder')}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='lastName'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('contacts.form.lastName')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('contacts.form.lastNamePlaceholder')}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='title'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('contacts.form.title')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('contacts.form.titlePlaceholder')}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='company'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('contacts.form.company')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('contacts.form.companyPlaceholder')}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Contact Type & Category */}
              <div className='space-y-4'>
                <h4 className='text-sm font-medium'>{t('contacts.form.typeInfo')}</h4>
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='type'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('contacts.form.type')}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('contacts.form.selectType')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {contactTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {t(`contacts.types.${type.value}`)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='category'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('contacts.form.category')}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('contacts.form.selectCategory')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {contactCategories.map((category) => (
                              <SelectItem key={category.value} value={category.value}>
                                {t(`contacts.categories.${category.value}`)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Contact Information */}
              <div className='space-y-4'>
                <h4 className='text-sm font-medium'>{t('contacts.form.contactInfo')}</h4>
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='email'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('contacts.form.email')}<Lock className="h-3 w-3 text-slate-500 inline ms-1" aria-hidden="true" /></FormLabel>
                        <FormControl>
                          <Input
                            type='email'
                            placeholder={t('contacts.form.emailPlaceholder')}
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
                    name='phone'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('contacts.form.phone')}<Lock className="h-3 w-3 text-slate-500 inline ms-1" aria-hidden="true" /></FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('contacts.form.phonePlaceholder')}
                            dir='ltr'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name='alternatePhone'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('contacts.form.alternatePhone')}<Lock className="h-3 w-3 text-slate-500 inline ms-1" aria-hidden="true" /></FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('contacts.form.alternatePhonePlaceholder')}
                          dir='ltr'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Address Information */}
              <div className='space-y-4'>
                <h4 className='text-sm font-medium'>{t('contacts.form.addressInfo')}</h4>
                <FormField
                  control={form.control}
                  name='address'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('contacts.form.address')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('contacts.form.addressPlaceholder')}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
                  <FormField
                    control={form.control}
                    name='city'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('contacts.form.city')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('contacts.form.cityPlaceholder')}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='postalCode'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('contacts.form.postalCode')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('contacts.form.postalCodePlaceholder')}
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
                    name='country'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('contacts.form.country')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('contacts.form.countryPlaceholder')}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Status & Notes */}
              <div className='space-y-4'>
                <h4 className='text-sm font-medium'>{t('contacts.form.statusSection')}</h4>
                <FormField
                  control={form.control}
                  name='status'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('contacts.form.status')}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('contacts.form.selectStatus')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {contactStatuses.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {t(`contacts.statuses.${status.value}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='notes'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('contacts.form.notes')}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t('contacts.form.notesPlaceholder')}
                          className='min-h-[100px]'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </ScrollArea>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={isCreating || isUpdating}
          >
            {isCreating || isUpdating
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
