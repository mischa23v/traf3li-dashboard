/**
 * Subcontracting Receipt List View
 * Main receipts list page with tabs, filters, and quality tracking
 */

import { useState, useMemo } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  Package,
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  AlertTriangle,
  Calendar,
  Send,
  PackageCheck,
  ShieldCheck,
  ShieldAlert,
  ShieldQuestion,
} from 'lucide-react'

import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { ProductivityHero } from '@/components/productivity-hero'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { useSubcontractingReceipts, useSubmitSubcontractingReceipt } from '@/hooks/use-subcontracting'
import type { SubcontractingReceipt, SubcontractingReceiptStatus } from '@/types/subcontracting'
import { SubcontractingSidebar } from './subcontracting-sidebar'
import { ROUTES } from '@/constants/routes'

const topNav = [
  { title: 'sidebar.nav.overview', href: ROUTES.dashboard.home },
  { title: 'sidebar.nav.subcontracting', href: ROUTES.dashboard.subcontracting.list },
  { title: 'subcontracting.receipts', href: ROUTES.dashboard.subcontracting.receipts.list },
]

// Quality status based on rejection rate
type QualityStatus = 'excellent' | 'good' | 'fair' | 'poor' | 'pending'

function getQualityStatus(receipt: SubcontractingReceipt): QualityStatus {
  if (receipt.status === 'draft') return 'pending'

  const totalReceived = receipt.items.reduce((sum, item) => sum + item.receivedQty, 0)
  const totalRejected = receipt.items.reduce((sum, item) => sum + (item.rejectedQty || 0), 0)
  const totalAccepted = receipt.items.reduce((sum, item) => sum + item.acceptedQty, 0)

  if (totalReceived === 0) return 'pending'

  const rejectionRate = (totalRejected / totalReceived) * 100

  if (rejectionRate === 0) return 'excellent'
  if (rejectionRate < 5) return 'good'
  if (rejectionRate < 15) return 'fair'
  return 'poor'
}

