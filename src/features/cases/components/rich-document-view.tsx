import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { sanitizeHtml } from '@/utils/sanitize'
import {
  FileText,
  ArrowLeft,
  Edit,
  Download,
  Eye,
  Clock,
  Calendar,
  History,
  RotateCcw,
  X,
  FileCode,
  FileType,
  AlertCircle,
  User
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'

import {
  useCaseRichDocument,
  useCaseRichDocumentVersions,
  useRestoreCaseRichDocumentVersion,
  useExportCaseRichDocument
} from '@/hooks/useCaseRichDocuments'
import type {
  CaseRichDocument,
  RichDocumentVersion
} from '@/types/caseRichDocument'
import {
  richDocumentTypeLabels,
  richDocumentTypeLabelsAr,
  richDocumentStatusLabels,
  richDocumentStatusLabelsAr,
  richDocumentStatusColors
} from '@/types/caseRichDocument'

interface RichDocumentViewProps {
  caseId: string
  docId: string
  onBack?: () => void
  onEdit?: (doc: CaseRichDocument) => void
}

export function RichDocumentView({
  caseId,
  docId,
  onBack,
  onEdit
}: RichDocumentViewProps) {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  const [showVersions, setShowVersions] = useState(false)

  // Fetch document
  const { data: document, isLoading, isError, error } = useCaseRichDocument(caseId, docId)

  // Fetch versions when modal is open
  const { data: versionsData, isLoading: isLoadingVersions } = useCaseRichDocumentVersions(
    caseId,
    docId,
    { enabled: showVersions }
  )

  // Mutations
  const restoreMutation = useRestoreCaseRichDocumentVersion()
  const exportMutation = useExportCaseRichDocument()

  const handleExport = (format: 'pdf' | 'latex' | 'markdown' | 'preview') => {
    exportMutation.mutate({ caseId, docId, format })
  }

  const handleRestoreVersion = async (versionNumber: number) => {
    if (!confirm(isArabic ? `هل تريد استعادة الإصدار ${versionNumber}؟` : `Restore version ${versionNumber}?`)) {
      return
    }
    try {
      await restoreMutation.mutateAsync({ caseId, docId, versionNumber })
      setShowVersions(false)
    } catch (err) {
    }
  }

  const getTypeLabel = (type: string) =>
    isArabic
      ? richDocumentTypeLabelsAr[type as keyof typeof richDocumentTypeLabelsAr]
      : richDocumentTypeLabels[type as keyof typeof richDocumentTypeLabels]

  const getStatusLabel = (status: string) =>
    isArabic
      ? richDocumentStatusLabelsAr[status as keyof typeof richDocumentStatusLabelsAr]
      : richDocumentStatusLabels[status as keyof typeof richDocumentStatusLabels]

  const getEditorName = (editor: RichDocumentVersion['editedBy']) => {
    if (typeof editor === 'string') return editor
    if (editor?.firstName && editor?.lastName) return `${editor.firstName} ${editor.lastName}`
    return editor?.username || (isArabic ? 'مستخدم' : 'User')
  }

  // Loading State
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  // Error State
  if (isError) {
    return (
      <div className="space-y-6">
        {onBack && (
          <Button variant="outline" onClick={onBack} className="rounded-xl">
            <ArrowLeft className="h-4 w-4 me-2" aria-hidden="true" />
            {isArabic ? 'رجوع' : 'Back'}
          </Button>
        )}
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" aria-hidden="true" />
          <AlertDescription className="text-red-800">
            {isArabic ? 'حدث خطأ أثناء تحميل المستند' : 'Error loading document'}: {error?.message}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!document) {
    return (
      <div className="space-y-6">
        {onBack && (
          <Button variant="outline" onClick={onBack} className="rounded-xl">
            <ArrowLeft className="h-4 w-4 me-2" aria-hidden="true" />
            {isArabic ? 'رجوع' : 'Back'}
          </Button>
        )}
        <Alert className="border-amber-200 bg-amber-50">
          <AlertCircle className="h-4 w-4 text-amber-600" aria-hidden="true" />
          <AlertDescription className="text-amber-800">
            {isArabic ? 'المستند غير موجود' : 'Document not found'}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="outline" onClick={onBack} className="rounded-xl">
              <ArrowLeft className="h-4 w-4 me-2" aria-hidden="true" />
              {isArabic ? 'رجوع' : 'Back'}
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-navy">
              {isArabic ? document.titleAr || document.title : document.title || document.titleAr}
            </h1>
            <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
              <Clock className="h-4 w-4" aria-hidden="true" />
              {isArabic ? 'آخر تعديل: ' : 'Last updated: '}
              {new Date(document.updatedAt).toLocaleString(isArabic ? 'ar-SA' : 'en-US')}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onEdit && (
            <Button
              onClick={() => onEdit(document)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
            >
              <Edit className="h-4 w-4 me-2" aria-hidden="true" />
              {isArabic ? 'تعديل' : 'Edit'}
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="rounded-xl">
                <Download className="h-4 w-4 me-2" aria-hidden="true" />
                {isArabic ? 'تصدير' : 'Export'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => handleExport('pdf')}
                disabled={exportMutation.isPending}
              >
                <Download className="h-4 w-4 me-2" aria-hidden="true" />
                PDF
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleExport('latex')}
                disabled={exportMutation.isPending}
              >
                <FileCode className="h-4 w-4 me-2" aria-hidden="true" />
                LaTeX
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleExport('markdown')}
                disabled={exportMutation.isPending}
              >
                <FileType className="h-4 w-4 me-2" aria-hidden="true" />
                Markdown
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleExport('preview')}
                disabled={exportMutation.isPending}
              >
                <Eye className="h-4 w-4 me-2" aria-hidden="true" />
                {isArabic ? 'معاينة' : 'Preview'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="outline"
            onClick={() => setShowVersions(true)}
            className="rounded-xl"
          >
            <History className="h-4 w-4 me-2" aria-hidden="true" />
            {isArabic ? 'سجل الإصدارات' : 'Version History'}
          </Button>
        </div>
      </div>

      {/* Meta Info */}
      <Card className="border border-slate-100 shadow-sm rounded-2xl">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="rounded-md px-3 py-1 bg-indigo-50 text-indigo-700 border-indigo-200"
              >
                {getTypeLabel(document.documentType)}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={`rounded-md px-3 py-1 bg-${richDocumentStatusColors[document.status]}-50 text-${richDocumentStatusColors[document.status]}-700 border-${richDocumentStatusColors[document.status]}-200`}
              >
                {getStatusLabel(document.status)}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <FileText className="h-4 w-4" aria-hidden="true" />
              {isArabic ? 'الإصدار' : 'Version'} {document.version}
            </div>
            {document.wordCount && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                {document.wordCount} {isArabic ? 'كلمة' : 'words'}
              </div>
            )}
            {document.showOnCalendar && (
              <div className="flex items-center gap-2 text-sm text-emerald-600">
                <Calendar className="h-4 w-4" aria-hidden="true" />
                {isArabic ? 'مُضاف للتقويم' : 'On Calendar'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Document Content */}
      <Card className="border border-slate-100 shadow-sm rounded-2xl">
        <CardHeader className="border-b border-slate-50">
          <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
            <FileText className="h-5 w-5 text-emerald-500" aria-hidden="true" />
            {isArabic ? 'محتوى المستند' : 'Document Content'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div
            className="prose prose-slate max-w-none"
            dir={document.textDirection || 'rtl'}
            style={{
              fontFamily: document.language === 'ar' || document.textDirection === 'rtl'
                ? "'Amiri', 'Cairo', serif"
                : 'inherit'
            }}
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(document.content) }}
          />
        </CardContent>
      </Card>

      {/* Version History Modal */}
      <Dialog open={showVersions} onOpenChange={setShowVersions}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-emerald-500" aria-hidden="true" />
              {isArabic ? 'سجل الإصدارات' : 'Version History'}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pe-4">
            {isLoadingVersions ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 border rounded-xl space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                ))}
              </div>
            ) : versionsData?.versions && versionsData.versions.length > 0 ? (
              <div className="space-y-3">
                {versionsData.versions.map((version) => (
                  <div
                    key={version.version}
                    className={`p-4 border rounded-xl transition-all ${
                      version.isCurrent
                        ? 'border-emerald-200 bg-emerald-50'
                        : 'border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-navy">
                            {isArabic ? 'الإصدار' : 'Version'} {version.version}
                          </span>
                          {version.isCurrent && (
                            <Badge className="bg-emerald-500 text-white text-xs">
                              {isArabic ? 'الحالي' : 'Current'}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" aria-hidden="true" />
                            {new Date(version.editedAt).toLocaleString(isArabic ? 'ar-SA' : 'en-US')}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" aria-hidden="true" />
                            {getEditorName(version.editedBy)}
                          </span>
                        </div>
                        {version.changeNote && (
                          <p className="text-sm text-slate-600 mt-1">
                            {version.changeNote}
                          </p>
                        )}
                      </div>
                      {!version.isCurrent && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRestoreVersion(version.version)}
                          disabled={restoreMutation.isPending}
                          className="rounded-lg"
                        >
                          <RotateCcw className="h-4 w-4 me-1" aria-hidden="true" />
                          {isArabic ? 'استعادة' : 'Restore'}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                {isArabic ? 'لا توجد إصدارات سابقة' : 'No previous versions'}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default RichDocumentView
