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
  X,
  Eye,
  ExternalLink,
  FileText,
  FileImage,
  FileVideo,
  FileAudio
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
import { wikiAttachmentService } from '@/services/wikiService'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
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

const formatDate = (dateString: string, isArabic: boolean = false): string => {
  return new Date(dateString).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Helper to determine file type category
const getFileTypeCategory = (
  fileType: string
): 'pdf' | 'image' | 'video' | 'audio' | 'document' | 'other' => {
  const type = fileType.toLowerCase()
  if (type === 'application/pdf' || type.endsWith('.pdf')) return 'pdf'
  if (type.startsWith('image/')) return 'image'
  if (type.startsWith('video/')) return 'video'
  if (type.startsWith('audio/')) return 'audio'
  if (
    type.includes('word') ||
    type.includes('document') ||
    type.includes('text') ||
    type.includes('spreadsheet') ||
    type.includes('excel')
  )
    return 'document'
  return 'other'
}

// Helper to get file icon based on type
const getFileTypeIcon = (fileType: string) => {
  const category = getFileTypeCategory(fileType)
  switch (category) {
    case 'pdf':
      return <FileText className='h-12 w-12 text-red-500' />
    case 'image':
      return <FileImage className='h-12 w-12 text-blue-500' />
    case 'video':
      return <FileVideo className='h-12 w-12 text-purple-500' />
    case 'audio':
      return <FileAudio className='h-12 w-12 text-green-500' />
    case 'document':
      return <FileText className='h-12 w-12 text-blue-600' />
    default:
      return <File className='h-12 w-12 text-muted-foreground' />
  }
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
  const [showPreview, setShowPreview] = useState(false)

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

  const handleShowPreview = (attachment: WikiAttachment) => {
    setSelectedAttachment(attachment)
    setShowPreview(true)
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
                    {t(
                      `wiki.attachments.categories.${attachment.documentCategory}`
                    )}{' '}
                    • {formatFileSize(attachment.fileSize)}
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
                {/* Preview Button */}
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-8 w-8'
                  onClick={() => handleShowPreview(attachment)}
                  title={t('common.preview')}
                >
                  <Eye className='h-4 w-4' />
                </Button>
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
      {selectedAttachment && showVersionHistory && (
        <AttachmentVersionHistoryDialog
          pageId={pageId}
          attachment={selectedAttachment}
          open={showVersionHistory}
          onOpenChange={setShowVersionHistory}
          isSealed={isSealed}
        />
      )}

      {/* Preview Dialog */}
      {selectedAttachment && showPreview && (
        <AttachmentPreviewDialog
          pageId={pageId}
          attachment={selectedAttachment}
          open={showPreview}
          onOpenChange={setShowPreview}
        />
      )}
    </div>
  )
}

// Preview Dialog Component with Arabic/RTL support
interface AttachmentPreviewDialogProps {
  pageId: string
  attachment: WikiAttachment
  open: boolean
  onOpenChange: (open: boolean) => void
}

const AttachmentPreviewDialog = ({
  pageId,
  attachment,
  open,
  onOpenChange
}: AttachmentPreviewDialogProps) => {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isLoadingPreview, setIsLoadingPreview] = useState(false)
  const [previewError, setPreviewError] = useState<string | null>(null)

  const fileCategory = getFileTypeCategory(attachment.fileType)
  const canPreviewInline = fileCategory === 'pdf' || fileCategory === 'image'
  const displayName = isRTL && attachment.fileNameAr
    ? attachment.fileNameAr
    : attachment.fileName

  // Fetch preview URL when dialog opens
  const fetchPreviewUrl = useCallback(async () => {
    if (!open || previewUrl) return

    setIsLoadingPreview(true)
    setPreviewError(null)

    try {
      const { downloadUrl } = await wikiAttachmentService.getDownloadUrl(
        pageId,
        attachment.attachmentId
      )
      setPreviewUrl(downloadUrl)
    } catch {
      setPreviewError(t('wiki.attachments.previewError') || 'Failed to load preview')
    } finally {
      setIsLoadingPreview(false)
    }
  }, [open, pageId, attachment.attachmentId, previewUrl, t])

  // Reset state when dialog closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setPreviewUrl(null)
      setPreviewError(null)
    }
    onOpenChange(newOpen)
  }

  // Load preview when dialog opens
  useState(() => {
    if (open && canPreviewInline) {
      fetchPreviewUrl()
    }
  })

  // Trigger fetch when open changes
  if (open && !previewUrl && !isLoadingPreview && canPreviewInline) {
    fetchPreviewUrl()
  }

  const handleOpenExternal = () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank')
    } else {
      fetchPreviewUrl().then(() => {
        if (previewUrl) {
          window.open(previewUrl, '_blank')
        }
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={`max-w-4xl max-h-[90vh] ${canPreviewInline ? 'h-[85vh]' : ''}`}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Eye className='h-5 w-5' />
            <span className={isRTL ? 'font-cairo' : ''}>{displayName}</span>
          </DialogTitle>
          <DialogDescription>
            {t(`wiki.attachments.categories.${attachment.documentCategory}`)} •{' '}
            {formatFileSize(attachment.fileSize)} •{' '}
            {attachment.fileType}
          </DialogDescription>
        </DialogHeader>

        <div className='flex-1 overflow-hidden'>
          {/* Loading state */}
          {isLoadingPreview && (
            <div className='flex items-center justify-center h-full min-h-[300px]'>
              <div className='text-center'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2' />
                <p className='text-sm text-muted-foreground'>
                  {t('common.loading')}
                </p>
              </div>
            </div>
          )}

          {/* Error state */}
          {previewError && (
            <div className='flex items-center justify-center h-full min-h-[300px]'>
              <div className='text-center'>
                <p className='text-sm text-destructive mb-4'>{previewError}</p>
                <Button variant='outline' onClick={fetchPreviewUrl}>
                  {t('common.retry')}
                </Button>
              </div>
            </div>
          )}

          {/* PDF Preview */}
          {!isLoadingPreview && !previewError && fileCategory === 'pdf' && previewUrl && (
            <iframe
              src={`${previewUrl}#toolbar=1&navpanes=1&scrollbar=1`}
              className='w-full h-full min-h-[500px] rounded-lg border'
              title={displayName}
            />
          )}

          {/* Image Preview */}
          {!isLoadingPreview && !previewError && fileCategory === 'image' && previewUrl && (
            <div className='flex items-center justify-center h-full min-h-[300px] bg-muted/50 rounded-lg'>
              <img
                src={previewUrl}
                alt={displayName}
                className='max-w-full max-h-[60vh] object-contain rounded'
              />
            </div>
          )}

          {/* Non-previewable files */}
          {!isLoadingPreview && !previewError && !canPreviewInline && (
            <div className='flex flex-col items-center justify-center h-full min-h-[300px] py-8'>
              {getFileTypeIcon(attachment.fileType)}

              <h3 className={`text-lg font-medium mt-4 ${isRTL ? 'font-cairo' : ''}`}>
                {displayName}
              </h3>

              <p className='text-sm text-muted-foreground mt-1'>
                {t('wiki.attachments.previewNotAvailable') || 'Preview not available for this file type'}
              </p>

              {/* File details */}
              <div className='mt-6 grid grid-cols-2 gap-4 text-sm'>
                <div>
                  <span className='text-muted-foreground'>
                    {t('wiki.attachments.categories.title') || 'Category'}:
                  </span>
                  <span className='ms-2 font-medium'>
                    {t(`wiki.attachments.categories.${attachment.documentCategory}`)}
                  </span>
                </div>
                <div>
                  <span className='text-muted-foreground'>
                    {t('documents.fileSize') || 'Size'}:
                  </span>
                  <span className='ms-2 font-medium'>
                    {formatFileSize(attachment.fileSize)}
                  </span>
                </div>
                <div>
                  <span className='text-muted-foreground'>
                    {t('documents.fileType') || 'Type'}:
                  </span>
                  <span className='ms-2 font-medium'>{attachment.fileType}</span>
                </div>
                <div>
                  <span className='text-muted-foreground'>
                    {t('wiki.attachmentVersions.uploadedAt') || 'Uploaded'}:
                  </span>
                  <span className='ms-2 font-medium'>
                    {formatDate(attachment.uploadedAt, isRTL)}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className='flex gap-3 mt-6'>
                <Button onClick={handleOpenExternal}>
                  <ExternalLink className='h-4 w-4 me-2' />
                  {t('common.openInNewTab') || 'Open in New Tab'}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer with status badges */}
        <div className='flex items-center gap-2 pt-2 border-t'>
          {attachment.isSealed && (
            <Badge variant='destructive' className='text-xs'>
              <Lock className='h-3 w-3 me-1' />
              {t('wiki.attachments.sealed')}
            </Badge>
          )}
          {attachment.isConfidential && (
            <Badge
              variant='outline'
              className='text-xs bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400'
            >
              {t('wiki.attachments.confidential')}
            </Badge>
          )}
          {attachment.versionCount && attachment.versionCount > 1 && (
            <Badge variant='secondary' className='text-xs'>
              <History className='h-3 w-3 me-1' />
              v{attachment.currentVersion}
            </Badge>
          )}
        </div>
      </DialogContent>
    </Dialog>
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
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
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

  const handleUploadVersion = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
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
      <DialogContent className='max-w-2xl' dir={isRTL ? 'rtl' : 'ltr'}>
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
                        {version.fileName} •{' '}
                        {formatFileSize(version.fileSize || 0)}
                      </div>
                      {version.changeNote && (
                        <div className='text-sm mt-1'>{version.changeNote}</div>
                      )}
                      <div className='text-xs text-muted-foreground mt-1'>
                        {version.uploadedBy?.firstName}{' '}
                        {version.uploadedBy?.lastName}
                        {' • '}
                        {formatDate(version.uploadedAt, isRTL)}
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
                      {!version.isCurrent &&
                        !isSealed &&
                        !attachment.isSealed && (
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
