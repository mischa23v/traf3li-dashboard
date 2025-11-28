import { useState, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useDropzone } from 'react-dropzone'
import {
  Upload,
  File,
  Lock,
  Trash2,
  Download,
  History,
  RotateCcw,
  X
} from 'lucide-react'
import {
  useWikiAttachments,
  useUploadWikiAttachment,
  useDeleteWikiAttachment,
  useDownloadWikiAttachment,
  useAttachmentVersionHistory,
  useUploadAttachmentVersion,
  useDownloadAttachmentVersion,
  useRestoreAttachmentVersion
} from '@/hooks/useWiki'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import type { WikiAttachment, WikiAttachmentCategory } from '@/types/wiki'

interface WikiAttachmentUploaderProps {
  pageId: string
  isSealed?: boolean
  canEdit?: boolean
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const WikiAttachmentUploader = ({
  pageId,
  isSealed = false,
  canEdit = true
}: WikiAttachmentUploaderProps) => {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  const { data, isLoading } = useWikiAttachments(pageId)
  const uploadMutation = useUploadWikiAttachment()
  const deleteMutation = useDeleteWikiAttachment()
  const downloadMutation = useDownloadWikiAttachment()

  const [category, setCategory] = useState<WikiAttachmentCategory>('other')
  const [isConfidential, setIsConfidential] = useState(false)
  const [selectedAttachment, setSelectedAttachment] =
    useState<WikiAttachment | null>(null)
  const [showVersionHistory, setShowVersionHistory] = useState(false)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      for (const file of acceptedFiles) {
        await uploadMutation.mutateAsync({
          pageId,
          file,
          category,
          isConfidential
        })
      }
    },
    [pageId, category, isConfidential, uploadMutation]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: isSealed || !canEdit || uploadMutation.isPending
  })

  const handleDownload = (attachment: WikiAttachment) => {
    downloadMutation.mutate({
      pageId,
      attachmentId: attachment.attachmentId
    })
  }

  const handleDelete = (attachment: WikiAttachment) => {
    if (window.confirm(t('wiki.attachments.deleteConfirmation'))) {
      deleteMutation.mutate({
        pageId,
        attachmentId: attachment.attachmentId
      })
    }
  }

  const handleShowVersionHistory = (attachment: WikiAttachment) => {
    setSelectedAttachment(attachment)
    setShowVersionHistory(true)
  }

  const categoryOptions: WikiAttachmentCategory[] = [
    'pleading',
    'evidence',
    'exhibit',
    'contract',
    'correspondence',
    'research',
    'judgment',
    'other'
  ]

  return (
    <div className='space-y-4'>
      {/* Upload Area */}
      {canEdit && !isSealed && (
        <div className='space-y-3'>
          <div className='flex flex-wrap gap-3'>
            <Select
              value={category}
              onValueChange={(value) =>
                setCategory(value as WikiAttachmentCategory)
              }
            >
              <SelectTrigger className='w-[180px]'>
                <SelectValue
                  placeholder={t('wiki.attachments.categories.other')}
                />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {t(`wiki.attachments.categories.${cat}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className='flex items-center gap-2'>
              <Checkbox
                id='confidential'
                checked={isConfidential}
                onCheckedChange={(checked) =>
                  setIsConfidential(checked as boolean)
                }
              />
              <Label htmlFor='confidential' className='text-sm cursor-pointer'>
                {t('wiki.attachments.confidential')}
              </Label>
            </div>
          </div>

          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' : 'border-muted-foreground/25 hover:border-muted-foreground/50'}
              ${uploadMutation.isPending ? 'opacity-50 cursor-wait' : ''}
            `}
          >
            <input {...getInputProps()} />
            <Upload className='mx-auto h-8 w-8 text-muted-foreground' />
            <p className='mt-2 text-sm text-muted-foreground'>
              {t('wiki.attachments.uploadDescription')}
            </p>
          </div>
        </div>
      )}

      {/* Attachment List */}
      {isLoading ? (
        <div className='animate-pulse space-y-2'>
          {[1, 2].map((i) => (
            <div key={i} className='h-14 bg-muted rounded-lg' />
          ))}
        </div>
      ) : (
        <div className='space-y-2'>
          {data?.attachments.map((attachment) => (
            <div
              key={attachment._id}
              className='flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors'
            >
              <div className='flex items-center gap-3 min-w-0'>
                <File className='h-5 w-5 text-muted-foreground flex-shrink-0' />
                <div className='min-w-0'>
                  <p className='font-medium text-sm truncate'>
                    {isRTL && attachment.fileNameAr
                      ? attachment.fileNameAr
                      : attachment.fileName}
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    {t(`wiki.attachments.categories.${attachment.documentCategory}`)} •{' '}
                    {formatFileSize(attachment.fileSize)}
                    {attachment.versionCount && attachment.versionCount > 1 && (
                      <span className='ms-1'>
                        • v{attachment.currentVersion}
                      </span>
                    )}
                  </p>
                </div>
                {attachment.isSealed && (
                  <Lock className='h-4 w-4 text-red-500 flex-shrink-0' />
                )}
                {attachment.isConfidential && (
                  <Badge
                    variant='outline'
                    className='text-xs bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400 flex-shrink-0'
                  >
                    {t('wiki.attachments.confidential')}
                  </Badge>
                )}
              </div>

              <div className='flex items-center gap-1 flex-shrink-0'>
                {attachment.versionCount && attachment.versionCount > 1 && (
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8'
                    onClick={() => handleShowVersionHistory(attachment)}
                    title={t('wiki.attachmentVersions.title')}
                  >
                    <History className='h-4 w-4' />
                  </Button>
                )}
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-8 w-8'
                  onClick={() => handleDownload(attachment)}
                  title={t('wiki.attachments.download')}
                >
                  <Download className='h-4 w-4' />
                </Button>
                {canEdit && !isSealed && !attachment.isSealed && (
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-950'
                    onClick={() => handleDelete(attachment)}
                    title={t('wiki.attachments.delete')}
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                )}
              </div>
            </div>
          ))}

          {data?.attachments.length === 0 && (
            <p className='text-sm text-muted-foreground text-center py-6'>
              {t('wiki.attachments.noAttachments')}
            </p>
          )}
        </div>
      )}

      {/* Version History Dialog */}
      {selectedAttachment && (
        <AttachmentVersionHistoryDialog
          pageId={pageId}
          attachment={selectedAttachment}
          open={showVersionHistory}
          onOpenChange={setShowVersionHistory}
          isSealed={isSealed}
        />
      )}
    </div>
  )
}

