import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { BillingRate } from '../data/schema'
import { rateTypes, rateCategories, currencies, formatAmount } from '../data/data'
import { useTranslation } from 'react-i18next'

interface RateViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRate: BillingRate | null
}

export function RateViewDialog({
  open,
  onOpenChange,
  currentRate,
}: RateViewDialogProps) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  if (!currentRate) return null

  const rateType = rateTypes.find((r) => r.value === currentRate.type)
  const rateCategory = rateCategories.find((c) => c.value === currentRate.category)
  const currency = currencies.find((c) => c.value === currentRate.currency)

  const TypeIcon = rateType?.icon
  const CategoryIcon = rateCategory?.icon

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isRTL ? currentRate.nameAr : currentRate.name}
            <Badge variant={currentRate.isActive ? 'default' : 'secondary'}>
              {currentRate.isActive ? t('common.active') : t('common.inactive')}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {isRTL ? currentRate.descriptionAr : currentRate.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">{t('billingRates.type')}</p>
              <div className="flex items-center gap-2 mt-1">
                {TypeIcon && <TypeIcon className="h-4 w-4" />}
                <span className="font-medium">
                  {isRTL ? rateType?.labelAr : rateType?.label}
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('billingRates.category')}</p>
              <div className="flex items-center gap-2 mt-1">
                {CategoryIcon && <CategoryIcon className="h-4 w-4" />}
                <span className="font-medium">
                  {isRTL ? rateCategory?.labelAr : rateCategory?.label}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">{t('billingRates.amount')}</p>
              <p className="text-xl font-bold">
                {formatAmount(currentRate.amount, currentRate.currency)}
              </p>
              {currentRate.unit && (
                <p className="text-sm text-muted-foreground">
                  {t('billingRates.perUnit', { unit: currentRate.unit })}
                </p>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('billingRates.currency')}</p>
              <p className="font-medium">
                {currency?.symbol} - {isRTL ? currency?.labelAr : currency?.label}
              </p>
            </div>
          </div>

          {(currentRate.minimumCharge || currentRate.roundingIncrement) && (
            <>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                {currentRate.minimumCharge && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t('billingRates.minimumCharge')}
                    </p>
                    <p className="font-medium">
                      {formatAmount(currentRate.minimumCharge, currentRate.currency)}
                    </p>
                  </div>
                )}
                {currentRate.roundingIncrement && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t('billingRates.roundingIncrement')}
                    </p>
                    <p className="font-medium">
                      {currentRate.roundingIncrement} {t('billingRates.minutes')}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          {currentRate.groupId && (
            <>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">{t('billingRates.group')}</p>
                <Badge variant="outline" className="mt-1">
                  {currentRate.groupId}
                </Badge>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
