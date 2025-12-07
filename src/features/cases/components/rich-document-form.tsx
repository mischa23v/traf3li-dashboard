import { useState, useEffect, lazy, Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Save,
  FileText,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Calendar,
  Palette,
  X,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Lazy load the rich text editor
const RichTextEditor = lazy(() => import('@/components/rich-text-editor'))

import {
  useCreateCaseRichDocument,
  useUpdateCaseRichDocument,
  useCaseRichDocument
} from '@/hooks/useCaseRichDocuments'
import type {
  CaseRichDocument,
  CreateRichDocumentInput,
  RichDocumentType,
  RichDocumentStatus,
  DocumentLanguage,
  TextDirection
} from '@/types/caseRichDocument'
import {
  richDocumentTypeLabels,
  richDocumentTypeLabelsAr,
  richDocumentStatusLabels,
  richDocumentStatusLabelsAr
} from '@/types/caseRichDocument'

interface RichDocumentFormProps {
  caseId: string
  document?: CaseRichDocument | null
  docId?: string
  onSuccess?: (doc: CaseRichDocument) => void
  onCancel?: () => void
}

export function RichDocumentForm({
  caseId,
  document,
  docId,
  onSuccess,
  onCancel
}: RichDocumentFormProps) {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  const isEditMode = !!document || !!docId

  // Fetch document if only docId is provided
  const { data: fetchedDocument, isLoading: isLoadingDocument } = useCaseRichDocument(
    caseId,
    docId || '',
  )

  const existingDoc = document || fetchedDocument

  // Mutations
  const createMutation = useCreateCaseRichDocument()
  const updateMutation = useUpdateCaseRichDocument()

  const [formData, setFormData] = useState<CreateRichDocumentInput>({
    title: '',
    titleAr: '',
    content: '',
    documentType: 'other',
    status: 'draft',
    language: 'ar',
    textDirection: 'rtl',
    showOnCalendar: false,
    calendarDate: '',
    calendarEndDate: '',
    calendarColor: '#3b82f6'
  })

  const [showCalendarSettings, setShowCalendarSettings] = useState(false)
  const [error, setError] = useState('')

  // Load existing document data for edit mode
  useEffect(() => {
    if (isEditMode && existingDoc) {
      setFormData({
        title: existingDoc.title || '',
        titleAr: existingDoc.titleAr || '',
        content: existingDoc.content || '',
        documentType: existingDoc.documentType,
        status: existingDoc.status,
        language: existingDoc.language || 'ar',
        textDirection: existingDoc.textDirection || 'rtl',
        showOnCalendar: existingDoc.showOnCalendar || false,
        calendarDate: existingDoc.calendarDate || '',
        calendarEndDate: existingDoc.calendarEndDate || '',
        calendarColor: existingDoc.calendarColor || '#3b82f6'
      })
      if (existingDoc.showOnCalendar) {
        setShowCalendarSettings(true)
      }
    }
  }, [isEditMode, existingDoc])

  const handleChange = (field: keyof CreateRichDocumentInput, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!formData.titleAr && !formData.title) {
      setError(isArabic ? 'يرجى إدخال عنوان المستند' : 'Please enter a document title')
      return
    }

    if (!formData.content) {
      setError(isArabic ? 'يرجى إدخال محتوى المستند' : 'Please enter document content')
      return
    }

    try {
      if (isEditMode && (document?._id || docId)) {
        const result = await updateMutation.mutateAsync({
          caseId,
          docId: document?._id || docId!,
          data: formData
        })
        onSuccess?.(result)
      } else {
        const result = await createMutation.mutateAsync({
          caseId,
          data: formData
        })
        onSuccess?.(result)
      }
    } catch (err: any) {
      setError(err.message || (isArabic ? 'حدث خطأ أثناء الحفظ' : 'An error occurred while saving'))
    }
  }

  const documentTypes: RichDocumentType[] = [
    'legal_memo', 'contract_draft', 'pleading', 'motion', 'brief',
    'letter', 'notice', 'agreement', 'report', 'notes', 'other'
  ]

  const statusOptions: RichDocumentStatus[] = ['draft', 'review', 'final', 'archived']

  const languageOptions: { value: DocumentLanguage; label: string; labelAr: string }[] = [
    { value: 'ar', label: 'Arabic', labelAr: 'العربية' },
    { value: 'en', label: 'English', labelAr: 'الإنجليزية' },
    { value: 'mixed', label: 'Mixed', labelAr: 'مختلط' }
  ]

  const directionOptions: { value: TextDirection; label: string; labelAr: string }[] = [
    { value: 'rtl', label: 'Right to Left (RTL)', labelAr: 'من اليمين لليسار' },
    { value: 'ltr', label: 'Left to Right (LTR)', labelAr: 'من اليسار لليمين' },
    { value: 'auto', label: 'Auto', labelAr: 'تلقائي' }
  ]

  const isLoading = createMutation.isPending || updateMutation.isPending

  if (docId && isLoadingDocument) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <Card className="border border-slate-100 shadow-sm rounded-2xl">
      <CardHeader className="bg-white border-b border-slate-50 pb-4">
        <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
          <FileText className="h-5 w-5 text-emerald-500" aria-hidden="true" />
          {isEditMode
            ? (isArabic ? 'تعديل المستند' : 'Edit Document')
            : (isArabic ? 'إنشاء مستند جديد' : 'Create New Document')}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" aria-hidden="true" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {/* Title Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                {isArabic ? 'العنوان بالعربية *' : 'Arabic Title *'}
              </label>
              <Input
                value={formData.titleAr}
                onChange={(e) => handleChange('titleAr', e.target.value)}
                placeholder={isArabic ? 'عنوان المستند بالعربية' : 'Document title in Arabic'}
                className="rounded-xl"
                dir="rtl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                {isArabic ? 'العنوان بالإنجليزية' : 'English Title'}
              </label>
              <Input
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder={isArabic ? 'عنوان المستند بالإنجليزية' : 'Document title in English'}
                className="rounded-xl"
                dir="ltr"
              />
            </div>
          </div>

          {/* Document Type & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                {isArabic ? 'نوع المستند *' : 'Document Type *'}
              </label>
              <Select
                value={formData.documentType}
                onValueChange={(value) => handleChange('documentType', value as RichDocumentType)}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {isArabic ? richDocumentTypeLabelsAr[type] : richDocumentTypeLabels[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                {isArabic ? 'الحالة' : 'Status'}
              </label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange('status', value as RichDocumentStatus)}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {isArabic ? richDocumentStatusLabelsAr[status] : richDocumentStatusLabels[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Language & Direction */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                {isArabic ? 'اللغة' : 'Language'}
              </label>
              <Select
                value={formData.language}
                onValueChange={(value) => handleChange('language', value as DocumentLanguage)}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languageOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {isArabic ? opt.labelAr : opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                {isArabic ? 'اتجاه النص' : 'Text Direction'}
              </label>
              <Select
                value={formData.textDirection}
                onValueChange={(value) => handleChange('textDirection', value as TextDirection)}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {directionOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {isArabic ? opt.labelAr : opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Content Editor */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-500" aria-hidden="true" />
              {isArabic ? 'المحتوى *' : 'Content *'}
            </label>
            <Suspense fallback={<Skeleton className="min-h-[300px] w-full rounded-xl" />}>
              <RichTextEditor
                value={formData.content}
                onChange={(content) => handleChange('content', content)}
                placeholder={isArabic ? 'اكتب محتوى المستند هنا...' : 'Write document content here...'}
                minHeight="300px"
              />
            </Suspense>
          </div>

          {/* Calendar Settings */}
          <Collapsible open={showCalendarSettings} onOpenChange={setShowCalendarSettings}>
            <div className="border-t border-slate-100 pt-6">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                  <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                    {isArabic ? 'إعدادات التقويم' : 'Calendar Settings'}
                  </h3>
                  {showCalendarSettings ? <ChevronUp className="w-5 h-5" aria-hidden="true" /> : <ChevronDown className="w-5 h-5" aria-hidden="true" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4">
                <div className="space-y-4 p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="showOnCalendar"
                      checked={formData.showOnCalendar}
                      onCheckedChange={(checked) => handleChange('showOnCalendar', checked === true)}
                    />
                    <div>
                      <label htmlFor="showOnCalendar" className="text-sm font-medium text-slate-700 cursor-pointer">
                        {isArabic ? 'إظهار في التقويم' : 'Show on Calendar'}
                      </label>
                      <p className="text-xs text-slate-500">
                        {isArabic ? 'عرض هذا المستند كحدث في التقويم' : 'Display this document as an event in the calendar'}
                      </p>
                    </div>
                  </div>

                  {formData.showOnCalendar && (
                    <div className="space-y-4 pt-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">
                            {isArabic ? 'تاريخ التقويم' : 'Calendar Date'}
                          </label>
                          <Input
                            type="datetime-local"
                            className="rounded-xl"
                            value={formData.calendarDate}
                            onChange={(e) => handleChange('calendarDate', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">
                            {isArabic ? 'تاريخ الانتهاء' : 'End Date'}{' '}
                            <span className="text-slate-400">({isArabic ? 'اختياري' : 'optional'})</span>
                          </label>
                          <Input
                            type="datetime-local"
                            className="rounded-xl"
                            value={formData.calendarEndDate}
                            onChange={(e) => handleChange('calendarEndDate', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                          <Palette className="w-4 h-4 text-emerald-500" />
                          {isArabic ? 'لون التقويم' : 'Calendar Color'}
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={formData.calendarColor || '#3b82f6'}
                            onChange={(e) => handleChange('calendarColor', e.target.value)}
                            className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer"
                          />
                          <div className="flex gap-2">
                            {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'].map((color) => (
                              <button
                                key={color}
                                type="button"
                                onClick={() => handleChange('calendarColor', color)}
                                className={`w-8 h-8 rounded-lg border-2 transition-all ${
                                  formData.calendarColor === color
                                    ? 'border-slate-800 scale-110'
                                    : 'border-transparent hover:border-slate-300'
                                }`}
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="rounded-xl"
                disabled={isLoading}
              >
                <X className="w-4 h-4 me-2" aria-hidden="true" />
                {isArabic ? 'إلغاء' : 'Cancel'}
              </Button>
            )}
            <Button
              type="submit"
              className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-6"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 me-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 me-2" aria-hidden="true" />
              )}
              {isLoading
                ? (isArabic ? 'جاري الحفظ...' : 'Saving...')
                : isEditMode
                ? (isArabic ? 'تحديث المستند' : 'Update Document')
                : (isArabic ? 'إنشاء المستند' : 'Create Document')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default RichDocumentForm
