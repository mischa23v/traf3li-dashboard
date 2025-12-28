/**
 * CRM Reports Dashboard View
 * Ultimate enterprise-grade CRM analytics dashboard
 * Main landing page for all CRM reports and insights
 */

'use client'

import { useState, useMemo, lazy, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '@/hooks/use-language'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'

// UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { TopNav } from '@/components/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'

// Icons
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  DollarSign,
  Clock,
  Activity,
  Funnel,
  Award,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Download,
  FileSpreadsheet,
  FileText,
  Calendar,
  MoreVertical,
  RefreshCw,
  Star,
  StarOff,
  ExternalLink,
  Zap,
  Bell,
  Mail,
  Phone,
  PieChart,
  LineChart,
  BarChart2,
  Filter,
  Settings,
  ChevronRight,
} from 'lucide-react'

// Lazy load charts
const LazyPieChart = lazy(() =>
  import('recharts').then((m) => ({ default: m.PieChart }))
)
const LazyPie = lazy(() =>
  import('recharts').then((m) => ({ default: m.Pie }))
)
const LazyCell = lazy(() =>
  import('recharts').then((m) => ({ default: m.Cell }))
)
const LazyLineChart = lazy(() =>
  import('recharts').then((m) => ({ default: m.LineChart }))
)
const LazyLine = lazy(() =>
  import('recharts').then((m) => ({ default: m.Line }))
)
const LazyBarChart = lazy(() =>
  import('recharts').then((m) => ({ default: m.BarChart }))
)
const LazyBar = lazy(() =>
  import('recharts').then((m) => ({ default: m.Bar }))
)
const LazyXAxis = lazy(() =>
  import('recharts').then((m) => ({ default: m.XAxis }))
)
const LazyYAxis = lazy(() =>
  import('recharts').then((m) => ({ default: m.YAxis }))
)
const LazyTooltip = lazy(() =>
  import('recharts').then((m) => ({ default: m.Tooltip }))
)
const LazyResponsiveContainer = lazy(() =>
  import('recharts').then((m) => ({ default: m.ResponsiveContainer }))
)
const LazyLegend = lazy(() =>
  import('recharts').then((m) => ({ default: m.Legend }))
)

// Quick Stats Card Component
interface QuickStatCardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon: React.ReactNode
  color: string
  isRTL: boolean
}

