import { useState } from 'react'
import { useNavigate, Link } from '@tanstack/react-router'
import {
  ArrowRight,
  Edit,
  Pause,
  Play,
  Ban,
  Trash2,
  Zap,
  Copy,
  Calendar,
  User,
  FileText,
  DollarSign,
  Clock,
  MoreHorizontal,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  useRecurringInvoice,
  useRecurringInvoiceHistory,
  useDeleteRecurringInvoice,
  usePauseRecurringInvoice,
  useResumeRecurringInvoice,
  useCancelRecurringInvoice,
  useGenerateFromRecurring,
  useDuplicateRecurringInvoice,
} from '@/hooks/useFinance'
import { getFrequencyLabel, getStatusLabel, getStatusColor } from '@/services/recurringInvoiceService'
import type { RecurringInvoice } from '@/services/recurringInvoiceService'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

interface RecurringInvoiceDetailsProps {
  invoiceId: string
}

export default function RecurringInvoiceDetails({ invoiceId }: RecurringInvoiceDetailsProps) {
  const navigate = useNavigate()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const { data: invoice, isLoading, isError } = useRecurringInvoice(invoiceId)
  const { data: history, isLoading: isLoadingHistory } = useRecurringInvoiceHistory(invoiceId)

  const { mutate: deleteInvoice } = useDeleteRecurringInvoice()
  const { mutate: pauseInvoice } = usePauseRecurringInvoice()
  const { mutate: resumeInvoice } = useResumeRecurringInvoice()
  const { mutate: cancelInvoice } = useCancelRecurringInvoice()
  const { mutate: generateInvoice } = useGenerateFromRecurring()
  const { mutate: duplicateInvoice } = useDuplicateRecurringInvoice()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 2,
    }).format(amount / 100)
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'PPP', { locale: ar })
  }

  const handleDelete = () => {
    deleteInvoice(invoiceId, {
      onSuccess: () => {
        navigate({ to: '/dashboard/finance/recurring-invoices' })
      },
    })
  }

  const handlePause = () => {
    pauseInvoice(invoiceId)
  }

  const handleResume = () => {
    resumeInvoice(invoiceId)
  }

  const handleCancel = () => {
    cancelInvoice(invoiceId)
  }

  const handleGenerate = () => {
    generateInvoice(invoiceId)
  }

  const handleDuplicate = () => {
    if (invoice) {
      duplicateInvoice({
        id: invoiceId,
        name: `${invoice.name} (نسخة)`,
        nameAr: invoice.nameAr ? `${invoice.nameAr} (نسخة)` : undefined,
      })
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-32" />
        <Skeleton className="h-64" />
        <Skeleton className="h-48" />
      </div>
    )
  }

  if (isError || !invoice) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-destructive">حدث خطأ أثناء تحميل البيانات</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const clientName =
    typeof invoice.clientId === 'object'
      ? invoice.clientId.name || `${invoice.clientId.firstName} ${invoice.clientId.lastName}`
      : 'عميل غير محدد'

  const caseName =
    typeof invoice.caseId === 'object'
      ? invoice.caseId.title || invoice.caseId.caseNumber
      : undefined

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({ to: '/dashboard/finance/recurring-invoices' })}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold">{invoice.name}</h1>
          </div>
          <div className="flex items-center gap-2 mr-12">
            <Badge className={getStatusColor(invoice.status)}>
              {getStatusLabel(invoice.status)}
            </Badge>
            <Badge variant="outline">{getFrequencyLabel(invoice.frequency)}</Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {invoice.status === 'active' && (
            <>
              <Button onClick={handleGenerate}>
                <Zap className="h-4 w-4 ml-2" />
                إنشاء فاتورة الآن
              </Button>
              <Button variant="outline" onClick={handlePause}>
                <Pause className="h-4 w-4 ml-2" />
                إيقاف مؤقت
              </Button>
            </>
          )}

          {invoice.status === 'paused' && (
            <Button onClick={handleResume}>
              <Play className="h-4 w-4 ml-2" />
              استئناف
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() =>
                  navigate({
                    to: '/dashboard/finance/recurring-invoices/$id/edit',
                    params: { id: invoiceId },
                  })
                }
              >
                <Edit className="h-4 w-4 ml-2" />
                تعديل
              </DropdownMenuItem>

              <DropdownMenuItem onClick={handleDuplicate}>
                <Copy className="h-4 w-4 ml-2" />
                نسخ
              </DropdownMenuItem>

              {(invoice.status === 'active' || invoice.status === 'paused') && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleCancel}>
                    <Ban className="h-4 w-4 ml-2" />
                    إلغاء
                  </DropdownMenuItem>
                </>
              )}

              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDeleteDialogOpen(true)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 ml-2" />
                حذف
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">المبلغ</p>
                <p className="text-xl font-bold">{formatCurrency(invoice.total)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">الفاتورة التالية</p>
                <p className="text-lg font-semibold">
                  {format(new Date(invoice.nextGenerationDate), 'dd/MM/yyyy')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">تم الإنشاء</p>
                <p className="text-xl font-bold">
                  {invoice.timesGenerated}
                  {invoice.maxGenerations && ` / ${invoice.maxGenerations}`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">تاريخ البدء</p>
                <p className="text-lg font-semibold">
                  {format(new Date(invoice.startDate), 'dd/MM/yyyy')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>معلومات أساسية</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">العميل</span>
              <span className="font-medium">{clientName}</span>
            </div>

            {caseName && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">القضية</span>
                <span className="font-medium">{caseName}</span>
              </div>
            )}

            <Separator />

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">التكرار</span>
              <span className="font-medium">{getFrequencyLabel(invoice.frequency)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">تاريخ البدء</span>
              <span className="font-medium">{formatDate(invoice.startDate)}</span>
            </div>

            {invoice.endDate && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">تاريخ الانتهاء</span>
                <span className="font-medium">{formatDate(invoice.endDate)}</span>
              </div>
            )}

            {invoice.lastGeneratedDate && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">آخر إنشاء</span>
                <span className="font-medium">{formatDate(invoice.lastGeneratedDate)}</span>
              </div>
            )}

            <Separator />

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">شروط الدفع</span>
              <span className="font-medium">{invoice.paymentTerms}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">إرسال تلقائي</span>
              <Badge variant={invoice.autoSend ? 'default' : 'secondary'}>
                {invoice.autoSend ? 'نعم' : 'لا'}
              </Badge>
            </div>

            {invoice.notes && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-2">ملاحظات</p>
                  <p className="text-sm">{invoice.notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Invoice Items */}
        <Card>
          <CardHeader>
            <CardTitle>بنود الفاتورة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {invoice.items.map((item, index) => (
              <div key={index} className="p-3 bg-muted rounded-lg space-y-2">
                <p className="font-medium">{item.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {item.quantity} × {formatCurrency(item.unitPrice)}
                  </span>
                  <span className="font-medium">{formatCurrency(item.total)}</span>
                </div>
              </div>
            ))}

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">المجموع الفرعي</span>
                <span>{formatCurrency(invoice.subtotal)}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  ضريبة القيمة المضافة ({invoice.vatRate}%)
                </span>
                <span>{formatCurrency(invoice.vatAmount)}</span>
              </div>

              <Separator />

              <div className="flex items-center justify-between text-lg font-bold">
                <span>الإجمالي</span>
                <span>{formatCurrency(invoice.total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Generation History */}
      <Card>
        <CardHeader>
          <CardTitle>سجل الإنشاء</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingHistory ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : history && history.length > 0 ? (
            <div className="space-y-3">
              {history.map((record: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium">
                        فاتورة #{record.invoiceNumber || record.invoiceId}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(record.generatedAt || record.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-medium">{formatCurrency(record.amount || invoice.total)}</span>
                    <Link
                      to={ROUTES.dashboard.finance.invoices.detail(record.invoiceId || record._id )}
                    >
                      <Button variant="outline" size="sm">
                        عرض
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">لم يتم إنشاء أي فواتير بعد</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من الحذف؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف الفاتورة المتكررة "{invoice.name}" بشكل نهائي. هذا الإجراء لا يمكن
              التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
