'use client'

import { format } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'
import {
  User,
  Phone,
  Mail,
  Calendar,
  Briefcase,
  Award,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { staffStatusColors, staffRoles } from '../data/data'
import { type Staff } from '../data/schema'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

type StaffViewDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Staff
}

export function StaffViewDialog({
  open,
  onOpenChange,
  currentRow,
}: StaffViewDialogProps) {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const dateLocale = isArabic ? ar : enUS

  const fullName = `${currentRow.firstName} ${currentRow.lastName}`
  const initials = `${currentRow.firstName[0] || ''}${currentRow.lastName[0] || ''}`.toUpperCase()
  const staffRole = staffRoles.find((r) => r.value === currentRow.role)
  const RoleIcon = staffRole?.icon || Briefcase

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <User className='h-5 w-5' />
            {t('staff.viewStaff')}
          </DialogTitle>
          <DialogDescription>
            {t('staff.viewStaffDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Profile Header */}
          <div className='flex items-center gap-4'>
            <Avatar className='h-16 w-16'>
              <AvatarImage src={currentRow.avatar} alt={fullName} />
              <AvatarFallback className='text-lg'>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className='text-lg font-semibold'>{fullName}</h3>
              <div className='flex items-center gap-2 mt-1'>
                <Badge
                  variant='outline'
                  className={cn(
                    'capitalize',
                    staffStatusColors.get(currentRow.status)
                  )}
                >
                  {t(`staff.statuses.${currentRow.status}`)}
                </Badge>
                <div className='flex items-center gap-1 text-sm text-muted-foreground'>
                  <RoleIcon className='h-4 w-4' />
                  {t(`staff.roles.${currentRow.role}`)}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <div className='space-y-4'>
            <h4 className='text-sm font-medium'>{t('staff.form.contactInfo')}</h4>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <div className='flex items-center gap-3'>
                <Mail className='h-4 w-4 text-muted-foreground' />
                <div>
                  <p className='text-sm text-muted-foreground'>
                    {t('staff.form.email')}
                  </p>
                  <p className='font-medium' dir='ltr'>
                    {currentRow.email}
                  </p>
                </div>
              </div>
              {currentRow.phone && (
                <div className='flex items-center gap-3'>
                  <Phone className='h-4 w-4 text-muted-foreground' />
                  <div>
                    <p className='text-sm text-muted-foreground'>
                      {t('staff.form.phone')}
                    </p>
                    <p className='font-medium' dir='ltr'>
                      {currentRow.phone}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Professional Information */}
          <Separator />
          <div className='space-y-4'>
            <h4 className='text-sm font-medium'>{t('staff.form.professionalInfo')}</h4>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <div className='flex items-center gap-3'>
                <Briefcase className='h-4 w-4 text-muted-foreground' />
                <div>
                  <p className='text-sm text-muted-foreground'>
                    {t('staff.form.role')}
                  </p>
                  <p className='font-medium'>
                    {t(`staff.roles.${currentRow.role}`)}
                  </p>
                </div>
              </div>
              {currentRow.specialization && (
                <div className='flex items-center gap-3'>
                  <Award className='h-4 w-4 text-muted-foreground' />
                  <div>
                    <p className='text-sm text-muted-foreground'>
                      {t('staff.form.specialization')}
                    </p>
                    <p className='font-medium'>
                      {t(`staff.specializations.${currentRow.specialization}`)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Timestamps */}
          <Separator />
          <div className='flex items-center gap-6 text-sm text-muted-foreground'>
            <div className='flex items-center gap-2'>
              <Calendar className='h-4 w-4' />
              <span>
                {t('staff.createdAt')}:{' '}
                {format(new Date(currentRow.createdAt), 'PPP', {
                  locale: dateLocale,
                })}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
