import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Users,
  UserPlus,
  Award,
  Search,
  Bell,
  Download,
  RefreshCw,
  Target,
  Brain,
  Activity,
} from 'lucide-react'
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
import { Skeleton } from '@/components/ui/skeleton'
import { ProductivityHero } from '@/components/productivity-hero'
import { HRSidebar } from './hr-sidebar'
import {
  useAttritionRisk,
  useHiringNeedsForecast,
  usePromotionReadiness,
  useRecalculatePredictions,
} from '@/hooks/useHrAnalytics'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts'
import { Link } from '@tanstack/react-router'

const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899']
const RISK_COLORS = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#10b981',
}

export function HrPredictionsDashboard() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const [forecastMonths, setForecastMonths] = useState(12)

  // Fetch predictions data
  const { data: attritionData, isLoading: attritionLoading } = useAttritionRisk()
  const { data: hiringData, isLoading: hiringLoading } = useHiringNeedsForecast(forecastMonths)
  const { data: promotionData, isLoading: promotionLoading } = usePromotionReadiness(75)
  const { mutate: recalculate, isPending: isRecalculating } = useRecalculatePredictions()

  const topNav = [
    { title: t('biometric.devices'), href: '/dashboard/hr/biometric', isActive: false },
    { title: t('biometric.geofencing'), href: '/dashboard/hr/geofencing', isActive: false },
    { title: t('hrAnalytics.title'), href: '/dashboard/hr/analytics', isActive: false },
    { title: t('hrPredictions.title'), href: '/dashboard/hr/predictions', isActive: true },
  ]

  const handleRecalculate = () => {
    recalculate()
  }

  return (
    <>
      {/* Header */}
      <Header className="bg-navy shadow-none relative">
        <TopNav
          links={topNav}
          className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white"
        />

        {/* Dynamic Island - Centered */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>

        <div className="ms-auto flex items-center gap-2 sm:gap-4 overflow-x-auto min-w-0">
          <div className="relative hidden md:block min-w-0">
            <Search
              className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500"
              aria-hidden="true"
            />
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
            className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0"
            aria-label="الإشعارات"
          >
            <Bell className="h-5 w-5" aria-hidden="true" />
            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
          </Button>
          <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
          <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white hidden sm:flex flex-shrink-0" />
          <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white hidden lg:flex flex-shrink-0" />
          <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
        </div>
        {/* Bottom Gradient Line */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main
        fluid={true}
        className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']"
      >
        {/* HERO CARD */}
        <ProductivityHero
          badge="الموارد البشرية"
          title="AI Predictions"
          type="analytics"
        />

        {/* Action Bar */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Badge className="bg-purple-100 text-purple-700 border-0 rounded-full px-4 py-1.5 text-sm">
              <Brain className="h-4 w-4 me-1" />
              {t('hrPredictions.aiPowered')}
            </Badge>
            <span className="text-sm text-slate-500">
              {t('hrPredictions.lastUpdated')}: {new Date().toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="rounded-lg"
              onClick={handleRecalculate}
              disabled={isRecalculating}
            >
              <RefreshCw className={`h-4 w-4 me-2 ${isRecalculating ? 'animate-spin' : ''}`} />
              {t('common.refresh')}
            </Button>
            <Button variant="outline" className="rounded-lg">
              <Download className="h-4 w-4 me-2" />
              {t('common.export')}
            </Button>
          </div>
        </div>

        {/* MAIN GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* RIGHT COLUMN (Main Content) */}
          <div className="lg:col-span-2 space-y-6">
            {/* KEY METRICS ROW */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard
                title={t('hrPredictions.highRiskEmployees')}
                value={attritionData?.summary?.highRisk}
                icon={AlertTriangle}
                color="red"
                loading={attritionLoading}
              />
              <MetricCard
                title={t('hrPredictions.hiringNeeds')}
                value={hiringData?.summary?.totalPositions}
                icon={UserPlus}
                color="blue"
                loading={hiringLoading}
              />
              <MetricCard
                title={t('hrPredictions.promotionReady')}
                value={promotionData?.summary?.readyCount}
                icon={Award}
                color="purple"
                loading={promotionLoading}
              />
            </div>

            {/* ATTRITION RISK SECTION */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-navy text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  {t('hrPredictions.attritionRisk')}
                </h3>
                <Badge className="bg-slate-100 text-slate-600 border-0 rounded-full px-4 py-1">
                  {attritionData?.employees?.length || 0} {t('common.employees')}
                </Badge>
              </div>

              {attritionLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <div className="space-y-4">
                  {/* Risk Distribution Chart */}
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart
                      data={attritionData?.riskDistribution || []}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis type="number" stroke="#64748b" fontSize={12} />
                      <YAxis
                        type="category"
                        dataKey="level"
                        stroke="#64748b"
                        fontSize={12}
                        width={80}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          border: 'none',
                          borderRadius: '12px',
                          color: '#fff',
                        }}
                      />
                      <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                        {(attritionData?.riskDistribution || []).map((entry: any) => (
                          <Cell
                            key={entry.level}
                            fill={RISK_COLORS[entry.level as keyof typeof RISK_COLORS] || '#10b981'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>

                  {/* High Risk Employees List */}
                  {attritionData?.employees && attritionData.employees.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-bold text-slate-700 text-sm">
                        {t('hrPredictions.highRiskEmployeesList')}
                      </h4>
                      {attritionData.employees.slice(0, 5).map((employee: any) => (
                        <Link
                          key={employee.employeeId}
                          to={`/dashboard/hr/employees/${employee.employeeId}`}
                          className="flex items-center justify-between p-4 bg-red-50 rounded-xl hover:bg-red-100 transition-colors border border-red-100"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold">
                              {employee.employeeName?.charAt(0) || 'E'}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 text-sm">
                                {employee.employeeName}
                              </p>
                              <p className="text-xs text-slate-500">
                                {employee.department} • {employee.position}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-end">
                              <p className="text-xs text-slate-500">{t('hrPredictions.riskScore')}</p>
                              <p className="font-bold text-red-600">{employee.riskScore}%</p>
                            </div>
                            <Badge
                              className={`${
                                employee.riskLevel === 'high'
                                  ? 'bg-red-100 text-red-700'
                                  : employee.riskLevel === 'medium'
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              } border-0 rounded-md px-2`}
                            >
                              {employee.riskLevel}
                            </Badge>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* HIRING NEEDS FORECAST */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-navy text-lg flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-blue-500" />
                  {t('hrPredictions.hiringForecast')}
                </h3>
                <div className="flex gap-2">
                  {[6, 12, 24].map((months) => (
                    <Button
                      key={months}
                      size="sm"
                      onClick={() => setForecastMonths(months)}
                      className={
                        forecastMonths === months
                          ? 'bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-3'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-full px-3 border-0'
                      }
                    >
                      {months}m
                    </Button>
                  ))}
                </div>
              </div>

              {hiringLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <div className="space-y-4">
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={hiringData?.forecast || []}>
                      <defs>
                        <linearGradient id="colorHiring" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                      <YAxis stroke="#64748b" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          border: 'none',
                          borderRadius: '12px',
                          color: '#fff',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="positions"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fill="url(#colorHiring)"
                        dot={{ fill: '#3b82f6', r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>

                  {/* Department Needs */}
                  {hiringData?.byDepartment && hiringData.byDepartment.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {hiringData.byDepartment.slice(0, 6).map((dept: any) => (
                        <div
                          key={dept.department}
                          className="p-4 bg-blue-50 rounded-xl text-center"
                        >
                          <p className="text-xs text-slate-600 mb-1">{dept.department}</p>
                          <p className="text-2xl font-bold text-blue-600">{dept.positions}</p>
                          <p className="text-xs text-slate-500">{t('common.positions')}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* PROMOTION READINESS */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-navy text-lg flex items-center gap-2">
                  <Award className="h-5 w-5 text-purple-500" />
                  {t('hrPredictions.promotionReadiness')}
                </h3>
                <Badge className="bg-slate-100 text-slate-600 border-0 rounded-full px-4 py-1">
                  {promotionData?.employees?.length || 0} {t('common.employees')}
                </Badge>
              </div>

              {promotionLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <div className="space-y-4">
                  {/* Readiness Score Distribution */}
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={promotionData?.scoreDistribution || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="range" stroke="#64748b" fontSize={12} />
                      <YAxis stroke="#64748b" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          border: 'none',
                          borderRadius: '12px',
                          color: '#fff',
                        }}
                      />
                      <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>

                  {/* Ready Employees List */}
                  {promotionData?.employees && promotionData.employees.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-bold text-slate-700 text-sm">
                        {t('hrPredictions.topCandidates')}
                      </h4>
                      {promotionData.employees.slice(0, 5).map((employee: any) => (
                        <Link
                          key={employee.employeeId}
                          to={`/dashboard/hr/employees/${employee.employeeId}`}
                          className="flex items-center justify-between p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors border border-purple-100"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                              {employee.employeeName?.charAt(0) || 'E'}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 text-sm">
                                {employee.employeeName}
                              </p>
                              <p className="text-xs text-slate-500">
                                {employee.currentPosition} → {employee.suggestedPosition}
                              </p>
                            </div>
                          </div>
                          <div className="text-end">
                            <p className="text-xs text-slate-500">{t('hrPredictions.readinessScore')}</p>
                            <p className="font-bold text-purple-600">{employee.readinessScore}%</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* LEFT COLUMN (Sidebar) */}
          <HRSidebar context="predictions" />
        </div>
      </Main>
    </>
  )
}

// Metric Card Component
function MetricCard({
  title,
  value,
  icon: Icon,
  color,
  loading,
}: {
  title: string
  value?: number
  icon: React.ComponentType<{ className?: string }>
  color: 'emerald' | 'blue' | 'purple' | 'red' | 'orange'
  loading?: boolean
}) {
  const colorClasses = {
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600',
    orange: 'bg-orange-50 text-orange-600',
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <div className="text-3xl font-bold text-navy">
        {loading ? <Skeleton className="h-8 w-16" /> : value || 0}
      </div>
      <div className="text-sm text-slate-500 mt-1">{title}</div>
    </div>
  )
}
