'use client'

import { format } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'
import {
  Building2,
  Phone,
  Mail,
  Calendar,
  Globe,
  MapPin,
  FileText,
  Hash,
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
import { organizationStatusColors, organizationTypes, organizationSizes } from '../data/data'
import { type Organization } from '../data/schema'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

type OrganizationsViewDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Organization
}

export function OrganizationsViewDialog({
  open,
  onOpenChange,
  currentRow,
}: OrganizationsViewDialogProps) {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const dateLocale = isArabic ? ar : enUS

  const displayName = isArabic && currentRow.nameAr ? currentRow.nameAr : currentRow.name
  const orgType = organizationTypes.find((t) => t.value === currentRow.type)
  const TypeIcon = orgType?.icon || Building2

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Building2 className='h-5 w-5' />
            {t('organizations.viewOrganization')}
          </DialogTitle>
          <DialogDescription>
            {t('organizations.viewOrganizationDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Header */}
          <div className='flex items-center gap-4'>
            <div className='flex h-16 w-16 items-center justify-center rounded-lg bg-muted'>
              <TypeIcon className='h-8 w-8 text-muted-foreground' />
            </div>
            <div>
              <h3 className='text-lg font-semibold'>{displayName}</h3>
              {currentRow.name !== displayName && (
                <p className='text-sm text-muted-foreground'>{currentRow.name}</p>
              )}
              <div className='flex items-center gap-2 mt-1'>
                <Badge
                  variant='outline'
                  className={cn(
                    'capitalize',
                    organizationStatusColors.get(currentRow.status)
                  )}
                >
                  {t(`organizations.statuses.${currentRow.status}`)}
                </Badge>
                <span className='text-sm text-muted-foreground'>
                  {t(`organizations.types.${currentRow.type}`)}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Registration Information */}
          {(currentRow.registrationNumber || currentRow.vatNumber) && (
            <>
              <div className='space-y-4'>
                <h4 className='text-sm font-medium'>{t('organizations.form.registrationInfo')}</h4>
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                  {currentRow.registrationNumber && (
                    <div className='flex items-center gap-3'>
                      <Hash className='h-4 w-4 text-muted-foreground' />
                      <div>
                        <p className='text-sm text-muted-foreground'>
                          {t('organizations.form.registrationNumber')}
                        </p>
                        <p className='font-medium' dir='ltr'>
                          {currentRow.registrationNumber}
                        </p>
                      </div>
                    </div>
                  )}
                  {currentRow.vatNumber && (
                    <div className='flex items-center gap-3'>
                      <FileText className='h-4 w-4 text-muted-foreground' />
                      <div>
                        <p className='text-sm text-muted-foreground'>
                          {t('organizations.form.vatNumber')}
                        </p>
                        <p className='font-medium' dir='ltr'>
                          {currentRow.vatNumber}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                {currentRow.size && (
                  <div className='flex items-center gap-3'>
                    <Building2 className='h-4 w-4 text-muted-foreground' />
                    <div>
                      <p className='text-sm text-muted-foreground'>
                        {t('organizations.form.size')}
                      </p>
                      <p className='font-medium'>
                        {t(`organizations.sizes.${currentRow.size}`)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <Separator />
            </>
          )}

          {/* Contact Information */}
          <div className='space-y-4'>
            <h4 className='text-sm font-medium'>{t('organizations.form.contactInfo')}</h4>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              {currentRow.email && (
                <div className='flex items-center gap-3'>
                  <Mail className='h-4 w-4 text-muted-foreground' />
                  <div>
                    <p className='text-sm text-muted-foreground'>
                      {t('organizations.form.email')}
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
                      {t('organizations.form.phone')}
                    </p>
                    <p className='font-medium' dir='ltr'>
                      {currentRow.phone}
                    </p>
                  </div>
                </div>
              )}
              {currentRow.website && (
                <div className='flex items-center gap-3'>
                  <Globe className='h-4 w-4 text-muted-foreground' />
                  <div>
                    <p className='text-sm text-muted-foreground'>
                      {t('organizations.form.website')}
                    </p>
                    <p className='font-medium' dir='ltr'>
                      {currentRow.website}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Address Information */}
          {(currentRow.address || currentRow.city) && (
            <>
              <Separator />
              <div className='space-y-4'>
                <h4 className='text-sm font-medium'>{t('organizations.form.addressInfo')}</h4>
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
                <h4 className='text-sm font-medium'>{t('organizations.form.notes')}</h4>
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
                {t('organizations.createdAt')}:{' '}
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
