import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { type Followup } from '../data/schema'
import { getTypeInfo, getStatusInfo, getPriorityInfo, getEntityTypeInfo } from '../data/data'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'
import { Clock, User, Calendar, History } from 'lucide-react'

interface FollowupsViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Followup
}

export function FollowupsViewDialog({
  open,
  onOpenChange,
  currentRow,
}: FollowupsViewDialogProps) {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  const typeInfo = getTypeInfo(currentRow.type)
  const statusInfo = getStatusInfo(currentRow.status)
  const priorityInfo = getPriorityInfo(currentRow.priority)
  const entityTypeInfo = getEntityTypeInfo(currentRow.entityType)

  const TypeIcon = typeInfo.icon

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPpp', {
        locale: isArabic ? ar : enUS,
      })
    } catch {
      return dateString
    }
  }

  const getHistoryActionLabel = (action: string) => {
    const labels: Record<string, { en: string; ar: string }> = {
      created: { en: 'Created', ar: 'تم الإنشاء' },
      updated: { en: 'Updated', ar: 'تم التحديث' },
      completed: { en: 'Completed', ar: 'تم الإكمال' },
      cancelled: { en: 'Cancelled', ar: 'تم الإلغاء' },
      rescheduled: { en: 'Rescheduled', ar: 'تم التأجيل' },
      note_added: { en: 'Note added', ar: 'تمت إضافة ملاحظة' },
    }
    return isArabic ? labels[action]?.ar : labels[action]?.en || action
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-3'>
            <div
              className='p-2 rounded-lg'
              style={{ backgroundColor: `${typeInfo.color}20` }}
            >
              <TypeIcon className='h-5 w-5' style={{ color: typeInfo.color }} />
            </div>
            {currentRow.title}
          </DialogTitle>
          <DialogDescription>
            {t('followups.viewFollowupDetails')}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          {/* Status badges */}
          <div className='flex flex-wrap gap-2'>
            <Badge
              variant='outline'
              style={{ borderColor: statusInfo.color, color: statusInfo.color }}
            >
              {isArabic ? statusInfo.labelAr : statusInfo.label}
            </Badge>
            <Badge
              variant={currentRow.priority === 'urgent' ? 'destructive' : 'secondary'}
              style={currentRow.priority !== 'urgent' ? { backgroundColor: `${priorityInfo.color}20`, color: priorityInfo.color } : {}}
            >
              {isArabic ? priorityInfo.labelAr : priorityInfo.label}
            </Badge>
            <Badge variant='outline'>
              {isArabic ? typeInfo.labelAr : typeInfo.label}
            </Badge>
          </div>

          {/* Due date */}
          <div className='flex items-center gap-2'>
            <Calendar className='h-4 w-4 text-muted-foreground' />
            <span className='text-sm'>
              {t('followups.dueDate')}: {format(new Date(currentRow.dueDate), 'PP', {
                locale: isArabic ? ar : enUS,
              })}
              {currentRow.dueTime && ` - ${currentRow.dueTime}`}
            </span>
          </div>

          {/* Linked entity */}
          <div>
            <h4 className='text-sm font-medium text-muted-foreground mb-1'>
              {t('followups.linkedEntity')}
            </h4>
            <p className='text-sm'>
              {isArabic ? entityTypeInfo.labelAr : entityTypeInfo.label}:{' '}
              {currentRow.entity?.fullName ||
                currentRow.entity?.name ||
                currentRow.entity?.title ||
                currentRow.entity?.caseNumber ||
                currentRow.entityId}
            </p>
          </div>

          {/* Description */}
          {currentRow.description && (
            <div>
              <h4 className='text-sm font-medium text-muted-foreground mb-1'>
                {t('common.description')}
              </h4>
              <p className='text-sm'>{currentRow.description}</p>
            </div>
          )}

          {/* Assigned to */}
          {currentRow.assignedTo && typeof currentRow.assignedTo === 'object' && (
            <div className='flex items-center gap-2'>
              <User className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm'>
                {currentRow.assignedTo.firstName} {currentRow.assignedTo.lastName}
              </span>
            </div>
          )}

          {/* Completion info */}
          {currentRow.status === 'completed' && currentRow.completedAt && (
            <div className='p-3 bg-green-50 dark:bg-green-950 rounded-lg'>
              <div className='flex items-center gap-2 text-green-700 dark:text-green-300'>
                <Clock className='h-4 w-4' />
                <span className='text-sm'>
                  {t('followups.completedAt')}: {formatDate(currentRow.completedAt)}
                </span>
              </div>
              {currentRow.completionNotes && (
                <p className='mt-2 text-sm text-green-600 dark:text-green-400'>
                  {currentRow.completionNotes}
                </p>
              )}
            </div>
          )}

          {/* History */}
          {currentRow.history && currentRow.history.length > 0 && (
            <div>
              <h4 className='text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1'>
                <History className='h-4 w-4' />
                {t('followups.history')}
              </h4>
              <ScrollArea className='h-[150px]'>
                <div className='space-y-2'>
                  {currentRow.history.map((entry) => (
                    <div
                      key={entry._id}
                      className='flex items-start gap-2 p-2 bg-muted/50 rounded text-sm'
                    >
                      <div className='flex-1'>
                        <span className='font-medium'>
                          {getHistoryActionLabel(entry.action)}
                        </span>
                        {entry.note && (
                          <p className='text-muted-foreground mt-1'>
                            {entry.note}
                          </p>
                        )}
                      </div>
                      <span className='text-xs text-muted-foreground'>
                        {format(new Date(entry.performedAt), 'PP', {
                          locale: isArabic ? ar : enUS,
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
