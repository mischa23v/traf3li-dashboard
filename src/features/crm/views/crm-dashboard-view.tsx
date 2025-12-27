/**
 * CRM Dashboard View
 * Main dashboard page with metrics, charts, activities, and recent leads
 */

import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from '@tanstack/react-router'
import {
  TrendingUp,
  DollarSign,
  Target,
  Award,
  TrendingDown,
  Percent,
  Calendar,
  Clock,
  Users,
  Building2,
  ArrowRight,
  Activity,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { ProductivityHero } from '@/components/productivity-hero'
import { StatCard } from '@/components/stat-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'

import { useCrmDashboard, type DashboardParams } from '@/hooks/useCrmAnalytics'
import { useLeads } from '@/hooks/useCrm'
import { SalesSidebar } from '@/features/crm/components/sales-sidebar'
import { ROUTES } from '@/constants/routes'
import type { LeadStatus } from '@/types/crm'

const CHART_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6']

const statusColors: Record<LeadStatus, string> = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-purple-100 text-purple-700',
  qualified: 'bg-emerald-100 text-emerald-700',
  proposal: 'bg-orange-100 text-orange-700',
  negotiation: 'bg-yellow-100 text-yellow-700',
  won: 'bg-green-100 text-green-700',
  lost: 'bg-red-100 text-red-700',
  dormant: 'bg-gray-100 text-gray-700',
}

const topNav = [
  { title: 'CRM Dashboard', titleAr: 'لوحة التحكم', href: '/dashboard/crm/dashboard' },
  { title: 'Leads', titleAr: 'العملاء المحتملين', href: ROUTES.dashboard.crm.leads.list },
  { title: 'Pipeline', titleAr: 'خط الأنابيب', href: ROUTES.dashboard.crm.pipeline },
]

type DateRangeOption = 'today' | 'last_7_days' | 'last_30_days' | 'this_quarter' | 'custom'

