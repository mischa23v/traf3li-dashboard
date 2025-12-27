/**
 * Workstation List View
 * Workstations list page with tabs, filters, and actions
 */

import { useState, useMemo } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  Cog,
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Circle,
  Activity,
  DollarSign,
  Clock,
  Zap,
  TrendingUp,
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

import { useWorkstations, useDeleteWorkstation, useManufacturingStats } from '@/hooks/use-manufacturing'
import type { Workstation } from '@/types/manufacturing'
import { ManufacturingSidebar } from './manufacturing-sidebar'
import { ROUTES } from '@/constants/routes'

const topNav = [
  { title: 'sidebar.nav.overview', href: ROUTES.dashboard.home },
  { title: 'sidebar.nav.manufacturing', href: ROUTES.dashboard.manufacturing.list },
  { title: 'manufacturing.workstations', href: ROUTES.dashboard.manufacturing.workstations.list },
]

type TabValue = 'all' | 'active' | 'inactive'

export function WorkstationListView() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  // State
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<TabValue>('all')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [workstationToDelete, setWorkstationToDelete] = useState<Workstation | null>(null)

  // Build filters based on active tab
  const filters = useMemo(() => {
    const f: { status?: 'active' | 'inactive' } = {}
    if (activeTab === 'active') f.status = 'active'
    if (activeTab === 'inactive') f.status = 'inactive'
    return f
  }, [activeTab])

  // Queries
  const { data: workstationsData, isLoading, error } = useWorkstations(filters)
  const { data: statsData } = useManufacturingStats()
  const deleteWorkstationMutation = useDeleteWorkstation()

  const allWorkstations = workstationsData?.workstations || []

  // Filter workstations by search
  const filteredWorkstations = useMemo(() => {
    if (!search) return allWorkstations
    const searchLower = search.toLowerCase()
    return allWorkstations.filter(
      (workstation) =>
        workstation.name?.toLowerCase().includes(searchLower) ||
        workstation.nameAr?.toLowerCase().includes(searchLower) ||
        workstation.workstationType?.toLowerCase().includes(searchLower) ||
        workstation.workstationId?.toLowerCase().includes(searchLower)
    )
  }, [allWorkstations, search])

  // Stats calculations
  const totalWorkstations = allWorkstations.length
  const activeWorkstations = allWorkstations.filter((ws) => ws.status === 'active').length
  const inactiveWorkstations = totalWorkstations - activeWorkstations

  // Calculate average utilization rate (mock calculation - in real app would come from job cards/work orders)
  const utilizationRate = totalWorkstations > 0
    ? Math.round((activeWorkstations / totalWorkstations) * 100)
    : 0

  // Calculate total production capacity
  const totalCapacity = allWorkstations.reduce((sum, ws) => sum + (ws.productionCapacity || 0), 0)

  // Calculate average hour rate
  const avgHourRate = allWorkstations.length > 0
    ? allWorkstations.reduce((sum, ws) => sum + (ws.hourRate || 0), 0) / allWorkstations.length
    : 0

  // Handlers
  const handleDelete = async () => {
    if (!workstationToDelete) return
    await deleteWorkstationMutation.mutateAsync(workstationToDelete._id)
    setDeleteDialogOpen(false)
    setWorkstationToDelete(null)
  }

  const formatCurrency = (amount: number, currency: string = 'SAR') => {
    return new Intl.NumberFormat('ar-SA', { style: 'currency', currency }).format(amount)
  }

  const getStatusBadge = (status: 'active' | 'inactive') => {
    if (status === 'active') {
      return (
        <Badge variant="default" className="bg-emerald-500">
          <CheckCircle2 className="w-3 h-3 ml-1" />
          {t('common.active', 'نشط')}
        </Badge>
      )
    }
    return (
      <Badge variant="secondary" className="bg-gray-100 text-gray-700">
        <XCircle className="w-3 h-3 ml-1" />
        {t('common.inactive', 'غير نشط')}
      </Badge>
    )
  }

  // Calculate working hours (8 hours standard, can be customized)
  const getWorkingHours = (workstation: Workstation) => {
    // In a real app, this would come from workstation configuration
    // For now, we'll use a standard 8-hour workday for active workstations
    return workstation.status === 'active' ? '8 ساعات/يوم' : '-'
  }

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} />
        <DynamicIsland />
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl">
        <ProductivityHero
          badge={t('manufacturing.badge', 'إدارة التصنيع')}
          title={t('manufacturing.workstations.title', 'محطات العمل')}
          type="manufacturing"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Cog className="w-4 h-4 text-navy" />
                  </div>
                  <div className="text-2xl font-bold text-navy">{totalWorkstations}</div>
                  <div className="text-sm text-muted-foreground">
                    {t('manufacturing.workstations.stats.total', 'إجمالي محطات العمل')}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-bold text-emerald-600">{activeWorkstations}</div>
                  <div className="text-sm text-muted-foreground">
                    {t('manufacturing.workstations.stats.active', 'نشطة')}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-blue-600">{utilizationRate}%</div>
                  <div className="text-sm text-muted-foreground">
                    {t('manufacturing.workstations.stats.utilization', 'معدل الاستخدام')}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold text-purple-600">{totalCapacity}</div>
                  <div className="text-sm text-muted-foreground">
                    {t('manufacturing.workstations.stats.capacity', 'الطاقة الإنتاجية')}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Card className="rounded-3xl">
              <CardContent className="p-4">
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
                  <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
                    <TabsTrigger value="all">
                      <Circle className="w-3 h-3 ml-1" />
                      {t('common.all', 'الكل')}
                    </TabsTrigger>
                    <TabsTrigger value="active">
                      <CheckCircle2 className="w-3 h-3 ml-1" />
                      {t('manufacturing.workstations.tabs.active', 'نشطة')}
                    </TabsTrigger>
                    <TabsTrigger value="inactive">
                      <XCircle className="w-3 h-3 ml-1" />
                      {t('manufacturing.workstations.tabs.inactive', 'غير نشطة')}
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
                        'manufacturing.workstations.searchPlaceholder',
                        'البحث باسم محطة العمل أو النوع...'
                      )}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pr-10 rounded-xl"
                    />
                  </div>
                  <Button asChild className="rounded-xl bg-emerald-600 hover:bg-emerald-700">
                    <Link to={ROUTES.dashboard.manufacturing.workstations.create}>
                      <Plus className="w-4 h-4 ml-2" />
                      {t('manufacturing.workstations.createWorkstation', 'إنشاء محطة عمل')}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Workstations Table */}
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
                ) : filteredWorkstations.length === 0 ? (
                  <div className="p-12 text-center">
                    <Cog className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      {search
                        ? t('manufacturing.workstations.noSearchResults', 'لا توجد نتائج بحث')
                        : t('manufacturing.workstations.noWorkstations', 'لا توجد محطات عمل')}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {search
                        ? t('manufacturing.workstations.tryDifferentSearch', 'جرب مصطلح بحث آخر')
                        : t('manufacturing.workstations.noWorkstationsDesc', 'ابدأ بإنشاء محطة عمل جديدة')}
                    </p>
                    {!search && (
                      <Button asChild className="rounded-xl">
                        <Link to={ROUTES.dashboard.manufacturing.workstations.create}>
                          <Plus className="w-4 h-4 ml-2" />
                          {t('manufacturing.workstations.createWorkstation', 'إنشاء محطة عمل')}
                        </Link>
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">
                            {t('manufacturing.workstations.workstationName', 'اسم محطة العمل')}
                          </TableHead>
                          <TableHead className="text-right">
                            {t('manufacturing.workstations.workstationType', 'نوع المحطة')}
                          </TableHead>
                          <TableHead className="text-right">
                            {t('manufacturing.workstations.productionCapacity', 'الطاقة الإنتاجية')}
                          </TableHead>
                          <TableHead className="text-right">
                            {t('manufacturing.workstations.hourRate', 'تكلفة الساعة')}
                          </TableHead>
                          <TableHead className="text-right">
                            {t('manufacturing.workstations.workingHours', 'ساعات العمل')}
                          </TableHead>
                          <TableHead className="text-right">
                            {t('manufacturing.workstations.status', 'الحالة')}
                          </TableHead>
                          <TableHead className="text-right w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredWorkstations.map((workstation) => (
                          <TableRow
                            key={workstation._id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => navigate({ to: `/dashboard/manufacturing/workstations/${workstation._id}` })}
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                                  <Cog className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <div className="font-medium">{workstation.nameAr || workstation.name}</div>
                                  <div className="text-xs text-muted-foreground font-mono">
                                    {workstation.workstationId}
                                  </div>
                                </div>
                              </div>
                            </TableCell>

                            <TableCell>
                              {workstation.workstationType ? (
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                  <Activity className="w-3 h-3 ml-1" />
                                  {workstation.workstationType}
                                </Badge>
                              ) : (
                                <span className="text-sm text-muted-foreground">-</span>
                              )}
                            </TableCell>

                            <TableCell>
                              {workstation.productionCapacity ? (
                                <div className="flex items-center gap-2">
                                  <TrendingUp className="w-4 h-4 text-purple-600" />
                                  <span className="font-mono font-medium">
                                    {workstation.productionCapacity}
                                  </span>
                                  <span className="text-xs text-muted-foreground">وحدة/يوم</span>
                                </div>
                              ) : (
                                <span className="text-sm text-muted-foreground">-</span>
                              )}
                            </TableCell>

                            <TableCell>
                              {workstation.hourRate ? (
                                <div className="flex items-center gap-2">
                                  <DollarSign className="w-4 h-4 text-emerald-600" />
                                  <span className="font-medium">
                                    {formatCurrency(workstation.hourRate)}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-sm text-muted-foreground">-</span>
                              )}
                            </TableCell>

                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-blue-600" />
                                <span className="text-sm">{getWorkingHours(workstation)}</span>
                              </div>
                            </TableCell>

                            <TableCell>
                              {getStatusBadge(workstation.status)}
                            </TableCell>

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
                                      navigate({ to: `/dashboard/manufacturing/workstations/${workstation._id}` })
                                    }}
                                  >
                                    <Eye className="w-4 h-4 ml-2" />
                                    {t('common.view', 'عرض')}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      navigate({ to: `/dashboard/manufacturing/workstations/${workstation._id}/edit` })
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
                                      setWorkstationToDelete(workstation)
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
          <ManufacturingSidebar />
        </div>
      </Main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('manufacturing.workstations.deleteConfirmTitle', 'حذف محطة العمل')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                'manufacturing.workstations.deleteConfirmDesc',
                'هل أنت متأكد من حذف محطة العمل هذه؟ لا يمكن التراجع عن هذا الإجراء. قد يؤثر هذا على قوائم المواد وأوامر العمل المرتبطة.'
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
