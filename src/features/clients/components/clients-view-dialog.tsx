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
  Lock,
  Wallet,
  CreditCard,
  DollarSign,
  ArrowRightCircle,
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

// Helper to get display name for a client
const getClientDisplayName = (client: Client): string => {
  if (client.clientType === 'individual' || !client.clientType) {
    return client.fullNameArabic || client.fullNameEnglish ||
           [client.firstName, client.lastName].filter(Boolean).join(' ') || '-'
  }
  return client.companyName || client.companyNameEnglish || '-'
}

export function ClientsViewDialog({
  open,
  onOpenChange,
  currentRow,
}: ClientViewDialogProps) {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const dateLocale = isArabic ? ar : enUS

  const preferredMethod = currentRow.preferredContactMethod || currentRow.preferredContact || 'phone'
  const contactMethod = contactMethods.find(
    (m) => m.value === preferredMethod
  )
  const ContactIcon = contactMethod?.icon || MessageCircle
  const status = currentRow.status || 'active'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <User className='h-5 w-5' />
            {getClientDisplayName(currentRow)}
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
                clientStatusColors.get(status as any)
              )}
            >
              {t(`clients.statuses.${status}`)}
            </Badge>
            {currentRow.clientNumber && (
              <span className='text-sm text-muted-foreground'>
                #{currentRow.clientNumber}
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
                    {t('clients.form.phone')}<Lock className="h-3 w-3 text-muted-foreground inline ms-1" aria-hidden="true" />
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
                      {t('clients.form.alternatePhone')}<Lock className="h-3 w-3 text-muted-foreground inline ms-1" aria-hidden="true" />
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
                      {t('clients.form.email')}<Lock className="h-3 w-3 text-muted-foreground inline ms-1" aria-hidden="true" />
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
                    {t(`clients.contactMethods.${preferredMethod}`)}
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
                      {t('clients.form.nationalId')}<Lock className="h-3 w-3 text-muted-foreground inline ms-1" aria-hidden="true" />
                    </p>
                    <p className='font-medium'>{currentRow.nationalId}</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Company Information */}
          {(currentRow.companyName || currentRow.crNumber) && (
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
                  {currentRow.crNumber && (
                    <div className='flex items-center gap-3'>
                      <FileText className='h-4 w-4 text-muted-foreground' />
                      <div>
                        <p className='text-sm text-muted-foreground'>
                          {t('clients.form.companyRegistration')}
                        </p>
                        <p className='font-medium'>
                          {currentRow.crNumber}
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
                      {(() => {
                        const addressStr = typeof currentRow.address === 'string'
                          ? currentRow.address
                          : currentRow.address?.street
                        return [addressStr, currentRow.city, currentRow.country]
                          .filter(Boolean)
                          .join('، ')
                      })()}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Billing & Balance (NEW) */}
          {(currentRow.billing?.creditBalance !== undefined ||
            currentRow.totalPaid !== undefined ||
            currentRow.totalOutstanding !== undefined) && (
            <>
              <Separator />
              <div className='space-y-4'>
                <h4 className='text-sm font-medium flex items-center gap-2'>
                  <Wallet className='h-4 w-4 text-emerald-500' />
                  {isArabic ? 'الرصيد المالي' : 'Financial Balance'}
                </h4>
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
                  {currentRow.billing?.creditBalance !== undefined && (
                    <div className='flex items-center gap-3 p-3 bg-emerald-50 rounded-xl'>
                      <CreditCard className='h-5 w-5 text-emerald-600' />
                      <div>
                        <p className='text-xs text-emerald-600'>
                          {isArabic ? 'الرصيد الائتماني' : 'Credit Balance'}
                        </p>
                        <p className='font-bold text-emerald-700 text-lg'>
                          {currentRow.billing.creditBalance.toLocaleString()} {currentRow.billing.currency || 'ر.س'}
                        </p>
                      </div>
                    </div>
                  )}
                  {currentRow.totalPaid !== undefined && (
                    <div className='flex items-center gap-3 p-3 bg-blue-50 rounded-xl'>
                      <DollarSign className='h-5 w-5 text-blue-600' />
                      <div>
                        <p className='text-xs text-blue-600'>
                          {isArabic ? 'إجمالي المدفوع' : 'Total Paid'}
                        </p>
                        <p className='font-bold text-blue-700 text-lg'>
                          {currentRow.totalPaid.toLocaleString()} ر.س
                        </p>
                      </div>
                    </div>
                  )}
                  {currentRow.totalOutstanding !== undefined && (
                    <div className='flex items-center gap-3 p-3 bg-amber-50 rounded-xl'>
                      <DollarSign className='h-5 w-5 text-amber-600' />
                      <div>
                        <p className='text-xs text-amber-600'>
                          {isArabic ? 'المبلغ المستحق' : 'Outstanding'}
                        </p>
                        <p className='font-bold text-amber-700 text-lg'>
                          {currentRow.totalOutstanding.toLocaleString()} ر.س
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Conversion Info (NEW) */}
          {currentRow.convertedFromLead && (
            <>
              <Separator />
              <div className='flex items-center gap-3 p-3 bg-purple-50 rounded-xl'>
                <ArrowRightCircle className='h-5 w-5 text-purple-600' />
                <div>
                  <p className='text-xs text-purple-600'>
                    {isArabic ? 'تم التحويل من عميل محتمل' : 'Converted from Lead'}
                  </p>
                  {currentRow.convertedAt && (
                    <p className='font-medium text-purple-700'>
                      {format(new Date(currentRow.convertedAt), 'PPP', { locale: dateLocale })}
                    </p>
                  )}
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
          {currentRow.createdAt && (
            <>
              <Separator />
              <div className='flex items-center gap-6 text-sm text-muted-foreground'>
                <div className='flex items-center gap-2'>
                  <Calendar className='h-4 w-4' />
                  <span>
                    {t('clients.createdAt')}:{' '}
                    {format(
                      currentRow.createdAt instanceof Date
                        ? currentRow.createdAt
                        : new Date(currentRow.createdAt),
                      'PPP',
                      { locale: dateLocale }
                    )}
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
