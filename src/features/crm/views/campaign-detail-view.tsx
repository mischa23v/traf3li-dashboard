/**
 * Campaign Detail View - CRM Module
 *
 * Full-featured campaign detail page with:
 * - Header with campaign name, status badge, action buttons, date range, owner avatar
 * - Tab Navigation (Overview, Leads, Statistics)
 * - Overview Tab with campaign information, UTM parameters, schedule, budget, targets, target audience
 * - Leads Tab with data table of attributed leads
 * - Statistics Tab with metrics cards, charts, and email stats
 * - RTL support and Arabic labels
 */

import { useState, useMemo } from 'react'
import {
  ArrowLeft,
  Trash2,
  Edit3,
  Loader2,
  Search,
  Bell,
  AlertCircle,
  Play,
  Pause,
  CheckCircle,
  TrendingUp,
  Target,
  DollarSign,
  Users,
  MapPin,
  Building2,
  Calendar,
  Tag,
  Link as LinkIcon,
  BarChart3,
  PieChart,
  Mail,
  Eye,
  MousePointer,
  Send,
  XCircle,
  UserX,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useCampaign,
  useCampaignLeads,
  useCampaignStats,
  useCampaignAnalytics,
  usePauseCampaign,
  useResumeCampaign,
  useCompleteCampaign,
  useDeleteCampaign,
} from '@/hooks/useCampaigns'
import { ProductivityHero } from '@/components/productivity-hero'
import { useParams, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Link } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { SalesSidebar } from '@/features/crm/components/sales-sidebar'
import { ROUTES } from '@/constants/routes'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import type { CampaignStatus } from '@/types/crm-extended'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

// ═══════════════════════════════════════════════════════════════
// LABEL MAPPINGS
// ═══════════════════════════════════════════════════════════════

const STATUS_LABELS: Record<CampaignStatus, { label: string; color: string }> = {
  draft: { label: 'مسودة', color: 'bg-slate-100 text-slate-700' },
  scheduled: { label: 'مجدولة', color: 'bg-blue-100 text-blue-700' },
  active: { label: 'نشطة', color: 'bg-emerald-100 text-emerald-700' },
  paused: { label: 'متوقفة', color: 'bg-orange-100 text-orange-700' },
  completed: { label: 'مكتملة', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'ملغاة', color: 'bg-red-100 text-red-700' },
}

const LEAD_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  new: { label: 'جديد', color: 'bg-blue-100 text-blue-700' },
  contacted: { label: 'تم التواصل', color: 'bg-purple-100 text-purple-700' },
  qualified: { label: 'مؤهل', color: 'bg-emerald-100 text-emerald-700' },
  converted: { label: 'تم التحويل', color: 'bg-green-100 text-green-700' },
  lost: { label: 'فقد', color: 'bg-red-100 text-red-700' },
}

