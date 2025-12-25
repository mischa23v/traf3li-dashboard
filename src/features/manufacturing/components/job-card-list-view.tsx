/**
 * Job Card List View
 * Job cards list page with tabs, filters, and actions
 */

import { useState, useMemo } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  ClipboardList,
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  PlayCircle,
  XCircle,
  Circle,
  Factory,
  Settings,
  PauseCircle,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

import {
  useJobCards,
  useStartJobCard,
  useCompleteJobCard,
  useWorkstations,
  useManufacturingStats
} from '@/hooks/use-manufacturing'
import type { JobCard, JobCardStatus } from '@/types/manufacturing'
import { ManufacturingSidebar } from './manufacturing-sidebar'

const topNav = [
  { title: 'sidebar.nav.overview', href: '/' },
  { title: 'sidebar.nav.manufacturing', href: '/dashboard/manufacturing' },
  { title: 'manufacturing.jobCards', href: '/dashboard/manufacturing/job-cards' },
]

type TabValue = 'all' | 'open' | 'work_in_progress' | 'completed' | 'cancelled'

export function JobCardListView() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  // State
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<TabValue>('all')
  const [workstationFilter, setWorkstationFilter] = useState<string>('all')
  const [startDialogOpen, setStartDialogOpen] = useState(false)
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false)
  const [jobCardToStart, setJobCardToStart] = useState<JobCard | null>(null)
  const [jobCardToComplete, setJobCardToComplete] = useState<JobCard | null>(null)
  const [completedQty, setCompletedQty] = useState<string>('')

  // Build filters based on active tab
  const filters = useMemo(() => {
    const f: { status?: JobCardStatus; workOrderId?: string } = {}
    if (activeTab !== 'all') {
      f.status = activeTab as JobCardStatus
    }
    return f
  }, [activeTab])

  // Queries
  const { data: jobCardsData, isLoading, error } = useJobCards(filters)
  const { data: workstationsData } = useWorkstations({ status: 'active' })
  const { data: statsData } = useManufacturingStats()

  // Mutations
  const startJobCardMutation = useStartJobCard()
  const completeJobCardMutation = useCompleteJobCard()

  const allJobCards = jobCardsData?.jobCards || []
  const workstations = workstationsData?.workstations || []

  // Filter job cards by search and workstation
  const filteredJobCards = useMemo(() => {
    let filtered = allJobCards

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(
        (card) =>
          card.jobCardNumber?.toLowerCase().includes(searchLower) ||
          card.workOrderNumber?.toLowerCase().includes(searchLower) ||
          card.operation?.toLowerCase().includes(searchLower)
      )
    }

    // Filter by workstation
    if (workstationFilter !== 'all') {
      filtered = filtered.filter((card) => card.workstation === workstationFilter)
    }

    return filtered
  }, [allJobCards, search, workstationFilter])

  // Stats calculations
  const totalJobCards = allJobCards.length
  const openJobCards = allJobCards.filter((card) => card.status === 'open').length
  const inProgressJobCards = allJobCards.filter((card) => card.status === 'work_in_progress').length

  // Calculate completed today (within last 24 hours)
  const completedTodayJobCards = allJobCards.filter((card) => {
    if (card.status !== 'completed' || !card.completedTime) return false
    const completedDate = new Date(card.completedTime)
    const now = new Date()
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    return completedDate >= twentyFourHoursAgo
  }).length

  // Handlers
  const handleStartJobCard = async () => {
    if (!jobCardToStart) return
    await startJobCardMutation.mutateAsync(jobCardToStart._id)
    setStartDialogOpen(false)
    setJobCardToStart(null)
  }

  const handleCompleteJobCard = async () => {
    if (!jobCardToComplete || !completedQty) return
    const qty = parseFloat(completedQty)
    if (isNaN(qty) || qty <= 0) return

    await completeJobCardMutation.mutateAsync({
      id: jobCardToComplete._id,
      completedQty: qty,
    })
    setCompleteDialogOpen(false)
    setJobCardToComplete(null)
    setCompletedQty('')
  }

  const getStatusBadge = (status: JobCardStatus) => {
    switch (status) {
      case 'draft':
        return (
          <Badge variant="outline">
            <Clock className="w-3 h-3 ml-1" />
            {t('manufacturing.jobCard.status.draft', 'مسودة')}
          </Badge>
        )
      case 'open':
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            <Circle className="w-3 h-3 ml-1" />
            {t('manufacturing.jobCard.status.open', 'مفتوحة')}
          </Badge>
        )
      case 'work_in_progress':
        return (
          <Badge variant="default" className="bg-amber-500">
            <PlayCircle className="w-3 h-3 ml-1" />
            {t('manufacturing.jobCard.status.workInProgress', 'قيد التنفيذ')}
          </Badge>
        )
      case 'completed':
        return (
          <Badge variant="default" className="bg-emerald-500">
            <CheckCircle2 className="w-3 h-3 ml-1" />
            {t('manufacturing.jobCard.status.completed', 'مكتملة')}
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 ml-1" />
            {t('manufacturing.jobCard.status.cancelled', 'ملغية')}
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const canStartJobCard = (jobCard: JobCard) => {
    return jobCard.status === 'open'
  }

  const canCompleteJobCard = (jobCard: JobCard) => {
    return jobCard.status === 'work_in_progress'
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
          title={t('manufacturing.jobCard.title', 'بطاقات العمل')}
          type="manufacturing"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-navy">{totalJobCards}</div>
                  <div className="text-sm text-muted-foreground">
                    {t('manufacturing.jobCard.stats.totalJobCards', 'إجمالي بطاقات العمل')}
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600">{openJobCards}</div>
                  <div className="text-sm text-muted-foreground">
                    {t('manufacturing.jobCard.stats.open', 'مفتوحة')}
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-amber-600">{inProgressJobCards}</div>
                  <div className="text-sm text-muted-foreground">
                    {t('manufacturing.jobCard.stats.inProgress', 'قيد التنفيذ')}
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-emerald-600">{completedTodayJobCards}</div>
                  <div className="text-sm text-muted-foreground">
                    {t('manufacturing.jobCard.stats.completedToday', 'مكتملة اليوم')}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Card className="rounded-3xl">
              <CardContent className="p-4">
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
                  <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
                    <TabsTrigger value="all">
                      <Circle className="w-3 h-3 ml-1" />
                      {t('common.all', 'الكل')}
                    </TabsTrigger>
                    <TabsTrigger value="open">
                      <Circle className="w-3 h-3 ml-1" />
                      {t('manufacturing.jobCard.tabs.open', 'مفتوحة')}
                    </TabsTrigger>
                    <TabsTrigger value="work_in_progress">
                      <PlayCircle className="w-3 h-3 ml-1" />
                      {t('manufacturing.jobCard.tabs.workInProgress', 'قيد التنفيذ')}
                    </TabsTrigger>
                    <TabsTrigger value="completed">
                      <CheckCircle2 className="w-3 h-3 ml-1" />
                      {t('manufacturing.jobCard.tabs.completed', 'مكتملة')}
                    </TabsTrigger>
                    <TabsTrigger value="cancelled">
                      <XCircle className="w-3 h-3 ml-1" />
                      {t('manufacturing.jobCard.tabs.cancelled', 'ملغية')}
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
                        'manufacturing.jobCard.searchPlaceholder',
                        'البحث برقم البطاقة أو أمر العمل...'
                      )}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pr-10 rounded-xl"
                    />
                  </div>
                  <Select value={workstationFilter} onValueChange={setWorkstationFilter}>
                    <SelectTrigger className="w-full md:w-48 rounded-xl">
                      <SelectValue placeholder={t('manufacturing.jobCard.filterByWorkstation', 'محطة العمل')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('common.all', 'الكل')}</SelectItem>
                      {workstations.map((ws) => (
                        <SelectItem key={ws._id} value={ws.workstationName}>
                          {ws.workstationName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button asChild className="rounded-xl bg-emerald-600 hover:bg-emerald-700">
                    <Link to="/dashboard/manufacturing/job-cards/create">
                      <Plus className="w-4 h-4 ml-2" />
                      {t('manufacturing.jobCard.createJobCard', 'إنشاء بطاقة عمل')}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Job Cards Table */}
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
                ) : filteredJobCards.length === 0 ? (
                  <div className="p-12 text-center">
                    <ClipboardList className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      {search || workstationFilter !== 'all'
                        ? t('manufacturing.jobCard.noSearchResults', 'لا توجد نتائج بحث')
                        : t('manufacturing.jobCard.noJobCards', 'لا توجد بطاقات عمل')}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {search || workstationFilter !== 'all'
                        ? t('manufacturing.jobCard.tryDifferentSearch', 'جرب مصطلح بحث آخر أو فلتر مختلف')
                        : t('manufacturing.jobCard.noJobCardsDesc', 'ابدأ بإنشاء بطاقة عمل جديدة')}
                    </p>
                    {!search && workstationFilter === 'all' && (
                      <Button asChild className="rounded-xl">
                        <Link to="/dashboard/manufacturing/job-cards/create">
                          <Plus className="w-4 h-4 ml-2" />
                          {t('manufacturing.jobCard.createJobCard', 'إنشاء بطاقة عمل')}
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
                            {t('manufacturing.jobCard.jobCardNumber', 'رقم البطاقة')}
                          </TableHead>
                          <TableHead className="text-right">
                            {t('manufacturing.jobCard.workOrder', 'أمر العمل')}
                          </TableHead>
                          <TableHead className="text-right">
                            {t('manufacturing.jobCard.operation', 'العملية')}
                          </TableHead>
                          <TableHead className="text-right">
                            {t('manufacturing.jobCard.workstation', 'محطة العمل')}
                          </TableHead>
                          <TableHead className="text-right">
                            {t('manufacturing.jobCard.forQuantity', 'الكمية المطلوبة')}
                          </TableHead>
                          <TableHead className="text-right">
                            {t('manufacturing.jobCard.completedQty', 'الكمية المنجزة')}
                          </TableHead>
                          <TableHead className="text-right">
                            {t('manufacturing.jobCard.status', 'الحالة')}
                          </TableHead>
                          <TableHead className="text-right w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredJobCards.map((jobCard) => (
                          <TableRow
                            key={jobCard._id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => navigate({ to: `/dashboard/manufacturing/job-cards/${jobCard._id}` })}
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                                  <ClipboardList className="w-5 h-5 text-muted-foreground" />
                                </div>
                                <div>
                                  <div className="font-medium font-mono">{jobCard.jobCardNumber}</div>
                                  {jobCard.employeeName && (
                                    <div className="text-xs text-muted-foreground">
                                      {jobCard.employeeName}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium font-mono">
                                {jobCard.workOrderNumber || jobCard.workOrderId}
                              </div>
                              {jobCard.itemName && (
                                <div className="text-xs text-muted-foreground">{jobCard.itemName}</div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{jobCard.operation}</div>
                              {jobCard.timeInMins && (
                                <div className="text-xs text-muted-foreground">
                                  {jobCard.timeInMins} {t('manufacturing.jobCard.mins', 'دقيقة')}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              {jobCard.workstation ? (
                                <Badge variant="outline" className="font-mono">
                                  <Settings className="w-3 h-3 ml-1" />
                                  {jobCard.workstation}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground text-sm">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <span className="font-mono font-medium">{jobCard.forQuantity}</span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-medium">{jobCard.completedQty}</span>
                                <span className="text-xs text-muted-foreground">
                                  ({Math.round((jobCard.completedQty / jobCard.forQuantity) * 100)}%)
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(jobCard.status)}</TableCell>
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
                                      navigate({ to: `/dashboard/manufacturing/job-cards/${jobCard._id}` })
                                    }}
                                  >
                                    <Eye className="w-4 h-4 ml-2" />
                                    {t('common.view', 'عرض')}
                                  </DropdownMenuItem>
                                  {canStartJobCard(jobCard) && (
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setJobCardToStart(jobCard)
                                        setStartDialogOpen(true)
                                      }}
                                    >
                                      <PlayCircle className="w-4 h-4 ml-2" />
                                      {t('manufacturing.jobCard.start', 'بدء')}
                                    </DropdownMenuItem>
                                  )}
                                  {canCompleteJobCard(jobCard) && (
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setJobCardToComplete(jobCard)
                                        setCompletedQty(jobCard.forQuantity.toString())
                                        setCompleteDialogOpen(true)
                                      }}
                                    >
                                      <CheckCircle2 className="w-4 h-4 ml-2" />
                                      {t('manufacturing.jobCard.complete', 'إكمال')}
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      navigate({ to: `/dashboard/manufacturing/job-cards/${jobCard._id}/edit` })
                                    }}
                                  >
                                    <Edit className="w-4 h-4 ml-2" />
                                    {t('common.edit', 'تعديل')}
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

      {/* Start Job Card Dialog */}
      <AlertDialog open={startDialogOpen} onOpenChange={setStartDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('manufacturing.jobCard.startConfirmTitle', 'بدء بطاقة العمل')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                'manufacturing.jobCard.startConfirmDesc',
                'هل أنت متأكد من بدء هذه البطاقة؟ سيتم تسجيل وقت البدء وتحديث حالة البطاقة إلى "قيد التنفيذ".'
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel', 'إلغاء')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStartJobCard}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <PlayCircle className="w-4 h-4 ml-2" />
              {t('manufacturing.jobCard.start', 'بدء')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Complete Job Card Dialog */}
      <Dialog open={completeDialogOpen} onOpenChange={setCompleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t('manufacturing.jobCard.completeTitle', 'إكمال بطاقة العمل')}
            </DialogTitle>
            <DialogDescription>
              {t(
                'manufacturing.jobCard.completeDesc',
                'أدخل الكمية المنجزة لإكمال بطاقة العمل. سيتم تسجيل وقت الإكمال.'
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="completedQty">
                {t('manufacturing.jobCard.completedQty', 'الكمية المنجزة')}
              </Label>
              <Input
                id="completedQty"
                type="number"
                value={completedQty}
                onChange={(e) => setCompletedQty(e.target.value)}
                placeholder={t('manufacturing.jobCard.enterCompletedQty', 'أدخل الكمية المنجزة')}
                className="mt-2"
                min="0"
                step="0.01"
              />
              {jobCardToComplete && (
                <p className="text-sm text-muted-foreground mt-2">
                  {t('manufacturing.jobCard.forQuantity', 'الكمية المطلوبة')}: {jobCardToComplete.forQuantity}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompleteDialogOpen(false)}>
              {t('common.cancel', 'إلغاء')}
            </Button>
            <Button
              onClick={handleCompleteJobCard}
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={!completedQty || parseFloat(completedQty) <= 0}
            >
              <CheckCircle2 className="w-4 h-4 ml-2" />
              {t('manufacturing.jobCard.complete', 'إكمال')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