export function ReceiptListView() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  // State
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<SubcontractingReceiptStatus | 'quality_pending' | 'completed' | 'all'>('all')

  // Mutations
  const submitReceiptMutation = useSubmitSubcontractingReceipt()

  // Build filters
  const filters = useMemo(() => {
    const f: { orderId?: string; status?: string } = {}

    // Map quality_pending and completed to actual receipt statuses
    if (statusFilter === 'quality_pending') {
      f.status = 'submitted'
    } else if (statusFilter === 'completed') {
      f.status = 'submitted'
    } else if (statusFilter !== 'all') {
      f.status = statusFilter
    }

    return f
  }, [statusFilter])

  // Queries
  const { data: receiptsData, isLoading, error } = useSubcontractingReceipts(filters)

  const allReceipts = receiptsData?.receipts || []

  // Filter receipts based on search and quality status
  const filteredReceipts = useMemo(() => {
    let filtered = allReceipts

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(
        (receipt) =>
          receipt.receiptNumber?.toLowerCase().includes(searchLower) ||
          receipt.orderNumber?.toLowerCase().includes(searchLower) ||
          receipt.supplierName?.toLowerCase().includes(searchLower)
      )
    }

    // Apply quality filter
    if (statusFilter === 'quality_pending') {
      filtered = filtered.filter(
        (receipt) => getQualityStatus(receipt) === 'pending' && receipt.status === 'submitted'
      )
    } else if (statusFilter === 'completed') {
      filtered = filtered.filter(
        (receipt) => getQualityStatus(receipt) !== 'pending' && receipt.status === 'submitted'
      )
    }

    return filtered
  }, [allReceipts, search, statusFilter])

  // Stats calculations
  const totalReceipts = allReceipts.length
  const pendingQC = allReceipts.filter(
    (r) => getQualityStatus(r) === 'pending' && r.status === 'submitted'
  ).length
  const completed = allReceipts.filter(
    (r) => getQualityStatus(r) !== 'pending' && r.status === 'submitted'
  ).length

  // Get current month's receipts
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const thisMonth = allReceipts.filter((r) => {
    const receiptDate = new Date(r.postingDate)
    return receiptDate.getMonth() === currentMonth && receiptDate.getFullYear() === currentYear
  }).length

  // Handlers
  const handleSubmit = async (receiptId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    await submitReceiptMutation.mutateAsync(receiptId)
  }

  const getStatusBadge = (status: SubcontractingReceiptStatus) => {
    switch (status) {
      case 'draft':
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-700">
            <FileText className="w-3 h-3 ml-1" />
            {t('subcontracting.receipt.status.draft', 'مسودة')}
          </Badge>
        )
      case 'submitted':
        return (
          <Badge variant="default" className="bg-emerald-500">
            <CheckCircle2 className="w-3 h-3 ml-1" />
            {t('subcontracting.receipt.status.submitted', 'مقدم')}
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 ml-1" />
            {t('subcontracting.receipt.status.cancelled', 'ملغي')}
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getQualityBadge = (qualityStatus: QualityStatus) => {
    switch (qualityStatus) {
      case 'excellent':
        return (
          <Badge variant="default" className="bg-emerald-600">
            <ShieldCheck className="w-3 h-3 ml-1" />
            {t('subcontracting.receipt.quality.excellent', 'ممتاز')}
          </Badge>
        )
      case 'good':
        return (
          <Badge variant="default" className="bg-green-500">
            <ShieldCheck className="w-3 h-3 ml-1" />
            {t('subcontracting.receipt.quality.good', 'جيد')}
          </Badge>
        )
      case 'fair':
        return (
          <Badge variant="secondary" className="bg-amber-100 text-amber-700">
            <ShieldAlert className="w-3 h-3 ml-1" />
            {t('subcontracting.receipt.quality.fair', 'مقبول')}
          </Badge>
        )
      case 'poor':
        return (
          <Badge variant="destructive">
            <ShieldAlert className="w-3 h-3 ml-1" />
            {t('subcontracting.receipt.quality.poor', 'ضعيف')}
          </Badge>
        )
      case 'pending':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <ShieldQuestion className="w-3 h-3 ml-1" />
            {t('subcontracting.receipt.quality.pending', 'قيد المراجعة')}
          </Badge>
        )
      default:
        return <Badge variant="outline">{qualityStatus}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} />
        <DynamicIsland />
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl">
        <ProductivityHero
          badge={t('subcontracting.badge', 'إدارة التصنيع الخارجي')}
          title={t('subcontracting.receipts.title', 'إيصالات الاستلام')}
          type="subcontracting"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-navy">{totalReceipts}</div>
                  <div className="text-sm text-muted-foreground">
                    {t('subcontracting.receipt.stats.total', 'إجمالي الإيصالات')}
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600">{pendingQC}</div>
                  <div className="text-sm text-muted-foreground">
                    {t('subcontracting.receipt.stats.pendingQC', 'بانتظار الفحص')}
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-emerald-600">{completed}</div>
                  <div className="text-sm text-muted-foreground">
                    {t('subcontracting.receipt.stats.completed', 'مكتمل')}
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-purple-600">{thisMonth}</div>
                  <div className="text-sm text-muted-foreground">
                    {t('subcontracting.receipt.stats.thisMonth', 'هذا الشهر')}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Card className="rounded-3xl">
              <CardContent className="p-4">
                <Tabs
                  value={statusFilter}
                  onValueChange={(v) =>
                    setStatusFilter(v as SubcontractingReceiptStatus | 'quality_pending' | 'completed' | 'all')
                  }
                >
                  <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
                    <TabsTrigger value="all">{t('common.all', 'الكل')}</TabsTrigger>
                    <TabsTrigger value="draft">{t('subcontracting.receipt.status.draft', 'مسودة')}</TabsTrigger>
                    <TabsTrigger value="submitted">{t('subcontracting.receipt.status.submitted', 'مقدم')}</TabsTrigger>
                    <TabsTrigger value="quality_pending">
                      {t('subcontracting.receipt.tabs.qualityPending', 'بانتظار الفحص')}
                    </TabsTrigger>
                    <TabsTrigger value="completed">
                      {t('subcontracting.receipt.tabs.completed', 'مكتمل')}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardContent>
            </Card>

            {/* Filters & Actions */}
            <Card className="rounded-3xl">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t(
                        'subcontracting.receipt.searchPlaceholder',
                        'البحث برقم الإيصال أو الأمر أو المورد...'
                      )}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pr-10 rounded-xl"
                    />
                  </div>
                  <Button asChild className="rounded-xl bg-emerald-600 hover:bg-emerald-700">
                    <Link to={ROUTES.dashboard.subcontracting.receipts.create}>
                      <Plus className="w-4 h-4 ml-2" />
                      {t('subcontracting.receipt.create', 'إنشاء إيصال')}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Receipts Table */}
            <Card className="rounded-3xl">
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-6 space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full rounded-xl" />
                    ))}
                  </div>
                ) : error ? (
                  <div className="p-6 text-center text-red-500">
                    {t('common.error', 'حدث خطأ في تحميل البيانات')}
                  </div>
                ) : filteredReceipts.length === 0 ? (
                  <div className="p-12 text-center">
                    <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      {t('subcontracting.receipt.noReceipts', 'لا توجد إيصالات استلام')}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {t('subcontracting.receipt.noReceiptsDesc', 'ابدأ بإنشاء إيصال استلام جديد')}
                    </p>
                    <Button asChild className="rounded-xl">
                      <Link to={ROUTES.dashboard.subcontracting.receipts.create}>
                        <Plus className="w-4 h-4 ml-2" />
                        {t('subcontracting.receipt.create', 'إنشاء إيصال')}
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">
                            {t('subcontracting.receipt.receiptNumber', 'رقم الإيصال')}
                          </TableHead>
                          <TableHead className="text-right">
                            {t('subcontracting.receipt.orderNumber', 'رقم الأمر')}
                          </TableHead>
                          <TableHead className="text-right">
                            {t('subcontracting.receipt.supplier', 'المورد')}
                          </TableHead>
                          <TableHead className="text-right">
                            {t('subcontracting.receipt.date', 'التاريخ')}
                          </TableHead>
                          <TableHead className="text-right">
                            {t('subcontracting.receipt.itemsReceived', 'الأصناف المستلمة')}
                          </TableHead>
                          <TableHead className="text-right">
                            {t('subcontracting.receipt.qualityStatus', 'حالة الجودة')}
                          </TableHead>
                          <TableHead className="text-right">
                            {t('subcontracting.receipt.status', 'الحالة')}
                          </TableHead>
                          <TableHead className="text-right w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredReceipts.map((receipt) => {
                          const qualityStatus = getQualityStatus(receipt)
                          const totalItems = receipt.items.length
                          const totalQty = receipt.totalQty || receipt.items.reduce((sum, item) => sum + item.receivedQty, 0)

                          return (
                            <TableRow
                              key={receipt._id}
                              className="cursor-pointer hover:bg-muted/50"
                              onClick={() => navigate({ to: ROUTES.dashboard.subcontracting.receipts.list + `/${receipt._id}` })}
                            >
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                                    <Package className="w-5 h-5 text-muted-foreground" />
                                  </div>
                                  <div>
                                    <div className="font-medium font-mono">{receipt.receiptNumber}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {t('subcontracting.receipt.id', 'معرف')}: {receipt.receiptId.slice(0, 8)}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="font-medium font-mono">{receipt.orderNumber || '-'}</div>
                              </TableCell>
                              <TableCell>
                                <div className="font-medium">{receipt.supplierName || receipt.supplierId}</div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-muted-foreground" />
                                  <span>{formatDate(receipt.postingDate)}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <PackageCheck className="w-4 h-4 text-muted-foreground" />
                                  <div>
                                    <div className="font-medium">
                                      {totalQty} {t('subcontracting.receipt.units', 'وحدة')}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {totalItems} {t('subcontracting.receipt.items', 'صنف')}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{getQualityBadge(qualityStatus)}</TableCell>
                              <TableCell>{getStatusBadge(receipt.status)}</TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        navigate({ to: ROUTES.dashboard.subcontracting.receipts.list + `/${receipt._id}` })
                                      }}
                                    >
                                      <Eye className="w-4 h-4 ml-2" />
                                      {t('common.view', 'عرض')}
                                    </DropdownMenuItem>
                                    {receipt.status === 'draft' && (
                                      <>
                                        <DropdownMenuItem
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            navigate({ to: ROUTES.dashboard.subcontracting.receipts.list + `/${receipt._id}/edit` })
                                          }}
                                        >
                                          <Edit className="w-4 h-4 ml-2" />
                                          {t('common.edit', 'تعديل')}
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          onClick={(e) => handleSubmit(receipt._id, e)}
                                          disabled={submitReceiptMutation.isPending}
                                        >
                                          <Send className="w-4 h-4 ml-2" />
                                          {t('common.submit', 'تقديم')}
                                        </DropdownMenuItem>
                                      </>
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

          {/* Sidebar */}
          <SubcontractingSidebar />
        </div>
      </Main>
    </>
  )
}
