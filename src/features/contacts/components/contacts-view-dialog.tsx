'use client'

import { format } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'
import {
  User,
  Phone,
  Mail,
  Calendar,
  Building2,
  MapPin,
  Tag,
  Lock,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { contactStatusColors, contactTypes, contactCategories } from '../data/data'
import { type Contact } from '../data/schema'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

type ContactsViewDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Contact
}

export function ContactsViewDialog({
  open,
  onOpenChange,
  currentRow,
}: ContactsViewDialogProps) {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const dateLocale = isArabic ? ar : enUS

  const firstName = currentRow.firstName || ''
  const lastName = currentRow.lastName || ''
  const fullName = `${firstName} ${lastName}`.trim() || '-'
  const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || '?'
  const typeValue = currentRow.type || 'individual'
  const contactType = contactTypes.find((t) => t.value === typeValue)
  const TypeIcon = contactType?.icon || User
  const categoryValue = currentRow.category || currentRow.primaryRole
  const category = categoryValue
    ? contactCategories.find((c) => c.value === categoryValue)
    : null
  const status = currentRow.status || 'active'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <User className='h-5 w-5' />
            {t('contacts.viewContact')}
          </DialogTitle>
          <DialogDescription>
            {t('contacts.viewContactDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Profile Header */}
          <div className='flex items-center gap-4'>
            <Avatar className='h-16 w-16'>
              <AvatarFallback className='text-lg'>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className='text-lg font-semibold'>{fullName}</h3>
              {currentRow.title && (
                <p className='text-sm text-muted-foreground'>{currentRow.title}</p>
              )}
              <div className='flex items-center gap-2 mt-1'>
                <Badge
                  variant='outline'
                  className={cn(
                    'capitalize',
                    contactStatusColors.get(status)
                  )}
                >
                  {t(`contacts.statuses.${status}`)}
                </Badge>
                <div className='flex items-center gap-1 text-sm text-muted-foreground'>
                  <TypeIcon className='h-4 w-4' />
                  {t(`contacts.types.${typeValue}`)}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <div className='space-y-4'>
            <h4 className='text-sm font-medium'>{t('contacts.form.contactInfo')}</h4>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              {currentRow.email && (
                <div className='flex items-center gap-3'>
                  <Mail className='h-4 w-4 text-muted-foreground' />
                  <div>
                    <p className='text-sm text-muted-foreground'>
                      {t('contacts.form.email')}<Lock className="h-3 w-3 text-muted-foreground inline ms-1" aria-hidden="true" />
                    </p>
                    <p className='font-medium' dir='ltr'>
                      {currentRow.email}
                    </p>
                  </div>
                </div>
              )}
              {currentRow.phone && (
                <div className='flex items-center gap-3'>
                  <Phone className='h-4 w-4 text-muted-foreground' />
                  <div>
                    <p className='text-sm text-muted-foreground'>
                      {t('contacts.form.phone')}<Lock className="h-3 w-3 text-muted-foreground inline ms-1" aria-hidden="true" />
                    </p>
                    <p className='font-medium' dir='ltr'>
                      {currentRow.phone}
                    </p>
                  </div>
                </div>
              )}
            </div>
            {currentRow.alternatePhone && (
              <div className='flex items-center gap-3'>
                <Phone className='h-4 w-4 text-muted-foreground' />
                <div>
                  <p className='text-sm text-muted-foreground'>
                    {t('contacts.form.alternatePhone')}<Lock className="h-3 w-3 text-muted-foreground inline ms-1" aria-hidden="true" />
                  </p>
                  <p className='font-medium' dir='ltr'>
                    {currentRow.alternatePhone}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Company & Category */}
          {(currentRow.company || category) && (
            <>
              <Separator />
              <div className='space-y-4'>
                <h4 className='text-sm font-medium'>{t('contacts.form.typeInfo')}</h4>
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                  {currentRow.company && (
                    <div className='flex items-center gap-3'>
                      <Building2 className='h-4 w-4 text-muted-foreground' />
                      <div>
                        <p className='text-sm text-muted-foreground'>
                          {t('contacts.form.company')}
                        </p>
                        <p className='font-medium'>{currentRow.company}</p>
                      </div>
                    </div>
                  )}
                  {category && categoryValue && (
                    <div className='flex items-center gap-3'>
                      <Tag className='h-4 w-4 text-muted-foreground' />
                      <div>
                        <p className='text-sm text-muted-foreground'>
                          {t('contacts.form.category')}
                        </p>
                        <p className='font-medium'>
                          {t(`contacts.categories.${categoryValue}`)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Address Information */}
          {(currentRow.address || currentRow.city) && (
            <>
              <Separator />
              <div className='space-y-4'>
                <h4 className='text-sm font-medium'>{t('contacts.form.addressInfo')}</h4>
                <div className='flex items-start gap-3'>
                  <MapPin className='h-4 w-4 text-muted-foreground mt-0.5' />
                  <div>
                    {currentRow.address && (
                      <p className='font-medium'>{currentRow.address}</p>
                    )}
                    <p className='text-sm text-muted-foreground'>
                      {[
                        currentRow.city,
                        currentRow.postalCode,
                        currentRow.country,
                      ]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Notes */}
          {currentRow.notes && (
            <>
              <Separator />
              <div className='space-y-2'>
                <h4 className='text-sm font-medium'>{t('contacts.form.notes')}</h4>
                <p className='text-sm text-muted-foreground whitespace-pre-wrap'>
                  {currentRow.notes}
                </p>
              </div>
            </>
          )}

          {/* Timestamps */}
          {currentRow.createdAt && (
            <>
              <Separator />
              <div className='flex items-center gap-6 text-sm text-muted-foreground'>
                <div className='flex items-center gap-2'>
                  <Calendar className='h-4 w-4' />
                  <span>
                    {t('contacts.createdAt')}:{' '}
                    {format(new Date(currentRow.createdAt), 'PPP', {
                      locale: dateLocale,
                    })}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