const CHART_COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4']

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export function CampaignDetailView() {
  const { campaignId } = useParams({ strict: false }) as { campaignId: string }
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Fetch campaign data
  const { data: campaignData, isLoading, isError, error, refetch } = useCampaign(campaignId)
  const { data: leadsData, isLoading: leadsLoading } = useCampaignLeads(
    campaignId,
    { page: 1, limit: 100 },
    !isLoading && !!campaignData
  )
  const { data: statsData, isLoading: statsLoading } = useCampaignStats(
    campaignId,
    !isLoading && !!campaignData
  )
  const { data: analyticsData, isLoading: analyticsLoading } = useCampaignAnalytics(
    campaignId,
    !isLoading && !!campaignData
  )

  // Mutations
  const pauseCampaignMutation = usePauseCampaign()
  const resumeCampaignMutation = useResumeCampaign()
  const completeCampaignMutation = useCompleteCampaign()
  const deleteCampaignMutation = useDeleteCampaign()

  // Transform API data
  const campaign = campaignData

  // Get owner info
  const ownerName = useMemo(() => {
    if (!campaign?.ownerId) return 'غير محدد'
    if (typeof campaign.ownerId === 'object') {
      const owner = campaign.ownerId as any
      return `${owner.firstName || ''} ${owner.lastName || ''}`.trim() || owner.email || 'غير محدد'
    }
    return 'غير محدد'
  }, [campaign])

  const ownerInitials = useMemo(() => {
    if (!campaign?.ownerId || typeof campaign.ownerId !== 'object') return 'NA'
    const owner = campaign.ownerId as any
    const first = owner.firstName?.[0] || ''
    const last = owner.lastName?.[0] || ''
    return (first + last).toUpperCase() || 'NA'
  }, [campaign])

  // Handle actions
  const handlePause = () => {
    pauseCampaignMutation.mutate(campaignId)
  }

  const handleResume = () => {
    resumeCampaignMutation.mutate(campaignId)
  }

  const handleComplete = () => {
    if (confirm('هل تريد إكمال هذه الحملة؟ لن تتمكن من تعديلها بعد ذلك.')) {
      completeCampaignMutation.mutate(campaignId)
    }
  }

  const handleDelete = () => {
    deleteCampaignMutation.mutate(campaignId, {
      onSuccess: () => {
        navigate({ to: '/dashboard/crm/campaigns' })
      },
    })
  }

  // Calculate email stats if available
  const emailStats = useMemo(() => {
    if (!statsData || campaign?.channel !== 'email') return null

    const sent = (statsData as any).emailsSent || 0
    const delivered = (statsData as any).emailsDelivered || sent
    const opened = (statsData as any).emailsOpened || 0
    const clicked = (statsData as any).emailsClicked || 0
    const bounced = (statsData as any).emailsBounced || 0
    const unsubscribed = (statsData as any).unsubscribed || 0

    return {
      sent,
      delivered,
      opened,
      clicked,
      bounced,
      unsubscribed,
      deliveryRate: sent > 0 ? (delivered / sent) * 100 : 0,
      openRate: sent > 0 ? (opened / sent) * 100 : 0,
      clickRate: sent > 0 ? (clicked / sent) * 100 : 0,
      bounceRate: sent > 0 ? (bounced / sent) * 100 : 0,
      unsubscribeRate: sent > 0 ? (unsubscribed / sent) * 100 : 0,
    }
  }, [statsData, campaign])

  const topNav = [
    { title: 'العملاء المحتملين', href: ROUTES.dashboard.crm.leads.list, isActive: false },
    { title: 'خط المبيعات', href: ROUTES.dashboard.crm.pipeline, isActive: false },
    { title: 'الحملات', href: '/dashboard/crm/campaigns', isActive: true },
    { title: 'الأنشطة', href: ROUTES.dashboard.crm.activities.list, isActive: false },
  ]

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
            <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
            <input
              type="text"
              placeholder="بحث..."
              aria-label="بحث"
              className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="التنبيهات"
            className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 end-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
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
        className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']"
      >
        {/* Breadcrumb / Back Link */}
        <div className="mb-6">
          <Link
            to="/dashboard/crm/campaigns"
            className="inline-flex items-center text-slate-500 hover:text-navy transition-colors"
          >
            <ArrowLeft className="h-4 w-4 ms-2" />
            العودة إلى قائمة الحملات
          </Link>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-6">
            <Skeleton className="h-48 w-full rounded-3xl" />
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 lg:col-span-8">
                <Skeleton className="h-96 w-full rounded-2xl" />
              </div>
              <div className="col-span-12 lg:col-span-4">
                <Skeleton className="h-96 w-full rounded-2xl" />
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-500" aria-hidden="true" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              حدث خطأ أثناء تحميل بيانات الحملة
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
        )}

        {/* Empty State */}
        {!isLoading && !isError && !campaign && (
          <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                <Target className="w-8 h-8 text-emerald-500" aria-hidden="true" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              الحملة غير موجودة
            </h3>
            <p className="text-slate-500 mb-4">
              لم يتم العثور على الحملة المطلوبة
            </p>
            <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
              <Link to="/dashboard/crm/campaigns">العودة إلى القائمة</Link>
            </Button>
          </div>
        )}

        {/* Success State */}
        {!isLoading && !isError && campaign && (
          <>
            {/* Campaign Header Card */}
            <Card className="border border-slate-100 shadow-sm rounded-3xl overflow-hidden bg-gradient-to-br from-white to-slate-50">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
                  {/* Campaign Info */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-start gap-3 mb-3">
                      <h1 className="text-3xl font-bold text-navy">{campaign.name}</h1>
                      {campaign.status && (
                        <Badge className={STATUS_LABELS[campaign.status as CampaignStatus]?.color || 'bg-gray-100 text-gray-700'}>
                          {STATUS_LABELS[campaign.status as CampaignStatus]?.label || campaign.status}
                        </Badge>
                      )}
                    </div>

                    {/* Date Range */}
                    {(campaign.startDate || campaign.endDate) && (
                      <div className="flex items-center gap-2 text-slate-600 mb-3">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {campaign.startDate && format(new Date(campaign.startDate), 'd MMMM yyyy', { locale: ar })}
                          {campaign.startDate && campaign.endDate && ' - '}
                          {campaign.endDate && format(new Date(campaign.endDate), 'd MMMM yyyy', { locale: ar })}
                        </span>
                      </div>
                    )}

                    {/* Owner */}
                    <div className="flex items-center gap-3 mb-6">
                      <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                        <AvatarImage src={(campaign.ownerId as any)?.avatar} alt={ownerName} />
                        <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white text-sm font-bold">
                          {ownerInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs text-slate-500">مدير الحملة</p>
                        <p className="text-sm font-medium text-navy">{ownerName}</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                      <Link to={`/dashboard/crm/campaigns/${campaignId}/edit`}>
                        <Button
                          variant="outline"
                          className="border-slate-200 hover:bg-slate-50"
                        >
                          <Edit3 className="h-4 w-4 ms-2" aria-hidden="true" />
                          تعديل
                        </Button>
                      </Link>

                      {campaign.status === 'active' && (
                        <Button
                          onClick={handlePause}
                          disabled={pauseCampaignMutation.isPending}
                          className="bg-orange-500 hover:bg-orange-600 text-white"
                        >
                          {pauseCampaignMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin ms-2" aria-hidden="true" />
                          ) : (
                            <Pause className="h-4 w-4 ms-2" aria-hidden="true" />
                          )}
                          إيقاف مؤقت
                        </Button>
                      )}

                      {campaign.status === 'paused' && (
                        <Button
                          onClick={handleResume}
                          disabled={resumeCampaignMutation.isPending}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white"
                        >
                          {resumeCampaignMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin ms-2" aria-hidden="true" />
                          ) : (
                            <Play className="h-4 w-4 ms-2" aria-hidden="true" />
                          )}
                          استئناف
                        </Button>
                      )}

                      {(campaign.status === 'active' || campaign.status === 'paused') && (
                        <Button
                          onClick={handleComplete}
                          disabled={completeCampaignMutation.isPending}
                          className="bg-green-500 hover:bg-green-600 text-white"
                        >
                          {completeCampaignMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin ms-2" aria-hidden="true" />
                          ) : (
                            <CheckCircle className="h-4 w-4 ms-2" aria-hidden="true" />
                          )}
                          إكمال
                        </Button>
                      )}

                      {!showDeleteConfirm ? (
                        <Button
                          variant="outline"
                          aria-label="حذف"
                          onClick={() => setShowDeleteConfirm(true)}
                          className="border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowDeleteConfirm(false)}
                            className="border-slate-200"
                          >
                            إلغاء
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleDelete}
                            disabled={deleteCampaignMutation.isPending}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            {deleteCampaignMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                            ) : (
                              'تأكيد'
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* MAIN CONTENT GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* CENTER CONTENT (Tabs & Details) */}
              <div className="lg:col-span-2">
                <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden min-h-[600px]">
                  <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full"
                  >
                    <div className="border-b border-slate-100 px-6 pt-4">
                      <TabsList className="bg-transparent h-auto p-0 gap-6">
                        {['overview', 'leads', 'statistics'].map((tab) => (
                          <TabsTrigger
                            key={tab}
                            value={tab}
                            className="
                              data-[state=active]:bg-transparent data-[state=active]:shadow-none
                              data-[state=active]:border-b-2 data-[state=active]:border-emerald-500
                              data-[state=active]:text-emerald-600
                              text-slate-500 font-medium text-base pb-4 rounded-none px-2
                            "
                          >
                            {tab === 'overview'
                              ? 'نظرة عامة'
                              : tab === 'leads'
                                ? 'العملاء المحتملين'
                                : 'الإحصائيات'}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </div>

                    <div className="p-6 bg-slate-50/50 min-h-[500px]">
                      {/* Overview Tab */}
                      <TabsContent value="overview" className="mt-0 space-y-6">
                        {/* Campaign Information */}
                        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                          <CardHeader>
                            <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                              <Target className="h-5 w-5 text-emerald-500" />
                              معلومات الحملة
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 mb-1">اسم الحملة</p>
                              <p className="font-medium text-navy">{campaign.name}</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 mb-1">نوع الحملة</p>
                              <p className="font-medium text-navy">{campaign.type || 'غير محدد'}</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 mb-1">القناة</p>
                              <p className="font-medium text-navy">{campaign.channel || 'غير محدد'}</p>
                            </div>
                            {campaign.description && (
                              <div className="p-4 bg-slate-50 rounded-xl md:col-span-2">
                                <p className="text-xs text-slate-500 mb-1">الوصف</p>
                                <p className="font-medium text-navy">{campaign.description}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>

                        {/* UTM Parameters */}
                        {(campaign as any).utmParameters && (
                          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                            <CardHeader>
                              <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                <LinkIcon className="h-5 w-5 text-blue-500" />
                                معلمات UTM
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {(campaign as any).utmParameters.source && (
                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <p className="text-xs text-slate-500 mb-1">المصدر (Source)</p>
                                  <p className="font-medium text-navy font-mono text-sm">{(campaign as any).utmParameters.source}</p>
                                </div>
                              )}
                              {(campaign as any).utmParameters.medium && (
                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <p className="text-xs text-slate-500 mb-1">الوسيط (Medium)</p>
                                  <p className="font-medium text-navy font-mono text-sm">{(campaign as any).utmParameters.medium}</p>
                                </div>
                              )}
                              {(campaign as any).utmParameters.campaign && (
                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <p className="text-xs text-slate-500 mb-1">الحملة (Campaign)</p>
                                  <p className="font-medium text-navy font-mono text-sm">{(campaign as any).utmParameters.campaign}</p>
                                </div>
                              )}
                              {(campaign as any).utmParameters.term && (
                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <p className="text-xs text-slate-500 mb-1">المصطلح (Term)</p>
                                  <p className="font-medium text-navy font-mono text-sm">{(campaign as any).utmParameters.term}</p>
                                </div>
                              )}
                              {(campaign as any).utmParameters.content && (
                                <div className="p-4 bg-slate-50 rounded-xl md:col-span-2">
                                  <p className="text-xs text-slate-500 mb-1">المحتوى (Content)</p>
                                  <p className="font-medium text-navy font-mono text-sm">{(campaign as any).utmParameters.content}</p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )}

                        {/* Schedule */}
                        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                          <CardHeader>
                            <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                              <Calendar className="h-5 w-5 text-purple-500" />
                              الجدول الزمني
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {campaign.startDate && (
                              <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500 mb-1">تاريخ البدء</p>
                                <p className="font-medium text-navy">
                                  {format(new Date(campaign.startDate), 'd MMMM yyyy', { locale: ar })}
                                </p>
                              </div>
                            )}
                            {campaign.endDate && (
                              <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500 mb-1">تاريخ الانتهاء</p>
                                <p className="font-medium text-navy">
                                  {format(new Date(campaign.endDate), 'd MMMM yyyy', { locale: ar })}
                                </p>
                              </div>
                            )}
                            {(campaign as any).recurring && (
                              <div className="p-4 bg-slate-50 rounded-xl md:col-span-2">
                                <p className="text-xs text-slate-500 mb-1">التكرار</p>
                                <p className="font-medium text-navy">{(campaign as any).recurringPattern || 'نعم'}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>

                        {/* Budget */}
                        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                          <CardHeader>
                            <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                              <DollarSign className="h-5 w-5 text-green-500" />
                              الميزانية
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {campaign.budget !== undefined && (
                              <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500 mb-1">الميزانية المخططة</p>
                                <p className="font-medium text-navy">{campaign.budget.toLocaleString('ar-SA')} ر.س</p>
                              </div>
                            )}
                            {campaign.spent !== undefined && (
                              <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500 mb-1">المبلغ المنفق</p>
                                <p className="font-medium text-navy">{campaign.spent.toLocaleString('ar-SA')} ر.س</p>
                              </div>
                            )}
                            {statsData?.costPerLead !== undefined && (
                              <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500 mb-1">التكلفة لكل عميل محتمل</p>
                                <p className="font-medium text-navy">{statsData.costPerLead.toLocaleString('ar-SA')} ر.س</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>

                        {/* Targets */}
                        {(campaign as any).targets && (
                          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                            <CardHeader>
                              <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                <Target className="h-5 w-5 text-orange-500" />
                                الأهداف
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {(campaign as any).targets.leads && (
                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <p className="text-xs text-slate-500 mb-1">عملاء محتملين مستهدفين</p>
                                  <p className="font-medium text-navy">{(campaign as any).targets.leads.toLocaleString('ar-SA')}</p>
                                </div>
                              )}
                              {(campaign as any).targets.conversions && (
                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <p className="text-xs text-slate-500 mb-1">تحويلات مستهدفة</p>
                                  <p className="font-medium text-navy">{(campaign as any).targets.conversions.toLocaleString('ar-SA')}</p>
                                </div>
                              )}
                              {(campaign as any).targets.revenue && (
                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <p className="text-xs text-slate-500 mb-1">الإيرادات المستهدفة</p>
                                  <p className="font-medium text-navy">{(campaign as any).targets.revenue.toLocaleString('ar-SA')} ر.س</p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )}

                        {/* Target Audience */}
                        {(campaign as any).targetAudience && (
                          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                            <CardHeader>
                              <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                <Users className="h-5 w-5 text-indigo-500" />
                                الجمهور المستهدف
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 gap-4">
                              {(campaign as any).targetAudience.industries && (
                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <p className="text-xs text-slate-500 mb-2">الصناعات</p>
                                  <div className="flex flex-wrap gap-2">
                                    {(campaign as any).targetAudience.industries.map((industry: string, idx: number) => (
                                      <Badge key={idx} className="bg-indigo-100 text-indigo-700">
                                        <Building2 className="h-3 w-3 ms-1" />
                                        {industry}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {(campaign as any).targetAudience.regions && (
                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <p className="text-xs text-slate-500 mb-2">المناطق</p>
                                  <div className="flex flex-wrap gap-2">
                                    {(campaign as any).targetAudience.regions.map((region: string, idx: number) => (
                                      <Badge key={idx} className="bg-blue-100 text-blue-700">
                                        <MapPin className="h-3 w-3 ms-1" />
                                        {region}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {(campaign as any).targetAudience.companySize && (
                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <p className="text-xs text-slate-500 mb-2">حجم الشركة</p>
                                  <div className="flex flex-wrap gap-2">
                                    {(campaign as any).targetAudience.companySize.map((size: string, idx: number) => (
                                      <Badge key={idx} className="bg-purple-100 text-purple-700">
                                        <Users className="h-3 w-3 ms-1" />
                                        {size}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )}
                      </TabsContent>

                      {/* Leads Tab */}
                      <TabsContent value="leads" className="mt-0 space-y-6">
                        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                          <CardHeader>
                            <CardTitle className="text-lg font-bold text-navy">
                              العملاء المحتملين المرتبطون بالحملة
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            {leadsLoading ? (
                              <div className="flex justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                              </div>
                            ) : leadsData?.data?.length ? (
                              <div className="overflow-x-auto">
                                <table className="w-full">
                                  <thead>
                                    <tr className="border-b border-slate-200">
                                      <th className="text-start p-3 text-sm font-semibold text-slate-700">الاسم</th>
                                      <th className="text-start p-3 text-sm font-semibold text-slate-700">الحالة</th>
                                      <th className="text-start p-3 text-sm font-semibold text-slate-700">تاريخ الإنشاء</th>
                                      <th className="text-start p-3 text-sm font-semibold text-slate-700">الإيرادات</th>
                                      <th className="text-start p-3 text-sm font-semibold text-slate-700">تم التحويل</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {leadsData.data.map((lead: any) => (
                                      <tr key={lead._id} className="border-b border-slate-100 hover:bg-slate-50">
                                        <td className="p-3">
                                          <Link
                                            to={ROUTES.dashboard.crm.leads.detail(lead._id)}
                                            className="text-emerald-600 hover:underline font-medium"
                                          >
                                            {lead.firstName || lead.fullName || lead.email || 'غير محدد'}
                                          </Link>
                                        </td>
                                        <td className="p-3">
                                          <Badge className={LEAD_STATUS_LABELS[lead.status]?.color || 'bg-gray-100 text-gray-700'}>
                                            {LEAD_STATUS_LABELS[lead.status]?.label || lead.status}
                                          </Badge>
                                        </td>
                                        <td className="p-3 text-slate-700">
                                          {lead.createdAt ? format(new Date(lead.createdAt), 'd MMM yyyy', { locale: ar }) : '-'}
                                        </td>
                                        <td className="p-3 text-slate-700 font-medium" dir="ltr">
                                          {lead.revenue ? `${lead.revenue.toLocaleString('ar-SA')} ر.س` : '-'}
                                        </td>
                                        <td className="p-3">
                                          {lead.converted ? (
                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                          ) : (
                                            <span className="text-slate-400">-</span>
                                          )}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <p className="text-center py-8 text-slate-500">لا توجد عملاء محتملين</p>
                            )}
                          </CardContent>
                        </Card>
                      </TabsContent>

                      {/* Statistics Tab */}
                      <TabsContent value="statistics" className="mt-0 space-y-6">
                        {/* Metrics Cards */}
                        {statsData && (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <Card className="border-0 shadow-sm">
                              <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                                    <Users className="h-5 w-5 text-blue-600" />
                                  </div>
                                  <div>
                                    <p className="text-xs text-slate-500">عملاء محتملين</p>
                                    <p className="text-xl font-bold text-navy">
                                      {statsData.totalLeads || 0}
                                      {(campaign as any).targets?.leads && (
                                        <span className="text-xs text-slate-500 font-normal">
                                          {' / '}{(campaign as any).targets.leads}
                                        </span>
                                      )}
                                    </p>
                                  </div>
                                </div>
                                {(campaign as any).targets?.leads && (
                                  <Progress
                                    value={((statsData.totalLeads || 0) / (campaign as any).targets.leads) * 100}
                                    className="h-1 mt-2"
                                  />
                                )}
                              </CardContent>
                            </Card>

                            <Card className="border-0 shadow-sm">
                              <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                                  </div>
                                  <div>
                                    <p className="text-xs text-slate-500">التحويلات</p>
                                    <p className="text-xl font-bold text-navy">{statsData.conversions || 0}</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>

                            <Card className="border-0 shadow-sm">
                              <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                                    <TrendingUp className="h-5 w-5 text-purple-600" />
                                  </div>
                                  <div>
                                    <p className="text-xs text-slate-500">معدل التحويل</p>
                                    <p className="text-xl font-bold text-navy">
                                      {statsData.conversionRate?.toFixed(1) || 0}%
                                    </p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>

                            <Card className="border-0 shadow-sm">
                              <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                                    <DollarSign className="h-5 w-5 text-orange-600" />
                                  </div>
                                  <div>
                                    <p className="text-xs text-slate-500">التكلفة لكل عميل</p>
                                    <p className="text-lg font-bold text-navy">
                                      {statsData.costPerLead?.toLocaleString('ar-SA') || 0} ر.س
                                    </p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>

                            <Card className="border-0 shadow-sm">
                              <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                                    <BarChart3 className="h-5 w-5 text-green-600" />
                                  </div>
                                  <div>
                                    <p className="text-xs text-slate-500">عائد الاستثمار</p>
                                    <p className="text-xl font-bold text-navy">
                                      {statsData.roi?.toFixed(1) || 0}%
                                    </p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        )}

                        {/* Charts */}
                        {analyticsData && (
                          <>
                            {/* Leads Over Time */}
                            {analyticsData.performance?.timeline && analyticsData.performance.timeline.length > 0 && (
                              <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                                <CardHeader>
                                  <CardTitle className="text-lg font-bold text-navy">
                                    العملاء المحتملين عبر الزمن
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={analyticsData.performance.timeline}>
                                      <CartesianGrid strokeDasharray="3 3" />
                                      <XAxis dataKey="date" />
                                      <YAxis />
                                      <Tooltip />
                                      <Legend />
                                      <Line type="monotone" dataKey="leads" stroke="#10b981" strokeWidth={2} name="عملاء محتملين" />
                                      <Line type="monotone" dataKey="conversions" stroke="#3b82f6" strokeWidth={2} name="تحويلات" />
                                    </LineChart>
                                  </ResponsiveContainer>
                                </CardContent>
                              </Card>
                            )}

                            {/* Conversion Funnel */}
                            {analyticsData.conversionFunnel && analyticsData.conversionFunnel.length > 0 && (
                              <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                                <CardHeader>
                                  <CardTitle className="text-lg font-bold text-navy">
                                    قمع التحويل
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={analyticsData.conversionFunnel}>
                                      <CartesianGrid strokeDasharray="3 3" />
                                      <XAxis dataKey="stage" />
                                      <YAxis />
                                      <Tooltip />
                                      <Legend />
                                      <Bar dataKey="count" fill="#10b981" name="العدد" />
                                    </BarChart>
                                  </ResponsiveContainer>
                                </CardContent>
                              </Card>
                            )}
                          </>
                        )}

                        {/* Email Stats */}
                        {emailStats && (
                          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                            <CardHeader>
                              <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                <Mail className="h-5 w-5 text-blue-500" />
                                إحصائيات البريد الإلكتروني
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Send className="h-4 w-4 text-blue-500" />
                                    <p className="text-xs text-slate-500">تم الإرسال</p>
                                  </div>
                                  <p className="text-2xl font-bold text-navy">{emailStats.sent}</p>
                                </div>

                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                                    <p className="text-xs text-slate-500">تم التسليم</p>
                                  </div>
                                  <p className="text-2xl font-bold text-navy">{emailStats.delivered}</p>
                                  <p className="text-xs text-slate-500 mt-1">{emailStats.deliveryRate.toFixed(1)}%</p>
                                </div>

                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Eye className="h-4 w-4 text-purple-500" />
                                    <p className="text-xs text-slate-500">تم الفتح</p>
                                  </div>
                                  <p className="text-2xl font-bold text-navy">{emailStats.opened}</p>
                                  <p className="text-xs text-slate-500 mt-1">{emailStats.openRate.toFixed(1)}%</p>
                                </div>

                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <div className="flex items-center gap-2 mb-2">
                                    <MousePointer className="h-4 w-4 text-orange-500" />
                                    <p className="text-xs text-slate-500">تم النقر</p>
                                  </div>
                                  <p className="text-2xl font-bold text-navy">{emailStats.clicked}</p>
                                  <p className="text-xs text-slate-500 mt-1">{emailStats.clickRate.toFixed(1)}%</p>
                                </div>

                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <div className="flex items-center gap-2 mb-2">
                                    <XCircle className="h-4 w-4 text-red-500" />
                                    <p className="text-xs text-slate-500">الارتداد</p>
                                  </div>
                                  <p className="text-2xl font-bold text-navy">{emailStats.bounced}</p>
                                  <p className="text-xs text-slate-500 mt-1">{emailStats.bounceRate.toFixed(1)}%</p>
                                </div>

                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <div className="flex items-center gap-2 mb-2">
                                    <UserX className="h-4 w-4 text-yellow-500" />
                                    <p className="text-xs text-slate-500">إلغاء الاشتراك</p>
                                  </div>
                                  <p className="text-2xl font-bold text-navy">{emailStats.unsubscribed}</p>
                                  <p className="text-xs text-slate-500 mt-1">{emailStats.unsubscribeRate.toFixed(1)}%</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </TabsContent>
                    </div>
                  </Tabs>
                </Card>
              </div>

              {/* SIDEBAR */}
              <SalesSidebar context="leads" />
            </div>
          </>
        )}
      </Main>
    </>
  )
}