function QuickStatCard({ title, value, change, changeLabel, icon, color, isRTL }: QuickStatCardProps) {
  const isPositive = change !== undefined && change >= 0

  return (
    <Card className="relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-300">
      <div className={cn("absolute inset-0 opacity-5", color)} />
      <CardContent className="p-5">
        <div className={cn("flex items-start justify-between", isRTL && "flex-row-reverse")}>
          <div className={cn("space-y-1", isRTL && "text-right")}>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {change !== undefined && (
              <div className={cn("flex items-center gap-1 text-xs", isRTL && "flex-row-reverse")}>
                {isPositive ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <span className={isPositive ? "text-green-600" : "text-red-600"}>
                  {isPositive ? '+' : ''}{change}%
                </span>
                {changeLabel && <span className="text-muted-foreground">{changeLabel}</span>}
              </div>
            )}
          </div>
          <div className={cn("p-3 rounded-xl", color)}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Report Navigation Card Component
interface ReportCardProps {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  route: string
  category: string
  categoryLabel: string
  previewValue?: string
  isFavorite?: boolean
  onToggleFavorite?: (id: string) => void
  isRTL: boolean
}

function ReportCard({
  id,
  title,
  description,
  icon,
  route,
  category,
  categoryLabel,
  previewValue,
  isFavorite,
  onToggleFavorite,
  isRTL,
}: ReportCardProps) {
  const navigate = useNavigate()

  const categoryColors: Record<string, string> = {
    pipeline: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    leads: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    performance: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    revenue: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    activity: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
    customer: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  }

  return (
    <Card
      className="group relative overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
      onClick={() => navigate(route)}
    >
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => {
            e.stopPropagation()
            onToggleFavorite?.(id)
          }}
        >
          {isFavorite ? (
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          ) : (
            <StarOff className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </div>

      <CardContent className="p-5">
        <div className={cn("flex items-start gap-4", isRTL && "flex-row-reverse")}>
          <div className="p-3 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 group-hover:scale-110 transition-transform">
            {icon}
          </div>
          <div className={cn("flex-1 min-w-0", isRTL && "text-right")}>
            <Badge variant="outline" className={cn("mb-2 text-xs", categoryColors[category])}>
              {categoryLabel}
            </Badge>
            <h3 className="font-semibold text-base truncate">{title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{description}</p>
            {previewValue && (
              <p className="text-lg font-bold text-primary mt-2">{previewValue}</p>
            )}
          </div>
        </div>

        <div className={cn("flex items-center justify-end mt-4 pt-3 border-t", isRTL && "flex-row-reverse")}>
          <span className="text-sm text-muted-foreground group-hover:text-primary transition-colors flex items-center gap-1">
            {isRTL ? 'عرض التقرير' : 'View Report'}
            <ChevronRight className={cn("h-4 w-4", isRTL && "rotate-180")} />
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

// Mini Chart Wrapper
function MiniChartWrapper({ children, title, isRTL }: { children: React.ReactNode; title: string; isRTL: boolean }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className={cn("text-sm font-medium", isRTL && "text-right")}>{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[150px]">
          <Suspense fallback={<Skeleton className="h-full w-full" />}>
            {children}
          </Suspense>
        </div>
      </CardContent>
    </Card>
  )
}

// Recent Activity Item
interface RecentActivityProps {
  type: 'won' | 'lost' | 'activity' | 'new_lead'
  title: string
  description: string
  time: string
  value?: string
  isRTL: boolean
}

function RecentActivityItem({ type, title, description, time, value, isRTL }: RecentActivityProps) {
  const icons: Record<string, React.ReactNode> = {
    won: <CheckCircle className="h-4 w-4 text-green-500" />,
    lost: <AlertTriangle className="h-4 w-4 text-red-500" />,
    activity: <Activity className="h-4 w-4 text-blue-500" />,
    new_lead: <Users className="h-4 w-4 text-purple-500" />,
  }

  return (
    <div className={cn("flex items-start gap-3 py-3 border-b last:border-0", isRTL && "flex-row-reverse")}>
      <div className="p-2 rounded-lg bg-muted">{icons[type]}</div>
      <div className={cn("flex-1 min-w-0", isRTL && "text-right")}>
        <p className="text-sm font-medium truncate">{title}</p>
        <p className="text-xs text-muted-foreground truncate">{description}</p>
        <p className="text-xs text-muted-foreground mt-1">{time}</p>
      </div>
      {value && (
        <span className="text-sm font-semibold text-green-600">{value}</span>
      )}
    </div>
  )
}

// Main Component
export function CrmReportsDashboardView() {
  const { language, t } = useLanguage()
  const isRTL = language === 'ar'
  const navigate = useNavigate()

  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    to: new Date(),
  })
  const [favorites, setFavorites] = useState<string[]>(['sales-funnel', 'revenue-forecast'])
  const [activeTab, setActiveTab] = useState('all')

  // Mock data for quick stats
  const quickStats = useMemo(() => ({
    totalPipeline: { value: '12.5M', change: 8.2 },
    dealsWon: { value: '47', change: 12.5 },
    winRate: { value: '68%', change: 5.3 },
    avgDealSize: { value: '265K', change: -2.1 },
    activities: { value: '284', change: 15.8 },
    leads: { value: '156', change: 22.4 },
  }), [])

  // Report definitions
  const reports = useMemo(() => [
    {
      id: 'sales-funnel',
      title: isRTL ? 'قمع المبيعات' : 'Sales Funnel',
      description: isRTL ? 'تحليل مراحل الصفقات ومعدلات التحويل' : 'Analyze deal stages and conversion rates',
      icon: <Funnel className="h-5 w-5" />,
      route: '/dashboard/crm/reports/funnel',
      category: 'pipeline',
      categoryLabel: isRTL ? 'خط الأنابيب' : 'Pipeline',
      previewValue: '68% Win Rate',
    },
    {
      id: 'deal-aging',
      title: isRTL ? 'عمر الصفقات' : 'Deal Aging',
      description: isRTL ? 'تتبع الصفقات المتوقفة والمعرضة للخطر' : 'Track stale and at-risk deals',
      icon: <Clock className="h-5 w-5" />,
      route: '/dashboard/crm/reports/aging',
      category: 'pipeline',
      categoryLabel: isRTL ? 'خط الأنابيب' : 'Pipeline',
      previewValue: '12 At Risk',
    },
    {
      id: 'leads-by-source',
      title: isRTL ? 'العملاء المحتملين حسب المصدر' : 'Leads by Source',
      description: isRTL ? 'تحليل مصادر العملاء المحتملين وفعاليتها' : 'Analyze lead sources and their effectiveness',
      icon: <Users className="h-5 w-5" />,
      route: '/dashboard/crm/reports/leads-source',
      category: 'leads',
      categoryLabel: isRTL ? 'العملاء المحتملين' : 'Leads',
      previewValue: '156 Leads',
    },
    {
      id: 'win-loss',
      title: isRTL ? 'تحليل الفوز والخسارة' : 'Win/Loss Analysis',
      description: isRTL ? 'فهم أسباب الفوز والخسارة في الصفقات' : 'Understand why deals are won or lost',
      icon: <Target className="h-5 w-5" />,
      route: '/dashboard/crm/reports/win-loss',
      category: 'performance',
      categoryLabel: isRTL ? 'الأداء' : 'Performance',
      previewValue: '68% Win Rate',
    },
    {
      id: 'activity-analytics',
      title: isRTL ? 'تحليلات النشاط' : 'Activity Analytics',
      description: isRTL ? 'تتبع أنشطة المبيعات والإنتاجية' : 'Track sales activities and productivity',
      icon: <Activity className="h-5 w-5" />,
      route: '/dashboard/crm/reports/activities',
      category: 'activity',
      categoryLabel: isRTL ? 'النشاط' : 'Activity',
      previewValue: '284 This Week',
    },
    {
      id: 'revenue-forecast',
      title: isRTL ? 'توقعات الإيرادات' : 'Revenue Forecast',
      description: isRTL ? 'توقع الإيرادات وتتبع الحصص' : 'Forecast revenue and track quotas',
      icon: <DollarSign className="h-5 w-5" />,
      route: '/dashboard/crm/reports/forecast',
      category: 'revenue',
      categoryLabel: isRTL ? 'الإيرادات' : 'Revenue',
      previewValue: '89% of Quota',
    },
    {
      id: 'lead-conversion',
      title: isRTL ? 'تحويل العملاء المحتملين' : 'Lead Conversion',
      description: isRTL ? 'تحليل معدلات ومراحل التحويل' : 'Analyze conversion rates and stages',
      icon: <ArrowRight className="h-5 w-5" />,
      route: '/dashboard/crm/reports/lead-conversion',
      category: 'leads',
      categoryLabel: isRTL ? 'العملاء المحتملين' : 'Leads',
      previewValue: '42% Conversion',
    },
    {
      id: 'sales-leaderboard',
      title: isRTL ? 'لوحة متصدري المبيعات' : 'Sales Leaderboard',
      description: isRTL ? 'تتبع أداء فريق المبيعات' : 'Track sales team performance',
      icon: <Award className="h-5 w-5" />,
      route: '/dashboard/crm/reports/leaderboard',
      category: 'performance',
      categoryLabel: isRTL ? 'الأداء' : 'Performance',
      previewValue: 'Top: Sarah M.',
    },
    {
      id: 'customer-health',
      title: isRTL ? 'صحة العملاء' : 'Customer Health',
      description: isRTL ? 'مراقبة رضا العملاء ومخاطر الانسحاب' : 'Monitor customer satisfaction and churn risk',
      icon: <Zap className="h-5 w-5" />,
      route: '/dashboard/crm/reports/customer-health',
      category: 'customer',
      categoryLabel: isRTL ? 'العملاء' : 'Customer',
      previewValue: '85% Healthy',
    },
  ], [isRTL])

  // Filter reports by category
  const filteredReports = useMemo(() => {
    if (activeTab === 'all') return reports
    if (activeTab === 'favorites') return reports.filter(r => favorites.includes(r.id))
    return reports.filter(r => r.category === activeTab)
  }, [reports, activeTab, favorites])

  // Mock data for mini charts
  const funnelData = useMemo(() => [
    { name: isRTL ? 'جديد' : 'New', value: 156 },
    { name: isRTL ? 'مؤهل' : 'Qualified', value: 98 },
    { name: isRTL ? 'عرض' : 'Proposal', value: 67 },
    { name: isRTL ? 'تفاوض' : 'Negotiation', value: 45 },
    { name: isRTL ? 'فوز' : 'Won', value: 32 },
  ], [isRTL])

  const trendData = useMemo(() => [
    { month: 'Aug', winRate: 62 },
    { month: 'Sep', winRate: 65 },
    { month: 'Oct', winRate: 58 },
    { month: 'Nov', winRate: 71 },
    { month: 'Dec', winRate: 68 },
  ], [])

  const activityData = useMemo(() => [
    { name: isRTL ? 'مكالمات' : 'Calls', value: 145 },
    { name: isRTL ? 'بريد' : 'Emails', value: 234 },
    { name: isRTL ? 'اجتماعات' : 'Meetings', value: 56 },
    { name: isRTL ? 'مهام' : 'Tasks', value: 89 },
  ], [isRTL])

  // Mock recent activities
  const recentActivities = useMemo(() => [
    {
      type: 'won' as const,
      title: isRTL ? 'شركة الفيصل للتطوير' : 'Al Faisal Development Co.',
      description: isRTL ? 'صفقة عقد استشاري' : 'Consulting contract deal',
      time: isRTL ? 'منذ ساعتين' : '2 hours ago',
      value: '450K SAR',
    },
    {
      type: 'new_lead' as const,
      title: isRTL ? 'مجموعة الراجحي' : 'Al Rajhi Group',
      description: isRTL ? 'عميل محتمل جديد من المعرض' : 'New lead from exhibition',
      time: isRTL ? 'منذ 4 ساعات' : '4 hours ago',
    },
    {
      type: 'activity' as const,
      title: isRTL ? 'اجتماع مع شركة سابك' : 'Meeting with SABIC',
      description: isRTL ? 'اجتماع متابعة للعرض' : 'Follow-up meeting on proposal',
      time: isRTL ? 'منذ 5 ساعات' : '5 hours ago',
    },
    {
      type: 'lost' as const,
      title: isRTL ? 'بنك الإنماء' : 'Alinma Bank',
      description: isRTL ? 'خسارة بسبب السعر' : 'Lost due to pricing',
      time: isRTL ? 'منذ يوم' : '1 day ago',
      value: '180K SAR',
    },
  ], [isRTL])

  // Scheduled reports mock data
  const scheduledReports = useMemo(() => [
    {
      id: '1',
      name: isRTL ? 'تقرير المبيعات الأسبوعي' : 'Weekly Sales Report',
      frequency: isRTL ? 'أسبوعي' : 'Weekly',
      nextRun: 'Mon, 9:00 AM',
      recipients: 3,
    },
    {
      id: '2',
      name: isRTL ? 'تقرير خط الأنابيب الشهري' : 'Monthly Pipeline Report',
      frequency: isRTL ? 'شهري' : 'Monthly',
      nextRun: 'Jan 1, 8:00 AM',
      recipients: 5,
    },
  ], [isRTL])

  const toggleFavorite = (id: string) => {
    setFavorites(prev =>
      prev.includes(id)
        ? prev.filter(f => f !== id)
        : [...prev, id]
    )
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

  return (
    <div
      className={cn(
        "min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950",
        isRTL ? "font-['IBM_Plex_Sans_Arabic']" : ""
      )}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <TopNav />
      <DynamicIsland />

      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Hero Header */}
        <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 p-8 text-white shadow-xl">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

          <div className={cn("relative z-10", isRTL && "text-right")}>
            <div className={cn("flex items-center justify-between flex-wrap gap-4", isRTL && "flex-row-reverse")}>
              <div>
                <Badge variant="secondary" className="mb-3 bg-white/20 text-white border-0">
                  <BarChart3 className="h-3 w-3 mr-1" />
                  {isRTL ? 'لوحة التقارير' : 'Reports Dashboard'}
                </Badge>
                <h1 className="text-3xl font-bold tracking-tight mb-2">
                  {isRTL ? 'تقارير إدارة العملاء' : 'CRM Reports'}
                </h1>
                <p className="text-white/80 max-w-2xl">
                  {isRTL
                    ? 'تحليلات شاملة ورؤى لاتخاذ قرارات مبنية على البيانات'
                    : 'Comprehensive analytics and insights for data-driven decisions'}
                </p>
              </div>

              <div className={cn("flex items-center gap-3 flex-wrap", isRTL && "flex-row-reverse")}>
                <DatePickerWithRange
                  date={dateRange}
                  onDateChange={(range) => range && setDateRange({ from: range.from!, to: range.to! })}
                  className="bg-white/10 border-white/20 text-white [&>button]:text-white"
                />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" className="bg-white/20 border-0 text-white hover:bg-white/30">
                      <Download className="h-4 w-4 mr-2" />
                      {isRTL ? 'تصدير' : 'Export'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align={isRTL ? "start" : "end"}>
                    <DropdownMenuItem>
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      {isRTL ? 'تصدير Excel' : 'Export Excel'}
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <FileText className="h-4 w-4 mr-2" />
                      {isRTL ? 'تصدير PDF' : 'Export PDF'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Mail className="h-4 w-4 mr-2" />
                      {isRTL ? 'جدولة البريد' : 'Schedule Email'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button variant="secondary" size="icon" className="bg-white/20 border-0 text-white hover:bg-white/30">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <QuickStatCard
            title={isRTL ? 'إجمالي خط الأنابيب' : 'Total Pipeline'}
            value={`${quickStats.totalPipeline.value} SAR`}
            change={quickStats.totalPipeline.change}
            changeLabel={isRTL ? 'من الشهر الماضي' : 'vs last month'}
            icon={<DollarSign className="h-5 w-5 text-white" />}
            color="bg-gradient-to-br from-emerald-500 to-teal-500"
            isRTL={isRTL}
          />
          <QuickStatCard
            title={isRTL ? 'الصفقات المربوحة' : 'Deals Won'}
            value={quickStats.dealsWon.value}
            change={quickStats.dealsWon.change}
            changeLabel={isRTL ? 'هذا الشهر' : 'this month'}
            icon={<CheckCircle className="h-5 w-5 text-white" />}
            color="bg-gradient-to-br from-green-500 to-emerald-500"
            isRTL={isRTL}
          />
          <QuickStatCard
            title={isRTL ? 'معدل الفوز' : 'Win Rate'}
            value={quickStats.winRate.value}
            change={quickStats.winRate.change}
            icon={<Target className="h-5 w-5 text-white" />}
            color="bg-gradient-to-br from-blue-500 to-indigo-500"
            isRTL={isRTL}
          />
          <QuickStatCard
            title={isRTL ? 'متوسط حجم الصفقة' : 'Avg Deal Size'}
            value={`${quickStats.avgDealSize.value} SAR`}
            change={quickStats.avgDealSize.change}
            icon={<BarChart3 className="h-5 w-5 text-white" />}
            color="bg-gradient-to-br from-purple-500 to-pink-500"
            isRTL={isRTL}
          />
          <QuickStatCard
            title={isRTL ? 'الأنشطة' : 'Activities'}
            value={quickStats.activities.value}
            change={quickStats.activities.change}
            changeLabel={isRTL ? 'هذا الأسبوع' : 'this week'}
            icon={<Activity className="h-5 w-5 text-white" />}
            color="bg-gradient-to-br from-cyan-500 to-blue-500"
            isRTL={isRTL}
          />
          <QuickStatCard
            title={isRTL ? 'عملاء محتملين جدد' : 'New Leads'}
            value={quickStats.leads.value}
            change={quickStats.leads.change}
            changeLabel={isRTL ? 'هذا الشهر' : 'this month'}
            icon={<Users className="h-5 w-5 text-white" />}
            color="bg-gradient-to-br from-orange-500 to-amber-500"
            isRTL={isRTL}
          />
        </div>

        {/* Report Categories Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className={cn("mb-6 flex-wrap h-auto p-1 bg-muted/50", isRTL && "flex-row-reverse")}>
            <TabsTrigger value="all" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800">
              {isRTL ? 'الكل' : 'All Reports'}
            </TabsTrigger>
            <TabsTrigger value="favorites" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800">
              <Star className="h-4 w-4 mr-1" />
              {isRTL ? 'المفضلة' : 'Favorites'}
            </TabsTrigger>
            <TabsTrigger value="pipeline" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800">
              {isRTL ? 'خط الأنابيب' : 'Pipeline'}
            </TabsTrigger>
            <TabsTrigger value="leads" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800">
              {isRTL ? 'العملاء المحتملين' : 'Leads'}
            </TabsTrigger>
            <TabsTrigger value="performance" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800">
              {isRTL ? 'الأداء' : 'Performance'}
            </TabsTrigger>
            <TabsTrigger value="revenue" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800">
              {isRTL ? 'الإيرادات' : 'Revenue'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            {/* Report Navigation Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredReports.map((report) => (
                <ReportCard
                  key={report.id}
                  {...report}
                  isFavorite={favorites.includes(report.id)}
                  onToggleFavorite={toggleFavorite}
                  isRTL={isRTL}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Featured Charts & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Mini Charts */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
            <MiniChartWrapper title={isRTL ? 'توزيع القمع' : 'Funnel Distribution'} isRTL={isRTL}>
              <Suspense fallback={<Skeleton className="h-full w-full" />}>
                <LazyResponsiveContainer width="100%" height="100%">
                  <LazyBarChart data={funnelData} layout="vertical">
                    <LazyXAxis type="number" hide />
                    <LazyYAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={60} />
                    <LazyTooltip />
                    <LazyBar dataKey="value" fill="#8884d8" radius={[0, 4, 4, 0]} />
                  </LazyBarChart>
                </LazyResponsiveContainer>
              </Suspense>
            </MiniChartWrapper>

            <MiniChartWrapper title={isRTL ? 'اتجاه معدل الفوز' : 'Win Rate Trend'} isRTL={isRTL}>
              <Suspense fallback={<Skeleton className="h-full w-full" />}>
                <LazyResponsiveContainer width="100%" height="100%">
                  <LazyLineChart data={trendData}>
                    <LazyXAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <LazyYAxis tick={{ fontSize: 11 }} domain={[50, 80]} />
                    <LazyTooltip />
                    <LazyLine
                      type="monotone"
                      dataKey="winRate"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ fill: '#10b981', strokeWidth: 2 }}
                    />
                  </LazyLineChart>
                </LazyResponsiveContainer>
              </Suspense>
            </MiniChartWrapper>

            <MiniChartWrapper title={isRTL ? 'ملخص النشاط' : 'Activity Summary'} isRTL={isRTL}>
              <Suspense fallback={<Skeleton className="h-full w-full" />}>
                <LazyResponsiveContainer width="100%" height="100%">
                  <LazyPieChart>
                    <LazyPie
                      data={activityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={55}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {activityData.map((_, index) => (
                        <LazyCell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </LazyPie>
                    <LazyTooltip />
                  </LazyPieChart>
                </LazyResponsiveContainer>
              </Suspense>
            </MiniChartWrapper>
          </div>

          {/* Recent Activity */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                <CardTitle className="text-base font-semibold">
                  {isRTL ? 'النشاط الأخير' : 'Recent Activity'}
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-xs">
                  {isRTL ? 'عرض الكل' : 'View All'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {recentActivities.map((activity, index) => (
                <RecentActivityItem key={index} {...activity} isRTL={isRTL} />
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Scheduled Reports */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
              <div className={isRTL ? "text-right" : ""}>
                <CardTitle className="text-base font-semibold">
                  {isRTL ? 'التقارير المجدولة' : 'Scheduled Reports'}
                </CardTitle>
                <CardDescription>
                  {isRTL ? 'إدارة التقارير التلقائية عبر البريد الإلكتروني' : 'Manage automated email reports'}
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Calendar className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                {isRTL ? 'إضافة تقرير مجدول' : 'Add Scheduled Report'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scheduledReports.map((report) => (
                <div
                  key={report.id}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors",
                    isRTL && "flex-row-reverse"
                  )}
                >
                  <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Bell className="h-4 w-4 text-primary" />
                    </div>
                    <div className={isRTL ? "text-right" : ""}>
                      <p className="font-medium text-sm">{report.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {report.frequency} • {isRTL ? 'التالي:' : 'Next:'} {report.nextRun}
                      </p>
                    </div>
                  </div>
                  <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                    <Badge variant="secondary" className="text-xs">
                      {report.recipients} {isRTL ? 'مستلمين' : 'recipients'}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align={isRTL ? "start" : "end"}>
                        <DropdownMenuItem>
                          <Settings className="h-4 w-4 mr-2" />
                          {isRTL ? 'تعديل' : 'Edit'}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Zap className="h-4 w-4 mr-2" />
                          {isRTL ? 'تشغيل الآن' : 'Run Now'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          {isRTL ? 'حذف' : 'Delete'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default CrmReportsDashboardView
