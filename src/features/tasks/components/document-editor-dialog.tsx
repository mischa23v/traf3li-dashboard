import { useState, useEffect, useCallback } from 'react'
import { Loader2, Save, X } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TipTapEditor } from '@/components/tiptap-editor'
import { useCreateDocument, useUpdateDocument, useDocument } from '@/hooks/useTasks'
import { toast } from 'sonner'

interface DocumentEditorDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    taskId: string
    documentId?: string // If provided, edit mode; otherwise create mode
    onSuccess?: () => void
}

export function DocumentEditorDialog({
    open,
    onOpenChange,
    taskId,
    documentId,
    onSuccess
}: DocumentEditorDialogProps) {
    const [title, setTitle] = useState('')
    const [contentHtml, setContentHtml] = useState('')
    const [contentJson, setContentJson] = useState<any>(null)
    const [isInitialized, setIsInitialized] = useState(false)

    const isEditMode = !!documentId
    const createMutation = useCreateDocument()
    const updateMutation = useUpdateDocument()

    // Fetch document if in edit mode
    const { data: documentData, isLoading: isLoadingDocument, isSuccess: isDocumentLoaded } = useDocument(
        taskId,
        documentId || ''
    )

    // Load document data when available (for edit mode)
    useEffect(() => {
        if (isEditMode && documentData?.document && !isInitialized) {
            const doc = documentData.document
            setTitle(doc.title || doc.fileName?.replace('.html', '') || '')
            setContentHtml(doc.content || '')
            setContentJson(doc.contentJson || null)
            setIsInitialized(true)
        }
    }, [documentData, isEditMode, isInitialized])

    // Reset form when dialog opens/closes
    useEffect(() => {
        if (open) {
            // Reset initialization flag when opening
            if (!isEditMode) {
                setTitle('')
                setContentHtml('')
                setContentJson(null)
                setIsInitialized(true) // Mark as initialized for create mode
            } else {
                setIsInitialized(false) // Will be set to true when document loads
            }
        } else {
            // Reset everything when closing
            setTitle('')
            setContentHtml('')
            setContentJson(null)
            setIsInitialized(false)
        }
    }, [open, isEditMode])

    const handleEditorChange = useCallback((html: string, json: any) => {
        setContentHtml(html)
        setContentJson(json)
    }, [])

    const handleSave = async () => {
        if (!title.trim()) {
            toast.error('يرجى إدخال عنوان المستند')
            return
        }

        if (!contentHtml.trim() || contentHtml === '<p></p>') {
            toast.error('يرجى إدخال محتوى المستند')
            return
        }

        try {
            if (isEditMode && documentId) {
                await updateMutation.mutateAsync({
                    taskId,
                    documentId,
                    data: {
                        title: title.trim(),
                        content: contentHtml,
                        contentJson
                    }
                })
                toast.success('تم تحديث المستند بنجاح')
            } else {
                await createMutation.mutateAsync({
                    taskId,
                    title: title.trim(),
                    content: contentHtml,
                    contentJson
                })
                toast.success('تم إنشاء المستند بنجاح')
            }
            onOpenChange(false)
            onSuccess?.()
        } catch (error: any) {
            toast.error(error.message || 'فشل في حفظ المستند')
        }
    }

    const isSaving = createMutation.isPending || updateMutation.isPending
    const isLoading = isEditMode && isLoadingDocument && !isInitialized

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col" dir="rtl">
                <DialogHeader className="flex-shrink-0">
                    <DialogTitle className="text-end">
                        {isEditMode ? 'تحرير المستند' : 'إنشاء مستند جديد'}
                    </DialogTitle>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
                        <span className="me-3 text-slate-500">جاري تحميل المستند...</span>
                    </div>
                ) : (
                    <div className="flex-1 overflow-auto space-y-4">
                        {/* Title Input */}
                        <div>
                            <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="عنوان المستند"
                                className="text-lg font-bold"
                                dir="rtl"
                            />
                        </div>

                        {/* TipTap Editor */}
                        <div className="min-h-[400px]">
                            <TipTapEditor
                                content={contentHtml}
                                contentJson={contentJson}
                                onChange={handleEditorChange}
                                placeholder="ابدأ الكتابة هنا..."
                                dir="rtl"
                                minHeight="350px"
                                showCharacterCount={true}
                            />
                        </div>
                    </div>
                )}

                {/* Footer Actions */}
                <div className="flex-shrink-0 flex justify-end gap-2 pt-4 border-t">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isSaving}
                    >
                        <X className="h-4 w-4 ms-2" aria-hidden="true" />
                        إلغاء
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving || !title.trim() || isLoading}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="h-4 w-4 ms-2 animate-spin" />
                                جاري الحفظ...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4 ms-2" aria-hidden="true" />
                                {isEditMode ? 'حفظ التغييرات' : 'حفظ المستند'}
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default DocumentEditorDialog
