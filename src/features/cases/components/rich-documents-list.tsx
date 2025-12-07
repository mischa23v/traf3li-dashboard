import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  FileText,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  Download,
  FileCode,
  FileType,
  Calendar,
  Clock,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'

import {
  useCaseRichDocuments,
  useDeleteCaseRichDocument,
  useExportCaseRichDocument
} from '@/hooks/useCaseRichDocuments'
import type {
  CaseRichDocument,
  RichDocumentType,
  RichDocumentStatus,
  RichDocumentFilters
} from '@/types/caseRichDocument'
import {
  richDocumentTypeLabels,
  richDocumentTypeLabelsAr,
  richDocumentStatusLabels,
  richDocumentStatusLabelsAr,
  richDocumentStatusColors
} from '@/types/caseRichDocument'

interface RichDocumentsListProps {
  caseId: string
  onEdit?: (doc: CaseRichDocument) => void
  onView?: (doc: CaseRichDocument) => void
  onCreate?: () => void
}

export function RichDocumentsList({
  caseId,
  onEdit,
  onView,
  onCreate
}: RichDocumentsListProps) {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  const [filters, setFilters] = useState<RichDocumentFilters>({
    documentType: undefined,
    status: undefined,
    search: ''
  })
  const [deleteDocId, setDeleteDocId] = useState<string | null>(null)

  // Fetch documents
  const { data, isLoading, isError, error, refetch } = useCaseRichDocuments(caseId, filters)

  // Mutations
  const deleteMutation = useDeleteCaseRichDocument()
  const exportMutation = useExportCaseRichDocument()

  const documents = data?.documents || []

  const handleDelete = async () => {
    if (!deleteDocId) return
    try {
      await deleteMutation.mutateAsync({ caseId, docId: deleteDocId })
      setDeleteDocId(null)
    } catch (err) {
    }
  }

  const handleExport = (docId: string, format: 'pdf' | 'latex' | 'markdown' | 'preview') => {
    exportMutation.mutate({ caseId, docId, format })
  }

  const getTypeLabel = (type: RichDocumentType) =>
    isArabic ? richDocumentTypeLabelsAr[type] : richDocumentTypeLabels[type]

  const getStatusLabel = (status: RichDocumentStatus) =>
    isArabic ? richDocumentStatusLabelsAr[status] : richDocumentStatusLabels[status]

  const documentTypes: RichDocumentType[] = [
    'legal_memo', 'contract_draft', 'pleading', 'motion', 'brief',
    'letter', 'notice', 'agreement', 'report', 'notes', 'other'
  ]

  const statusOptions: RichDocumentStatus[] = ['draft', 'review', 'final', 'archived']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-navy flex items-center gap-2">
            <FileText className="h-5 w-5 text-emerald-500" aria-hidden="true" />
            {isArabic ? 'المستندات النصية' : 'Rich Documents'}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {isArabic
              ? 'إنشاء وإدارة المستندات القانونية للقضية'
              : 'Create and manage legal documents for this case'}
          </p>
        </div>
        {onCreate && (
          <Button
            onClick={onCreate}
            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
          >
            <Plus className="h-4 w-4 me-2" aria-hidden="true" />
            {isArabic ? 'إنشاء مستند جديد' : 'Create Document'}
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="border border-slate-100 shadow-sm rounded-2xl">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden="true" />
              <Input
                placeholder={isArabic ? 'بحث في المستندات...' : 'Search documents...'}
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pe-10 rounded-xl"
                aria-label={isArabic ? 'بحث' : 'Search'}
              />
            </div>
            <Select
              value={filters.documentType || 'all'}
              onValueChange={(value) =>
                setFilters(prev => ({
                  ...prev,
                  documentType: value === 'all' ? undefined : value as RichDocumentType
                }))
              }
            >
              <SelectTrigger className="w-[180px] rounded-xl">
                <Filter className="h-4 w-4 me-2 text-slate-400" aria-hidden="true" />
                <SelectValue placeholder={isArabic ? 'نوع المستند' : 'Document Type'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isArabic ? 'كل الأنواع' : 'All Types'}</SelectItem>
                {documentTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {getTypeLabel(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) =>
                setFilters(prev => ({
                  ...prev,
                  status: value === 'all' ? undefined : value as RichDocumentStatus
                }))
              }
            >
              <SelectTrigger className="w-[150px] rounded-xl">
                <SelectValue placeholder={isArabic ? 'الحالة' : 'Status'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isArabic ? 'كل الحالات' : 'All Status'}</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {getStatusLabel(status)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border border-slate-100 shadow-sm rounded-2xl">
              <CardContent className="p-4 space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-4 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && !isLoading && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" aria-hidden="true" />
          <AlertDescription className="text-red-800">
            <div className="flex items-center justify-between">
              <span>{isArabic ? 'حدث خطأ أثناء تحميل المستندات' : 'Error loading documents'}: {error?.message}</span>
              <Button onClick={() => refetch()} variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-100">
                {isArabic ? 'إعادة المحاولة' : 'Retry'}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Empty State */}
      {!isLoading && !isError && documents.length === 0 && (
        <Card className="border border-slate-100 shadow-sm rounded-2xl">
          <CardContent className="py-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 mb-4">
              <FileText className="h-8 w-8 text-emerald-500" aria-hidden="true" />
            </div>
            <h4 className="text-lg font-bold text-navy mb-2">
              {filters.search || filters.documentType || filters.status
                ? (isArabic ? 'لا توجد نتائج' : 'No Results')
                : (isArabic ? 'لا توجد مستندات' : 'No Documents')}
            </h4>
            <p className="text-slate-500 mb-4">
              {filters.search || filters.documentType || filters.status
                ? (isArabic ? 'جرب البحث بكلمات مختلفة' : 'Try different search terms')
                : (isArabic ? 'ابدأ بإنشاء مستند جديد لهذه القضية' : 'Start by creating a new document for this case')}
            </p>
            {onCreate && !filters.search && !filters.documentType && !filters.status && (
              <Button
                onClick={onCreate}
                className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
              >
                <Plus className="h-4 w-4 me-2" aria-hidden="true" />
                {isArabic ? 'إنشاء مستند جديد' : 'Create Document'}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Documents Grid */}
      {!isLoading && !isError && documents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <Card
              key={doc._id}
              className="border border-slate-100 shadow-sm rounded-2xl hover:border-emerald-200 transition-all group"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base font-bold text-navy line-clamp-2">
                    {isArabic ? doc.titleAr || doc.title : doc.title || doc.titleAr}
                  </CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-navy" aria-label="خيارات">
                        <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onView && (
                        <DropdownMenuItem onClick={() => onView(doc)}>
                          <Eye className="h-4 w-4 me-2" aria-hidden="true" />
                          {isArabic ? 'عرض' : 'View'}
                        </DropdownMenuItem>
                      )}
                      {onEdit && (
                        <DropdownMenuItem onClick={() => onEdit(doc)}>
                          <Edit className="h-4 w-4 me-2" aria-hidden="true" />
                          {isArabic ? 'تعديل' : 'Edit'}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleExport(doc._id, 'pdf')}
                        disabled={exportMutation.isPending}
                      >
                        <Download className="h-4 w-4 me-2" aria-hidden="true" />
                        {isArabic ? 'تصدير PDF' : 'Export PDF'}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleExport(doc._id, 'latex')}
                        disabled={exportMutation.isPending}
                      >
                        <FileCode className="h-4 w-4 me-2" aria-hidden="true" />
                        {isArabic ? 'تصدير LaTeX' : 'Export LaTeX'}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleExport(doc._id, 'markdown')}
                        disabled={exportMutation.isPending}
                      >
                        <FileType className="h-4 w-4 me-2" aria-hidden="true" />
                        {isArabic ? 'تصدير Markdown' : 'Export Markdown'}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleExport(doc._id, 'preview')}
                        disabled={exportMutation.isPending}
                      >
                        <Eye className="h-4 w-4 me-2" aria-hidden="true" />
                        {isArabic ? 'معاينة' : 'Preview'}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => setDeleteDocId(doc._id)}
                      >
                        <Trash2 className="h-4 w-4 me-2" aria-hidden="true" />
                        {isArabic ? 'حذف' : 'Delete'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant="outline"
                    className="rounded-md px-2 text-xs bg-indigo-50 text-indigo-700 border-indigo-200"
                  >
                    {getTypeLabel(doc.documentType)}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`rounded-md px-2 text-xs bg-${richDocumentStatusColors[doc.status]}-50 text-${richDocumentStatusColors[doc.status]}-700 border-${richDocumentStatusColors[doc.status]}-200`}
                  >
                    {getStatusLabel(doc.status)}
                  </Badge>
                </div>

                {/* Meta info */}
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" aria-hidden="true" />
                    v{doc.version}
                  </span>
                  {doc.wordCount && (
                    <span>{doc.wordCount} {isArabic ? 'كلمة' : 'words'}</span>
                  )}
                  {doc.showOnCalendar && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-emerald-500" aria-hidden="true" />
                    </span>
                  )}
                </div>

                {/* Date */}
                <div className="text-xs text-slate-500">
                  {isArabic ? 'آخر تعديل: ' : 'Updated: '}
                  {new Date(doc.updatedAt).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US')}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-slate-100">
                  {onView && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onView(doc)}
                      className="flex-1 rounded-lg text-xs"
                    >
                      <Eye className="h-3 w-3 me-1" aria-hidden="true" />
                      {isArabic ? 'عرض' : 'View'}
                    </Button>
                  )}
                  {onEdit && (
                    <Button
                      size="sm"
                      onClick={() => onEdit(doc)}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs"
                    >
                      <Edit className="h-3 w-3 me-1" aria-hidden="true" />
                      {isArabic ? 'تعديل' : 'Edit'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteDocId} onOpenChange={() => setDeleteDocId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isArabic ? 'حذف المستند' : 'Delete Document'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isArabic
                ? 'هل أنت متأكد من حذف هذا المستند؟ لا يمكن التراجع عن هذا الإجراء.'
                : 'Are you sure you want to delete this document? This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{isArabic ? 'إلغاء' : 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleteMutation.isPending
                ? (isArabic ? 'جاري الحذف...' : 'Deleting...')
                : (isArabic ? 'حذف' : 'Delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default RichDocumentsList
