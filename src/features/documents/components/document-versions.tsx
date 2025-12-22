import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  useVersionList,
  useVersionStatistics,
  useDownloadVersion,
  useRestoreVersion,
  useDeleteVersion,
  useVersionPreviewUrl,
} from '@/hooks/useDocumentVersions'
import { type Document } from '../data/schema'
import { formatFileSize } from '../data/data'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'
import {
  Download,
  RotateCcw,
  FileText,
  Clock,
  User,
  History,
  CheckCircle2,
  GitBranch,
  Eye,
  Trash2,
  Loader2,
  TrendingUp,
  Archive,
  AlertCircle,
} from 'lucide-react'
import { openSmartPreview } from '@/lib/file-viewer'
import { cn } from '@/lib/utils'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface DocumentVersionsProps {
  document: Document
  onCompareVersions?: (versionId1: string, versionId2: string) => void
}

export function DocumentVersions({ document, onCompareVersions }: DocumentVersionsProps) {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const [deleteVersionId, setDeleteVersionId] = useState<string | null>(null)
  const [isPreviewLoading, setIsPreviewLoading] = useState<string | null>(null)

  const { data: versions = [], isLoading } = useVersionList(document._id)
  const { data: statistics } = useVersionStatistics(document._id)
  const downloadVersion = useDownloadVersion()
  const restoreVersion = useRestoreVersion()
  const deleteVersion = useDeleteVersion()
  const previewUrlMutation = useVersionPreviewUrl()

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPp', {
        locale: isArabic ? ar : enUS,
      })
    } catch {
      return dateString
    }
  }

  const getUploaderName = (uploadedBy: string | { _id: string; fullName: string }) => {
    if (typeof uploadedBy === 'object') {
      return uploadedBy.fullName
    }
    return uploadedBy
  }

  const handleDownload = (versionId: string, fileName: string) => {
    downloadVersion.mutate({
      documentId: document._id,
      versionId,
      fileName,
    })
  }

  const handleRestore = (versionId: string) => {
    restoreVersion.mutate({
      documentId: document._id,
      versionId,
    })
  }

  const handleDelete = () => {
    if (!deleteVersionId) return
    deleteVersion.mutate(
      {
        documentId: document._id,
        versionId: deleteVersionId,
      },
      {
        onSuccess: () => {
          setDeleteVersionId(null)
        },
      }
    )
  }

  const handlePreview = async (versionId: string, fileName: string) => {
    setIsPreviewLoading(versionId)
    try {
      const url = await previewUrlMutation.mutateAsync({
        documentId: document._id,
        versionId,
      })
      openSmartPreview({
        url,
        fileName,
        isArabic,
      })
    } finally {
      setIsPreviewLoading(null)
    }
  }

  return (
    <div className='space-y-6'>
      {/* Statistics Card */}
      {statistics && (
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium flex items-center gap-2'>
              <TrendingUp className='h-4 w-4 text-primary' />
              {t('documents.versionStatistics', 'Version Statistics')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
              <div>
                <p className='text-xs text-muted-foreground'>
                  {t('documents.totalVersions', 'Total Versions')}
                </p>
                <p className='text-2xl font-bold'>{statistics.totalVersions + 1}</p>
              </div>
              <div>
                <p className='text-xs text-muted-foreground'>
                  {t('documents.totalSize', 'Total Size')}
                </p>
                <p className='text-2xl font-bold'>
                  {formatFileSize(statistics.totalSize + document.fileSize)}
                </p>
              </div>
              <div>
                <p className='text-xs text-muted-foreground'>
                  {t('documents.averageSize', 'Average Size')}
                </p>
                <p className='text-2xl font-bold'>
                  {formatFileSize(
                    (statistics.totalSize + document.fileSize) / (statistics.totalVersions + 1)
                  )}
                </p>
              </div>
              <div>
                <p className='text-xs text-muted-foreground'>
                  {t('documents.mostActive', 'Most Active')}
                </p>
                <p className='text-sm font-medium truncate' title={statistics.mostActiveUploader || '-'}>
                  {statistics.mostActiveUploader || '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Version History */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <History className='h-5 w-5 text-primary' />
            {t('documents.versionHistory', 'Version History')}
          </CardTitle>
          <CardDescription>
            {t('documents.versionHistoryDescription', 'Browse and manage document versions')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className='h-[600px] pr-4'>
            {isLoading ? (
              <div className='text-center py-12 text-muted-foreground'>
                <Loader2 className='h-8 w-8 animate-spin mx-auto mb-2' />
                <p>{t('common.loading', 'Loading...')}</p>
              </div>
            ) : (
              <TooltipProvider>
                <div className='relative'>
                  {/* Timeline line */}
                  <div className='absolute top-6 bottom-6 start-5 w-0.5 bg-gradient-to-b from-primary via-muted-foreground/30 to-muted-foreground/10' />

                  <div className='space-y-6'>
                    {/* Current version */}
                    <div className='relative flex gap-4'>
                      {/* Timeline node */}
                      <div className='relative z-10 flex-shrink-0'>
                        <div className='w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30'>
                          <CheckCircle2 className='h-5 w-5 text-primary-foreground' />
                        </div>
                      </div>
                      {/* Content */}
                      <Card className='flex-1 bg-primary/5 border-2 border-primary/20 hover:border-primary/40 transition-colors'>
                        <CardContent className='p-4'>
                          <div className='flex items-start justify-between gap-4'>
                            <div className='flex-1 min-w-0'>
                              <div className='flex items-center gap-2 mb-2 flex-wrap'>
                                <FileText className='h-4 w-4 text-primary flex-shrink-0' />
                                <span className='font-semibold truncate'>
                                  {document.originalName}
                                </span>
                                <Badge className='bg-primary text-primary-foreground flex-shrink-0'>
                                  {t('documents.currentVersion', 'Current')}
                                </Badge>
                                <Badge variant='outline' className='flex-shrink-0'>
                                  v{document.version}
                                </Badge>
                              </div>
                              <div className='flex flex-wrap items-center gap-3 text-sm text-muted-foreground'>
                                <span className='flex items-center gap-1'>
                                  <Clock className='h-3 w-3' />
                                  {formatDate(document.updatedAt)}
                                </span>
                                <span className='px-2 py-0.5 bg-muted rounded-full text-xs'>
                                  {formatFileSize(document.fileSize)}
                                </span>
                              </div>
                            </div>
                            <div className='flex gap-2 flex-shrink-0'>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant='ghost'
                                    size='sm'
                                    className='hover:bg-primary/10'
                                    onClick={() => handlePreview(document._id, document.originalName)}
                                    disabled={isPreviewLoading === document._id}
                                  >
                                    {isPreviewLoading === document._id ? (
                                      <Loader2 className='h-4 w-4 animate-spin' />
                                    ) : (
                                      <Eye className='h-4 w-4' />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {t('common.preview', 'Preview')}
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant='outline'
                                    size='sm'
                                    className='hover:bg-primary hover:text-primary-foreground'
                                    onClick={() =>
                                      handleDownload(document._id, document.originalName)
                                    }
                                    disabled={downloadVersion.isPending}
                                  >
                                    <Download className='h-4 w-4' />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {t('common.download', 'Download')}
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Previous versions */}
                    {versions.length === 0 ? (
                      <div className='relative flex gap-4'>
                        <div className='relative z-10 flex-shrink-0'>
                          <div className='w-10 h-10 rounded-full bg-muted flex items-center justify-center'>
                            <GitBranch className='h-4 w-4 text-muted-foreground' />
                          </div>
                        </div>
                        <Card className='flex-1 bg-muted/30'>
                          <CardContent className='p-6 text-center'>
                            <Archive className='h-12 w-12 mx-auto mb-2 text-muted-foreground' />
                            <p className='text-sm text-muted-foreground'>
                              {t('documents.noVersions', 'No previous versions')}
                            </p>
                            <p className='text-xs mt-1 text-muted-foreground'>
                              {t(
                                'documents.firstVersion',
                                'This is the first version of the document'
                              )}
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    ) : (
                      versions.map((version) => (
                        <div key={version._id} className='relative flex gap-4'>
                          {/* Timeline node */}
                          <div className='relative z-10 flex-shrink-0'>
                            <div className='w-10 h-10 rounded-full bg-muted border-2 border-muted-foreground/20 flex items-center justify-center'>
                              <span className='text-xs font-bold text-muted-foreground'>
                                v{version.version}
                              </span>
                            </div>
                          </div>
                          {/* Content */}
                          <Card className='flex-1 bg-muted/30 hover:bg-muted/50 transition-all group'>
                            <CardContent className='p-4'>
                              <div className='flex items-start justify-between gap-4'>
                                <div className='flex-1 min-w-0'>
                                  <div className='flex items-center gap-2 mb-2 flex-wrap'>
                                    <FileText className='h-4 w-4 text-muted-foreground flex-shrink-0' />
                                    <span className='font-medium truncate'>
                                      {version.originalName}
                                    </span>
                                    <Badge variant='outline' className='text-xs flex-shrink-0'>
                                      v{version.version}
                                    </Badge>
                                  </div>
                                  <div className='flex flex-wrap items-center gap-3 text-sm text-muted-foreground'>
                                    <span className='flex items-center gap-1'>
                                      <Clock className='h-3 w-3' />
                                      {formatDate(version.createdAt)}
                                    </span>
                                    <span className='px-2 py-0.5 bg-muted rounded-full text-xs'>
                                      {formatFileSize(version.fileSize)}
                                    </span>
                                    <span className='flex items-center gap-1'>
                                      <User className='h-3 w-3' />
                                      {getUploaderName(version.uploadedBy)}
                                    </span>
                                  </div>
                                  {version.changeNote && (
                                    <div className='mt-2 p-2 bg-muted/50 rounded-lg border-s-2 border-muted-foreground/30'>
                                      <p className='text-xs text-muted-foreground italic'>
                                        "{version.changeNote}"
                                      </p>
                                    </div>
                                  )}
                                </div>
                                <div className='flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0'>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant='ghost'
                                        size='sm'
                                        className='hover:bg-primary/10'
                                        onClick={() => handlePreview(version._id, version.originalName)}
                                        disabled={isPreviewLoading === version._id}
                                      >
                                        {isPreviewLoading === version._id ? (
                                          <Loader2 className='h-4 w-4 animate-spin' />
                                        ) : (
                                          <Eye className='h-4 w-4' />
                                        )}
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      {t('common.preview', 'Preview')}
                                    </TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant='ghost'
                                        size='sm'
                                        onClick={() =>
                                          handleDownload(version._id, version.originalName)
                                        }
                                        disabled={downloadVersion.isPending}
                                      >
                                        <Download className='h-4 w-4' />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      {t('common.download', 'Download')}
                                    </TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant='ghost'
                                        size='sm'
                                        onClick={() => handleRestore(version._id)}
                                        disabled={restoreVersion.isPending}
                                        className='hover:bg-amber-500/10 hover:text-amber-600'
                                      >
                                        <RotateCcw className='h-4 w-4' />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      {t('documents.restoreVersion', 'Restore this version')}
                                    </TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant='ghost'
                                        size='sm'
                                        onClick={() => setDeleteVersionId(version._id)}
                                        className='hover:bg-destructive/10 hover:text-destructive'
                                      >
                                        <Trash2 className='h-4 w-4' />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      {t('common.delete', 'Delete')}
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </TooltipProvider>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteVersionId} onOpenChange={() => setDeleteVersionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className='flex items-center gap-2'>
              <AlertCircle className='h-5 w-5 text-destructive' />
              {t('documents.deleteVersion', 'Delete Version')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                'documents.deleteVersionConfirm',
                'Are you sure you want to delete this version? This action cannot be undone.'
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel', 'Cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {deleteVersion.isPending ? (
                <Loader2 className='h-4 w-4 animate-spin me-2' />
              ) : (
                <Trash2 className='h-4 w-4 me-2' />
              )}
              {t('common.delete', 'Delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