export function CrmDashboardView() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const isRTL = i18n.language === 'ar'

  const [dateRange, setDateRange] = useState<DateRangeOption>('last_30_days')

  // Build dashboard params
  const dashboardParams: DashboardParams = useMemo(() => ({
    dateRange,
  }), [dateRange])

  // Fetch dashboard data
  const { data: dashboardData, isLoading, error } = useCrmDashboard(dashboardParams)

  // Fetch recent leads
  const { data: leadsData, isLoading: leadsLoading } = useLeads({ limit: 5 })
  const recentLeads = leadsData?.data || []

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Format number with locale
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-US').format(num)
  }

  // Get status badge
  const getStatusBadge = (status: LeadStatus) => {
    const statusLabels: Record<LeadStatus, { en: string; ar: string }> = {
      new: { en: 'New', ar: 'جديد' },
      contacted: { en: 'Contacted', ar: 'تم التواصل' },
      qualified: { en: 'Qualified', ar: 'مؤهل' },
      proposal: { en: 'Proposal', ar: 'عرض' },
      negotiation: { en: 'Negotiation', ar: 'تفاوض' },
      won: { en: 'Won', ar: 'فاز' },
      lost: { en: 'Lost', ar: 'خسر' },
      dormant: { en: 'Dormant', ar: 'خامل' },
    }

    return (
      <Badge className={statusColors[status]}>
        {isRTL ? statusLabels[status].ar : statusLabels[status].en}
      </Badge>
    )
  }

  // Prepare chart data for Pipeline by Stage
  const pipelineChartData = useMemo(() => {
    if (!dashboardData) return []

    // Mock data - replace with actual API data structure when available
    return [
      { stage: isRTL ? 'جديد' : 'New', count: dashboardData.overview.activeLeads * 0.3, value: dashboardData.overview.totalRevenue * 0.1 },
      { stage: isRTL ? 'تم التواصل' : 'Contacted', count: dashboardData.overview.activeLeads * 0.25, value: dashboardData.overview.totalRevenue * 0.15 },
      { stage: isRTL ? 'مؤهل' : 'Qualified', count: dashboardData.overview.activeLeads * 0.2, value: dashboardData.overview.totalRevenue * 0.2 },
      { stage: isRTL ? 'عرض' : 'Proposal', count: dashboardData.overview.activeLeads * 0.15, value: dashboardData.overview.totalRevenue * 0.25 },
      { stage: isRTL ? 'تفاوض' : 'Negotiation', count: dashboardData.overview.activeLeads * 0.1, value: dashboardData.overview.totalRevenue * 0.3 },
    ]
  }, [dashboardData, isRTL])

  // Prepare chart data for Leads by Source
  const leadsSourceChartData = useMemo(() => {
    if (!dashboardData) return []

    // Mock data - replace with actual API data structure when available
    const total = dashboardData.overview.totalLeads
    return [
      { name: isRTL ? 'الموقع' : 'Website', value: Math.floor(total * 0.3) },
      { name: isRTL ? 'إحالة' : 'Referral', value: Math.floor(total * 0.25) },
      { name: isRTL ? 'إعلانات' : 'Ads', value: Math.floor(total * 0.2) },
      { name: isRTL ? 'وسائل التواصل' : 'Social', value: Math.floor(total * 0.15) },
      { name: isRTL ? 'أخرى' : 'Other', value: Math.floor(total * 0.1) },
    ]
  }, [dashboardData, isRTL])

  if (isLoading) {
    return (
      <>
        <Header className="bg-navy shadow-none relative">
          <TopNav links={topNav} />
          <DynamicIsland />
        </Header>
        <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl">
          <div className="space-y-6">
            <Skeleton className="h-32 w-full rounded-3xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
          </div>
        </Main>
      </>
    )
  }

  if (error || !dashboardData) {
    return (
      <>
        <Header className="bg-navy shadow-none relative">
          <TopNav links={topNav} />
          <DynamicIsland />
        </Header>
        <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl">
          <div className="text-center p-12">
            <p className="text-red-500">
              {isRTL ? 'حدث خطأ في تحميل بيانات لوحة التحكم' : 'Error loading dashboard data'}
            </p>
          </div>
        </Main>
      </>
    )
  }

  const { overview } = dashboardData

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} />
        <DynamicIsland />
      </Header>

      <Main
        fluid={true}
        className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl"
      >
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <ProductivityHero
            badge={isRTL ? 'إدارة العملاء' : 'CRM'}
            title={isRTL ? 'لوحة التحكم' : 'Dashboard'}
            type="crm"
          />

          {/* Date Range Filter */}
          <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRangeOption)}>
            <SelectTrigger className="w-full md:w-48 rounded-xl bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">
                {isRTL ? 'اليوم' : 'Today'}
              </SelectItem>
              <SelectItem value="last_7_days">
                {isRTL ? 'آخر 7 أيام' : 'Last 7 Days'}
              </SelectItem>
              <SelectItem value="last_30_days">
                {isRTL ? 'آخر 30 يوم' : 'Last 30 Days'}
              </SelectItem>
              <SelectItem value="this_quarter">
                {isRTL ? 'هذا الربع' : 'This Quarter'}
              </SelectItem>
              <SelectItem value="custom">
                {isRTL ? 'نطاق مخصص' : 'Custom Range'}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Metric Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label={isRTL ? 'إجمالي العملاء المحتملين' : 'Total Leads'}
                value={formatNumber(overview.totalLeads)}
                icon={Users}
                status="normal"
              />
              <StatCard
                label={isRTL ? 'قيمة خط الأنابيب المفتوح' : 'Open Pipeline Value'}
                value={formatCurrency(overview.totalRevenue * 0.6)}
                icon={DollarSign}
                status="normal"
              />
              <StatCard
                label={isRTL ? 'القيمة المرجحة' : 'Weighted Value'}
                value={formatCurrency(overview.totalRevenue * 0.4)}
                icon={Target}
                status="normal"
              />
              <StatCard
                label={isRTL ? 'فاز هذا الشهر' : 'Won This Month'}
                value={formatNumber(overview.wonLeads)}
                icon={Award}
                status="normal"
              />
              <StatCard
                label={isRTL ? 'خسر هذا الشهر' : 'Lost This Month'}
                value={formatNumber(overview.lostLeads)}
                icon={TrendingDown}
                status={overview.lostLeads > 0 ? 'attention' : 'zero'}
              />
              <StatCard
                label={isRTL ? 'معدل التحويل' : 'Conversion Rate'}
                value={`${overview.conversionRate.toFixed(1)}%`}
                icon={Percent}
                status="normal"
              />
              <StatCard
                label={isRTL ? 'متوسط ​​حجم الصفقة' : 'Avg Deal Size'}
                value={formatCurrency(overview.averageDealSize)}
                icon={DollarSign}
                status="normal"
              />
              <StatCard
                label={isRTL ? 'متوسط ​​دورة المبيعات' : 'Avg Sales Cycle'}
                value={`${Math.round(overview.averageSalesCycle)} ${isRTL ? 'يوم' : 'days'}`}
                icon={Calendar}
                status="normal"
              />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pipeline by Stage Chart */}
              <Card className="rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">
                    {isRTL ? 'خط الأنابيب حسب المرحلة' : 'Pipeline by Stage'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={pipelineChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="stage"
                        tick={{ fontSize: 12 }}
                        angle={isRTL ? 0 : -45}
                        textAnchor={isRTL ? 'middle' : 'end'}
                        height={60}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                        }}
                      />
                      <Legend />
                      <Bar
                        dataKey="count"
                        fill="#10b981"
                        name={isRTL ? 'العدد' : 'Count'}
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Leads by Source Chart */}
              <Card className="rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">
                    {isRTL ? 'العملاء المحتملون حسب المصدر' : 'Leads by Source'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={leadsSourceChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${entry.value}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {leadsSourceChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Activities Due Today */}
            <Card className="rounded-3xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">
                  {isRTL ? 'الأنشطة المستحقة اليوم' : 'Activities Due Today'}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-lg"
                  onClick={() => navigate({ to: ROUTES.dashboard.crm.activities.list })}
                >
                  {isRTL ? 'عرض الكل' : 'View All'}
                  <ArrowRight className={`w-4 h-4 ${isRTL ? 'mr-2' : 'ml-2'}`} />
                </Button>
              </CardHeader>
              <CardContent>
                {dashboardData.recentActivity && dashboardData.recentActivity.activities > 0 ? (
                  <div className="space-y-3">
                    {[...Array(Math.min(5, dashboardData.recentActivity.activities))].map((_, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <div className="p-2 rounded-lg bg-emerald-100">
                          <Activity className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {isRTL ? `نشاط ${idx + 1}` : `Activity ${idx + 1}`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {isRTL ? 'تفاصيل النشاط' : 'Activity details'}
                          </p>
                        </div>
                        <Clock className="w-4 h-4 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">
                      {isRTL ? 'لا توجد أنشطة مستحقة اليوم' : 'No activities due today'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Leads Table */}
            <Card className="rounded-3xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">
                  {isRTL ? 'العملاء المحتملون الأخيرون' : 'Recent Leads'}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-lg"
                  onClick={() => navigate({ to: ROUTES.dashboard.crm.leads.list })}
                >
                  {isRTL ? 'عرض الكل' : 'View All'}
                  <ArrowRight className={`w-4 h-4 ${isRTL ? 'mr-2' : 'ml-2'}`} />
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {leadsLoading ? (
                  <div className="p-6 space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full rounded-xl" />
                    ))}
                  </div>
                ) : recentLeads.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className={isRTL ? 'text-right' : 'text-left'}>
                          {isRTL ? 'الاسم' : 'Name'}
                        </TableHead>
                        <TableHead className={isRTL ? 'text-right' : 'text-left'}>
                          {isRTL ? 'الشركة' : 'Company'}
                        </TableHead>
                        <TableHead className={isRTL ? 'text-right' : 'text-left'}>
                          {isRTL ? 'الحالة' : 'Status'}
                        </TableHead>
                        <TableHead className={isRTL ? 'text-right' : 'text-left'}>
                          {isRTL ? 'تاريخ الإنشاء' : 'Created'}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentLeads.slice(0, 5).map((lead) => (
                        <TableRow
                          key={lead._id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => navigate({ to: ROUTES.dashboard.crm.leads.detail(lead._id) })}
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="p-2 rounded-lg bg-blue-100">
                                {lead.type === 'company' ? (
                                  <Building2 className="w-4 h-4 text-blue-600" />
                                ) : (
                                  <Users className="w-4 h-4 text-blue-600" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-sm">
                                  {lead.type === 'company'
                                    ? isRTL
                                      ? lead.companyNameAr || lead.companyName
                                      : lead.companyName
                                    : isRTL
                                    ? lead.fullNameArabic || `${lead.firstName} ${lead.lastName}`
                                    : `${lead.firstName} ${lead.lastName}`}
                                </p>
                                {lead.phone && (
                                  <p className="text-xs text-muted-foreground">{lead.phone}</p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {lead.type === 'company'
                              ? isRTL
                                ? lead.companyNameAr || lead.companyName || '-'
                                : lead.companyName || '-'
                              : '-'}
                          </TableCell>
                          <TableCell>{getStatusBadge(lead.status)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {lead.createdAt
                              ? new Date(lead.createdAt).toLocaleDateString(
                                  isRTL ? 'ar-SA' : 'en-US',
                                  {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                  }
                                )
                              : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-20" />
                    <p className="text-sm text-muted-foreground">
                      {isRTL ? 'لا توجد عملاء محتملون' : 'No leads found'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <SalesSidebar />
        </div>
      </Main>
    </>
  )
}
