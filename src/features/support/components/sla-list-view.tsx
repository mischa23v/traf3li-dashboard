/**
 * SLA List View
 * Service Level Agreement management page
 */

import { useState, useMemo } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  Clock,
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Star,
  Timer,
  AlertCircle,
  TrendingUp,
  Shield,
  Zap,
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

import { useSLAs, useDeleteSLA } from '@/hooks/use-support'
import type { ServiceLevelAgreement, TicketPriority } from '@/types/support'
import { SupportSidebar } from './support-sidebar'
import { ROUTES } from '@/constants/routes'

const topNav = [
  { title: 'sidebar.nav.overview', href: ROUTES.dashboard.home },
  { title: 'sidebar.nav.support', href: ROUTES.dashboard.support.list },
  { title: 'support.sla.title', href: ROUTES.dashboard.support.sla.list },
]

export function SLAListView() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  // State
  const [search, setSearch] = useState('')
  const [statusTab, setStatusTab] = useState<'all' | 'active' | 'inactive'>('all')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [slaToDelete, setSlaToDelete] = useState<ServiceLevelAgreement | null>(null)

  // Queries
  const { data: slasData, isLoading, error } = useSLAs()
  const deleteSLAMutation = useDeleteSLA()

  const slas = slasData?.slas || []

  // Filter SLAs based on search and status tab
  const filteredSLAs = useMemo(() => {
    let filtered = slas

    // Filter by status tab
    if (statusTab === 'active') {
      filtered = filtered.filter((sla) => sla.status === 'active')
    } else if (statusTab === 'inactive') {
      filtered = filtered.filter((sla) => sla.status === 'inactive')
    }

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(
        (sla) =>
          sla.name.toLowerCase().includes(searchLower) ||
          sla.nameAr?.toLowerCase().includes(searchLower) ||
          sla.priority.toLowerCase().includes(searchLower)
      )
    }

    return filtered
  }, [slas, statusTab, search])

  // Calculate stats
  const stats = useMemo(() => {
    const totalSLAs = slas.length
    const activeSLAs = slas.filter((sla) => sla.status === 'active').length
    const defaultSLA = slas.find((sla) => sla.isDefault)

    return {
      totalSLAs,
      activeSLAs,
      inactiveSLAs: totalSLAs - activeSLAs,
      defaultSLA,
    }
  }, [slas])

  // Handlers
  const handleDelete = async () => {
    if (!slaToDelete) return
    await deleteSLAMutation.mutateAsync(slaToDelete._id)
    setDeleteDialogOpen(false)
    setSlaToDelete(null)
  }

  const handleViewSLA = (slaId: string) => {
    navigate({ to: `/dashboard/support/sla/${slaId}` })
  }

  const handleEditSLA = (slaId: string) => {
    navigate({ to: `/dashboard/support/sla/${slaId}/edit` })
  }

  // Helper functions
  const getPriorityBadge = (priority: TicketPriority) => {
    switch (priority) {
      case 'urgent':
        return (
          <Badge variant="destructive" className="font-medium">
            <Zap className="w-3 h-3 ml-1" />
            {t('support.priority.urgent', 'عاجل')}
          </Badge>
        )
      case 'high':
        return (
          <Badge variant="default" className="bg-orange-500 hover:bg-orange-600 font-medium">
            <TrendingUp className="w-3 h-3 ml-1" />
            {t('support.priority.high', 'عالي')}
          </Badge>
        )
      case 'medium':
        return (
          <Badge variant="secondary" className="font-medium">
            <AlertCircle className="w-3 h-3 ml-1" />
            {t('support.priority.medium', 'متوسط')}
          </Badge>
        )
      case 'low':
        return (
          <Badge variant="outline" className="font-medium">
            {t('support.priority.low', 'منخفض')}
          </Badge>
        )
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  const getStatusBadge = (status: 'active' | 'inactive') => {
    if (status === 'active') {
      return (
        <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">
          <CheckCircle2 className="w-3 h-3 ml-1" />
          {t('support.sla.status.active', 'نشط')}
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="text-muted-foreground">
        <XCircle className="w-3 h-3 ml-1" />
        {t('support.sla.status.inactive', 'غير نشط')}
      </Badge>
    )
  }

  const formatMinutesToTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} ${t('support.sla.minutes', 'دقيقة')}`
    }
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (mins === 0) {
      return `${hours} ${t('support.sla.hours', 'ساعة')}`
    }
    return `${hours} ${t('support.sla.hours', 'ساعة')} ${mins} ${t('support.sla.minutes', 'دقيقة')}`
  }

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} />
        <DynamicIsland />
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl">
        <ProductivityHero
          badge={t('support.sla.badge', 'اتفاقيات مستوى الخدمة')}
          title={t('support.sla.title', 'إدارة SLA')}
          type="support"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-navy">{stats.totalSLAs}</div>
                      <div className="text-sm text-muted-foreground">
                        {t('support.sla.stats.totalSLAs', 'إجمالي SLAs')}
                      </div>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <Shield className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-emerald-600">{stats.activeSLAs}</div>
                      <div className="text-sm text-muted-foreground">
                        {t('support.sla.stats.activeSLAs', 'SLAs نشطة')}
                      </div>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-amber-600">
                        {stats.defaultSLA ? '1' : '0'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {t('support.sla.stats.defaultSLA', 'SLA افتراضي')}
                      </div>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                      <Star className="h-6 w-6 text-amber-600" />
                    </div>
                  </div>
                  {stats.defaultSLA && (
                    <div className="mt-2 text-xs text-muted-foreground truncate">
                      {stats.defaultSLA.name}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Tabs & Search */}
            <Card className="rounded-3xl">
              <CardContent className="p-4">
                <div className="space-y-4">
                  {/* Tabs */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <Tabs value={statusTab} onValueChange={(v) => setStatusTab(v as any)} className="w-full md:w-auto">
                      <TabsList className="grid w-full md:w-auto grid-cols-3 rounded-xl">
                        <TabsTrigger value="all" className="rounded-lg">
                          {t('support.sla.tabs.all', 'الكل')}
                          {statusTab === 'all' && (
                            <Badge variant="secondary" className="mr-2 rounded-full px-2 py-0 text-xs">
                              {slas.length}
                            </Badge>
                          )}
                        </TabsTrigger>
                        <TabsTrigger value="active" className="rounded-lg">
                          {t('support.sla.tabs.active', 'نشط')}
                          {statusTab === 'active' && (
                            <Badge variant="secondary" className="mr-2 rounded-full px-2 py-0 text-xs">
                              {stats.activeSLAs}
                            </Badge>
                          )}
                        </TabsTrigger>
                        <TabsTrigger value="inactive" className="rounded-lg">
                          {t('support.sla.tabs.inactive', 'غير نشط')}
                          {statusTab === 'inactive' && (
                            <Badge variant="secondary" className="mr-2 rounded-full px-2 py-0 text-xs">
                              {stats.inactiveSLAs}
                            </Badge>
                          )}
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>

                    <Button asChild className="rounded-xl bg-emerald-600 hover:bg-emerald-700">
                      <Link to={ROUTES.dashboard.support.sla.create}>
                        <Plus className="w-4 h-4 ml-2" />
                        {t('support.sla.createSLA', 'إنشاء SLA')}
                      </Link>
                    </Button>
                  </div>

                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t('support.sla.searchPlaceholder', 'البحث عن SLA بالاسم أو الأولوية...')}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pr-10 rounded-xl"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SLAs Table */}
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
                ) : filteredSLAs.length === 0 ? (
                  <div className="p-12 text-center">
                    <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      {t('support.sla.noSLAs', 'لا توجد اتفاقيات SLA')}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {search
                        ? t('support.sla.noSLAsSearch', 'لم يتم العثور على نتائج للبحث')
                        : t('support.sla.noSLAsDesc', 'ابدأ بإنشاء اتفاقية SLA جديدة')}
                    </p>
                    {!search && (
                      <Button asChild className="rounded-xl">
                        <Link to={ROUTES.dashboard.support.sla.create}>
                          <Plus className="w-4 h-4 ml-2" />
                          {t('support.sla.createSLA', 'إنشاء SLA')}
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
                            {t('support.sla.table.name', 'اسم SLA')}
                          </TableHead>
                          <TableHead className="text-right">
                            {t('support.sla.table.priority', 'الأولوية')}
                          </TableHead>
                          <TableHead className="text-right">
                            {t('support.sla.table.firstResponse', 'وقت الاستجابة الأولى')}
                          </TableHead>
                          <TableHead className="text-right">
                            {t('support.sla.table.resolution', 'وقت الحل')}
                          </TableHead>
                          <TableHead className="text-right">
                            {t('support.sla.table.status', 'الحالة')}
                          </TableHead>
                          <TableHead className="text-right w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredSLAs.map((sla) => (
                          <TableRow
                            key={sla._id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => handleViewSLA(sla._id)}
                          >
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div>
                                  <div className="font-medium flex items-center gap-2">
                                    {sla.nameAr || sla.name}
                                    {sla.isDefault && (
                                      <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                                    )}
                                  </div>
                                  {sla.nameAr && (
                                    <div className="text-sm text-muted-foreground">{sla.name}</div>
                                  )}
                                  {sla.supportType && (
                                    <div className="text-xs text-muted-foreground mt-1">
                                      {sla.supportType}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{getPriorityBadge(sla.priority)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-sm">
                                <Timer className="h-3.5 w-3.5 text-muted-foreground" />
                                {formatMinutesToTime(sla.firstResponseMinutes)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-sm">
                                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                {formatMinutesToTime(sla.resolutionMinutes)}
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(sla.status)}</TableCell>
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
                                      handleViewSLA(sla._id)
                                    }}
                                  >
                                    <Eye className="w-4 h-4 ml-2" />
                                    {t('common.view', 'عرض')}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleEditSLA(sla._id)
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
                                      setSlaToDelete(sla)
                                      setDeleteDialogOpen(true)
                                    }}
                                    disabled={sla.isDefault}
                                  >
                                    <Trash2 className="w-4 h-4 ml-2" />
                                    {t('common.delete', 'حذف')}
                                  </DropdownMenuItem>
                                  {sla.isDefault && (
                                    <div className="px-2 py-1 text-xs text-muted-foreground">
                                      {t('support.sla.cannotDeleteDefault', 'لا يمكن حذف SLA الافتراضي')}
                                    </div>
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
          <SupportSidebar />
        </div>
      </Main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('support.sla.deleteConfirmTitle', 'حذف اتفاقية SLA')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                'support.sla.deleteConfirmDesc',
                'هل أنت متأكد من حذف اتفاقية SLA هذه؟ قد يؤثر ذلك على التذاكر المرتبطة بها. لا يمكن التراجع عن هذا الإجراء.'
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
