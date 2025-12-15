import { useState, useMemo } from 'react'
import {
  CheckCircle, XCircle, Clock, AlertCircle, MessageSquare, ArrowUp,
  Filter, Search, Calendar, DollarSign, User, FileText, MoreVertical,
  Download, Printer, Eye, Send, RefreshCw, CheckCheck, AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { Link } from '@tanstack/react-router'
import { FinanceSidebar } from './finance-sidebar'
import { ProductivityHero } from '@/components/productivity-hero'
import { cn } from '@/lib/utils'
import {
  useInvoicesPendingApproval,
  useApproveInvoice,
  useRejectInvoice,
  useRequestInvoiceChanges,
  useBulkApproveInvoices,
} from '@/hooks/useFinance'
import { useClients } from '@/hooks/useCasesAndClients'
import type { InvoiceStatus } from '../types/approval-types'

interface InvoiceWithApproval {
  _id: string
  invoiceNumber: string
  clientId: string | { _id: string; firstName: string; lastName: string; fullName?: string }
  totalAmount: number
  issueDate: string
  dueDate: string
  status: InvoiceStatus
  approvalLevel: number
  currentApprover: string
  submittedForApprovalAt: string
  approvalHistory: any[]
  createdBy: { firstName: string; lastName: string }
}

export function InvoiceApprovalsView() {
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending')
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [clientFilter, setClientFilter] = useState<string>('')
  const [minAmount, setMinAmount] = useState<string>('')
  const [maxAmount, setMaxAmount] = useState<string>('')

  // Dialog states
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [changesDialogOpen, setChangesDialogOpen] = useState(false)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceWithApproval | null>(null)

  // Form states
  const [approvalComments, setApprovalComments] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [rejectionComments, setRejectionComments] = useState('')
  const [requestedChanges, setRequestedChanges] = useState('')
  const [changesComments, setChangesComments] = useState('')

  // API hooks
  const { data: invoicesData, isLoading } = useInvoicesPendingApproval({
    status: activeTab === 'all' ? undefined : activeTab,
    clientId: clientFilter || undefined,
    minAmount: minAmount ? parseFloat(minAmount) : undefined,
    maxAmount: maxAmount ? parseFloat(maxAmount) : undefined,
  })
  const { data: clientsData } = useClients()
  const approveInvoiceMutation = useApproveInvoice()
  const rejectInvoiceMutation = useRejectInvoice()
  const requestChangesMutation = useRequestInvoiceChanges()
  const bulkApproveMutation = useBulkApproveInvoices()

  const invoices = useMemo(() => {
    return invoicesData?.invoices || []
  }, [invoicesData])

  const clients = useMemo(() => {
    if (!clientsData) return []
    return Array.isArray(clientsData) ? clientsData : (clientsData as any)?.data || []
  }, [clientsData])

  // Filter invoices by search query
  const filteredInvoices = useMemo(() => {
    if (!searchQuery) return invoices
    const query = searchQuery.toLowerCase()
    return invoices.filter((inv: InvoiceWithApproval) => {
      const clientName = typeof inv.clientId === 'string'
        ? ''
        : `${inv.clientId.firstName} ${inv.clientId.lastName}`.toLowerCase()
      return (
        inv.invoiceNumber.toLowerCase().includes(query) ||
        clientName.includes(query)
      )
    })
  }, [invoices, searchQuery])

  // Format currency
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('ar-SA', { minimumFractionDigits: 2 }) + ' ر.س'
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA')
  }

  // Get client name
  const getClientName = (clientId: any) => {
    if (typeof clientId === 'string') return 'عميل غير معروف'
    return clientId.fullName || `${clientId.firstName} ${clientId.lastName}`
  }

  // Status badge
  const getStatusBadge = (status: InvoiceStatus) => {
    const variants: Record<InvoiceStatus, { label: string; className: string; icon: any }> = {
      draft: { label: 'مسودة', className: 'bg-slate-100 text-slate-700', icon: FileText },
      pending_approval: { label: 'قيد المراجعة', className: 'bg-amber-100 text-amber-700', icon: Clock },
      approved: { label: 'معتمدة', className: 'bg-green-100 text-green-700', icon: CheckCircle },
      rejected: { label: 'مرفوضة', className: 'bg-red-100 text-red-700', icon: XCircle },
      sent: { label: 'مرسلة', className: 'bg-blue-100 text-blue-700', icon: Send },
      paid: { label: 'مدفوعة', className: 'bg-emerald-100 text-emerald-700', icon: CheckCheck },
      partial: { label: 'مدفوعة جزئياً', className: 'bg-purple-100 text-purple-700', icon: DollarSign },
      overdue: { label: 'متأخرة', className: 'bg-red-100 text-red-700', icon: AlertTriangle },
      cancelled: { label: 'ملغاة', className: 'bg-gray-100 text-gray-700', icon: XCircle },
    }
    const info = variants[status] || variants.draft
    const Icon = info.icon
    return (
      <Badge className={cn("rounded-full flex items-center gap-1", info.className)}>
        <Icon className="w-3 h-3" />
        {info.label}
      </Badge>
    )
  }

  // Handle approve
  const handleApprove = async () => {
    if (!selectedInvoice) return

    approveInvoiceMutation.mutate(
      {
        invoiceId: selectedInvoice._id,
        comments: approvalComments,
        approverLevel: selectedInvoice.approvalLevel,
      },
      {
        onSuccess: () => {
          setApproveDialogOpen(false)
          setApprovalComments('')
          setSelectedInvoice(null)
        },
      }
    )
  }

  // Handle reject
  const handleReject = async () => {
    if (!selectedInvoice) return

    rejectInvoiceMutation.mutate(
      {
        invoiceId: selectedInvoice._id,
        reason: rejectionReason,
        comments: rejectionComments,
      },
      {
        onSuccess: () => {
          setRejectDialogOpen(false)
          setRejectionReason('')
          setRejectionComments('')
          setSelectedInvoice(null)
        },
      }
    )
  }

  // Handle request changes
  const handleRequestChanges = async () => {
    if (!selectedInvoice) return

    requestChangesMutation.mutate(
      {
        invoiceId: selectedInvoice._id,
        requestedChanges,
        comments: changesComments,
      },
      {
        onSuccess: () => {
          setChangesDialogOpen(false)
          setRequestedChanges('')
          setChangesComments('')
          setSelectedInvoice(null)
        },
      }
    )
  }

  // Handle bulk approve
  const handleBulkApprove = async () => {
    if (selectedInvoices.length === 0) return

    bulkApproveMutation.mutate(
      { invoiceIds: selectedInvoices },
      {
        onSuccess: () => {
          setSelectedInvoices([])
        },
      }
    )
  }

  // Toggle invoice selection
  const toggleInvoiceSelection = (invoiceId: string) => {
    setSelectedInvoices(prev =>
      prev.includes(invoiceId)
        ? prev.filter(id => id !== invoiceId)
        : [...prev, invoiceId]
    )
  }

  // Select all invoices
  const selectAllInvoices = () => {
    if (selectedInvoices.length === filteredInvoices.length) {
      setSelectedInvoices([])
    } else {
      setSelectedInvoices(filteredInvoices.map((inv: InvoiceWithApproval) => inv._id))
    }
  }

  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/finance/overview', isActive: false },
    { title: 'الفواتير', href: '/dashboard/finance/invoices', isActive: false },
    { title: 'الموافقات', href: '/dashboard/finance/invoices/approvals', isActive: true },
    { title: 'المصروفات', href: '/dashboard/finance/expenses', isActive: false },
    { title: 'كشف الحساب', href: '/dashboard/finance/statements', isActive: false },
  ]

  // Stats
  const stats = useMemo(() => {
    const pending = invoices.filter((inv: InvoiceWithApproval) => inv.status === 'pending_approval').length
    const approved = invoices.filter((inv: InvoiceWithApproval) => inv.status === 'approved').length
    const rejected = invoices.filter((inv: InvoiceWithApproval) => inv.status === 'rejected').length
    const totalAmount = invoices
      .filter((inv: InvoiceWithApproval) => inv.status === 'pending_approval')
      .reduce((sum: number, inv: InvoiceWithApproval) => sum + inv.totalAmount, 0)

    return { pending, approved, rejected, totalAmount }
  }, [invoices])

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
        {/* HERO CARD */}
        <ProductivityHero
          badge="الموافقات"
          title="موافقات الفواتير"
          type="invoices"
          listMode={true}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* MAIN CONTENT */}
          <div className="lg:col-span-2 space-y-6">
            {/* STATS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="rounded-2xl shadow-sm border-slate-100">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500">قيد المراجعة</p>
                      <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
                    </div>
                    <Clock className="w-8 h-8 text-amber-500 opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-sm border-slate-100">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500">معتمدة</p>
                      <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-500 opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-sm border-slate-100">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500">مرفوضة</p>
                      <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                    </div>
                    <XCircle className="w-8 h-8 text-red-500 opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-sm border-slate-100">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500">القيمة الإجمالية</p>
                      <p className="text-lg font-bold text-slate-700">{formatCurrency(stats.totalAmount)}</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-slate-500 opacity-20" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* FILTERS */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">البحث</Label>
                    <div className="relative">
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        placeholder="رقم الفاتورة أو العميل..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="rounded-xl pr-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">العميل</Label>
                    <Select value={clientFilter} onValueChange={setClientFilter}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="كل العملاء" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">كل العملاء</SelectItem>
                        {clients.map((client: any) => (
                          <SelectItem key={client._id} value={client._id}>
                            {client.fullName || `${client.firstName} ${client.lastName}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">الحد الأدنى</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={minAmount}
                      onChange={(e) => setMinAmount(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">الحد الأقصى</Label>
                    <Input
                      type="number"
                      placeholder="∞"
                      value={maxAmount}
                      onChange={(e) => setMaxAmount(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                </div>

                {selectedInvoices.length > 0 && (
                  <div className="mt-4 flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                    <span className="text-sm text-emerald-700">
                      تم تحديد {selectedInvoices.length} فاتورة
                    </span>
                    <Button
                      onClick={handleBulkApprove}
                      disabled={bulkApproveMutation.isPending}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                    >
                      <CheckCircle className="w-4 h-4 ms-2" />
                      اعتماد المحدد
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* TABS */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
              <TabsList className="grid w-full grid-cols-4 rounded-xl bg-slate-100 p-1">
                <TabsTrigger value="pending" className="rounded-lg">
                  قيد المراجعة ({stats.pending})
                </TabsTrigger>
                <TabsTrigger value="approved" className="rounded-lg">
                  معتمدة ({stats.approved})
                </TabsTrigger>
                <TabsTrigger value="rejected" className="rounded-lg">
                  مرفوضة ({stats.rejected})
                </TabsTrigger>
                <TabsTrigger value="all" className="rounded-lg">
                  الكل
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-6 space-y-4">
                {isLoading ? (
                  <Card className="rounded-3xl shadow-sm border-slate-100">
                    <CardContent className="p-12 text-center">
                      <RefreshCw className="w-8 h-8 mx-auto mb-4 text-slate-400 animate-spin" />
                      <p className="text-slate-600">جاري التحميل...</p>
                    </CardContent>
                  </Card>
                ) : filteredInvoices.length === 0 ? (
                  <Card className="rounded-3xl shadow-sm border-slate-100">
                    <CardContent className="p-12 text-center">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                      <p className="text-slate-600">لا توجد فواتير</p>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    {/* SELECT ALL */}
                    {activeTab === 'pending' && (
                      <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                        <input
                          type="checkbox"
                          checked={selectedInvoices.length === filteredInvoices.length}
                          onChange={selectAllInvoices}
                          className="h-4 w-4 text-emerald-600 rounded border-slate-300"
                        />
                        <Label className="text-sm text-slate-600">تحديد الكل</Label>
                      </div>
                    )}

                    {/* INVOICE CARDS */}
                    {filteredInvoices.map((invoice: InvoiceWithApproval) => (
                      <Card key={invoice._id} className="rounded-3xl shadow-sm border-slate-100 hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between gap-4">
                            {/* Checkbox */}
                            {invoice.status === 'pending_approval' && (
                              <input
                                type="checkbox"
                                checked={selectedInvoices.includes(invoice._id)}
                                onChange={() => toggleInvoiceSelection(invoice._id)}
                                className="mt-1 h-4 w-4 text-emerald-600 rounded border-slate-300"
                              />
                            )}

                            {/* Invoice Info */}
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h3 className="text-lg font-bold text-slate-800 mb-1">
                                    {invoice.invoiceNumber}
                                  </h3>
                                  <p className="text-sm text-slate-600">
                                    {getClientName(invoice.clientId)}
                                  </p>
                                </div>
                                {getStatusBadge(invoice.status)}
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <p className="text-slate-500">المبلغ الإجمالي</p>
                                  <p className="font-semibold text-emerald-600">
                                    {formatCurrency(invoice.totalAmount)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-slate-500">تاريخ الإصدار</p>
                                  <p className="font-medium">{formatDate(invoice.issueDate)}</p>
                                </div>
                                <div>
                                  <p className="text-slate-500">تاريخ الاستحقاق</p>
                                  <p className="font-medium">{formatDate(invoice.dueDate)}</p>
                                </div>
                                <div>
                                  <p className="text-slate-500">مستوى الاعتماد</p>
                                  <p className="font-medium">المستوى {invoice.approvalLevel}</p>
                                </div>
                              </div>

                              {invoice.approvalHistory && invoice.approvalHistory.length > 0 && (
                                <div className="mt-3 p-3 bg-slate-50 rounded-xl">
                                  <p className="text-xs text-slate-500 mb-2">سجل الموافقات:</p>
                                  <div className="space-y-1">
                                    {invoice.approvalHistory.slice(0, 2).map((step: any, idx: number) => (
                                      <div key={idx} className="flex items-center gap-2 text-xs">
                                        {step.action === 'approve' ? (
                                          <CheckCircle className="w-3 h-3 text-green-500" />
                                        ) : step.action === 'reject' ? (
                                          <XCircle className="w-3 h-3 text-red-500" />
                                        ) : (
                                          <Clock className="w-3 h-3 text-amber-500" />
                                        )}
                                        <span className="text-slate-600">
                                          {step.approverName} - {step.action === 'approve' ? 'اعتمد' : step.action === 'reject' ? 'رفض' : 'قيد المراجعة'}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                              {invoice.status === 'pending_approval' && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      setSelectedInvoice(invoice)
                                      setApproveDialogOpen(true)
                                    }}
                                    className="bg-green-500 hover:bg-green-600 text-white rounded-xl"
                                  >
                                    <CheckCircle className="w-4 h-4 ms-1" />
                                    اعتماد
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedInvoice(invoice)
                                      setRejectDialogOpen(true)
                                    }}
                                    className="border-red-200 text-red-600 hover:bg-red-50 rounded-xl"
                                  >
                                    <XCircle className="w-4 h-4 ms-1" />
                                    رفض
                                  </Button>
                                </>
                              )}

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="rounded-xl">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => {
                                    setSelectedInvoice(invoice)
                                    setDetailsDialogOpen(true)
                                  }}>
                                    <Eye className="w-4 h-4 ms-2" />
                                    عرض التفاصيل
                                  </DropdownMenuItem>
                                  {invoice.status === 'pending_approval' && (
                                    <>
                                      <DropdownMenuItem onClick={() => {
                                        setSelectedInvoice(invoice)
                                        setChangesDialogOpen(true)
                                      }}>
                                        <MessageSquare className="w-4 h-4 ms-2" />
                                        طلب تعديلات
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                    </>
                                  )}
                                  <DropdownMenuItem>
                                    <Download className="w-4 h-4 ms-2" />
                                    تحميل PDF
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Printer className="w-4 h-4 ms-2" />
                                    طباعة
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* SIDEBAR */}
          <FinanceSidebar context="invoices" />
        </div>
      </Main>

      {/* APPROVE DIALOG */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              اعتماد الفاتورة
            </DialogTitle>
            <DialogDescription>
              هل أنت متأكد من اعتماد فاتورة رقم {selectedInvoice?.invoiceNumber}؟
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedInvoice && (
              <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">العميل:</span>
                  <span className="font-medium">{getClientName(selectedInvoice.clientId)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">المبلغ:</span>
                  <span className="font-medium text-emerald-600">
                    {formatCurrency(selectedInvoice.totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">مستوى الاعتماد:</span>
                  <span className="font-medium">المستوى {selectedInvoice.approvalLevel}</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>ملاحظات (اختياري)</Label>
              <Textarea
                placeholder="أضف ملاحظات الاعتماد..."
                value={approvalComments}
                onChange={(e) => setApprovalComments(e.target.value)}
                className="rounded-xl min-h-[100px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setApproveDialogOpen(false)
                setApprovalComments('')
              }}
              className="rounded-xl"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleApprove}
              disabled={approveInvoiceMutation.isPending}
              className="bg-green-500 hover:bg-green-600 text-white rounded-xl"
            >
              {approveInvoiceMutation.isPending ? 'جاري الاعتماد...' : 'اعتماد الفاتورة'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* REJECT DIALOG */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              رفض الفاتورة
            </DialogTitle>
            <DialogDescription>
              يرجى تحديد سبب رفض فاتورة رقم {selectedInvoice?.invoiceNumber}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>سبب الرفض <span className="text-red-500">*</span></Label>
              <Select value={rejectionReason} onValueChange={setRejectionReason}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="اختر السبب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="amount_incorrect">المبلغ غير صحيح</SelectItem>
                  <SelectItem value="missing_details">تفاصيل ناقصة</SelectItem>
                  <SelectItem value="client_unauthorized">عميل غير مخول</SelectItem>
                  <SelectItem value="exceeds_budget">يتجاوز الميزانية</SelectItem>
                  <SelectItem value="duplicate">فاتورة مكررة</SelectItem>
                  <SelectItem value="other">سبب آخر</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>تفاصيل إضافية</Label>
              <Textarea
                placeholder="أضف تفاصيل الرفض..."
                value={rejectionComments}
                onChange={(e) => setRejectionComments(e.target.value)}
                className="rounded-xl min-h-[100px]"
              />
            </div>

            <Alert className="rounded-xl bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                سيتم إرسال إشعار للمنشئ بسبب الرفض والتفاصيل المضافة.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialogOpen(false)
                setRejectionReason('')
                setRejectionComments('')
              }}
              className="rounded-xl"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleReject}
              disabled={!rejectionReason || rejectInvoiceMutation.isPending}
              className="bg-red-500 hover:bg-red-600 text-white rounded-xl"
            >
              {rejectInvoiceMutation.isPending ? 'جاري الرفض...' : 'رفض الفاتورة'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* REQUEST CHANGES DIALOG */}
      <Dialog open={changesDialogOpen} onOpenChange={setChangesDialogOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-amber-500" />
              طلب تعديلات
            </DialogTitle>
            <DialogDescription>
              حدد التعديلات المطلوبة لفاتورة رقم {selectedInvoice?.invoiceNumber}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>التعديلات المطلوبة <span className="text-red-500">*</span></Label>
              <Textarea
                placeholder="وصف التعديلات المطلوبة..."
                value={requestedChanges}
                onChange={(e) => setRequestedChanges(e.target.value)}
                className="rounded-xl min-h-[120px]"
              />
            </div>

            <div className="space-y-2">
              <Label>ملاحظات إضافية</Label>
              <Textarea
                placeholder="ملاحظات للمنشئ..."
                value={changesComments}
                onChange={(e) => setChangesComments(e.target.value)}
                className="rounded-xl min-h-[80px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setChangesDialogOpen(false)
                setRequestedChanges('')
                setChangesComments('')
              }}
              className="rounded-xl"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleRequestChanges}
              disabled={!requestedChanges || requestChangesMutation.isPending}
              className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl"
            >
              {requestChangesMutation.isPending ? 'جاري الإرسال...' : 'إرسال الطلب'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DETAILS DIALOG */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="rounded-3xl max-w-2xl">
          <DialogHeader>
            <DialogTitle>تفاصيل الفاتورة</DialogTitle>
            <DialogDescription>
              فاتورة رقم {selectedInvoice?.invoiceNumber}
            </DialogDescription>
          </DialogHeader>

          {selectedInvoice && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">العميل</p>
                  <p className="font-medium">{getClientName(selectedInvoice.clientId)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">المبلغ الإجمالي</p>
                  <p className="font-medium text-emerald-600">{formatCurrency(selectedInvoice.totalAmount)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">تاريخ الإصدار</p>
                  <p className="font-medium">{formatDate(selectedInvoice.issueDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">تاريخ الاستحقاق</p>
                  <p className="font-medium">{formatDate(selectedInvoice.dueDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">الحالة</p>
                  <div className="mt-1">{getStatusBadge(selectedInvoice.status)}</div>
                </div>
                <div>
                  <p className="text-sm text-slate-500">مستوى الاعتماد</p>
                  <p className="font-medium">المستوى {selectedInvoice.approvalLevel}</p>
                </div>
              </div>

              {selectedInvoice.approvalHistory && selectedInvoice.approvalHistory.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">سجل الموافقات</h4>
                  <div className="space-y-2">
                    {selectedInvoice.approvalHistory.map((step: any, idx: number) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{step.approverName}</span>
                          <Badge className={cn(
                            "rounded-full",
                            step.action === 'approve' ? 'bg-green-100 text-green-700' :
                            step.action === 'reject' ? 'bg-red-100 text-red-700' :
                            'bg-amber-100 text-amber-700'
                          )}>
                            {step.action === 'approve' ? 'اعتمد' :
                             step.action === 'reject' ? 'رفض' :
                             'قيد المراجعة'}
                          </Badge>
                        </div>
                        {step.comments && (
                          <p className="text-sm text-slate-600">{step.comments}</p>
                        )}
                        {step.timestamp && (
                          <p className="text-xs text-slate-400 mt-1">
                            {formatDate(step.timestamp)}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDetailsDialogOpen(false)}
              className="rounded-xl"
            >
              إغلاق
            </Button>
            <Link to={`/dashboard/finance/invoices/${selectedInvoice?._id}`}>
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl">
                <Eye className="w-4 h-4 ms-2" />
                عرض كامل
              </Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
