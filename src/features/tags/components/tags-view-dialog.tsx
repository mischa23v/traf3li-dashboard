import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { type Tag } from '../data/schema'
import { getEntityTypeInfo } from '../data/data'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'

interface TagsViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Tag
}

export function TagsViewDialog({
  open,
  onOpenChange,
  currentRow,
}: TagsViewDialogProps) {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const entityTypeInfo = getEntityTypeInfo(currentRow.entityType || 'all')
  const displayName = isArabic && currentRow.nameAr ? currentRow.nameAr : currentRow.name

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP', {
        locale: isArabic ? ar : enUS,
      })
    } catch {
      return dateString
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-3'>
            <div
              className='h-6 w-6 rounded-full'
              style={{ backgroundColor: currentRow.color }}
            />
            {displayName}
          </DialogTitle>
          <DialogDescription>
            {t('tags.viewTagDetails')}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          {currentRow.nameAr && currentRow.name && (
            <div>
              <h4 className='text-sm font-medium text-muted-foreground mb-1'>
                {isArabic ? t('tags.nameEn') : t('tags.nameAr')}
              </h4>
              <p className='text-sm'>
                {isArabic ? currentRow.name : currentRow.nameAr}
              </p>
            </div>
          )}

          <div>
            <h4 className='text-sm font-medium text-muted-foreground mb-1'>
              {t('tags.entityType')}
            </h4>
            <Badge variant='outline'>
              {isArabic ? entityTypeInfo.labelAr : entityTypeInfo.label}
            </Badge>
          </div>

          <div>
            <h4 className='text-sm font-medium text-muted-foreground mb-1'>
              {t('tags.usageCount')}
            </h4>
            <Badge variant='secondary'>
              {currentRow.usageCount || 0} {t('tags.timesUsed')}
            </Badge>
          </div>

          {currentRow.description && (
            <div>
              <h4 className='text-sm font-medium text-muted-foreground mb-1'>
                {t('common.description')}
              </h4>
              <p className='text-sm'>{currentRow.description}</p>
            </div>
          )}

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <h4 className='text-sm font-medium text-muted-foreground mb-1'>
                {t('common.createdAt')}
              </h4>
              <p className='text-sm'>{formatDate(currentRow.createdAt)}</p>
            </div>
            <div>
              <h4 className='text-sm font-medium text-muted-foreground mb-1'>
                {t('common.updatedAt')}
              </h4>
              <p className='text-sm'>{formatDate(currentRow.updatedAt)}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