// Version History Dialog Component
interface AttachmentVersionHistoryDialogProps {
  pageId: string
  attachment: WikiAttachment
  open: boolean
  onOpenChange: (open: boolean) => void
  isSealed?: boolean
}

const AttachmentVersionHistoryDialog = ({
  pageId,
  attachment,
  open,
  onOpenChange,
  isSealed
}: AttachmentVersionHistoryDialogProps) => {
  const { t } = useTranslation()
  const [showUpload, setShowUpload] = useState(false)
  const [changeNote, setChangeNote] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: versionData, isLoading } = useAttachmentVersionHistory(
    pageId,
    attachment.attachmentId,
    { enabled: open }
  )
  const uploadMutation = useUploadAttachmentVersion()
  const downloadMutation = useDownloadAttachmentVersion()
  const restoreMutation = useRestoreAttachmentVersion()

  const handleUploadVersion = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    await uploadMutation.mutateAsync({
      pageId,
      attachmentId: attachment.attachmentId,
      file,
      changeNote: changeNote || undefined
    })

    setShowUpload(false)
    setChangeNote('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRestore = async (versionNumber: number) => {
    if (!window.confirm(t('wiki.attachmentVersions.confirmRestore'))) return

    await restoreMutation.mutateAsync({
      pageId,
      attachmentId: attachment.attachmentId,
      versionNumber
    })
  }

  const handleDownloadVersion = (versionNumber: number) => {
    downloadMutation.mutate({
      pageId,
      attachmentId: attachment.attachmentId,
      versionNumber
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <History className='h-5 w-5' />
            {t('wiki.attachmentVersions.title')} - {attachment.fileName}
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-4'>
          {/* Upload New Version Button */}
          {!isSealed && !attachment.isSealed && (
            <div className='flex justify-end'>
              <Button
                variant='outline'
                onClick={() => setShowUpload(!showUpload)}
              >
                <Upload className='h-4 w-4 me-2' />
                {t('wiki.attachmentVersions.uploadNewVersion')}
              </Button>
            </div>
          )}

          {/* Upload Form */}
          {showUpload && (
            <div className='p-4 border rounded-lg space-y-3 bg-muted/50'>
              <Input
                placeholder={t('wiki.attachmentVersions.changeNotePlaceholder')}
                value={changeNote}
                onChange={(e) => setChangeNote(e.target.value)}
              />
              <input
                ref={fileInputRef}
                type='file'
                onChange={handleUploadVersion}
                className='hidden'
              />
              <div className='flex gap-2'>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadMutation.isPending}
                >
                  {uploadMutation.isPending
                    ? t('common.loading')
                    : t('common.selectFile')}
                </Button>
                <Button
                  variant='ghost'
                  onClick={() => {
                    setShowUpload(false)
                    setChangeNote('')
                  }}
                >
                  <X className='h-4 w-4' />
                </Button>
              </div>
            </div>
          )}

          {/* Version List */}
          <div className='space-y-2 max-h-96 overflow-y-auto'>
            {isLoading ? (
              <div className='text-center py-4 text-muted-foreground'>
                {t('common.loading')}
              </div>
            ) : versionData?.versions.length === 0 ? (
              <div className='text-center py-4 text-muted-foreground'>
                {t('wiki.attachmentVersions.noVersionHistory')}
              </div>
            ) : (
              versionData?.versions.map((version) => (
                <div
                  key={version.versionNumber}
                  className={`p-3 border rounded-lg ${
                    version.isCurrent
                      ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800'
                      : 'bg-background'
                  }`}
                >
                  <div className='flex justify-between items-start'>
                    <div className='min-w-0'>
                      <div className='flex items-center gap-2 flex-wrap'>
                        <span className='font-medium'>
                          {t('wiki.attachmentVersions.version')}{' '}
                          {version.versionNumber}
                        </span>
                        {version.isCurrent && (
                          <Badge variant='default' className='text-xs'>
                            {t('wiki.attachmentVersions.currentVersion')}
                          </Badge>
                        )}
                        {version.isRestored && (
                          <Badge variant='secondary' className='text-xs'>
                            {t('wiki.attachmentVersions.restoredFrom')} v
                            {version.restoredFrom}
                          </Badge>
                        )}
                      </div>
                      <div className='text-sm text-muted-foreground mt-1 truncate'>
                        {version.fileName} • {formatFileSize(version.fileSize || 0)}
                      </div>
                      {version.changeNote && (
                        <div className='text-sm mt-1'>{version.changeNote}</div>
                      )}
                      <div className='text-xs text-muted-foreground mt-1'>
                        {version.uploadedBy?.firstName}{' '}
                        {version.uploadedBy?.lastName}
                        {' • '}
                        {formatDate(version.uploadedAt)}
                      </div>
                    </div>
                    <div className='flex gap-1 flex-shrink-0'>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-8 w-8'
                        onClick={() =>
                          handleDownloadVersion(version.versionNumber)
                        }
                        title={t('wiki.attachmentVersions.downloadVersion')}
                      >
                        <Download className='h-4 w-4' />
                      </Button>
                      {!version.isCurrent && !isSealed && !attachment.isSealed && (
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-8 w-8'
                          onClick={() => handleRestore(version.versionNumber)}
                          disabled={restoreMutation.isPending}
                          title={t('wiki.attachmentVersions.restoreVersion')}
                        >
                          <RotateCcw className='h-4 w-4' />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default WikiAttachmentUploader
