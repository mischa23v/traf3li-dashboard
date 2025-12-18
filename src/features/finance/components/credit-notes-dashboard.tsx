import { useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import {
  FileText, Plus, Filter, MoreVertical, Download, Search,
  Eye, Edit, Trash2, Receipt, CheckCircle2, XCircle,
  AlertCircle, Clock, Send, FileCheck
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Link } from '@tanstack/react-router'
import { useCreditNotes, useDeleteCreditNote, useExportCreditNotePdf } from '@/hooks/useFinance'
import { ProductivityHero } from '@/components/productivity-hero'

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

export function CreditNotesDashboard() {
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
    // Debounced search handler
    const debouncedSetSearch = useDebouncedCallback(
        (value: string) => setSearchQuery(value),
        300
    )

  const [reasonFilter, setReasonFilter] = useState<string>('')

  // Fetch credit notes
  const { data, isLoading, refetch } = useCreditNotes({
    status: statusFilter || undefined,
    reasonCategory: reasonFilter || undefined,
  })

  const deleteMutation = useDeleteCreditNote()
  const exportPdfMutation = useExportCreditNotePdf()

  const creditNotes = data?.creditNotes || []
  const total = data?.total || 0

  // Filter credit notes by search query
  const filteredCreditNotes = creditNotes.filter((cn: any) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    const clientName = typeof cn.clientId === 'string'
      ? cn.clientId
      : `${cn.clientId?.firstName || ''} ${cn.clientId?.lastName || ''}`.toLowerCase()
    return (
      cn.creditNoteNumber.toLowerCase().includes(query) ||
      clientName.includes(query)
    )
  })

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف إشعار الدائن هذا؟')) {
      await deleteMutation.mutateAsync(id)
      refetch()
    }
  }

  const handleExportPdf = async (id: string) => {
    await exportPdfMutation.mutateAsync(id)
  }

  // Calculate stats
  const stats = {
    total: total,
    draft: creditNotes.filter((cn: any) => cn.status === 'draft').length,
    issued: creditNotes.filter((cn: any) => cn.status === 'issued').length,
    applied: creditNotes.filter((cn: any) => cn.status === 'applied').length,
    totalAmount: creditNotes.reduce((sum: number, cn: any) => sum + (cn.totalAmount || 0), 0),
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <ProductivityHero
        title="إشعارات الدائن"
        description="إدارة وتتبع إشعارات الدائن (Credit Notes) المتعلقة بالفواتير"
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الإشعارات</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مسودات</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.draft}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">صادرة</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.issued}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المبلغ</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('ar-SA', {
                style: 'currency',
                currency: 'SAR',
                minimumFractionDigits: 2,
              }).format(stats.totalAmount / 100)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="بحث بالرقم أو العميل..."
                  defaultValue={searchQuery}
                  onChange={(e) => debouncedSetSearch(e.target.value)}
                  className="pe-9"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">الكل</SelectItem>
                  <SelectItem value="draft">مسودة</SelectItem>
                  <SelectItem value="issued">صادر</SelectItem>
                  <SelectItem value="applied">مطبق</SelectItem>
                  <SelectItem value="void">ملغي</SelectItem>
                </SelectContent>
              </Select>

              <Select value={reasonFilter} onValueChange={setReasonFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="السبب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">الكل</SelectItem>
                  <SelectItem value="error">خطأ في الفاتورة</SelectItem>
                  <SelectItem value="discount">خصم</SelectItem>
                  <SelectItem value="return">إرجاع</SelectItem>
                  <SelectItem value="cancellation">إلغاء</SelectItem>
                  <SelectItem value="adjustment">تعديل</SelectItem>
                  <SelectItem value="other">أخرى</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Link to="/dashboard/finance/credit-notes/new">
              <Button>
                <Plus className="h-4 w-4 ms-2" />
                إنشاء إشعار دائن جديد
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredCreditNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">لا توجد إشعارات دائن</h3>
              <p className="text-sm text-muted-foreground mb-4">
                ابدأ بإنشاء إشعار دائن جديد
              </p>
              <Link to="/dashboard/finance/credit-notes/new">
                <Button>
                  <Plus className="h-4 w-4 ms-2" />
                  إنشاء إشعار دائن
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم الإشعار</TableHead>
                    <TableHead>الفاتورة الأصلية</TableHead>
                    <TableHead>العميل</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>السبب</TableHead>
                    <TableHead>المبلغ</TableHead>
                    <TableHead>تاريخ الإصدار</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead className="text-end">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCreditNotes.map((creditNote: any) => {
                    const StatusIcon = statusMap[creditNote.status as keyof typeof statusMap]?.icon || AlertCircle
                    const clientName = typeof creditNote.clientId === 'string'
                      ? creditNote.clientId
                      : `${creditNote.clientId?.firstName || ''} ${creditNote.clientId?.lastName || ''}`.trim() || 'غير محدد'
                    const originalInvoice = typeof creditNote.originalInvoiceId === 'string'
                      ? creditNote.originalInvoiceId
                      : creditNote.originalInvoiceId?.invoiceNumber || 'غير محدد'

                    return (
                      <TableRow key={creditNote._id}>
                        <TableCell className="font-medium">
                          <Link
                            to="/dashboard/finance/credit-notes/$creditNoteId"
                            params={{ creditNoteId: creditNote._id }}
                            className="hover:underline"
                          >
                            {creditNote.creditNoteNumber}
                          </Link>
                        </TableCell>
                        <TableCell>{originalInvoice}</TableCell>
                        <TableCell>{clientName}</TableCell>
                        <TableCell>
                          <Badge className={creditTypeMap[creditNote.creditType as keyof typeof creditTypeMap]?.color}>
                            {creditTypeMap[creditNote.creditType as keyof typeof creditTypeMap]?.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {reasonCategoryMap[creditNote.reasonCategory as keyof typeof reasonCategoryMap]}
                        </TableCell>
                        <TableCell className="font-medium">
                          {new Intl.NumberFormat('ar-SA', {
                            style: 'currency',
                            currency: 'SAR',
                            minimumFractionDigits: 2,
                          }).format(creditNote.totalAmount / 100)}
                        </TableCell>
                        <TableCell>
                          {new Date(creditNote.issueDate).toLocaleDateString('ar-SA')}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusMap[creditNote.status as keyof typeof statusMap]?.color}>
                            <StatusIcon className="h-3 w-3 me-1" />
                            {statusMap[creditNote.status as keyof typeof statusMap]?.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <Link to="/dashboard/finance/credit-notes/$creditNoteId" params={{ creditNoteId: creditNote._id }}>
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 me-2" />
                                  عرض التفاصيل
                                </DropdownMenuItem>
                              </Link>
                              {creditNote.status === 'draft' && (
                                <>
                                  <Link to="/dashboard/finance/credit-notes/$creditNoteId/edit" params={{ creditNoteId: creditNote._id }}>
                                    <DropdownMenuItem>
                                      <Edit className="h-4 w-4 me-2" />
                                      تعديل
                                    </DropdownMenuItem>
                                  </Link>
                                </>
                              )}
                              <DropdownMenuItem onClick={() => handleExportPdf(creditNote._id)}>
                                <Download className="h-4 w-4 me-2" />
                                تحميل PDF
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {creditNote.status === 'draft' && (
                                <DropdownMenuItem
                                  onClick={() => handleDelete(creditNote._id)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 me-2" />
                                  حذف
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
