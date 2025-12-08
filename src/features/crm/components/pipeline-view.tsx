import { useState, useMemo, useEffect } from 'react'
import {
  Plus,
  Users,
  TrendingUp,
  Search,
  Bell,
  AlertCircle,
  GripVertical,
  Phone,
  Mail,
  MoreHorizontal,
  ArrowUpRight,
  DollarSign,
  Building2,
  User,
  Clock,
  Target,
  BarChart3,
  Filter,
  Calendar,
  Star,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Zap,
  TrendingDown,
  Timer,
  ArrowUp,
  ArrowDown,
  Activity,
  Percent,
  Settings,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useLeadsByPipeline,
  usePipelines,
  useMoveLeadToStage,
  useConvertLead,
  useUpdatePipelineStage,
} from '@/hooks/useCrm'
import { ProductivityHero } from '@/components/productivity-hero'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Link } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Progress } from '@/components/ui/progress'
import type { Lead, Pipeline, PipelineStage } from '@/types/crm'
import { formatDistanceToNow, differenceInDays } from 'date-fns'
import { ar } from 'date-fns/locale'
import { SalesSidebar } from './sales-sidebar'
import { PipelineAutomationDialog } from './pipeline-automation-dialog'
import { cn } from '@/lib/utils'
import type { PipelineAutoAction } from '@/types/crm'

