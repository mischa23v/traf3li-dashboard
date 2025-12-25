/**
 * RFQ (Request for Quotation) List View
 * Comprehensive list page for managing RFQs with suppliers
 */

import { useState, useMemo } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  FileText,
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Users,
  Package,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  MessageSquare,
  AlertCircle,
  Mail,
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { useRfqs, useDeleteRfq } from '@/hooks/use-buying'
import type { RequestForQuotation, RfqStatus, RfqFilters } from '@/types/buying'
import { BuyingSidebar } from './buying-sidebar'
import { format, isPast, parseISO } from 'date-fns'
import { ar } from 'date-fns/locale'

const topNav = [
  { title: 'sidebar.nav.overview', href: '/' },
  { title: 'sidebar.nav.buying', href: '/dashboard/buying' },
  { title: 'buying.rfqs', href: '/dashboard/buying/rfqs' },
]

type TabValue = 'all' | 'draft' | 'submitted' | 'quoted' | 'ordered' | 'expired'

export function RfqListView() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()

  // State
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<TabValue>('all')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [rfqToDelete, setRfqToDelete] = useState<RequestForQuotation | null>(null)

  // Build filters
  const filters: RfqFilters = useMemo(() => {
    const f: RfqFilters = {}
    if (search) f.search = search
    if (activeTab !== 'all') {
      f.status = activeTab as RfqStatus | 'expired'
    }
    return f
  }, [search, activeTab])

  // Queries
  const { data: rfqsData, isLoading, error } = useRfqs(filters)
  const deleteRfqMutation = useDeleteRfq()

  const rfqs = rfqsData?.rfqs || []

  // Calculate stats
  const stats = useMemo(() => {
    const allRfqs = rfqsData?.rfqs || []

    const total = allRfqs.length
    const pending = allRfqs.filter((rfq) => rfq.status === 'submitted').length
    const quoted = allRfqs.filter((rfq) => rfq.status === 'quoted').length
    const expired = allRfqs.filter((rfq) => {
      if (!rfq.validTill) return false
      try {
        return isPast(parseISO(rfq.validTill))
      } catch {
        return false
      }
    }).length

    return { total, pending, quoted, expired }
  }, [rfqsData])

  // Handlers
  const handleDelete = async () => {
    if (!rfqToDelete) return
    await deleteRfqMutation.mutateAsync(rfqToDelete._id)
    setDeleteDialogOpen(false)
    setRfqToDelete(null)
  }

  const getStatusBadge = (rfq: RequestForQuotation) => {
    // Check if expired first
    if (rfq.validTill) {
      try {
        if (isPast(parseISO(rfq.validTill))) {
          return (
            <Badge variant="secondary" className="bg-gray-500 text-white">
              <Clock className="w-3 h-3 ml-1" />
              {t('buying.rfq.status.expired', 'منتهي')}
            </Badge>
          )
        }
      } catch {
        // Invalid date, continue
      }
    }

    // Regular status badges
    switch (rfq.status) {
      case 'draft':
        return (
          <Badge variant="outline">
            <Edit className="w-3 h-3 ml-1" />
            {t('buying.rfq.status.draft', 'مسودة')}
          </Badge>
        )
      case 'submitted':
        return (
          <Badge variant="default" className="bg-blue-600">
            <Send className="w-3 h-3 ml-1" />
            {t('buying.rfq.status.sent', 'مرسل')}
          </Badge>
        )
      case 'quoted':
        return (
          <Badge variant="default" className="bg-emerald-600">
            <MessageSquare className="w-3 h-3 ml-1" />
            {t('buying.rfq.status.quoted', 'تم تقديم عروض')}
          </Badge>
        )
      case 'ordered':
        return (
          <Badge variant="default" className="bg-purple-600">
            <CheckCircle2 className="w-3 h-3 ml-1" />
            {t('buying.rfq.status.ordered', 'تم الطلب')}
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 ml-1" />
            {t('buying.rfq.status.cancelled', 'ملغي')}
          </Badge>
        )
      default:
        return <Badge variant="outline">{rfq.status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString)
      return format(date, 'dd MMM yyyy', {
        locale: i18n.language === 'ar' ? ar : undefined,
      })
    } catch {
      return dateString
    }
  }

  const isExpired = (rfq: RequestForQuotation) => {
    if (!rfq.validTill) return false
    try {
      return isPast(parseISO(rfq.validTill))
    } catch {
      return false
    }
  }

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} />
        <DynamicIsland />
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl">
        <ProductivityHero
          badge={t('buying.rfq.badge', 'طلبات عروض الأسعار')}
          title={t('buying.rfq.title', 'إدارة طلبات عروض الأسعار')}
          type="buying"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-navy">{stats.total}</div>
                  <div className="text-sm text-muted-foreground">
                    {t('buying.rfq.stats.total', 'إجمالي الطلبات')}
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600">{stats.pending}</div>
                  <div className="text-sm text-muted-foreground">
                    {t('buying.rfq.stats.pendingResponse', 'بانتظار الرد')}
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-emerald-600">{stats.quoted}</div>
                  <div className="text-sm text-muted-foreground">
                    {t('buying.rfq.stats.quoted', 'تم تقديم عروض')}
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-gray-600">{stats.expired}</div>
                  <div className="text-sm text-muted-foreground">
                    {t('buying.rfq.stats.expired', 'منتهية')}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs & Filters */}
            <Card className="rounded-3xl">
              <CardContent className="p-4 space-y-4">
                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
                  <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="all">
                      {t('common.all', 'الكل')}
                    </TabsTrigger>
                    <TabsTrigger value="draft">
                      {t('buying.rfq.status.draft', 'مسودة')}
                    </TabsTrigger>
                    <TabsTrigger value="submitted">
                      {t('buying.rfq.status.sent', 'مرسل')}
                    </TabsTrigger>
                    <TabsTrigger value="quoted">
                      {t('buying.rfq.status.quoted', 'عروض')}
                    </TabsTrigger>
                    <TabsTrigger value="ordered">
                      {t('buying.rfq.status.ordered', 'طُلب')}
                    </TabsTrigger>
                    <TabsTrigger value="expired">
                      {t('buying.rfq.status.expired', 'منتهي')}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                {/* Search & Actions */}
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t('buying.rfq.searchPlaceholder', 'البحث برقم الطلب...')}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pr-10 rounded-xl"
                    />
                  </div>
                  <Button asChild className="rounded-xl bg-emerald-600 hover:bg-emerald-700">
                    <Link to="/dashboard/buying/rfqs/create">
                      <Plus className="w-4 h-4 ml-2" />
                      {t('buying.rfq.createRfq', 'إنشاء طلب عرض سعر')}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* RFQs Table */}
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
                ) : rfqs.length === 0 ? (
                  <div className="p-12 text-center">
                    <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      {t('buying.rfq.noRfqs', 'لا توجد طلبات عروض أسعار')}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {t('buying.rfq.noRfqsDesc', 'ابدأ بإنشاء طلب عرض سعر جديد للموردين')}
                    </p>
                    <Button asChild className="rounded-xl">
                      <Link to="/dashboard/buying/rfqs/create">
                        <Plus className="w-4 h-4 ml-2" />
                        {t('buying.rfq.createRfq', 'إنشاء طلب عرض سعر')}
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">
                            {t('buying.rfq.rfqNumber', 'رقم الطلب')}
                          </TableHead>
                          <TableHead className="text-right">
                            {t('buying.rfq.suppliers', 'الموردين')}
                          </TableHead>
                          <TableHead className="text-right">
                            {t('buying.rfq.items', 'الأصناف')}
                          </TableHead>
                          <TableHead className="text-right">
                            {t('buying.rfq.date', 'التاريخ')}
                          </TableHead>
                          <TableHead className="text-right">
                            {t('buying.rfq.deadline', 'الموعد النهائي')}
                          </TableHead>
                          <TableHead className="text-right">
                            {t('buying.rfq.status', 'الحالة')}
                          </TableHead>
                          <TableHead className="text-right w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rfqs.map((rfq) => (
                          <TableRow
                            key={rfq._id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => navigate({ to: `/dashboard/buying/rfqs/${rfq._id}` })}
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                                  <FileText className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                  <div className="font-medium">{rfq.rfqNumber}</div>
                                  {rfq.materialRequestId && (
                                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                                      <Package className="w-3 h-3" />
                                      {rfq.materialRequestId}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-muted-foreground" />
                                <span className="font-medium">{rfq.suppliers.length}</span>
                                {rfq.suppliers.some((s) => s.sendEmail) && (
                                  <Mail className="w-3 h-3 text-blue-500" />
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Package className="w-4 h-4 text-muted-foreground" />
                                <span className="font-medium">{rfq.items.length}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm">{formatDate(rfq.transactionDate)}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {rfq.validTill ? (
                                <div
                                  className={`flex items-center gap-2 ${
                                    isExpired(rfq) ? 'text-red-600' : ''
                                  }`}
                                >
                                  <Clock className="w-4 h-4" />
                                  <span className="text-sm">{formatDate(rfq.validTill)}</span>
                                  {isExpired(rfq) && (
                                    <AlertCircle className="w-4 h-4 text-red-600" />
                                  )}
                                </div>
                              ) : (
                                <span className="text-sm text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>{getStatusBadge(rfq)}</TableCell>
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
                                      navigate({ to: `/dashboard/buying/rfqs/${rfq._id}` })
                                    }}
                                  >
                                    <Eye className="w-4 h-4 ml-2" />
                                    {t('common.view', 'عرض')}
                                  </DropdownMenuItem>
                                  {rfq.status === 'draft' && (
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        navigate({ to: `/dashboard/buying/rfqs/${rfq._id}/edit` })
                                      }}
                                    >
                                      <Edit className="w-4 h-4 ml-2" />
                                      {t('common.edit', 'تعديل')}
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setRfqToDelete(rfq)
                                      setDeleteDialogOpen(true)
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4 ml-2" />
                                    {t('common.delete', 'حذف')}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <BuyingSidebar />
        </div>
      </Main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('buying.rfq.deleteConfirmTitle', 'حذف طلب عرض السعر')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                'buying.rfq.deleteConfirmDesc',
                'هل أنت متأكد من حذف طلب عرض السعر هذا؟ لا يمكن التراجع عن هذا الإجراء.'
              )}
              {rfqToDelete && (
                <div className="mt-2 p-3 bg-muted rounded-lg">
                  <p className="font-medium">{rfqToDelete.rfqNumber}</p>
                  <p className="text-sm text-muted-foreground">
                    {rfqToDelete.suppliers.length} {t('buying.rfq.suppliers', 'موردين')} •{' '}
                    {rfqToDelete.items.length} {t('buying.rfq.items', 'أصناف')}
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel', 'إلغاء')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {t('common.delete', 'حذف')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
