import { useState, useEffect } from 'react'
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
import { TaskDocument } from '@/services/tasksService'

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

    const isEditMode = !!documentId
    const createMutation = useCreateDocument()
    const updateMutation = useUpdateDocument()

    // Fetch document if in edit mode
    const { data: documentData, isLoading: isLoadingDocument } = useDocument(
        taskId,
        documentId || ''
    )

    // Load document data when available
    useEffect(() => {
        if (documentData?.document) {
            const doc = documentData.document
            setTitle(doc.title || doc.fileName?.replace('.html', '') || '')
            setContentHtml(doc.content || '')
            setContentJson(doc.contentJson || null)
        }
    }, [documentData])

    // Reset form when dialog closes
    useEffect(() => {
        if (!open) {
            if (!isEditMode) {
                setTitle('')
                setContentHtml('')
                setContentJson(null)
            }
        }
    }, [open, isEditMode])

    const handleEditorChange = (html: string, json: any) => {
        setContentHtml(html)
        setContentJson(json)
    }

    const handleSave = async () => {
        if (!title.trim()) {
            alert('يرجى إدخال عنوان المستند')
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
            } else {
                await createMutation.mutateAsync({
                    taskId,
                    title: title.trim(),
                    content: contentHtml,
                    contentJson
                })
            }
            onOpenChange(false)
            onSuccess?.()
        } catch (error) {
            console.error('Failed to save document:', error)
        }
    }

    const isSaving = createMutation.isPending || updateMutation.isPending

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col" dir="rtl">
                <DialogHeader className="flex-shrink-0">
                    <DialogTitle className="text-right">
                        {isEditMode ? 'تحرير المستند' : 'إنشاء مستند جديد'}
                    </DialogTitle>
                </DialogHeader>

                {isEditMode && isLoadingDocument ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
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
                        <X className="h-4 w-4 ml-2" />
                        إلغاء
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving || !title.trim()}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                                جاري الحفظ...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4 ml-2" />
                                حفظ المستند
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default DocumentEditorDialog
