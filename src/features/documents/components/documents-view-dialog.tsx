import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { type Document } from '../data/schema'
import { getCategoryInfo, formatFileSize, getFileIcon } from '../data/data'
import { useTranslation } from 'react-i18next'
import { useDownloadDocument } from '@/hooks/useDocuments'
import { format } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'
import { Download, ExternalLink, Lock, History, Link as LinkIcon } from 'lucide-react'

interface DocumentsViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Document
}

export function DocumentsViewDialog({
  open,
  onOpenChange,
  currentRow,
}: DocumentsViewDialogProps) {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const categoryInfo = getCategoryInfo(currentRow.category)
  const downloadDocument = useDownloadDocument()

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPpp', {
        locale: isArabic ? ar : enUS,
      })
    } catch {
      return dateString
    }
  }

  const handleDownload = () => {
    downloadDocument.mutate({
      id: currentRow._id,
      fileName: currentRow.originalName,
    })
  }

  const handlePreview = () => {
    window.open(currentRow.url, '_blank')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <span className='text-2xl'>{getFileIcon(currentRow.fileType)}</span>
            {currentRow.originalName}
          </DialogTitle>
          <DialogDescription>
            {t('documents.viewDocumentDetails')}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          {/* Status badges */}
          <div className='flex flex-wrap gap-2'>
            <Badge
              variant='outline'
              style={{ borderColor: categoryInfo.color, color: categoryInfo.color }}
            >
              {isArabic ? categoryInfo.labelAr : categoryInfo.label}
            </Badge>
            {currentRow.version > 1 && (
              <Badge variant='secondary'>
                <History className='h-3 w-3 me-1' />
                v{currentRow.version}
              </Badge>
            )}
            {currentRow.isConfidential && (
              <Badge variant='destructive'>
                <Lock className='h-3 w-3 me-1' />
                {t('documents.confidential')}
              </Badge>
            )}
            {currentRow.isEncrypted && (
              <Badge variant='outline' className='border-amber-500 text-amber-500'>
                <Lock className='h-3 w-3 me-1' />
                {t('documents.encrypted')}
              </Badge>
            )}
            {currentRow.shareToken && (
              <Badge variant='outline' className='border-blue-500 text-blue-500'>
                <LinkIcon className='h-3 w-3 me-1' />
                {t('documents.shared')}
              </Badge>
            )}
          </div>

          {/* File info */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <h4 className='text-sm font-medium text-muted-foreground mb-1'>
                {t('documents.fileSize')}
              </h4>
              <p className='text-sm'>{formatFileSize(currentRow.fileSize)}</p>
            </div>
            <div>
              <h4 className='text-sm font-medium text-muted-foreground mb-1'>
                {t('documents.fileType')}
              </h4>
              <p className='text-sm'>{currentRow.fileType}</p>
            </div>
          </div>

          {/* Case info */}
          {currentRow.caseId && typeof currentRow.caseId === 'object' && (
            <div>
              <h4 className='text-sm font-medium text-muted-foreground mb-1'>
                {t('documents.linkedCase')}
              </h4>
              <p className='text-sm'>
                {currentRow.caseId.caseNumber} - {currentRow.caseId.title}
              </p>
            </div>
          )}

          {/* Description */}
          {currentRow.description && (
            <div>
              <h4 className='text-sm font-medium text-muted-foreground mb-1'>
                {t('common.description')}
              </h4>
              <p className='text-sm'>{currentRow.description}</p>
            </div>
          )}

          {/* Tags */}
          {currentRow.tags && currentRow.tags.length > 0 && (
            <div>
              <h4 className='text-sm font-medium text-muted-foreground mb-1'>
                {t('documents.tags')}
              </h4>
              <div className='flex flex-wrap gap-1'>
                {currentRow.tags.map((tag) => (
                  <Badge key={tag} variant='secondary'>
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Dates */}
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

          {/* Access info */}
          {currentRow.accessCount !== undefined && (
            <div>
              <h4 className='text-sm font-medium text-muted-foreground mb-1'>
                {t('documents.accessCount')}
              </h4>
              <p className='text-sm'>
                {currentRow.accessCount} {t('documents.timesAccessed')}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className='flex gap-2 pt-4'>
            <Button onClick={handleDownload} className='flex-1'>
              <Download className='me-2 h-4 w-4' />
              {t('common.download')}
            </Button>
            <Button variant='outline' onClick={handlePreview}>
              <ExternalLink className='me-2 h-4 w-4' />
              {t('common.preview')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
