'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Building2 } from 'lucide-react'
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
import { createOrganizationSchema, type CreateOrganizationInput, type Organization } from '../data/schema'
import { organizationTypes, organizationSizes, organizationStatuses } from '../data/data'
import { useCreateOrganization, useUpdateOrganization } from '@/hooks/useOrganizations'
import { useTranslation } from 'react-i18next'

type OrganizationsActionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Organization
}

export function OrganizationsActionDialog({
  open,
  onOpenChange,
  currentRow,
}: OrganizationsActionDialogProps) {
  const { t } = useTranslation()
  const isEdit = !!currentRow
  const { mutate: createOrganization, isPending: isCreating } = useCreateOrganization()
  const { mutate: updateOrganization, isPending: isUpdating } = useUpdateOrganization()

  const form = useForm<CreateOrganizationInput>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: {
      name: '',
      nameAr: '',
      type: 'company',
      registrationNumber: '',
      vatNumber: '',
      phone: '',
      fax: '',
      email: '',
      website: '',
      address: '',
      city: '',
      postalCode: '',
      country: '',
      industry: '',
      size: undefined,
      notes: '',
      status: 'active',
    },
  })

  useEffect(() => {
    if (currentRow) {
      form.reset({
        name: currentRow.name,
        nameAr: currentRow.nameAr || '',
        type: currentRow.type,
        registrationNumber: currentRow.registrationNumber || '',
        vatNumber: currentRow.vatNumber || '',
        phone: currentRow.phone || '',
        fax: currentRow.fax || '',
        email: currentRow.email || '',
        website: currentRow.website || '',
        address: currentRow.address || '',
        city: currentRow.city || '',
        postalCode: currentRow.postalCode || '',
        country: currentRow.country || '',
        industry: currentRow.industry || '',
        size: currentRow.size,
        notes: currentRow.notes || '',
        status: currentRow.status,
      })
    } else {
      form.reset({
        name: '',
        nameAr: '',
        type: 'company',
        registrationNumber: '',
        vatNumber: '',
        phone: '',
        fax: '',
        email: '',
        website: '',
        address: '',
        city: '',
        postalCode: '',
        country: '',
        industry: '',
        size: undefined,
        notes: '',
        status: 'active',
      })
    }
  }, [currentRow, form])

  const onSubmit = (data: CreateOrganizationInput) => {
    if (isEdit && currentRow) {
      updateOrganization(
        { id: currentRow._id, data },
        {
          onSuccess: () => {
            onOpenChange(false)
            form.reset()
          },
        }
      )
    } else {
      createOrganization(data, {
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
            <Building2 className='h-5 w-5' />
            {isEdit ? t('organizations.editOrganization') : t('organizations.addOrganization')}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? t('organizations.editOrganizationDescription')
              : t('organizations.addOrganizationDescription')}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className='max-h-[60vh] pe-4'>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              {/* Basic Information */}
              <div className='space-y-4'>
                <h4 className='text-sm font-medium'>{t('organizations.form.basicInfo')}</h4>
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='name'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('organizations.form.name')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('organizations.form.namePlaceholder')}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='nameAr'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('organizations.form.nameAr')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('organizations.form.nameArPlaceholder')}
                            dir='rtl'
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
                    name='type'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('organizations.form.type')}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('organizations.form.selectType')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {organizationTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {t(`organizations.types.${type.value}`)}
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
                    name='industry'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('organizations.form.industry')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('organizations.form.industryPlaceholder')}
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

              {/* Registration Information */}
              <div className='space-y-4'>
                <h4 className='text-sm font-medium'>{t('organizations.form.registrationInfo')}</h4>
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='registrationNumber'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('organizations.form.registrationNumber')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('organizations.form.registrationNumberPlaceholder')}
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
                    name='vatNumber'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('organizations.form.vatNumber')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('organizations.form.vatNumberPlaceholder')}
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
                  name='size'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('organizations.form.size')}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('organizations.form.selectSize')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {organizationSizes.map((size) => (
                            <SelectItem key={size.value} value={size.value}>
                              {t(`organizations.sizes.${size.value}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Contact Information */}
              <div className='space-y-4'>
                <h4 className='text-sm font-medium'>{t('organizations.form.contactInfo')}</h4>
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='email'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('organizations.form.email')}</FormLabel>
                        <FormControl>
                          <Input
                            type='email'
                            placeholder={t('organizations.form.emailPlaceholder')}
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
                    name='website'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('organizations.form.website')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('organizations.form.websitePlaceholder')}
                            dir='ltr'
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
                    name='phone'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('organizations.form.phone')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('organizations.form.phonePlaceholder')}
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
                    name='fax'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('organizations.form.fax')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('organizations.form.faxPlaceholder')}
                            dir='ltr'
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

              {/* Address Information */}
              <div className='space-y-4'>
                <h4 className='text-sm font-medium'>{t('organizations.form.addressInfo')}</h4>
                <FormField
                  control={form.control}
                  name='address'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('organizations.form.address')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('organizations.form.addressPlaceholder')}
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
                        <FormLabel>{t('organizations.form.city')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('organizations.form.cityPlaceholder')}
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
                        <FormLabel>{t('organizations.form.postalCode')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('organizations.form.postalCodePlaceholder')}
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
                        <FormLabel>{t('organizations.form.country')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('organizations.form.countryPlaceholder')}
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
                <h4 className='text-sm font-medium'>{t('organizations.form.statusSection')}</h4>
                <FormField
                  control={form.control}
                  name='status'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('organizations.form.status')}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('organizations.form.selectStatus')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {organizationStatuses.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {t(`organizations.statuses.${status.value}`)}
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
                      <FormLabel>{t('organizations.form.notes')}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t('organizations.form.notesPlaceholder')}
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
