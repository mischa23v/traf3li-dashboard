import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useShareDocument, useRevokeShareLink } from '@/hooks/useDocuments'
import { type Document } from '../data/schema'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'
import { Copy, Link as LinkIcon, Trash, Check } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface DocumentsShareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Document
}

export function DocumentsShareDialog({
  open,
  onOpenChange,
  currentRow,
}: DocumentsShareDialogProps) {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const [expiresIn, setExpiresIn] = useState<string>('24')
  const [shareLink, setShareLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const shareDocument = useShareDocument()
  const revokeShare = useRevokeShareLink()

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPp', {
        locale: isArabic ? ar : enUS,
      })
    } catch {
      return dateString
    }
  }

  const handleGenerateLink = () => {
    shareDocument.mutate(
      {
        id: currentRow._id,
        expiresIn: parseInt(expiresIn),
      },
      {
        onSuccess: (data) => {
          setShareLink(data.shareLink)
        },
      }
    )
  }

  const handleCopyLink = async () => {
    if (shareLink) {
      await navigator.clipboard.writeText(shareLink)
      setCopied(true)
      toast({
        title: t('status.success'),
        description: t('documents.linkCopied'),
      })
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleRevokeLink = () => {
    revokeShare.mutate(currentRow._id, {
      onSuccess: () => {
        setShareLink(null)
      },
    })
  }

  const expiryOptions = [
    { value: '1', label: t('documents.expiryOptions.oneHour') },
    { value: '6', label: t('documents.expiryOptions.sixHours') },
    { value: '24', label: t('documents.expiryOptions.twentyFourHours') },
    { value: '72', label: t('documents.expiryOptions.threeDays') },
    { value: '168', label: t('documents.expiryOptions.sevenDays') },
    { value: '720', label: t('documents.expiryOptions.thirtyDays') },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <LinkIcon className='h-5 w-5' />
            {t('documents.shareDocument')}
          </DialogTitle>
          <DialogDescription>
            {t('documents.shareDocumentDescription', { name: currentRow.originalName })}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          {/* Existing share info */}
          {currentRow.shareToken && currentRow.shareExpiresAt && (
            <div className='p-4 border rounded-lg bg-blue-50 dark:bg-blue-950'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-blue-700 dark:text-blue-300'>
                    {t('documents.currentlyShared')}
                  </p>
                  <p className='text-xs text-blue-600 dark:text-blue-400'>
                    {t('documents.expiresAt')}: {formatDate(currentRow.shareExpiresAt)}
                  </p>
                </div>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={handleRevokeLink}
                  disabled={revokeShare.isPending}
                  className='text-destructive hover:text-destructive'
                >
                  <Trash className='h-4 w-4' />
                </Button>
              </div>
            </div>
          )}

          {/* Generate new link */}
          {!shareLink ? (
            <>
              <div>
                <Label>{t('documents.linkExpiry')}</Label>
                <Select value={expiresIn} onValueChange={setExpiresIn}>
                  <SelectTrigger className='mt-1'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {expiryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleGenerateLink}
                disabled={shareDocument.isPending}
                className='w-full'
              >
                <LinkIcon className='me-2 h-4 w-4' />
                {shareDocument.isPending
                  ? t('common.loading')
                  : t('documents.generateLink')}
              </Button>
            </>
          ) : (
            <div className='space-y-3'>
              <Label>{t('documents.shareableLink')}</Label>
              <div className='flex gap-2'>
                <Input
                  value={shareLink}
                  readOnly
                  className='font-mono text-sm'
                />
                <Button
                  variant='outline'
                  size='icon'
                  onClick={handleCopyLink}
                >
                  {copied ? (
                    <Check className='h-4 w-4 text-green-500' />
                  ) : (
                    <Copy className='h-4 w-4' />
                  )}
                </Button>
              </div>
              <p className='text-xs text-muted-foreground'>
                {t('documents.linkExpiresIn', {
                  hours: expiresIn,
                })}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            {t('common.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
