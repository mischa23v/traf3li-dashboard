/**
 * ML Lead Scoring Analytics Page
 * Comprehensive dashboard for ML scoring analytics and model performance
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Brain,
  BarChart3,
  Target,
  TrendingUp,
  RefreshCw,
  Download,
  Settings,
  Bell,
  Search,
  Loader2,
  AlertCircle,
  Activity,
  Zap,
  PieChart,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ProductivityHero } from '@/components/productivity-hero'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import {
  useMLDashboard,
  useFeatureImportance,
  useScoreDistribution,
  useModelMetrics,
  useTrainModel,
  useExportTrainingData,
} from '@/hooks/useMlScoring'
import { PriorityQueue } from './components/priority-queue'
import { SLADashboard } from './components/sla-dashboard'
import { ROUTES } from '@/constants/routes'

// ==================== CONSTANTS ====================

const SCORE_COLORS = {
  high: '#22c55e',
  medium: '#f59e0b',
  low: '#ef4444',
}

// ==================== MAIN COMPONENT ====================

export function MLAnalytics() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  const [period, setPeriod] = useState(30)

  // Data hooks
  const { data: dashboardData, isLoading: dashboardLoading, isError: dashboardError } = useMLDashboard({ period })
  const { data: featureData, isLoading: featureLoading } = useFeatureImportance()
  const { data: distributionData, isLoading: distributionLoading } = useScoreDistribution()
  const { data: modelData, isLoading: modelLoading } = useModelMetrics()

  // Mutation hooks
  const trainModelMutation = useTrainModel()
  const exportDataMutation = useExportTrainingData()

  const isLoading = dashboardLoading || featureLoading || distributionLoading || modelLoading
  const dashboard = dashboardData?.data
  const features = featureData?.data?.features || []
  const distribution = distributionData?.data
  const modelMetrics = modelData?.data

  // Prepare chart data
  const featureChartData = features.slice(0, 10).map((f) => ({
    name: formatFeatureName(f.name, isRTL),
    importance: f.importance * 100,
  }))

  const distributionChartData = distribution
    ? [
        { name: isRTL ? 'عالي (70-100)' : 'High (70-100)', value: distribution.high, color: SCORE_COLORS.high },
        { name: isRTL ? 'متوسط (40-69)' : 'Medium (40-69)', value: distribution.medium, color: SCORE_COLORS.medium },
        { name: isRTL ? 'منخفض (0-39)' : 'Low (0-39)', value: distribution.low, color: SCORE_COLORS.low },
      ]
    : []

  const topNav = [
    { title: t('sidebar.nav.overview', 'Overview'), href: ROUTES.dashboard.overview, isActive: false },
    { title: t('sidebar.nav.leads', 'Leads'), href: ROUTES.dashboard.crm.leads.list, isActive: false },
    { title: t('mlScoring.nav.analytics', 'ML Analytics'), href: ROUTES.dashboard.ml.analytics, isActive: true },
  ]

  return (
    <>
      {/* Header */}
      <Header className="bg-navy shadow-none relative">
        <TopNav
          links={topNav}
          className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white"
        />

        {/* Dynamic Island */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>

        <div className="ms-auto flex items-center gap-2 sm:gap-4 overflow-x-auto min-w-0">
          <div className="relative hidden md:block min-w-0">
            <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder={t('common.search', 'Search...')}
              className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 end-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
          </Button>
          <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
          <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white hidden sm:flex flex-shrink-0" />
          <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white hidden lg:flex flex-shrink-0" />
          <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      {/* Main Content */}
      <Main
        fluid={true}
        className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']"
      >
        {/* Hero Card */}
        <ProductivityHero
          badge={t('mlScoring.badge', 'AI-Powered')}
          title={t('mlScoring.title', 'ML Lead Scoring')}
          type="analytics"
        />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Model Performance Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                icon={Target}
                iconColor="text-blue-600"
                iconBg="bg-blue-100"
                label={t('mlScoring.stats.accuracy', 'Accuracy')}
                value={modelMetrics ? `${(modelMetrics.accuracy * 100).toFixed(1)}%` : '-'}
                isLoading={modelLoading}
              />
              <StatCard
                icon={Zap}
                iconColor="text-purple-600"
                iconBg="bg-purple-100"
                label={t('mlScoring.stats.precision', 'Precision')}
                value={modelMetrics ? `${(modelMetrics.precision * 100).toFixed(1)}%` : '-'}
                isLoading={modelLoading}
              />
              <StatCard
                icon={Activity}
                iconColor="text-emerald-600"
                iconBg="bg-emerald-100"
                label={t('mlScoring.stats.recall', 'Recall')}
                value={modelMetrics ? `${(modelMetrics.recall * 100).toFixed(1)}%` : '-'}
                isLoading={modelLoading}
              />
              <StatCard
                icon={TrendingUp}
                iconColor="text-amber-600"
                iconBg="bg-amber-100"
                label={t('mlScoring.stats.f1Score', 'F1 Score')}
                value={modelMetrics ? modelMetrics.f1Score.toFixed(2) : '-'}
                isLoading={modelLoading}
              />
            </div>

            {/* Actions Bar */}
            <Card className="rounded-2xl border-slate-100">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-emerald-100 text-emerald-700 border-0 rounded-full px-3">
                      <Brain className="w-3 h-3 me-1" />
                      {modelMetrics?.modelVersion || 'v1.0.0'}
                    </Badge>
                    {modelMetrics?.lastTrainedAt && (
                      <span className="text-sm text-slate-500">
                        {t('mlScoring.lastTrained', 'Last trained')}:{' '}
                        {new Date(modelMetrics.lastTrainedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => trainModelMutation.mutate({})}
                      disabled={trainModelMutation.isPending}
                      className="rounded-xl"
                    >
                      <RefreshCw className={cn('w-4 h-4 me-1', trainModelMutation.isPending && 'animate-spin')} />
                      {t('mlScoring.actions.retrain', 'Retrain Model')}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" disabled={exportDataMutation.isPending} className="rounded-xl">
                          <Download className="w-4 h-4 me-1" />
                          {t('common.export', 'Export')}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => exportDataMutation.mutate('json')}>JSON</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => exportDataMutation.mutate('csv')}>CSV</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Feature Importance Chart */}
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-6">
                  <h3 className="font-bold text-navy text-lg flex items-center gap-2 mb-4">
                    <BarChart3 className="w-5 h-5 text-blue-500" />
                    {t('mlScoring.charts.featureImportance', 'Feature Importance')}
                  </h3>
                  {featureLoading ? (
                    <Skeleton className="h-[280px] rounded-xl" />
                  ) : featureChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={featureChartData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis type="number" stroke="#64748b" fontSize={12} />
                        <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={11} width={100} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1e293b',
                            border: 'none',
                            borderRadius: '12px',
                            color: '#fff',
                          }}
                          formatter={(value: number) => [`${value.toFixed(1)}%`, 'Importance']}
                        />
                        <Bar dataKey="importance" fill="#3b82f6" radius={[0, 8, 8, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[280px] flex items-center justify-center text-slate-400">
                      {t('mlScoring.noData', 'No data available')}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Score Distribution Chart */}
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-6">
                  <h3 className="font-bold text-navy text-lg flex items-center gap-2 mb-4">
                    <PieChart className="w-5 h-5 text-purple-500" />
                    {t('mlScoring.charts.scoreDistribution', 'Score Distribution')}
                  </h3>
                  {distributionLoading ? (
                    <Skeleton className="h-[280px] rounded-xl" />
                  ) : distributionChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={280}>
                      <RechartsPieChart>
                        <Pie
                          data={distributionChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {distributionChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1e293b',
                            border: 'none',
                            borderRadius: '12px',
                            color: '#fff',
                          }}
                        />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[280px] flex items-center justify-center text-slate-400">
                      {t('mlScoring.noData', 'No data available')}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Priority Queue */}
            <PriorityQueue showFilters={true} limit={10} />
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* SLA Dashboard */}
            <SLADashboard period="7d" />

            {/* Model Info Card */}
            <Card className="rounded-2xl border-slate-100">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-bold text-navy flex items-center gap-2">
                  <Settings className="w-5 h-5 text-slate-500" />
                  {t('mlScoring.modelInfo.title', 'Model Information')}
                </h3>

                {modelLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ) : modelMetrics ? (
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">{t('mlScoring.modelInfo.version', 'Version')}</span>
                      <span className="font-medium text-slate-700">{modelMetrics.modelVersion}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">{t('mlScoring.modelInfo.auc', 'AUC Score')}</span>
                      <span className="font-medium text-slate-700">{modelMetrics.auc.toFixed(3)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">{t('mlScoring.modelInfo.trainingData', 'Training Data')}</span>
                      <span className="font-medium text-slate-700">
                        {modelMetrics.trainingDataSize.toLocaleString()} {t('mlScoring.modelInfo.samples', 'samples')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">{t('mlScoring.modelInfo.lastTrained', 'Last Trained')}</span>
                      <span className="font-medium text-slate-700">
                        {new Date(modelMetrics.lastTrainedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm">{t('mlScoring.noData', 'No data available')}</p>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="rounded-2xl border-slate-100">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-bold text-navy flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                  {t('mlScoring.quickStats.title', 'Quick Stats')}
                </h3>

                {dashboardLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ) : dashboard ? (
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">{t('mlScoring.quickStats.totalScored', 'Total Scored')}</span>
                      <span className="font-medium text-slate-700">{dashboard.totalScored?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">{t('mlScoring.quickStats.avgScore', 'Average Score')}</span>
                      <span className="font-medium text-slate-700">{((dashboard.avgScore || 0) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">{t('mlScoring.quickStats.conversionRate', 'Conversion Rate')}</span>
                      <span className="font-medium text-emerald-600">
                        {((dashboard.conversionRate || 0) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm">{t('mlScoring.noData', 'No data available')}</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </Main>
    </>
  )
}

// ==================== SUB-COMPONENTS ====================

interface StatCardProps {
  icon: typeof Target
  iconColor: string
  iconBg: string
  label: string
  value: string
  isLoading?: boolean
}

const StatCard = ({ icon: Icon, iconColor, iconBg, label, value, isLoading }: StatCardProps) => (
  <Card className="rounded-2xl border-slate-100">
    <CardContent className="p-4">
      <div className="flex items-center gap-3">
        <div className={cn('p-2 rounded-xl', iconBg)}>
          <Icon className={cn('w-5 h-5', iconColor)} />
        </div>
        <div>
          <p className="text-xs text-slate-500">{label}</p>
          {isLoading ? (
            <Skeleton className="h-6 w-16" />
          ) : (
            <p className="text-xl font-bold text-navy">{value}</p>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
)

// ==================== HELPERS ====================

const formatFeatureName = (name: string, isRTL: boolean): string => {
  const translations: Record<string, { ar: string; en: string }> = {
    engagementVelocity: { ar: 'سرعة التفاعل', en: 'Engagement' },
    responseSpeedPercentile: { ar: 'سرعة الاستجابة', en: 'Response Speed' },
    meetingReliability: { ar: 'موثوقية الاجتماعات', en: 'Meeting Reliability' },
    urgencySignal: { ar: 'إشارة الاستعجال', en: 'Urgency Signal' },
    activitiesLast7d: { ar: 'أنشطة 7 أيام', en: 'Activities 7d' },
    activityTrend: { ar: 'اتجاه النشاط', en: 'Activity Trend' },
    sourceConversionRate: { ar: 'معدل المصدر', en: 'Source Rate' },
    budgetScore: { ar: 'درجة الميزانية', en: 'Budget' },
    authorityScore: { ar: 'درجة الصلاحية', en: 'Authority' },
    needScore: { ar: 'درجة الحاجة', en: 'Need' },
    timelineScore: { ar: 'الجدول الزمني', en: 'Timeline' },
  }

  const translation = translations[name]
  if (translation) {
    return isRTL ? translation.ar : translation.en
  }

  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .slice(0, 15)
}

export default MLAnalytics
