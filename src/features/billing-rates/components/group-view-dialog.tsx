import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { RateGroup } from '../data/schema'
import { applicableToOptions } from '../data/data'
import { useTranslation } from 'react-i18next'

interface GroupViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentGroup: RateGroup | null
}

export function GroupViewDialog({
  open,
  onOpenChange,
  currentGroup,
}: GroupViewDialogProps) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  if (!currentGroup) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: currentGroup.color }}
            />
            {isRTL ? currentGroup.nameAr : currentGroup.name}
            <Badge variant={currentGroup.isActive ? 'default' : 'secondary'}>
              {currentGroup.isActive ? t('common.active') : t('common.inactive')}
            </Badge>
            {currentGroup.isDefault && (
              <Badge variant="outline">{t('common.default')}</Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {isRTL ? currentGroup.descriptionAr : currentGroup.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {currentGroup.discount !== undefined && currentGroup.discount > 0 && (
            <div>
              <p className="text-sm text-muted-foreground">{t('billingRates.discount')}</p>
              <p className="text-2xl font-bold text-green-600">
                {currentGroup.discount}% {t('billingRates.off')}
              </p>
            </div>
          )}

          <Separator />

          <div>
            <p className="text-sm text-muted-foreground mb-2">
              {t('billingRates.applicableTo')}
            </p>
            <div className="flex flex-wrap gap-2">
              {currentGroup.applicableTo.length > 0 ? (
                currentGroup.applicableTo.map((item) => {
                  const option = applicableToOptions.find((o) => o.value === item)
                  return (
                    <Badge key={item} variant="secondary">
                      {isRTL ? option?.labelAr : option?.label}
                    </Badge>
                  )
                })
              ) : (
                <span className="text-muted-foreground text-sm">
                  {t('billingRates.noRestrictions')}
                </span>
              )}
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">{t('billingRates.nameEn')}</p>
              <p className="font-medium">{currentGroup.name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{t('billingRates.nameAr')}</p>
              <p className="font-medium" dir="rtl">
                {currentGroup.nameAr}
              </p>
            </div>
          </div>

          {(currentGroup.description || currentGroup.descriptionAr) && (
            <>
              <Separator />
              <div className="grid grid-cols-2 gap-4 text-sm">
                {currentGroup.description && (
                  <div>
                    <p className="text-muted-foreground">{t('billingRates.descriptionEn')}</p>
                    <p>{currentGroup.description}</p>
                  </div>
                )}
                {currentGroup.descriptionAr && (
                  <div>
                    <p className="text-muted-foreground">{t('billingRates.descriptionAr')}</p>
                    <p dir="rtl">{currentGroup.descriptionAr}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
