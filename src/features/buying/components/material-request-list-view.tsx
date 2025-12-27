/**
 * Material Request List View
 * Main material requests list page for Purchase/Transfer/Material Issue/Manufacture requests
 */

import { useState, useMemo } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  ShoppingCart,
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  FileText,
  Package,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  ArrowRightLeft,
  Upload,
  Factory,
  Calendar,
  TrendingUp,
  AlertCircle,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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

import { useMaterialRequests } from '@/hooks/use-buying'
import type { MaterialRequest, MaterialRequestType, MaterialRequestStatus } from '@/types/buying'
import { BuyingSidebar } from './buying-sidebar'
import { ROUTES } from '@/constants/routes'

const topNav = [
  { title: 'sidebar.nav.overview', href: ROUTES.dashboard.home },
  { title: 'sidebar.nav.buying', href: ROUTES.dashboard.buying.list },
  { title: 'buying.materialRequests', href: ROUTES.dashboard.buying.materialRequests.list },
]

export function MaterialRequestListView() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  // State
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<MaterialRequestType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<MaterialRequestStatus | 'all'>('all')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [requestToDelete, setRequestToDelete] = useState<MaterialRequest | null>(null)

  // Build filters
  const filters = useMemo(() => {
    const f: any = {}
    if (search) f.search = search
    if (typeFilter !== 'all') f.requestType = typeFilter
    if (statusFilter !== 'all') f.status = statusFilter
    return f
  }, [search, typeFilter, statusFilter])

  // Queries
  const { data: requestsData, isLoading, error } = useMaterialRequests(filters)

  const requests = requestsData?.requests || []

  // Calculate stats
  const stats = useMemo(() => {
    const today = new Date()
    const urgentDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days from now

    return {
      totalRequests: requests.length,
      pending: requests.filter((r) => r.status === 'draft' || r.status === 'submitted').length,
      urgent: requests.filter((r) => {
        if (!r.requiredDate) return false
        const reqDate = new Date(r.requiredDate)
        return reqDate <= urgentDate && (r.status === 'draft' || r.status === 'submitted')
      }).length,
      completed: requests.filter(
        (r) => r.status === 'ordered' || r.status === 'transferred' || r.status === 'issued'
      ).length,
    }
  }, [requests])

  // Handlers
  const handleDelete = async () => {
    if (!requestToDelete) return
    // TODO: Implement delete mutation
    setDeleteDialogOpen(false)
    setRequestToDelete(null)
  }

  // Get request type badge with icon
  const getTypeBadge = (type: MaterialRequestType) => {
    switch (type) {
      case 'purchase':
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-700">
            <ShoppingCart className="w-3 h-3 ml-1" />
            {t('buying.materialRequest.type.purchase', 'شراء')}
          </Badge>
        )
      case 'transfer':
        return (
          <Badge variant="outline" className="border-purple-500 text-purple-700">
            <ArrowRightLeft className="w-3 h-3 ml-1" />
            {t('buying.materialRequest.type.transfer', 'نقل')}
          </Badge>
        )
      case 'material_issue':
        return (
          <Badge variant="outline" className="border-orange-500 text-orange-700">
            <Upload className="w-3 h-3 ml-1" />
            {t('buying.materialRequest.type.materialIssue', 'صرف مواد')}
          </Badge>
        )
      case 'manufacture':
        return (
          <Badge variant="outline" className="border-emerald-500 text-emerald-700">
            <Factory className="w-3 h-3 ml-1" />
            {t('buying.materialRequest.type.manufacture', 'تصنيع')}
          </Badge>
        )
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  // Get status badge
  const getStatusBadge = (status: MaterialRequestStatus) => {
    switch (status) {
      case 'ordered':
        return (
          <Badge variant="default" className="bg-emerald-500">
            <CheckCircle2 className="w-3 h-3 ml-1" />
            {t('buying.materialRequest.status.ordered', 'تم الطلب')}
          </Badge>
        )
      case 'transferred':
        return (
          <Badge variant="default" className="bg-blue-500">
            <ArrowRightLeft className="w-3 h-3 ml-1" />
            {t('buying.materialRequest.status.transferred', 'تم النقل')}
          </Badge>
        )
      case 'issued':
        return (
          <Badge variant="default" className="bg-purple-500">
            <Upload className="w-3 h-3 ml-1" />
            {t('buying.materialRequest.status.issued', 'تم الصرف')}
          </Badge>
        )
      case 'submitted':
        return (
          <Badge variant="secondary" className="bg-amber-100 text-amber-700">
            <Clock className="w-3 h-3 ml-1" />
            {t('buying.materialRequest.status.submitted', 'مرسل')}
          </Badge>
        )
      case 'draft':
        return (
          <Badge variant="secondary">
            <FileText className="w-3 h-3 ml-1" />
            {t('buying.materialRequest.status.draft', 'مسودة')}
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 ml-1" />
            {t('buying.materialRequest.status.cancelled', 'ملغى')}
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // Check if request is urgent
  const isUrgent = (request: MaterialRequest) => {
    if (!request.requiredDate) return false
    const today = new Date()
    const reqDate = new Date(request.requiredDate)
    const urgentDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    return reqDate <= urgentDate && (request.status === 'draft' || request.status === 'submitted')
  }

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} />
        <DynamicIsland />
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl">
        <ProductivityHero
          badge={t('buying.materialRequest.badge', 'طلبات المواد')}
          title={t('buying.materialRequest.title', 'إدارة طلبات المواد')}
          type="buying"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-navy">{stats.totalRequests}</div>
                  <div className="text-sm text-muted-foreground">
                    {t('buying.materialRequest.stats.total', 'إجمالي الطلبات')}
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
                  <div className="text-sm text-muted-foreground">
                    {t('buying.materialRequest.stats.pending', 'قيد الانتظار')}
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-red-600">{stats.urgent}</div>
                  <div className="text-sm text-muted-foreground">
                    {t('buying.materialRequest.stats.urgent', 'عاجل')}
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-emerald-600">{stats.completed}</div>
                  <div className="text-sm text-muted-foreground">
                    {t('buying.materialRequest.stats.completed', 'مكتملة')}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Status Tabs */}
            <Card className="rounded-3xl">
              <CardContent className="p-4">
                <Tabs
                  value={statusFilter}
                  onValueChange={(v) => setStatusFilter(v as MaterialRequestStatus | 'all')}
                >
                  <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 gap-2">
                    <TabsTrigger value="all" className="rounded-xl">
                      {t('common.all', 'الكل')}
                    </TabsTrigger>
                    <TabsTrigger value="draft" className="rounded-xl">
                      <FileText className="w-4 h-4 ml-2" />
                      {t('buying.materialRequest.status.pending', 'معلقة')}
                    </TabsTrigger>
                    <TabsTrigger value="ordered" className="rounded-xl">
                      <ShoppingCart className="w-4 h-4 ml-2" />
                      {t('buying.materialRequest.status.ordered', 'مطلوبة')}
                    </TabsTrigger>
                    <TabsTrigger value="transferred" className="rounded-xl">
                      <ArrowRightLeft className="w-4 h-4 ml-2" />
                      {t('buying.materialRequest.status.transferred', 'منقولة')}
                    </TabsTrigger>
                    <TabsTrigger value="issued" className="rounded-xl">
                      <Upload className="w-4 h-4 ml-2" />
                      {t('buying.materialRequest.status.issued', 'مصروفة')}
                    </TabsTrigger>
                    <TabsTrigger value="cancelled" className="rounded-xl hidden md:flex">
                      <XCircle className="w-4 h-4 ml-2" />
                      {t('buying.materialRequest.status.cancelled', 'ملغاة')}
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
                        'buying.materialRequest.searchPlaceholder',
                        'البحث برقم طلب المواد...'
                      )}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pr-10 rounded-xl"
                    />
                  </div>
                  <Select
                    value={typeFilter}
                    onValueChange={(v) => setTypeFilter(v as MaterialRequestType | 'all')}
                  >
                    <SelectTrigger className="w-full md:w-48 rounded-xl">
                      <SelectValue
                        placeholder={t('buying.materialRequest.filterByType', 'نوع الطلب')}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('common.all', 'الكل')}</SelectItem>
                      <SelectItem value="purchase">
                        {t('buying.materialRequest.type.purchase', 'شراء')}
                      </SelectItem>
                      <SelectItem value="transfer">
                        {t('buying.materialRequest.type.transfer', 'نقل')}
                      </SelectItem>
                      <SelectItem value="material_issue">
                        {t('buying.materialRequest.type.materialIssue', 'صرف مواد')}
                      </SelectItem>
                      <SelectItem value="manufacture">
                        {t('buying.materialRequest.type.manufacture', 'تصنيع')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Button asChild className="rounded-xl bg-emerald-600 hover:bg-emerald-700">
                    <Link to={ROUTES.dashboard.buying.materialRequests.create}>
                      <Plus className="w-4 h-4 ml-2" />
                      {t('buying.materialRequest.createRequest', 'طلب جديد')}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Material Requests Table */}
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
                ) : requests.length === 0 ? (
                  <div className="p-12 text-center">
                    <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      {t('buying.materialRequest.noRequests', 'لا توجد طلبات مواد')}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {t('buying.materialRequest.noRequestsDesc', 'ابدأ بإنشاء طلب مواد جديد')}
                    </p>
                    <Button asChild className="rounded-xl">
                      <Link to={ROUTES.dashboard.buying.materialRequests.create}>
                        <Plus className="w-4 h-4 ml-2" />
                        {t('buying.materialRequest.createRequest', 'طلب جديد')}
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">
                            {t('buying.materialRequest.mrNumber', 'رقم الطلب')}
                          </TableHead>
                          <TableHead className="text-right">
                            {t('buying.materialRequest.type', 'النوع')}
                          </TableHead>
                          <TableHead className="text-right">
                            {t('buying.materialRequest.requiredBy', 'مطلوب بتاريخ')}
                          </TableHead>
                          <TableHead className="text-right">
                            {t('buying.materialRequest.requestedBy', 'طالب بواسطة')}
                          </TableHead>
                          <TableHead className="text-right">
                            {t('buying.materialRequest.totalQty', 'إجمالي الكمية')}
                          </TableHead>
                          <TableHead className="text-right">
                            {t('buying.materialRequest.status', 'الحالة')}
                          </TableHead>
                          <TableHead className="text-right w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {requests.map((request) => (
                          <TableRow
                            key={request._id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() =>
                              navigate({ to: ROUTES.dashboard.buying.materialRequests.detail(request._id) })
                            }
                          >
                            <TableCell className="font-mono text-sm font-medium">
                              <div className="flex items-center gap-2">
                                {request.mrNumber}
                                {isUrgent(request) && (
                                  <AlertCircle className="w-4 h-4 text-red-500" />
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{getTypeBadge(request.requestType)}</TableCell>
                            <TableCell className="text-sm">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                {formatDate(request.requiredDate)}
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">
                              {request.requestedBy || '-'}
                            </TableCell>
                            <TableCell className="font-mono font-medium">
                              {request.totalQty.toLocaleString('ar-SA', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </TableCell>
                            <TableCell>{getStatusBadge(request.status)}</TableCell>
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
                                      navigate({
                                        to: ROUTES.dashboard.buying.materialRequests.detail(request._id),
                                      })
                                    }}
                                  >
                                    <Eye className="w-4 h-4 ml-2" />
                                    {t('common.view', 'عرض')}
                                  </DropdownMenuItem>
                                  {request.status === 'draft' && (
                                    <>
                                      <DropdownMenuItem
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          navigate({
                                            to: ROUTES.dashboard.buying.materialRequests.detail(request._id),
                                          })
                                        }}
                                      >
                                        <Edit className="w-4 h-4 ml-2" />
                                        {t('common.edit', 'تعديل')}
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        className="text-red-600"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setRequestToDelete(request)
                                          setDeleteDialogOpen(true)
                                        }}
                                      >
                                        <Trash2 className="w-4 h-4 ml-2" />
                                        {t('common.delete', 'حذف')}
                                      </DropdownMenuItem>
                                    </>
                                  )}
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
              {t('buying.materialRequest.deleteConfirmTitle', 'حذف طلب المواد')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                'buying.materialRequest.deleteConfirmDesc',
                'هل أنت متأكد من حذف هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.'
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel', 'إلغاء')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              {t('common.delete', 'حذف')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
