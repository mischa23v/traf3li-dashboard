import { useState, useMemo } from 'react'
import {
  FileText, ArrowLeft, Download, Send, CheckCircle2, XCircle, Printer,
  Edit, Clock, AlertCircle, Receipt, FileCheck, User, Calendar, Hash, DollarSign
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Link, useParams } from '@tanstack/react-router'
import { ProductivityHero } from '@/components/productivity-hero'
import {
  useCreditNote,
  useIssueCreditNote,
  useApplyCreditNote,
  useVoidCreditNote,
  useExportCreditNotePdf,
  useSubmitCreditNoteToZATCA,
} from '@/hooks/useFinance'

const statusMap = {
  draft: { label: 'مسودة', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300', icon: Clock },
  issued: { label: 'صادر', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300', icon: FileCheck },
  applied: { label: 'مطبق', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300', icon: CheckCircle2 },
  void: { label: 'ملغي', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300', icon: XCircle },
}

const creditTypeMap = {
  full: { label: 'كامل', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' },
  partial: { label: 'جزئي', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' },
}

const reasonCategoryMap = {
  error: 'خطأ في الفاتورة',
  discount: 'خصم',
  return: 'إرجاع',
  cancellation: 'إلغاء',
  adjustment: 'تعديل',
  other: 'أخرى',
}

export function CreditNoteDetailsView() {
  const { creditNoteId } = useParams({ strict: false }) as { creditNoteId: string }
  const [voidDialogOpen, setVoidDialogOpen] = useState(false)
  const [voidReason, setVoidReason] = useState('')

  // Fetch credit note
  const { data: creditNoteData, isLoading, refetch } = useCreditNote(creditNoteId)

  // Mutations
  const issueMutation = useIssueCreditNote()
  const applyMutation = useApplyCreditNote()
  const voidMutation = useVoidCreditNote()
  const exportPdfMutation = useExportCreditNotePdf()
  const submitToZATCAMutation = useSubmitCreditNoteToZATCA()

  const creditNote = useMemo(() => {
    if (!creditNoteData) return null
    const cn = creditNoteData
    return {
      id: cn.creditNoteNumber || cn._id,
      creditNoteNumber: cn.creditNoteNumber,
      status: cn.status,
      creditType: cn.creditType,
      reasonCategory: cn.reasonCategory,
      reason: cn.reason,
      originalInvoice: typeof cn.originalInvoiceId === 'string'
        ? cn.originalInvoiceId
        : cn.originalInvoiceId?.invoiceNumber || 'غير محدد',
      originalInvoiceId: typeof cn.originalInvoiceId === 'string'
        ? cn.originalInvoiceId
        : cn.originalInvoiceId?._id,
      client: typeof cn.clientId === 'string'
        ? cn.clientId
        : `${cn.clientId?.firstName || ''} ${cn.clientId?.lastName || ''}`.trim() || 'غير محدد',
      issueDate: new Date(cn.issueDate).toLocaleDateString('ar-SA'),
      appliedDate: cn.appliedDate ? new Date(cn.appliedDate).toLocaleDateString('ar-SA') : null,
      subtotal: cn.subtotal,
      vatRate: cn.vatRate,
      vatAmount: cn.vatAmount,
      totalAmount: cn.totalAmount,
      items: (cn.items || []).map((item: any) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total,
      })),
      notes: cn.notes,
      pdfUrl: cn.pdfUrl,
      zatcaStatus: cn.zatcaStatus,
      zatcaSubmissionDate: cn.zatcaSubmissionDate
        ? new Date(cn.zatcaSubmissionDate).toLocaleDateString('ar-SA')
        : null,
      history: (cn.history || []).map((h: any) => ({
        date: new Date(h.timestamp).toLocaleDateString('ar-SA'),
        action: h.action,
        user: h.performedBy || 'النظام',
      })),
    }
  }, [creditNoteData])

  const handleIssue = async () => {
    if (confirm('هل أنت متأكد من إصدار إشعار الدائن هذا؟')) {
      await issueMutation.mutateAsync(creditNoteId)
      refetch()
    }
  }

  const handleApply = async () => {
    if (confirm('هل أنت متأكد من تطبيق إشعار الدائن على الفاتورة الأصلية؟')) {
      await applyMutation.mutateAsync(creditNoteId)
      refetch()
    }
  }

  const handleVoid = async () => {
    if (!voidReason.trim()) {
      alert('الرجاء إدخال سبب الإلغاء')
      return
    }
    await voidMutation.mutateAsync({ id: creditNoteId, reason: voidReason })
    setVoidDialogOpen(false)
    setVoidReason('')
    refetch()
  }

  const handleExportPdf = async () => {
    await exportPdfMutation.mutateAsync(creditNoteId)
  }

  const handleSubmitToZATCA = async () => {
    if (confirm('هل أنت متأكد من إرسال إشعار الدائن إلى هيئة الزكاة والضريبة والجمارك؟')) {
      await submitToZATCAMutation.mutateAsync(creditNoteId)
      refetch()
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Skeleton className="h-96 w-full" />
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  if (!creditNote) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">لم يتم العثور على إشعار الدائن</h3>
        <Link to="/dashboard/finance/credit-notes">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 ms-2" />
            العودة إلى القائمة
          </Button>
        </Link>
      </div>
    )
  }

  const StatusIcon = statusMap[creditNote.status as keyof typeof statusMap]?.icon || AlertCircle

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link to="/dashboard/finance/credit-notes">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <ProductivityHero
              title={`إشعار دائن ${creditNote.creditNoteNumber}`}
              description={`صادر بتاريخ ${creditNote.issueDate}`}
            />
          </div>
          <div className="flex items-center gap-2 mt-4">
            <Badge className={statusMap[creditNote.status as keyof typeof statusMap]?.color}>
              <StatusIcon className="h-3 w-3 me-1" />
              {statusMap[creditNote.status as keyof typeof statusMap]?.label}
            </Badge>
            <Badge className={creditTypeMap[creditNote.creditType as keyof typeof creditTypeMap]?.color}>
              {creditTypeMap[creditNote.creditType as keyof typeof creditTypeMap]?.label}
            </Badge>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {creditNote.status === 'draft' && (
            <>
              <Link to="/dashboard/finance/credit-notes/$creditNoteId/edit" params={{ creditNoteId }}>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 me-2" />
                  تعديل
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleIssue}>
                <Send className="h-4 w-4 me-2" />
                إصدار
              </Button>
            </>
          )}
          {creditNote.status === 'issued' && (
            <>
              <Button variant="outline" size="sm" onClick={handleApply}>
                <CheckCircle2 className="h-4 w-4 me-2" />
                تطبيق على الفاتورة
              </Button>
              <Button variant="outline" size="sm" onClick={handleSubmitToZATCA}>
                <Send className="h-4 w-4 me-2" />
                إرسال إلى ZATCA
              </Button>
            </>
          )}
          {(creditNote.status === 'draft' || creditNote.status === 'issued') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setVoidDialogOpen(true)}
              className="text-destructive hover:text-destructive"
            >
              <XCircle className="h-4 w-4 me-2" />
              إلغاء
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleExportPdf}>
            <Download className="h-4 w-4 me-2" />
            تحميل PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Credit Note Info */}
          <Card>
            <CardHeader>
              <CardTitle>معلومات إشعار الدائن</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">رقم الإشعار</p>
                  <p className="font-medium">{creditNote.creditNoteNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">الفاتورة الأصلية</p>
                  <Link
                    to="/dashboard/finance/invoices/$invoiceId"
                    params={{ invoiceId: creditNote.originalInvoiceId }}
                    className="font-medium hover:underline"
                  >
                    {creditNote.originalInvoice}
                  </Link>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">العميل</p>
                  <p className="font-medium">{creditNote.client}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">تاريخ الإصدار</p>
                  <p className="font-medium">{creditNote.issueDate}</p>
                </div>
                {creditNote.appliedDate && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">تاريخ التطبيق</p>
                    <p className="font-medium">{creditNote.appliedDate}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground mb-1">فئة السبب</p>
                  <p className="font-medium">
                    {reasonCategoryMap[creditNote.reasonCategory as keyof typeof reasonCategoryMap]}
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground mb-2">سبب الإصدار</p>
                <p className="text-sm bg-muted p-3 rounded-lg">{creditNote.reason}</p>
              </div>

              {creditNote.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">ملاحظات</p>
                    <p className="text-sm bg-muted p-3 rounded-lg">{creditNote.notes}</p>
                  </div>
                </>
              )}

              {creditNote.zatcaStatus && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">حالة ZATCA</p>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          creditNote.zatcaStatus === 'approved'
                            ? 'default'
                            : creditNote.zatcaStatus === 'rejected'
                              ? 'destructive'
                              : 'secondary'
                        }
                      >
                        {creditNote.zatcaStatus}
                      </Badge>
                      {creditNote.zatcaSubmissionDate && (
                        <span className="text-xs text-muted-foreground">
                          تم الإرسال: {creditNote.zatcaSubmissionDate}
                        </span>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader>
              <CardTitle>العناصر</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الوصف</TableHead>
                    <TableHead>الكمية</TableHead>
                    <TableHead>سعر الوحدة</TableHead>
                    <TableHead className="text-end">الإجمالي</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {creditNote.items.map((item: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.description}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>
                        {new Intl.NumberFormat('ar-SA', {
                          style: 'currency',
                          currency: 'SAR',
                        }).format(item.unitPrice / 100)}
                      </TableCell>
                      <TableCell className="text-end font-medium">
                        {new Intl.NumberFormat('ar-SA', {
                          style: 'currency',
                          currency: 'SAR',
                        }).format(item.total / 100)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* History */}
          {creditNote.history && creditNote.history.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>السجل</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {creditNote.history.map((entry: any, index: number) => (
                    <div key={index} className="flex items-start gap-3 text-sm">
                      <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />
                      <div className="flex-1">
                        <p className="font-medium">{entry.action}</p>
                        <p className="text-xs text-muted-foreground">
                          {entry.user} • {entry.date}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>ملخص المبلغ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">المجموع الفرعي</span>
                  <span className="font-medium">
                    {new Intl.NumberFormat('ar-SA', {
                      style: 'currency',
                      currency: 'SAR',
                    }).format(creditNote.subtotal / 100)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    ضريبة القيمة المضافة ({creditNote.vatRate}%)
                  </span>
                  <span className="font-medium">
                    {new Intl.NumberFormat('ar-SA', {
                      style: 'currency',
                      currency: 'SAR',
                    }).format(creditNote.vatAmount / 100)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="font-semibold">إجمالي المبلغ</span>
                  <span className="text-xl font-bold text-primary">
                    {new Intl.NumberFormat('ar-SA', {
                      style: 'currency',
                      currency: 'SAR',
                    }).format(creditNote.totalAmount / 100)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Void Dialog */}
      <Dialog open={voidDialogOpen} onOpenChange={setVoidDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إلغاء إشعار الدائن</DialogTitle>
            <DialogDescription>
              الرجاء إدخال سبب إلغاء إشعار الدائن. لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="voidReason">سبب الإلغاء *</Label>
              <Textarea
                id="voidReason"
                placeholder="اشرح سبب إلغاء إشعار الدائن..."
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVoidDialogOpen(false)}>
              إلغاء
            </Button>
            <Button
              variant="destructive"
              onClick={handleVoid}
              disabled={!voidReason.trim() || voidMutation.isPending}
            >
              {voidMutation.isPending ? 'جاري الإلغاء...' : 'تأكيد الإلغاء'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
