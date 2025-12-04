import { useState, useMemo } from 'react'
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
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useLeadsByPipeline,
  usePipelines,
  useMoveLeadToStage,
  useConvertLead,
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
} from '@/components/ui/dropdown-menu'
import type { Lead, Pipeline, PipelineStage } from '@/types/crm'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'

export function PipelineView() {
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>('')
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null)

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

  const pipeline = pipelineData?.pipeline
  const leadsByStage = pipelineData?.leadsByStage || {}

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
    }
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

        <div className="ms-auto flex items-center space-x-4">
          <div className="relative hidden md:block">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="بحث..."
              className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pr-9 pl-4 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
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
        <ProductivityHero badge="مسار المبيعات" title="مسار المبيعات" type="pipeline" hideButtons={true}>
          <div className="flex items-center gap-4">
            <Select
              value={selectedPipelineId}
              onValueChange={setSelectedPipelineId}
            >
              <SelectTrigger className="w-[200px] rounded-xl bg-white/10 border-white/10 text-white">
                <SelectValue placeholder="اختر مسار المبيعات" />
              </SelectTrigger>
              <SelectContent>
                {pipelines.map((p: Pipeline) => (
                  <SelectItem key={p._id} value={p._id}>
                    {p.nameAr || p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              asChild
              className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg border-0"
            >
              <Link to="/dashboard/crm/leads/new">
                <Plus className="ml-2 h-4 w-4" />
                إضافة عميل
              </Link>
            </Button>
          </div>
        </ProductivityHero>

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
                <AlertCircle className="w-8 h-8 text-red-500" />
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
            {pipeline.stages.map((stage: PipelineStage) => {
              const totals = getStageTotals(stage.stageId)
              const stageLeads = leadsByStage[stage.stageId] || []

              return (
                <div key={stage.stageId} className="flex-shrink-0 w-80">
                  {/* Stage Header */}
                  <div
                    className="p-4 rounded-t-xl text-white font-semibold flex justify-between items-center"
                    style={{ backgroundColor: stage.color }}
                  >
                    <span>{stage.nameAr || stage.name}</span>
                    <Badge className="bg-white/20 text-white border-0">
                      {totals.count}
                    </Badge>
                  </div>

                  {/* Stage Value */}
                  {totals.value > 0 && (
                    <div className="bg-slate-100 px-4 py-2 text-sm text-slate-600 border-x border-slate-200">
                      {totals.value.toLocaleString('ar-SA')} ر.س
                    </div>
                  )}

                  {/* Droppable Area */}
                  <div
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, stage.stageId)}
                    className={`min-h-[400px] p-3 rounded-b-xl border border-t-0 transition-colors ${draggedLeadId
                      ? 'bg-emerald-50 border-emerald-200'
                      : 'bg-slate-50 border-slate-200'
                      }`}
                  >
                    {stageLeads.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                        اسحب العملاء هنا
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {stageLeads.map((lead: Lead) => (
                          <div
                            key={lead._id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, lead._id)}
                            onDragEnd={handleDragEnd}
                            className={`bg-white p-4 rounded-xl shadow-sm cursor-grab active:cursor-grabbing border border-transparent hover:border-emerald-300 transition-all ${draggedLeadId === lead._id
                              ? 'opacity-50 ring-2 ring-emerald-400'
                              : ''
                              }`}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <GripVertical className="h-4 w-4 text-slate-300" />
                                <span className="font-medium text-navy">
                                  {lead.displayName}
                                </span>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem asChild>
                                    <Link to={`/dashboard/crm/leads/${lead._id}`}>
                                      عرض التفاصيل
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => convertLead(lead._id)}
                                  >
                                    <ArrowUpRight className="h-4 w-4 ml-2" />
                                    تحويل لعميل
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>

                            <div className="space-y-2 text-sm text-slate-500">
                              {lead.phone && (
                                <div className="flex items-center gap-2">
                                  <Phone className="h-3 w-3" />
                                  {lead.phone}
                                </div>
                              )}
                              {lead.email && (
                                <div className="flex items-center gap-2">
                                  <Mail className="h-3 w-3" />
                                  {lead.email}
                                </div>
                              )}
                            </div>

                            {lead.estimatedValue > 0 && (
                              <div className="mt-3 pt-3 border-t border-slate-100">
                                <span className="text-emerald-600 font-semibold">
                                  {lead.estimatedValue.toLocaleString('ar-SA')} ر.س
                                </span>
                              </div>
                            )}

                            <div className="mt-2 text-xs text-slate-400">
                              {formatDistanceToNow(new Date(lead.createdAt), {
                                addSuffix: true,
                                locale: ar,
                              })}
                            </div>
                          </div>
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
          <CrmSidebar />
        </div>
      </Main>
    </>
  )
}
