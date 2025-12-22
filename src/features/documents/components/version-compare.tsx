import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  useVersionList,
  useVersionComparison,
  useVersionDiff,
  useVersionContent,
} from '@/hooks/useDocumentVersions'
import { type Document, type DocumentVersion } from '../data/schema'
import { formatFileSize } from '../data/data'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'
import {
  FileText,
  Clock,
  User,
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  AlertCircle,
  Loader2,
  FileCode,
  Eye,
  ChevronDown,
  ChevronUp,
  Minus,
  Plus,
} from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { cn } from '@/lib/utils'

interface VersionCompareProps {
  document: Document
}

export function VersionCompare({ document }: VersionCompareProps) {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const [version1Id, setVersion1Id] = useState<string>('')
  const [version2Id, setVersion2Id] = useState<string>(document._id)
  const [compareMode, setCompareMode] = useState<'metadata' | 'content'>('metadata')

  const { data: versions = [], isLoading: versionsLoading } = useVersionList(document._id)

  // Create full version list (current + historical)
  const allVersions: (Document | DocumentVersion)[] = [
    document,
    ...(versions || []),
  ]

  // Auto-select versions if not selected
  useEffect(() => {
    if (!version1Id && versions.length > 0) {
      setVersion1Id(versions[0]._id)
    }
  }, [versions, version1Id])

  const { data: comparison, isLoading: comparisonLoading } = useVersionComparison(
    document._id,
    version1Id,
    version2Id
  )

  const { data: diff, isLoading: diffLoading } = useVersionDiff(
    document._id,
    version1Id,
    version2Id
  )

  const { data: content1 } = useVersionContent(document._id, version1Id)
  const { data: content2 } = useVersionContent(document._id, version2Id)

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPp', {
        locale: isArabic ? ar : enUS,
      })
    } catch {
      return dateString
    }
  }

  const getVersionInfo = (versionId: string) => {
    return allVersions.find((v) => v._id === versionId)
  }

  const version1 = getVersionInfo(version1Id)
  const version2 = getVersionInfo(version2Id)

  const getUploaderName = (uploadedBy: string | { _id: string; fullName: string }) => {
    if (typeof uploadedBy === 'object') {
      return uploadedBy.fullName
    }
    return uploadedBy
  }

  const isTextFile = (fileType: string) => {
    const textTypes = [
      'text/plain',
      'application/json',
      'application/xml',
      'text/html',
      'text/css',
      'text/javascript',
      'application/javascript',
    ]
    return textTypes.includes(fileType)
  }

  const canCompareContent =
    version1 && version2 && isTextFile(version1.fileType) && isTextFile(version2.fileType)

  const renderDiffLine = (line: string, index: number) => {
    const firstChar = line[0]
    let className = ''
    let icon = null

    if (firstChar === '+') {
      className = 'bg-green-50 dark:bg-green-950/30 border-s-2 border-green-500'
      icon = <Plus className='h-3 w-3 text-green-600' />
    } else if (firstChar === '-') {
      className = 'bg-red-50 dark:bg-red-950/30 border-s-2 border-red-500'
      icon = <Minus className='h-3 w-3 text-red-600' />
    } else if (firstChar === ' ') {
      className = 'bg-muted/30'
    }

    return (
      <div
        key={index}
        className={cn('px-3 py-1 font-mono text-xs flex items-start gap-2', className)}
      >
        {icon && <span className='flex-shrink-0 mt-0.5'>{icon}</span>}
        <span className='flex-1 whitespace-pre-wrap break-all'>{line.slice(1)}</span>
      </div>
    )
  }

  if (versionsLoading) {
    return (
      <div className='text-center py-12'>
        <Loader2 className='h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground' />
        <p className='text-muted-foreground'>{t('common.loading', 'Loading...')}</p>
      </div>
    )
  }

  if (versions.length === 0) {
    return (
      <Alert>
        <AlertCircle className='h-4 w-4' />
        <AlertTitle>{t('documents.noVersionsToCompare', 'No Versions to Compare')}</AlertTitle>
        <AlertDescription>
          {t(
            'documents.noVersionsToCompareDesc',
            'There are no previous versions to compare. Upload a new version to enable version comparison.'
          )}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Version Selectors */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <ArrowLeftRight className='h-5 w-5 text-primary' />
            {t('documents.compareVersions', 'Compare Versions')}
          </CardTitle>
          <CardDescription>
            {t('documents.compareVersionsDesc', 'Select two versions to compare')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>
                {t('documents.version', 'Version')} 1
              </label>
              <Select value={version1Id} onValueChange={setVersion1Id}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {allVersions.map((v) => (
                    <SelectItem key={v._id} value={v._id}>
                      <div className='flex items-center gap-2'>
                        <span>v{v.version}</span>
                        {v._id === document._id && (
                          <Badge variant='secondary' className='text-xs'>
                            {t('documents.current', 'Current')}
                          </Badge>
                        )}
                        <span className='text-xs text-muted-foreground'>
                          {formatDate('createdAt' in v ? v.createdAt : v.updatedAt)}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-medium'>
                {t('documents.version', 'Version')} 2
              </label>
              <Select value={version2Id} onValueChange={setVersion2Id}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {allVersions.map((v) => (
                    <SelectItem key={v._id} value={v._id}>
                      <div className='flex items-center gap-2'>
                        <span>v{v.version}</span>
                        {v._id === document._id && (
                          <Badge variant='secondary' className='text-xs'>
                            {t('documents.current', 'Current')}
                          </Badge>
                        )}
                        <span className='text-xs text-muted-foreground'>
                          {formatDate('createdAt' in v ? v.createdAt : v.updatedAt)}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparison Results */}
      {version1Id && version2Id && version1 && version2 && (
        <Tabs value={compareMode} onValueChange={(v) => setCompareMode(v as any)}>
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger value='metadata'>
              <Eye className='h-4 w-4 me-2' />
              {t('documents.metadata', 'Metadata')}
            </TabsTrigger>
            <TabsTrigger value='content' disabled={!canCompareContent}>
              <FileCode className='h-4 w-4 me-2' />
              {t('documents.content', 'Content')}
              {!canCompareContent && (
                <Badge variant='outline' className='ms-2 text-xs'>
                  {t('documents.textOnly', 'Text only')}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Metadata Comparison */}
          <TabsContent value='metadata' className='space-y-4'>
            {/* Summary Card */}
            {comparison && !comparisonLoading && (
              <Card className='bg-muted/50'>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-sm'>
                    {t('documents.comparisonSummary', 'Comparison Summary')}
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                    <div>
                      <p className='text-xs text-muted-foreground'>
                        {t('documents.sizeDifference', 'Size Difference')}
                      </p>
                      <div className='flex items-center gap-1 mt-1'>
                        {comparison.sizeDifference > 0 ? (
                          <TrendingUp className='h-4 w-4 text-green-600' />
                        ) : comparison.sizeDifference < 0 ? (
                          <TrendingDown className='h-4 w-4 text-red-600' />
                        ) : (
                          <Minus className='h-4 w-4 text-muted-foreground' />
                        )}
                        <span className='text-sm font-medium'>
                          {formatFileSize(Math.abs(comparison.sizeDifference))}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className='text-xs text-muted-foreground'>
                        {t('documents.percentageChange', 'Change %')}
                      </p>
                      <p className='text-sm font-medium mt-1'>
                        {comparison.metadata.percentageSizeChange.toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className='text-xs text-muted-foreground'>
                        {t('documents.timeDifference', 'Time Difference')}
                      </p>
                      <p className='text-sm font-medium mt-1'>
                        {Math.floor(comparison.timeDifference / 1000 / 60 / 60 / 24)}d
                      </p>
                    </div>
                    <div>
                      <p className='text-xs text-muted-foreground'>
                        {t('documents.newerVersion', 'Newer')}
                      </p>
                      <p className='text-sm font-medium mt-1'>
                        v
                        {comparison.metadata.version1IsNewer
                          ? comparison.version1.version
                          : comparison.version2.version}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Side-by-Side Metadata */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {/* Version 1 */}
              <Card>
                <CardHeader>
                  <CardTitle className='text-sm flex items-center justify-between'>
                    <span>
                      {t('documents.version', 'Version')} {version1.version}
                    </span>
                    {version1._id === document._id && (
                      <Badge variant='secondary'>{t('documents.current', 'Current')}</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <div>
                    <p className='text-xs text-muted-foreground'>
                      {t('documents.fileName', 'File Name')}
                    </p>
                    <p className='text-sm font-medium truncate'>{version1.originalName}</p>
                  </div>
                  <div>
                    <p className='text-xs text-muted-foreground'>
                      {t('documents.fileSize', 'File Size')}
                    </p>
                    <p className='text-sm font-medium'>{formatFileSize(version1.fileSize)}</p>
                  </div>
                  <div>
                    <p className='text-xs text-muted-foreground'>
                      {t('documents.fileType', 'File Type')}
                    </p>
                    <p className='text-sm font-medium'>{version1.fileType}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className='text-xs text-muted-foreground flex items-center gap-1'>
                      <Clock className='h-3 w-3' />
                      {t('documents.uploadDate', 'Upload Date')}
                    </p>
                    <p className='text-sm'>
                      {formatDate('createdAt' in version1 ? version1.createdAt : version1.updatedAt)}
                    </p>
                  </div>
                  <div>
                    <p className='text-xs text-muted-foreground flex items-center gap-1'>
                      <User className='h-3 w-3' />
                      {t('documents.uploadedBy', 'Uploaded By')}
                    </p>
                    <p className='text-sm'>{getUploaderName(version1.uploadedBy)}</p>
                  </div>
                  {'changeNote' in version1 && version1.changeNote && (
                    <div>
                      <p className='text-xs text-muted-foreground'>
                        {t('documents.changeNote', 'Change Note')}
                      </p>
                      <p className='text-sm italic text-muted-foreground'>
                        "{version1.changeNote}"
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Version 2 */}
              <Card>
                <CardHeader>
                  <CardTitle className='text-sm flex items-center justify-between'>
                    <span>
                      {t('documents.version', 'Version')} {version2.version}
                    </span>
                    {version2._id === document._id && (
                      <Badge variant='secondary'>{t('documents.current', 'Current')}</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <div>
                    <p className='text-xs text-muted-foreground'>
                      {t('documents.fileName', 'File Name')}
                    </p>
                    <p className='text-sm font-medium truncate'>{version2.originalName}</p>
                  </div>
                  <div>
                    <p className='text-xs text-muted-foreground'>
                      {t('documents.fileSize', 'File Size')}
                    </p>
                    <p className='text-sm font-medium'>{formatFileSize(version2.fileSize)}</p>
                  </div>
                  <div>
                    <p className='text-xs text-muted-foreground'>
                      {t('documents.fileType', 'File Type')}
                    </p>
                    <p className='text-sm font-medium'>{version2.fileType}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className='text-xs text-muted-foreground flex items-center gap-1'>
                      <Clock className='h-3 w-3' />
                      {t('documents.uploadDate', 'Upload Date')}
                    </p>
                    <p className='text-sm'>
                      {formatDate('createdAt' in version2 ? version2.createdAt : version2.updatedAt)}
                    </p>
                  </div>
                  <div>
                    <p className='text-xs text-muted-foreground flex items-center gap-1'>
                      <User className='h-3 w-3' />
                      {t('documents.uploadedBy', 'Uploaded By')}
                    </p>
                    <p className='text-sm'>{getUploaderName(version2.uploadedBy)}</p>
                  </div>
                  {'changeNote' in version2 && version2.changeNote && (
                    <div>
                      <p className='text-xs text-muted-foreground'>
                        {t('documents.changeNote', 'Change Note')}
                      </p>
                      <p className='text-sm italic text-muted-foreground'>
                        "{version2.changeNote}"
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Content Comparison */}
          <TabsContent value='content'>
            {diffLoading ? (
              <div className='text-center py-12'>
                <Loader2 className='h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground' />
                <p className='text-muted-foreground'>{t('common.loading', 'Loading diff...')}</p>
              </div>
            ) : diff ? (
              <Card>
                <CardHeader>
                  <CardTitle className='text-sm flex items-center gap-2'>
                    <FileCode className='h-4 w-4' />
                    {t('documents.textDiff', 'Text Differences')}
                  </CardTitle>
                  <CardDescription>
                    {t(
                      'documents.textDiffDesc',
                      'Lines starting with + were added, lines starting with - were removed'
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className='h-[600px] w-full border rounded-lg'>
                    <div className='bg-muted/50'>
                      {diff.diff.split('\n').map((line, index) => renderDiffLine(line, index))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            ) : (
              <Alert>
                <AlertCircle className='h-4 w-4' />
                <AlertTitle>
                  {t('documents.noDiffAvailable', 'No Diff Available')}
                </AlertTitle>
                <AlertDescription>
                  {t(
                    'documents.noDiffAvailableDesc',
                    'Content comparison is only available for text-based files.'
                  )}
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
