import { useState, useRef } from 'react'
import {
    Upload, Download, FileText, CheckCircle, XCircle, AlertCircle,
    Loader2, FileSpreadsheet, Info
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert"
import { Progress } from '@/components/ui/progress'
import { useImportTransactionsCSV, useDownloadCSVTemplate } from '@/hooks/useCorporateCards'

interface CSVImportDialogProps {
    cardId: string
    isOpen: boolean
    onClose: () => void
}

export function CSVImportDialog({ cardId, isOpen, onClose }: CSVImportDialogProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [importResult, setImportResult] = useState<any>(null)
    const [showResults, setShowResults] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const importMutation = useImportTransactionsCSV()
    const downloadTemplateMutation = useDownloadCSVTemplate()

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            if (!file.name.endsWith('.csv')) {
                alert('يرجى اختيار ملف CSV')
                return
            }
            setSelectedFile(file)
            setShowResults(false)
            setImportResult(null)
        }
    }

    const handleImport = async () => {
        if (!selectedFile) return

        try {
            const result = await importMutation.mutateAsync({ cardId, file: selectedFile })
            setImportResult(result)
            setShowResults(true)
        } catch (error) {
            console.error('Import failed:', error)
        }
    }

    const handleDownloadTemplate = () => {
        downloadTemplateMutation.mutate()
    }

    const handleClose = () => {
        setSelectedFile(null)
        setImportResult(null)
        setShowResults(false)
        onClose()
    }

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B'
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">استيراد معاملات من CSV</DialogTitle>
                    <DialogDescription>
                        قم برفع ملف CSV يحتوي على معاملات البطاقة من البنك
                    </DialogDescription>
                </DialogHeader>

                {!showResults ? (
                    <div className="space-y-6 py-4">
                        {/* Instructions */}
                        <Alert>
                            <Info className="h-4 w-4" />
                            <AlertTitle>تعليمات الاستيراد</AlertTitle>
                            <AlertDescription className="mt-2 space-y-2 text-sm">
                                <ul className="list-disc list-inside space-y-1">
                                    <li>تأكد من أن الملف بصيغة CSV</li>
                                    <li>يجب أن يحتوي الملف على الأعمدة التالية: تاريخ المعاملة، اسم التاجر، المبلغ، العملة</li>
                                    <li>قم بتحميل القالب للحصول على التنسيق الصحيح</li>
                                    <li>سيتم تجاهل المعاملات المكررة تلقائياً</li>
                                </ul>
                            </AlertDescription>
                        </Alert>

                        {/* Download Template */}
                        <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg">
                                    <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-slate-800">تحميل القالب</p>
                                    <p className="text-sm text-slate-500">قالب CSV للمعاملات</p>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                onClick={handleDownloadTemplate}
                                disabled={downloadTemplateMutation.isPending}
                                className="rounded-xl"
                            >
                                {downloadTemplateMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 ms-2 animate-spin" />
                                ) : (
                                    <Download className="h-4 w-4 ms-2" />
                                )}
                                تحميل
                            </Button>
                        </div>

                        {/* File Upload */}
                        <div className="space-y-3">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv"
                                onChange={handleFileSelect}
                                className="hidden"
                            />

                            {selectedFile ? (
                                <div className="flex items-center justify-between p-4 border border-emerald-200 rounded-xl bg-emerald-50">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-lg">
                                            <FileText className="h-5 w-5 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-800">{selectedFile.name}</p>
                                            <p className="text-sm text-slate-500">{formatFileSize(selectedFile.size)}</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSelectedFile(null)}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                        <XCircle className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full border-2 border-dashed border-slate-300 rounded-xl p-8 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all cursor-pointer"
                                >
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="p-3 bg-slate-100 rounded-full">
                                            <Upload className="h-6 w-6 text-slate-600" />
                                        </div>
                                        <div className="text-center">
                                            <p className="font-medium text-slate-800">اضغط لاختيار ملف CSV</p>
                                            <p className="text-sm text-slate-500 mt-1">أو اسحب وأفلت الملف هنا</p>
                                        </div>
                                    </div>
                                </button>
                            )}
                        </div>

                        {/* Supported Banks */}
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-slate-700">البنوك المدعومة:</p>
                            <div className="flex flex-wrap gap-2">
                                <Badge variant="secondary">البنك الأهلي</Badge>
                                <Badge variant="secondary">الراجحي</Badge>
                                <Badge variant="secondary">سامبا</Badge>
                                <Badge variant="secondary">البلاد</Badge>
                                <Badge variant="secondary">الرياض</Badge>
                                <Badge variant="secondary">العربي الوطني</Badge>
                            </div>
                        </div>
                    </div>
                ) : (
                    // Import Results
                    <div className="space-y-6 py-4">
                        {importResult && (
                            <>
                                {/* Success Summary */}
                                <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-emerald-100 rounded-full">
                                            <CheckCircle className="h-6 w-6 text-emerald-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-emerald-800">تم الاستيراد بنجاح!</h3>
                                            <p className="text-sm text-emerald-700">تم معالجة الملف وإضافة المعاملات</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="text-center p-3 bg-white rounded-lg">
                                            <p className="text-2xl font-bold text-slate-800">{importResult.totalRecords}</p>
                                            <p className="text-xs text-slate-600 mt-1">إجمالي السجلات</p>
                                        </div>
                                        <div className="text-center p-3 bg-white rounded-lg">
                                            <p className="text-2xl font-bold text-emerald-600">{importResult.importedRecords}</p>
                                            <p className="text-xs text-slate-600 mt-1">تم الاستيراد</p>
                                        </div>
                                        <div className="text-center p-3 bg-white rounded-lg">
                                            <p className="text-2xl font-bold text-amber-600">{importResult.duplicateRecords}</p>
                                            <p className="text-xs text-slate-600 mt-1">مكرر</p>
                                        </div>
                                        <div className="text-center p-3 bg-white rounded-lg">
                                            <p className="text-2xl font-bold text-red-600">{importResult.errorRecords}</p>
                                            <p className="text-xs text-slate-600 mt-1">خطأ</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-600">نسبة النجاح</span>
                                        <span className="font-semibold text-slate-800">
                                            {((importResult.importedRecords / importResult.totalRecords) * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                    <Progress
                                        value={(importResult.importedRecords / importResult.totalRecords) * 100}
                                        className="h-2"
                                    />
                                </div>

                                {/* Errors */}
                                {importResult.errors && importResult.errors.length > 0 && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle>تنبيهات وأخطاء</AlertTitle>
                                        <AlertDescription className="mt-2">
                                            <div className="max-h-40 overflow-y-auto space-y-2">
                                                {importResult.errors.slice(0, 5).map((error: any, index: number) => (
                                                    <div key={index} className="text-sm">
                                                        <span className="font-medium">السطر {error.row}:</span> {error.error}
                                                    </div>
                                                ))}
                                                {importResult.errors.length > 5 && (
                                                    <p className="text-sm font-medium">
                                                        ... و {importResult.errors.length - 5} خطأ آخر
                                                    </p>
                                                )}
                                            </div>
                                        </AlertDescription>
                                    </Alert>
                                )}

                                {/* Next Steps */}
                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                                    <h4 className="font-semibold text-blue-800 mb-2">الخطوات التالية</h4>
                                    <ul className="space-y-1 text-sm text-blue-700">
                                        <li>• راجع المعاملات المستوردة للتأكد من صحتها</li>
                                        <li>• قم بتطابق المعاملات مع مطالبات المصروفات</li>
                                        <li>• تحقق من المعاملات المكررة إذا لزم الأمر</li>
                                    </ul>
                                </div>
                            </>
                        )}
                    </div>
                )}

                <DialogFooter>
                    {!showResults ? (
                        <>
                            <Button variant="outline" onClick={handleClose} className="rounded-xl">
                                إلغاء
                            </Button>
                            <Button
                                onClick={handleImport}
                                disabled={!selectedFile || importMutation.isPending}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                            >
                                {importMutation.isPending ? (
                                    <>
                                        <Loader2 className="h-4 w-4 ms-2 animate-spin" />
                                        جاري الاستيراد...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-4 w-4 ms-2" />
                                        استيراد
                                    </>
                                )}
                            </Button>
                        </>
                    ) : (
                        <Button onClick={handleClose} className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl">
                            <CheckCircle className="h-4 w-4 ms-2" />
                            تم
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
