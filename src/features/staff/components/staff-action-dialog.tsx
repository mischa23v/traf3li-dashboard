'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { MailPlus, Send, UserPlus } from 'lucide-react'
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
import { useUpdateStaff, useInviteStaff } from '@/hooks/useStaff'
import { useTranslation } from 'react-i18next'

// Schema for editing existing staff
const editFormSchema = z.object({
  firstName: z.string().min(2, 'الاسم الأول مطلوب'),
  lastName: z.string().min(2, 'الاسم الأخير مطلوب'),
  email: z.string().email('البريد الإلكتروني غير صالح'),
  phone: z.string().optional(),
  role: z.enum(['owner', 'admin', 'partner', 'lawyer', 'paralegal', 'secretary', 'accountant', 'departed']),
  specialization: z.string().optional(),
  status: z.enum(['active', 'departed', 'suspended', 'pending', 'pending_approval']).default('active'),
})

// Schema for inviting new staff
const inviteFormSchema = z.object({
  firstName: z.string().min(2, 'الاسم الأول مطلوب'),
  lastName: z.string().min(2, 'الاسم الأخير مطلوب'),
  email: z.string().email('البريد الإلكتروني غير صالح'),
  role: z.enum(['owner', 'admin', 'partner', 'lawyer', 'paralegal', 'secretary', 'accountant', 'departed']),
})

type EditStaffForm = z.infer<typeof editFormSchema>
type InviteStaffForm = z.infer<typeof inviteFormSchema>

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
  const { mutate: updateStaff, isPending: isUpdating } = useUpdateStaff()
  const { mutate: inviteStaff, isPending: isInviting } = useInviteStaff()
  const isPending = isUpdating || isInviting

  // Edit form for existing staff
  const editForm = useForm<EditStaffForm>({
    resolver: zodResolver(editFormSchema) as any,
    defaultValues: currentRow
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

  // Invite form for new staff
  const inviteForm = useForm<InviteStaffForm>({
    resolver: zodResolver(inviteFormSchema) as any,
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      role: 'lawyer',
    },
  })

  const onEditSubmit = (values: EditStaffForm) => {
    if (currentRow) {
      updateStaff(
        { staffId: currentRow._id, data: values },
        {
          onSuccess: () => {
            editForm.reset()
            onOpenChange(false)
          },
        }
      )
    }
  }

  const onInviteSubmit = (values: InviteStaffForm) => {
    inviteStaff(values, {
      onSuccess: () => {
        inviteForm.reset()
        onOpenChange(false)
      },
    })
  }

  const handleClose = () => {
    editForm.reset()
    inviteForm.reset()
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        if (!state) handleClose()
        else onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle className='flex items-center gap-2'>
            {isEdit ? (
              <UserPlus className='h-5 w-5' />
            ) : (
              <MailPlus className='h-5 w-5' />
            )}
            {isEdit ? t('staff.editStaff') : t('staff.invite.title')}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? t('staff.editStaffDescription')
              : t('staff.invite.description')}
          </DialogDescription>
        </DialogHeader>

        {isEdit ? (
          // Edit existing staff form
          <div className='max-h-[60vh] w-full overflow-y-auto py-1 pe-3'>
            <Form {...editForm}>
              <form
                id='staff-form'
                onSubmit={editForm.handleSubmit(onEditSubmit)}
                className='space-y-4 px-0.5'
              >
                {/* Name Section */}
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                  <FormField
                    control={editForm.control}
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
                    control={editForm.control}
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
                    control={editForm.control}
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
                    control={editForm.control}
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
                    control={editForm.control}
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
                    control={editForm.control}
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
                  control={editForm.control}
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
        ) : (
          // Invite new staff form
          <div className='max-h-[60vh] w-full overflow-y-auto py-1 pe-3'>
            <Form {...inviteForm}>
              <form
                id='staff-form'
                onSubmit={inviteForm.handleSubmit(onInviteSubmit)}
                className='space-y-4 px-0.5'
              >
                {/* Name Section */}
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                  <FormField
                    control={inviteForm.control}
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
                    control={inviteForm.control}
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

                {/* Email Section */}
                <FormField
                  control={inviteForm.control}
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

                {/* Role Section */}
                <FormField
                  control={inviteForm.control}
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

                {/* Info about invitation */}
                <div className='rounded-lg bg-blue-50 p-3 text-sm text-blue-800 dark:bg-blue-950 dark:text-blue-200'>
                  <p>{t('staff.invite.info')}</p>
                </div>
              </form>
            </Form>
          </div>
        )}

        <DialogFooter>
          <Button
            variant='outline'
            onClick={handleClose}
            disabled={isPending}
          >
            {t('common.cancel')}
          </Button>
          <Button type='submit' form='staff-form' disabled={isPending}>
            {isPending ? (
              t('common.loading')
            ) : isEdit ? (
              t('common.update')
            ) : (
              <>
                {t('staff.invite.send')} <Send className='ms-2 h-4 w-4' />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
