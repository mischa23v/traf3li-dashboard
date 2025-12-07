import { useState } from 'react'
import { formatDistanceToNow, format } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Loader2,
  Download,
  Eye,
  Clock,
  FileText,
  History,
  CheckCircle2,
  GitBranch,
} from 'lucide-react'
import { useAttachmentVersions, useAttachmentVersionDownload } from '@/hooks/useTasks'
import { useTranslation } from 'react-i18next'
import type { Attachment, AttachmentVersion } from '@/services/tasksService'
import { cn } from '@/lib/utils'

interface AttachmentVersionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  taskId: string
  attachment: Attachment
}

export function AttachmentVersionsDialog({
  open,
  onOpenChange,
  taskId,
  attachment,
}: AttachmentVersionsDialogProps) {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const attachmentId = attachment._id || ''

  const { data, isLoading, error } = useAttachmentVersions(taskId, attachmentId)
  const downloadMutation = useAttachmentVersionDownload()
  const [downloadingVersion, setDownloadingVersion] = useState<string | null>(null)

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPp', {
        locale: isArabic ? ar : enUS,
      })
    } catch {
      return dateString
    }
  }

  const handleDownload = async (version: AttachmentVersion) => {
    setDownloadingVersion(version.versionId)
    try {
      await downloadMutation.mutateAsync({
        taskId,
        attachmentId,
        versionId: version.versionId,
        disposition: 'attachment',
        fileName: attachment.fileName,
      })
    } finally {
      setDownloadingVersion(null)
    }
  }

  const handlePreview = async (version: AttachmentVersion) => {
    setDownloadingVersion(version.versionId)
    try {
      await downloadMutation.mutateAsync({
        taskId,
        attachmentId,
        versionId: version.versionId,
        disposition: 'inline',
      })
    } finally {
      setDownloadingVersion(null)
    }
  }

  const versions = data?.versions || []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[700px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Clock className='h-5 w-5' />
            {isArabic ? 'سجل النسخ' : 'Version History'}
          </DialogTitle>
          <DialogDescription>
            {isArabic
              ? `سجل نسخ الملف: ${attachment.fileName}`
              : `Version history for: ${attachment.fileName}`}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Version history with visual timeline */}
          <div>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='font-medium flex items-center gap-2'>
                <History className='h-4 w-4 text-primary' />
                {isArabic ? 'النسخ المتوفرة' : 'Available Versions'}
              </h3>
              <Badge variant='secondary' className='text-xs'>
                {versions.length} {isArabic ? 'نسخة' : 'versions'}
              </Badge>
            </div>
            <ScrollArea className='h-[350px]'>
              {isLoading ? (
                <div className='flex items-center justify-center py-8'>
                  <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
                  <span className='me-2 text-muted-foreground'>
                    {isArabic ? 'جاري التحميل...' : 'Loading...'}
                  </span>
                </div>
              ) : error ? (
                <div className='text-center py-8 text-destructive'>
                  {isArabic ? 'فشل في تحميل سجل النسخ' : 'Failed to load version history'}
                </div>
              ) : versions.length === 0 ? (
                <div className='text-center py-8 text-slate-600'>
                  <GitBranch className='mx-auto h-12 w-12 mb-4 opacity-50' />
                  <p className='text-sm'>
                    {isArabic ? 'لا توجد نسخ سابقة' : 'No previous versions'}
                  </p>
                  <p className='text-xs mt-1'>
                    {isArabic
                      ? 'هذه هي النسخة الأولى من الملف'
                      : 'This is the first version of the file'}
                  </p>
                </div>
              ) : (
                <TooltipProvider>
                  <div className='relative'>
                    {/* Timeline line */}
                    <div className='absolute top-6 bottom-6 start-5 w-0.5 bg-gradient-to-b from-primary via-muted-foreground/30 to-muted-foreground/10' />

                    <div className='space-y-4'>
                      {versions.map((version, index) => (
                        <div key={version.versionId} className='relative flex gap-4'>
                          {/* Timeline node */}
                          <div className='relative z-10 flex-shrink-0'>
                            <div
                              className={cn(
                                'w-10 h-10 rounded-full flex items-center justify-center',
                                version.isLatest
                                  ? 'bg-primary shadow-lg shadow-primary/30'
                                  : 'bg-muted border-2 border-muted-foreground/20'
                              )}
                            >
                              {version.isLatest ? (
                                <CheckCircle2 className='h-5 w-5 text-primary-foreground' />
                              ) : (
                                <span className='text-xs font-bold text-muted-foreground'>
                                  v{versions.length - index}
                                </span>
                              )}
                            </div>
                          </div>
                          {/* Content */}
                          <div
                            className={cn(
                              'flex-1 rounded-xl p-4 transition-colors',
                              version.isLatest
                                ? 'bg-primary/5 border-2 border-primary/20 hover:border-primary/40'
                                : 'bg-muted/30 border border-muted-foreground/10 hover:border-muted-foreground/30 hover:bg-muted/50'
                            )}
                          >
                            <div className='flex items-start justify-between'>
                              <div className='flex-1'>
                                <div className='flex items-center gap-2 mb-2'>
                                  <FileText className='h-4 w-4 text-primary' />
                                  <span className='font-semibold'>
                                    {version.isLatest
                                      ? isArabic
                                        ? 'النسخة الحالية'
                                        : 'Current Version'
                                      : isArabic
                                      ? `نسخة ${versions.length - index}`
                                      : `Version ${versions.length - index}`}
                                  </span>
                                  {version.isLatest && (
                                    <Badge className='bg-primary text-primary-foreground'>
                                      {isArabic ? 'الأحدث' : 'Latest'}
                                    </Badge>
                                  )}
                                </div>
                                <div className='flex flex-wrap items-center gap-3 text-sm text-slate-600'>
                                  <span className='flex items-center gap-1'>
                                    <Clock className='h-3 w-3' />
                                    {formatDate(version.lastModified)}
                                  </span>
                                  <span className='px-2 py-0.5 bg-muted rounded-full text-xs'>
                                    {formatFileSize(version.size)}
                                  </span>
                                </div>
                                <div className='mt-1 text-xs text-slate-600'>
                                  {formatDistanceToNow(new Date(version.lastModified), {
                                    addSuffix: true,
                                    locale: isArabic ? ar : enUS,
                                  })}
                                </div>
                              </div>
                              <div className='flex items-center gap-2'>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant='ghost'
                                      size='sm'
                                      onClick={() => handlePreview(version)}
                                      disabled={downloadingVersion === version.versionId}
                                      className='hover:bg-primary/10'
                                    >
                                      {downloadingVersion === version.versionId ? (
                                        <Loader2 className='h-4 w-4 animate-spin' />
                                      ) : (
                                        <Eye className='h-4 w-4' />
                                      )}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {isArabic ? 'معاينة' : 'Preview'}
                                  </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant='outline'
                                      size='sm'
                                      onClick={() => handleDownload(version)}
                                      disabled={downloadingVersion === version.versionId}
                                      className='hover:bg-primary hover:text-primary-foreground'
                                    >
                                      {downloadingVersion === version.versionId ? (
                                        <Loader2 className='h-4 w-4 animate-spin' />
                                      ) : (
                                        <Download className='h-4 w-4' />
                                      )}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {isArabic ? 'تحميل' : 'Download'}
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TooltipProvider>
              )}
            </ScrollArea>
          </div>

          {/* Help text */}
          <div className='text-xs text-slate-600 bg-muted/50 p-3 rounded-lg'>
            {isArabic
              ? 'لإضافة نسخة جديدة، قم برفع ملف بنفس الاسم. سيتم حفظ النسخة السابقة تلقائياً.'
              : 'To add a new version, upload a file with the same name. The previous version will be saved automatically.'}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
