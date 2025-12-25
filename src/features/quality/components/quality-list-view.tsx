/**
 * Quality List View
 * Main quality inspections list page
 */

import { useState, useMemo } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  ClipboardCheck,
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
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

import { useInspections, useDeleteInspection, useQualityStats } from '@/hooks/use-quality'
import type { QualityInspection, QualityFilters, InspectionStatus, InspectionType } from '@/types/quality'
import { QualitySidebar } from './quality-sidebar'

const topNav = [
  { title: 'sidebar.nav.overview', href: '/' },
  { title: 'sidebar.nav.quality', href: '/dashboard/quality' },
]

export function QualityListView() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  // State
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<InspectionStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<InspectionType | 'all'>('all')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [inspectionToDelete, setInspectionToDelete] = useState<QualityInspection | null>(null)

  // Build filters
  const filters: QualityFilters = useMemo(() => {
    const f: QualityFilters = {}
    if (search) f.search = search
    if (statusFilter !== 'all') f.status = statusFilter
    if (typeFilter !== 'all') f.inspectionType = typeFilter
    return f
  }, [search, statusFilter, typeFilter])

  // Queries
  const { data: inspectionsData, isLoading, error } = useInspections(filters)
  const { data: statsData } = useQualityStats()
  const deleteInspectionMutation = useDeleteInspection()

  const inspections = inspectionsData?.inspections || []
  const stats = statsData

  // Handlers
  const handleDelete = async () => {
    if (!inspectionToDelete) return
    await deleteInspectionMutation.mutateAsync(inspectionToDelete._id)
    setDeleteDialogOpen(false)
    setInspectionToDelete(null)
  }

  const getStatusBadge = (status: InspectionStatus) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 ml-1" />{t('quality.status.pending', 'قيد الانتظار')}</Badge>
      case 'accepted':
        return <Badge variant="default" className="bg-emerald-500"><CheckCircle2 className="w-3 h-3 ml-1" />{t('quality.status.accepted', 'مقبول')}</Badge>
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 ml-1" />{t('quality.status.rejected', 'مرفوض')}</Badge>
      case 'partially_accepted':
        return <Badge variant="secondary" className="bg-amber-100 text-amber-700"><AlertTriangle className="w-3 h-3 ml-1" />{t('quality.status.partiallyAccepted', 'مقبول جزئياً')}</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeBadge = (type: InspectionType) => {
    switch (type) {
      case 'incoming':
        return <Badge variant="outline" className="border-blue-500 text-blue-500">{t('quality.type.incoming', 'وارد')}</Badge>
      case 'outgoing':
        return <Badge variant="outline" className="border-green-500 text-green-500">{t('quality.type.outgoing', 'صادر')}</Badge>
      case 'in_process':
        return <Badge variant="outline" className="border-purple-500 text-purple-500">{t('quality.type.inProcess', 'قيد التصنيع')}</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
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
          badge={t('quality.badge', 'إدارة الجودة')}
          title={t('quality.title', 'فحوصات الجودة')}
          type="quality"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-navy">{stats?.totalInspections || 0}</div>
                  <div className="text-sm text-muted-foreground">{t('quality.stats.totalInspections', 'إجمالي الفحوصات')}</div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-emerald-600">{stats?.passRate || 0}%</div>
                  <div className="text-sm text-muted-foreground">{t('quality.stats.passRate', 'نسبة النجاح')}</div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-amber-600">{stats?.pendingInspections || 0}</div>
                  <div className="text-sm text-muted-foreground">{t('quality.stats.pending', 'قيد الانتظار')}</div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600">{stats?.openActions || 0}</div>
                  <div className="text-sm text-muted-foreground">{t('quality.stats.openActions', 'إجراءات مفتوحة')}</div>
                </CardContent>
              </Card>
            </div>

            {/* Filters & Actions */}
            <Card className="rounded-3xl">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t('quality.searchPlaceholder', 'البحث في الفحوصات...')}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pr-10 rounded-xl"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as InspectionStatus | 'all')}>
                    <SelectTrigger className="w-full md:w-40 rounded-xl">
                      <SelectValue placeholder={t('quality.filterByStatus', 'الحالة')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('common.all', 'الكل')}</SelectItem>
                      <SelectItem value="pending">{t('quality.status.pending', 'قيد الانتظار')}</SelectItem>
                      <SelectItem value="accepted">{t('quality.status.accepted', 'مقبول')}</SelectItem>
                      <SelectItem value="rejected">{t('quality.status.rejected', 'مرفوض')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as InspectionType | 'all')}>
                    <SelectTrigger className="w-full md:w-40 rounded-xl">
                      <SelectValue placeholder={t('quality.filterByType', 'النوع')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('common.all', 'الكل')}</SelectItem>
                      <SelectItem value="incoming">{t('quality.type.incoming', 'وارد')}</SelectItem>
                      <SelectItem value="outgoing">{t('quality.type.outgoing', 'صادر')}</SelectItem>
                      <SelectItem value="in_process">{t('quality.type.inProcess', 'قيد التصنيع')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button asChild className="rounded-xl bg-emerald-600 hover:bg-emerald-700">
                    <Link to="/dashboard/quality/create">
                      <Plus className="w-4 h-4 ml-2" />
                      {t('quality.createInspection', 'إنشاء فحص')}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Inspections Table */}
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
                ) : inspections.length === 0 ? (
                  <div className="p-12 text-center">
                    <ClipboardCheck className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">{t('quality.noInspections', 'لا توجد فحوصات')}</h3>
                    <p className="text-muted-foreground mb-4">{t('quality.noInspectionsDesc', 'ابدأ بإنشاء فحص جديد')}</p>
                    <Button asChild className="rounded-xl">
                      <Link to="/dashboard/quality/create">
                        <Plus className="w-4 h-4 ml-2" />
                        {t('quality.createInspection', 'إنشاء فحص')}
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">{t('quality.inspectionNumber', 'رقم الفحص')}</TableHead>
                        <TableHead className="text-right">{t('quality.item', 'الصنف')}</TableHead>
                        <TableHead className="text-right">{t('quality.type', 'النوع')}</TableHead>
                        <TableHead className="text-right">{t('quality.status', 'الحالة')}</TableHead>
                        <TableHead className="text-right w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inspections.map((inspection) => (
                        <TableRow
                          key={inspection._id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => navigate({ to: `/dashboard/quality/${inspection._id}` })}
                        >
                          <TableCell className="font-mono text-sm">{inspection.inspectionNumber}</TableCell>
                          <TableCell>
                            <div className="font-medium">{inspection.itemName || inspection.itemCode}</div>
                            <div className="text-sm text-muted-foreground">{inspection.inspectionDate}</div>
                          </TableCell>
                          <TableCell>{getTypeBadge(inspection.inspectionType)}</TableCell>
                          <TableCell>{getStatusBadge(inspection.status)}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation()
                                  navigate({ to: `/dashboard/quality/${inspection._id}` })
                                }}>
                                  <Eye className="w-4 h-4 ml-2" />
                                  {t('common.view', 'عرض')}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation()
                                  navigate({ to: `/dashboard/quality/${inspection._id}/edit` })
                                }}>
                                  <Edit className="w-4 h-4 ml-2" />
                                  {t('common.edit', 'تعديل')}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setInspectionToDelete(inspection)
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
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <QualitySidebar />
        </div>
      </Main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('quality.deleteConfirmTitle', 'حذف الفحص')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('quality.deleteConfirmDesc', 'هل أنت متأكد من حذف هذا الفحص؟ لا يمكن التراجع عن هذا الإجراء.')}
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
