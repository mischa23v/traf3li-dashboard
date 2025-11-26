'use client'

import { format } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'
import {
  User,
  Phone,
  Mail,
  Building2,
  MapPin,
  Calendar,
  MessageCircle,
  FileText,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { clientStatusColors, contactMethods } from '../data/data'
import { type Client } from '../data/schema'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

type ClientViewDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Client
}

export function ClientsViewDialog({
  open,
  onOpenChange,
  currentRow,
}: ClientViewDialogProps) {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const dateLocale = isArabic ? ar : enUS

  const contactMethod = contactMethods.find(
    (m) => m.value === currentRow.preferredContactMethod
  )
  const ContactIcon = contactMethod?.icon || MessageCircle

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <User className='h-5 w-5' />
            {currentRow.fullName}
          </DialogTitle>
          <DialogDescription>
            {t('clients.viewClientDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Status Badge */}
          <div className='flex items-center gap-2'>
            <Badge
              variant='outline'
              className={cn(
                'capitalize',
                clientStatusColors.get(currentRow.status)
              )}
            >
              {t(`clients.statuses.${currentRow.status}`)}
            </Badge>
            {currentRow.clientId && (
              <span className='text-sm text-muted-foreground'>
                #{currentRow.clientId}
              </span>
            )}
          </div>

          <Separator />

          {/* Contact Information */}
          <div className='space-y-4'>
            <h4 className='text-sm font-medium'>{t('clients.form.contactInfo')}</h4>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <div className='flex items-center gap-3'>
                <Phone className='h-4 w-4 text-muted-foreground' />
                <div>
                  <p className='text-sm text-muted-foreground'>
                    {t('clients.form.phone')}
                  </p>
                  <p className='font-medium' dir='ltr'>
                    {currentRow.phone}
                  </p>
                </div>
              </div>
              {currentRow.alternatePhone && (
                <div className='flex items-center gap-3'>
                  <Phone className='h-4 w-4 text-muted-foreground' />
                  <div>
                    <p className='text-sm text-muted-foreground'>
                      {t('clients.form.alternatePhone')}
                    </p>
                    <p className='font-medium' dir='ltr'>
                      {currentRow.alternatePhone}
                    </p>
                  </div>
                </div>
              )}
              {currentRow.email && (
                <div className='flex items-center gap-3'>
                  <Mail className='h-4 w-4 text-muted-foreground' />
                  <div>
                    <p className='text-sm text-muted-foreground'>
                      {t('clients.form.email')}
                    </p>
                    <p className='font-medium' dir='ltr'>
                      {currentRow.email}
                    </p>
                  </div>
                </div>
              )}
              <div className='flex items-center gap-3'>
                <ContactIcon className='h-4 w-4 text-muted-foreground' />
                <div>
                  <p className='text-sm text-muted-foreground'>
                    {t('clients.form.preferredContactMethod')}
                  </p>
                  <p className='font-medium'>
                    {t(`clients.contactMethods.${currentRow.preferredContactMethod}`)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Identity Information */}
          {currentRow.nationalId && (
            <>
              <Separator />
              <div className='space-y-4'>
                <h4 className='text-sm font-medium'>
                  {t('clients.form.identityInfo')}
                </h4>
                <div className='flex items-center gap-3'>
                  <FileText className='h-4 w-4 text-muted-foreground' />
                  <div>
                    <p className='text-sm text-muted-foreground'>
                      {t('clients.form.nationalId')}
                    </p>
                    <p className='font-medium'>{currentRow.nationalId}</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Company Information */}
          {(currentRow.companyName || currentRow.companyRegistration) && (
            <>
              <Separator />
              <div className='space-y-4'>
                <h4 className='text-sm font-medium'>
                  {t('clients.form.companyInfo')}
                </h4>
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                  {currentRow.companyName && (
                    <div className='flex items-center gap-3'>
                      <Building2 className='h-4 w-4 text-muted-foreground' />
                      <div>
                        <p className='text-sm text-muted-foreground'>
                          {t('clients.form.companyName')}
                        </p>
                        <p className='font-medium'>{currentRow.companyName}</p>
                      </div>
                    </div>
                  )}
                  {currentRow.companyRegistration && (
                    <div className='flex items-center gap-3'>
                      <FileText className='h-4 w-4 text-muted-foreground' />
                      <div>
                        <p className='text-sm text-muted-foreground'>
                          {t('clients.form.companyRegistration')}
                        </p>
                        <p className='font-medium'>
                          {currentRow.companyRegistration}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Address Information */}
          {(currentRow.city || currentRow.address) && (
            <>
              <Separator />
              <div className='space-y-4'>
                <h4 className='text-sm font-medium'>
                  {t('clients.form.addressInfo')}
                </h4>
                <div className='flex items-center gap-3'>
                  <MapPin className='h-4 w-4 text-muted-foreground' />
                  <div>
                    <p className='text-sm text-muted-foreground'>
                      {t('clients.form.address')}
                    </p>
                    <p className='font-medium'>
                      {[currentRow.address, currentRow.city, currentRow.country]
                        .filter(Boolean)
                        .join('، ')}
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
              <div className='space-y-4'>
                <h4 className='text-sm font-medium'>{t('clients.form.notes')}</h4>
                <p className='text-sm text-muted-foreground whitespace-pre-wrap'>
                  {currentRow.notes}
                </p>
              </div>
            </>
          )}

          {/* Timestamps */}
          <Separator />
          <div className='flex items-center gap-6 text-sm text-muted-foreground'>
            <div className='flex items-center gap-2'>
              <Calendar className='h-4 w-4' />
              <span>
                {t('clients.createdAt')}:{' '}
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