// Analytics metric card component
function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  color = 'emerald',
  subtitle,
}: {
  title: string
  value: string | number
  icon: any
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  color?: 'emerald' | 'blue' | 'purple' | 'orange' | 'red'
  subtitle?: string
}) {
  const colorClasses = {
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-slate-500">{title}</p>
            <p className="text-2xl font-bold text-navy">{value}</p>
            {subtitle && (
              <p className="text-xs text-slate-500">{subtitle}</p>
            )}
          </div>
          <div className={cn('p-2 rounded-xl', colorClasses[color])}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
        {trend && trendValue && (
          <div className="mt-2 flex items-center gap-1 text-xs">
            {trend === 'up' && (
              <>
                <ArrowUp className="w-3 h-3 text-emerald-500" />
                <span className="text-emerald-600">{trendValue}</span>
              </>
            )}
            {trend === 'down' && (
              <>
                <ArrowDown className="w-3 h-3 text-red-500" />
                <span className="text-red-600">{trendValue}</span>
              </>
            )}
            {trend === 'neutral' && (
              <span className="text-slate-500">{trendValue}</span>
            )}
            <span className="text-slate-500 me-1">من الشهر الماضي</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Lead card with enhanced info
function LeadCard({
  lead,
  onDragStart,
  onDragEnd,
  isDragging,
  onConvert,
}: {
  lead: Lead
  onDragStart: (e: React.DragEvent, leadId: string) => void
  onDragEnd: () => void
  isDragging: boolean
  onConvert: () => void
}) {
  const daysInStage = differenceInDays(new Date(), new Date(lead.updatedAt || lead.createdAt))
  const isStale = daysInStage > 14
  const isUrgent = lead.intake?.urgency === 'urgent' || lead.intake?.urgency === 'critical'
  const isVIP = lead.isVIP

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, lead._id)}
      onDragEnd={onDragEnd}
      className={cn(
        'bg-white p-4 rounded-xl shadow-sm cursor-grab active:cursor-grabbing border transition-all',
        isDragging ? 'opacity-50 ring-2 ring-emerald-400 border-emerald-300' : 'border-transparent hover:border-emerald-300',
        isStale && !isDragging && 'border-orange-200 bg-orange-50/50',
      )}
    >
      {/* Header with badges */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 text-slate-300" />
          <span className="font-medium text-navy">{lead.displayName}</span>
        </div>
        <div className="flex items-center gap-1">
          {isVIP && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                </TooltipTrigger>
                <TooltipContent>عميل VIP</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {isUrgent && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <AlertTriangle className="w-4 h-4 text-red-500" aria-hidden="true" />
                </TooltipTrigger>
                <TooltipContent>عاجل</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {isStale && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Clock className="w-4 h-4 text-orange-500" aria-hidden="true" />
                </TooltipTrigger>
                <TooltipContent>{daysInStage} يوم في هذه المرحلة</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to={`/dashboard/crm/leads/${lead._id}`}>
                  عرض التفاصيل
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onConvert}>
                <ArrowUpRight className="h-4 w-4 ms-2" />
                تحويل لعميل
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Company */}
      {lead.company && (
        <p className="text-xs text-slate-500 mb-2">{lead.company}</p>
      )}

      {/* Contact info */}
      <div className="space-y-1 text-sm text-slate-500">
        {lead.phone && (
          <div className="flex items-center gap-2">
            <Phone className="h-3 w-3" aria-hidden="true" />
            <span dir="ltr">{lead.phone}</span>
          </div>
        )}
        {lead.email && (
          <div className="flex items-center gap-2 truncate">
            <Mail className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
            <span className="truncate" dir="ltr">{lead.email}</span>
          </div>
        )}
        {lead.organizationId && typeof lead.organizationId === 'object' && (
          <div className="flex items-center gap-2 truncate">
            <Building2 className="h-3 w-3 flex-shrink-0 text-emerald-600" aria-hidden="true" />
            <span className="truncate text-emerald-600">{lead.organizationId.legalName}</span>
          </div>
        )}
        {lead.contactId && typeof lead.contactId === 'object' && (
          <div className="flex items-center gap-2 truncate">
            <User className="h-3 w-3 flex-shrink-0 text-blue-600" aria-hidden="true" />
            <span className="truncate text-blue-600">{lead.contactId.firstName} {lead.contactId.lastName || ''}</span>
          </div>
        )}
      </div>

      {/* Practice area and value */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
        {lead.intake?.practiceArea ? (
          <Badge variant="secondary" className="text-xs">
            {lead.intake.practiceArea === 'corporate' && 'شركات'}
            {lead.intake.practiceArea === 'litigation' && 'تقاضي'}
            {lead.intake.practiceArea === 'labor' && 'عمالي'}
            {lead.intake.practiceArea === 'real_estate' && 'عقارات'}
            {lead.intake.practiceArea === 'family' && 'أسري'}
            {lead.intake.practiceArea === 'criminal' && 'جنائي'}
            {!['corporate', 'litigation', 'labor', 'real_estate', 'family', 'criminal'].includes(lead.intake.practiceArea) && lead.intake.practiceArea}
          </Badge>
        ) : (
          <span />
        )}
        {lead.estimatedValue > 0 && (
          <span className="text-emerald-600 font-semibold text-sm">
            {lead.estimatedValue.toLocaleString('ar-SA')} ر.س
          </span>
        )}
      </div>

      {/* Lead score and probability */}
      {(lead.qualification?.score || lead.probability) && (
        <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
          {lead.qualification?.score && (
            <div className="flex items-center gap-1">
              <Target className="w-3 h-3" />
              <span>نقاط: {lead.qualification.score}</span>
            </div>
          )}
          {lead.probability && (
            <div className="flex items-center gap-1">
              <Percent className="w-3 h-3" />
              <span>{lead.probability}%</span>
            </div>
          )}
        </div>
      )}

      {/* Time ago */}
      <div className="mt-2 text-xs text-slate-500">
        {formatDistanceToNow(new Date(lead.createdAt), {
          addSuffix: true,
          locale: ar,
        })}
      </div>
    </div>
  )
}

export function PipelineView() {
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>('')
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null)
  const [filterSource, setFilterSource] = useState<string>('all')
  const [filterUrgency, setFilterUrgency] = useState<string>('all')
  const [automationDialogOpen, setAutomationDialogOpen] = useState(false)
  const [selectedStageForAutomation, setSelectedStageForAutomation] = useState<PipelineStage | null>(null)

  // Fetch pipelines
  const { data: pipelinesData } = usePipelines()
  const pipelines = pipelinesData?.data || []

  // Fetch leads by pipeline
  const {
    data: pipelineData,
    isLoading,
    isError,
    error,
    refetch,
  } = useLeadsByPipeline(selectedPipelineId || undefined)

  const { mutate: moveToStage } = useMoveLeadToStage()
  const { mutate: convertLead } = useConvertLead()
  const { mutate: updateStage, isPending: isUpdatingStage } = useUpdatePipelineStage()

  const pipeline = pipelineData?.pipeline
  const leadsByStage = pipelineData?.leadsByStage || {}

  // Auto-select default pipeline on load
  useEffect(() => {
    if (!selectedPipelineId && pipelines.length > 0) {
      const defaultPipeline = pipelines.find((p: Pipeline) => p.isDefault)
      setSelectedPipelineId(defaultPipeline?._id || pipelines[0]._id)
    }
  }, [pipelines, selectedPipelineId])

  // Calculate analytics
  const analytics = useMemo(() => {
    const allLeads: Lead[] = Object.values(leadsByStage).flat() as Lead[]

    const totalLeads = allLeads.length
    const totalValue = allLeads.reduce((sum, lead) => sum + (lead.estimatedValue || 0), 0)
    const avgValue = totalLeads > 0 ? totalValue / totalLeads : 0

    // Won leads (in last stage or converted)
    const wonLeads = allLeads.filter(lead => lead.status === 'won' || lead.status === 'converted')
    const lostLeads = allLeads.filter(lead => lead.status === 'lost')
    const conversionRate = totalLeads > 0 ? ((wonLeads.length / totalLeads) * 100).toFixed(1) : '0'

    // Average days to close
    const closedLeads = [...wonLeads, ...lostLeads]
    const avgDaysToClose = closedLeads.length > 0
      ? Math.round(closedLeads.reduce((sum, lead) => {
          const days = differenceInDays(new Date(), new Date(lead.createdAt))
          return sum + days
        }, 0) / closedLeads.length)
      : 0

    // Stale leads (> 14 days in same stage)
    const staleLeads = allLeads.filter(lead => {
      const daysInStage = differenceInDays(new Date(), new Date(lead.updatedAt || lead.createdAt))
      return daysInStage > 14
    })

    // VIP leads
    const vipLeads = allLeads.filter(lead => lead.isVIP)

    // Urgent leads
    const urgentLeads = allLeads.filter(lead =>
      lead.intake?.urgency === 'urgent' || lead.intake?.urgency === 'critical'
    )

    // Leads by source
    const leadsBySource = allLeads.reduce((acc, lead) => {
      const source = lead.source?.type || 'other'
      acc[source] = (acc[source] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Weighted pipeline value
    const weightedValue = allLeads.reduce((sum, lead) => {
      return sum + ((lead.estimatedValue || 0) * (lead.probability || 50) / 100)
    }, 0)

    return {
      totalLeads,
      totalValue,
      avgValue,
      conversionRate,
      avgDaysToClose,
      staleLeads: staleLeads.length,
      vipLeads: vipLeads.length,
      urgentLeads: urgentLeads.length,
      wonLeads: wonLeads.length,
      lostLeads: lostLeads.length,
      leadsBySource,
      weightedValue,
    }
  }, [leadsByStage])

  // Handle drag and drop
  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    setDraggedLeadId(leadId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault()
    if (draggedLeadId) {
      moveToStage({ leadId: draggedLeadId, stageId })
      setDraggedLeadId(null)
    }
  }

  const handleDragEnd = () => {
    setDraggedLeadId(null)
  }

  // Handle opening automation dialog for a stage
  const handleOpenAutomation = (stage: PipelineStage) => {
    setSelectedStageForAutomation(stage)
    setAutomationDialogOpen(true)
  }

  // Handle saving automation settings
  const handleSaveAutomation = async (autoActions: PipelineAutoAction[]) => {
    if (!pipeline || !selectedStageForAutomation) return

    return new Promise<void>((resolve, reject) => {
      updateStage(
        {
          pipelineId: pipeline._id,
          stageId: selectedStageForAutomation.stageId,
          data: { autoActions },
        },
        {
          onSuccess: () => {
            refetch()
            resolve()
          },
          onError: (error) => {
            reject(error)
          },
        }
      )
    })
  }

  const topNav = [
    { title: 'العملاء المحتملين', href: '/dashboard/crm/leads', isActive: false },
    { title: 'مسار المبيعات', href: '/dashboard/crm/pipeline', isActive: true },
    { title: 'الإحالات', href: '/dashboard/crm/referrals', isActive: false },
    { title: 'سجل الأنشطة', href: '/dashboard/crm/activities', isActive: false },
  ]

  // Calculate stage totals
  const getStageTotals = (stageId: string) => {
    const leads = leadsByStage[stageId] || []
    return {
      count: leads.length,
      value: leads.reduce((sum, lead) => sum + (lead.estimatedValue || 0), 0),
      weightedValue: leads.reduce((sum, lead) =>
        sum + ((lead.estimatedValue || 0) * (lead.probability || 50) / 100), 0
      ),
    }
  }

  // Filter leads in stage
  const getFilteredLeads = (stageId: string): Lead[] => {
    let leads = leadsByStage[stageId] || []

    if (filterSource !== 'all') {
      leads = leads.filter(lead => lead.source?.type === filterSource)
    }

    if (filterUrgency !== 'all') {
      leads = leads.filter(lead => lead.intake?.urgency === filterUrgency)
    }

    return leads
  }

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav
          links={topNav}
          className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white"
        />

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>

        <div className="ms-auto flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
            <input
              type="text"
              placeholder="بحث..."
              className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
          </Button>
          <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main
        fluid={true}
        className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-6 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']"
      >
        {/* Header with Pipeline Selector */}
        <ProductivityHero badge="مسار المبيعات" title="مسار المبيعات" type="pipeline" />

        {/* Pipeline Selector */}
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-slate-700">اختر مسار المبيعات:</label>
          <Select value={selectedPipelineId} onValueChange={setSelectedPipelineId}>
            <SelectTrigger className="w-[300px] rounded-xl h-10">
              <SelectValue placeholder="اختر مسار المبيعات" />
            </SelectTrigger>
            <SelectContent>
              {pipelines.length === 0 ? (
                <SelectItem value="" disabled>
                  لا توجد مسارات متاحة
                </SelectItem>
              ) : (
                pipelines.map((p: Pipeline) => (
                  <SelectItem key={p._id} value={p._id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: p.color }}
                      />
                      <span>{p.nameAr || p.name}</span>
                      {p.isDefault && (
                        <Badge variant="outline" className="text-xs">
                          افتراضي
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Analytics Cards */}
        {pipeline && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <MetricCard
              title="إجمالي العملاء"
              value={analytics.totalLeads}
              icon={Users}
              color="blue"
              trend="up"
              trendValue="+12%"
            />
            <MetricCard
              title="القيمة الإجمالية"
              value={`${(analytics.totalValue / 1000).toFixed(0)}K`}
              subtitle={`${analytics.totalValue.toLocaleString('ar-SA')} ر.س`}
              icon={DollarSign}
              color="emerald"
              trend="up"
              trendValue="+8%"
            />
            <MetricCard
              title="القيمة المرجحة"
              value={`${(analytics.weightedValue / 1000).toFixed(0)}K`}
              subtitle="بناءً على الاحتمالية"
              icon={Target}
              color="purple"
            />
            <MetricCard
              title="معدل التحويل"
              value={`${analytics.conversionRate}%`}
              icon={TrendingUp}
              color="emerald"
              trend="up"
              trendValue="+2%"
            />
            <MetricCard
              title="متوسط أيام الإغلاق"
              value={`${analytics.avgDaysToClose}`}
              subtitle="يوم"
              icon={Timer}
              color="orange"
            />
            <MetricCard
              title="تحتاج متابعة"
              value={analytics.staleLeads}
              subtitle={`${analytics.urgentLeads} عاجل`}
              icon={AlertTriangle}
              color={analytics.staleLeads > 5 ? 'red' : 'orange'}
            />
          </div>
        )}

        {/* Quick Stats Row */}
        {pipeline && analytics.totalLeads > 0 && (
          <div className="flex flex-wrap gap-4">
            <Badge variant="outline" className="px-3 py-1.5 gap-2">
              <Star className="w-3 h-3 text-yellow-500" />
              {analytics.vipLeads} عميل VIP
            </Badge>
            <Badge variant="outline" className="px-3 py-1.5 gap-2">
              <CheckCircle className="w-3 h-3 text-emerald-500" />
              {analytics.wonLeads} فاز
            </Badge>
            <Badge variant="outline" className="px-3 py-1.5 gap-2">
              <XCircle className="w-3 h-3 text-red-500" />
              {analytics.lostLeads} خسر
            </Badge>
            <Badge variant="outline" className="px-3 py-1.5 gap-2">
              <Activity className="w-3 h-3 text-blue-500" />
              متوسط القيمة: {analytics.avgValue.toLocaleString('ar-SA')} ر.س
            </Badge>
          </div>
        )}

        {/* Filters */}
        {pipeline && (
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-600" aria-hidden="true" />
              <span className="text-sm text-slate-600">تصفية:</span>
            </div>
            <Select value={filterSource} onValueChange={setFilterSource}>
              <SelectTrigger className="w-[160px] rounded-xl h-9 text-sm">
                <SelectValue placeholder="المصدر" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل المصادر</SelectItem>
                <SelectItem value="website">الموقع</SelectItem>
                <SelectItem value="referral">إحالة</SelectItem>
                <SelectItem value="social_media">وسائل التواصل</SelectItem>
                <SelectItem value="advertising">إعلان</SelectItem>
                <SelectItem value="cold_call">اتصال مباشر</SelectItem>
                <SelectItem value="walk_in">زيارة شخصية</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterUrgency} onValueChange={setFilterUrgency}>
              <SelectTrigger className="w-[140px] rounded-xl h-9 text-sm">
                <SelectValue placeholder="الأولوية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الأولويات</SelectItem>
                <SelectItem value="critical">حرجة</SelectItem>
                <SelectItem value="urgent">عاجلة</SelectItem>
                <SelectItem value="high">عالية</SelectItem>
                <SelectItem value="normal">عادية</SelectItem>
                <SelectItem value="low">منخفضة</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* MAIN GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* MAIN CONTENT */}
          <div className="lg:col-span-2">
            {/* Pipeline Board */}
            {isLoading ? (
              <div className="flex gap-4 overflow-x-auto pb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex-shrink-0 w-80">
                    <Skeleton className="h-12 w-full rounded-t-xl" />
                    <div className="bg-slate-100 p-3 rounded-b-xl space-y-3 min-h-[400px]">
                      {[1, 2, 3].map((j) => (
                        <Skeleton key={j} className="h-32 w-full rounded-xl" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : isError ? (
              <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-red-500" aria-hidden="true" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  حدث خطأ أثناء تحميل مسار المبيعات
                </h3>
                <p className="text-slate-500 mb-4">
                  {error?.message || 'تعذر الاتصال بالخادم'}
                </p>
                <Button
                  onClick={() => refetch()}
                  className="bg-emerald-500 hover:bg-emerald-600"
                >
                  إعادة المحاولة
                </Button>
              </div>
            ) : !pipeline ? (
              <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                    <TrendingUp className="w-8 h-8 text-emerald-500" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  اختر مسار المبيعات
                </h3>
                <p className="text-slate-500 mb-4">
                  اختر مسار مبيعات من القائمة أعلاه لعرض العملاء المحتملين
                </p>
              </div>
            ) : (
              <div
                className="flex gap-4 overflow-x-auto pb-4"
                style={{ direction: 'rtl' }}
              >
                {pipeline.stages.map((stage: PipelineStage, index: number) => {
                  const totals = getStageTotals(stage.stageId)
                  const stageLeads = getFilteredLeads(stage.stageId)
                  const stagePercent = analytics.totalLeads > 0
                    ? Math.round((totals.count / analytics.totalLeads) * 100)
                    : 0

                  return (
                    <div key={stage.stageId} className="flex-shrink-0 w-80">
                      {/* Stage Header */}
                      <div
                        className="p-4 rounded-t-xl text-white font-semibold"
                        style={{ backgroundColor: stage.color }}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <span>{stage.nameAr || stage.name}</span>
                            {stage.autoActions && stage.autoActions.length > 0 && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Zap className="w-4 h-4 text-yellow-300" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {stage.autoActions.length} إجراء تلقائي
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-white/20 text-white border-0">
                              {totals.count}
                            </Badge>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-white/80 hover:text-white hover:bg-white/20"
                                >
                                  <Settings className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleOpenAutomation(stage)}>
                                  <Zap className="h-4 w-4 ms-2 text-emerald-500" />
                                  تكوين الأتمتة
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        {/* Stage progress bar */}
                        <Progress
                          value={stagePercent}
                          className="h-1.5 bg-white/20"
                        />
                      </div>

                      {/* Stage Value */}
                      <div className="bg-slate-100 px-4 py-2 text-xs text-slate-600 border-x border-slate-200 flex justify-between items-center">
                        <span>
                          {totals.value > 0 ? `${totals.value.toLocaleString('ar-SA')} ر.س` : 'لا قيمة'}
                        </span>
                        {totals.weightedValue > 0 && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <span className="text-emerald-600">
                                  ~{totals.weightedValue.toLocaleString('ar-SA')}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>القيمة المرجحة</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>

                      {/* Droppable Area */}
                      <div
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, stage.stageId)}
                        className={cn(
                          'min-h-[400px] p-3 rounded-b-xl border border-t-0 transition-colors',
                          draggedLeadId
                            ? 'bg-emerald-50 border-emerald-200'
                            : 'bg-slate-50 border-slate-200'
                        )}
                      >
                        {stageLeads.length === 0 ? (
                          <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                            اسحب العملاء هنا
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {stageLeads.map((lead: Lead) => (
                              <LeadCard
                                key={lead._id}
                                lead={lead}
                                onDragStart={handleDragStart}
                                onDragEnd={handleDragEnd}
                                isDragging={draggedLeadId === lead._id}
                                onConvert={() => convertLead(lead._id)}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* SIDEBAR */}
          <SalesSidebar context="pipeline" />
        </div>
      </Main>

      {/* Pipeline Automation Dialog */}
      {selectedStageForAutomation && (
        <PipelineAutomationDialog
          open={automationDialogOpen}
          onOpenChange={setAutomationDialogOpen}
          stage={selectedStageForAutomation}
          onSave={handleSaveAutomation}
          isLoading={isUpdatingStage}
        />
      )}
    </>
  )
}
