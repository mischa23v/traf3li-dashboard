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
import { SelectDropdown } from '@/components/select-dropdown'
import { staffStatuses, staffRoles, specializations } from '../data/data'
import { type Staff } from '../data/schema'
import { useCreateStaff, useUpdateStaff } from '@/hooks/useStaff'
import { useTranslation } from 'react-i18next'

const formSchema = z.object({
  firstName: z.string().min(2, 'الاسم الأول مطلوب'),
  lastName: z.string().min(2, 'الاسم الأخير مطلوب'),
  email: z.string().email('البريد الإلكتروني غير صالح'),
  phone: z.string().optional(),
  role: z.enum(['admin', 'lawyer', 'paralegal', 'assistant']),
  specialization: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
})

type StaffForm = z.infer<typeof formSchema>

type StaffActionDialogProps = {
  currentRow?: Staff
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function StaffActionDialog({
  currentRow,
  open,
  onOpenChange,
}: StaffActionDialogProps) {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const isEdit = !!currentRow
  const { mutate: createStaff, isPending: isCreating } = useCreateStaff()
  const { mutate: updateStaff, isPending: isUpdating } = useUpdateStaff()
  const isPending = isCreating || isUpdating

  const form = useForm<StaffForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          firstName: currentRow.firstName,
          lastName: currentRow.lastName,
          email: currentRow.email,
          phone: currentRow.phone || '',
          role: currentRow.role,
          specialization: currentRow.specialization || '',
          status: currentRow.status,
        }
      : {
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          role: 'lawyer',
          specialization: '',
          status: 'active',
        },
  })

  const onSubmit = (values: StaffForm) => {
    if (isEdit && currentRow) {
      updateStaff(
        { staffId: currentRow._id, data: values },
        {
          onSuccess: () => {
            form.reset()
            onOpenChange(false)
          },
        }
      )
    } else {
      createStaff(values, {
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
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle>
            {isEdit ? t('staff.editStaff') : t('staff.addStaff')}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? t('staff.editStaffDescription')
              : t('staff.addStaffDescription')}
          </DialogDescription>
        </DialogHeader>
        <div className='max-h-[60vh] w-full overflow-y-auto py-1 pe-3'>
          <Form {...form}>
            <form
              id='staff-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 px-0.5'
            >
              {/* Name Section */}
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='firstName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('staff.form.firstName')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('staff.form.firstNamePlaceholder')}
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
                      <FormLabel>{t('staff.form.lastName')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('staff.form.lastNamePlaceholder')}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Contact Section */}
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('staff.form.email')}</FormLabel>
                      <FormControl>
                        <Input
                          type='email'
                          placeholder={t('staff.form.emailPlaceholder')}
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
                      <FormLabel>{t('staff.form.phone')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('staff.form.phonePlaceholder')}
                          dir='ltr'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Role Section */}
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='role'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('staff.form.role')}</FormLabel>
                      <SelectDropdown
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                        placeholder={t('staff.form.selectRole')}
                        items={staffRoles.map((r) => ({
                          label: isArabic ? r.label : r.labelEn,
                          value: r.value,
                        }))}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='specialization'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('staff.form.specialization')}</FormLabel>
                      <SelectDropdown
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                        placeholder={t('staff.form.selectSpecialization')}
                        items={specializations.map((s) => ({
                          label: isArabic ? s.label : s.labelEn,
                          value: s.value,
                        }))}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Status Section */}
              <FormField
                control={form.control}
                name='status'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('staff.columns.status')}</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder={t('staff.form.selectStatus')}
                      items={staffStatuses.map((s) => ({
                        label: isArabic ? s.label : s.labelEn,
                        value: s.value,
                      }))}
                    />
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
          <Button type='submit' form='staff-form' disabled={isPending}>
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
