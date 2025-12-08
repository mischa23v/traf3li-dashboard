import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Users,
  TrendingUp,
  TrendingDown,
  Clock,
  Calendar,
  DollarSign,
  Award,
  UserPlus,
  Search,
  Bell,
  Download,
  Filter,
  BarChart3,
  PieChart,
  LineChart,
  Briefcase,
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
  useWorkforceOverview,
  useHeadcountTrends,
  useDepartmentBreakdown,
  useTenureDistribution,
  useAttendanceAnalytics,
  usePayrollAnalytics,
  usePerformanceAnalytics,
  useDiversityAnalytics,
} from '@/hooks/useHrAnalytics'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts'

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export function HrAnalyticsDashboard() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const [selectedPeriod, setSelectedPeriod] = useState('month')

  // Fetch analytics data
  const { data: workforceData, isLoading: workforceLoading } = useWorkforceOverview()
  const { data: headcountTrends, isLoading: trendsLoading } = useHeadcountTrends({
    groupBy: selectedPeriod as 'day' | 'week' | 'month',
  })
  const { data: departmentData, isLoading: deptLoading } = useDepartmentBreakdown()
  const { data: tenureData } = useTenureDistribution()
  const { data: attendanceData } = useAttendanceAnalytics()
  const { data: payrollData } = usePayrollAnalytics()
  const { data: performanceData } = usePerformanceAnalytics()
  const { data: diversityData } = useDiversityAnalytics()

  const topNav = [
    { title: t('biometric.devices'), href: '/dashboard/hr/biometric', isActive: false },
    { title: t('biometric.geofencing'), href: '/dashboard/hr/geofencing', isActive: false },
    { title: t('hrAnalytics.title'), href: '/dashboard/hr/analytics', isActive: true },
    { title: t('hrPredictions.title'), href: '/dashboard/hr/predictions', isActive: false },
  ]

  const periods = [
    { id: 'week', label: t('common.week') },
    { id: 'month', label: t('common.month') },
    { id: 'quarter', label: t('common.quarter') },
    { id: 'year', label: t('common.year') },
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

        <div className="ms-auto flex items-center gap-2 sm:gap-4 overflow-x-auto min-w-0">
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0"
          >
            <Bell className="h-5 w-5" />
          </Button>
          <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
          <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white hidden sm:flex flex-shrink-0" />
          <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white hidden lg:flex flex-shrink-0" />
          <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main
        fluid={true}
        className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']"
      >
        {/* HERO CARD */}
        <ProductivityHero
          badge={t('hrAnalytics.insights')}
          title={t('hrAnalytics.title')}
          type="analytics"
        />

        {/* Period Selector */}
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            {periods.map((period) => (
              <Button
                key={period.id}
                size="sm"
                onClick={() => setSelectedPeriod(period.id)}
                className={
                  selectedPeriod === period.id
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-4'
                    : 'bg-white text-slate-600 hover:bg-slate-100 rounded-full px-4 border border-slate-200'
                }
              >
                {period.label}
              </Button>
            ))}
          </div>
          <Button variant="outline" className="rounded-lg">
            <Download className="h-4 w-4 me-2" />
            {t('common.export')}
          </Button>
        </div>

        {/* KEY METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title={t('hrAnalytics.totalEmployees')}
            value={workforceData?.totalEmployees}
            change={workforceData?.headcountChange}
            icon={Users}
            color="emerald"
            loading={workforceLoading}
          />
          <MetricCard
            title={t('hrAnalytics.turnoverRate')}
            value={workforceData?.turnoverRate}
            suffix="%"
            icon={TrendingDown}
            color="red"
            loading={workforceLoading}
          />
          <MetricCard
            title={t('hrAnalytics.avgTenure')}
            value={workforceData?.averageTenure}
            suffix={` ${t('common.years')}`}
            icon={Clock}
            color="blue"
            loading={workforceLoading}
          />
          <MetricCard
            title={t('hrAnalytics.avgSalary')}
            value={workforceData?.avgSalary}
            prefix={t('common.sar') + ' '}
            icon={DollarSign}
            color="purple"
            loading={workforceLoading}
            format="currency"
          />
        </div>

        {/* CHARTS ROW 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Headcount Trends */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-navy text-lg flex items-center gap-2">
                <LineChart className="h-5 w-5 text-emerald-500" />
                {t('hrAnalytics.headcountTrends')}
              </h3>
            </div>
            {trendsLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={headcountTrends || []}>
                  <defs>
                    <linearGradient id="colorHeadcount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="period" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: 'none',
                      borderRadius: '12px',
                      color: '#fff',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="headcount"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorHeadcount)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Department Breakdown */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-navy text-lg flex items-center gap-2">
                <PieChart className="h-5 w-5 text-blue-500" />
                {t('hrAnalytics.departmentBreakdown')}
              </h3>
            </div>
            {deptLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <div className="flex items-center">
                <ResponsiveContainer width="50%" height={200}>
                  <RechartsPieChart>
                    <Pie
                      data={departmentData || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="count"
                    >
                      {(departmentData || []).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {(departmentData || []).slice(0, 5).map((dept, index) => (
                    <div key={dept.department} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm text-slate-600">{dept.department}</span>
                      </div>
                      <span className="text-sm font-medium text-navy">{dept.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CHARTS ROW 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Attendance Overview */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h3 className="font-bold text-navy text-lg mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-500" />
              {t('hrAnalytics.attendance')}
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">{t('hrAnalytics.attendanceRate')}</span>
                <span className="font-bold text-navy text-xl">
                  {attendanceData?.averageAttendanceRate?.toFixed(1) || '-'}%
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all"
                  style={{ width: `${attendanceData?.averageAttendanceRate || 0}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="text-center p-3 bg-slate-50 rounded-xl">
                  <div className="text-2xl font-bold text-orange-500">
                    {attendanceData?.lateArrivals || 0}
                  </div>
                  <div className="text-xs text-slate-500">{t('hrAnalytics.lateArrivals')}</div>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-xl">
                  <div className="text-2xl font-bold text-red-500">
                    {attendanceData?.absences || 0}
                  </div>
                  <div className="text-xs text-slate-500">{t('hrAnalytics.absences')}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Distribution */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h3 className="font-bold text-navy text-lg mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              {t('hrAnalytics.performance')}
            </h3>
            <div className="text-center mb-4">
              <div className="text-4xl font-bold text-navy">
                {performanceData?.averageScore?.toFixed(1) || '-'}
              </div>
              <div className="text-sm text-slate-500">{t('hrAnalytics.avgScore')}</div>
            </div>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={performanceData?.distribution || []}>
                <XAxis dataKey="rating" fontSize={10} stroke="#64748b" />
                <YAxis fontSize={10} stroke="#64748b" />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Diversity */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h3 className="font-bold text-navy text-lg mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-pink-500" />
              {t('hrAnalytics.diversity')}
            </h3>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-slate-500 mb-2">{t('hrAnalytics.genderDistribution')}</div>
                <div className="flex gap-2">
                  {(diversityData?.genderDistribution || []).map((item, index) => (
                    <div
                      key={item.gender}
                      className="flex-1 text-center p-3 rounded-xl"
                      style={{ backgroundColor: `${COLORS[index]}20` }}
                    >
                      <div className="text-lg font-bold" style={{ color: COLORS[index] }}>
                        {item.percentage?.toFixed(0)}%
                      </div>
                      <div className="text-xs text-slate-500">{item.gender}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-500 mb-2">{t('hrAnalytics.ageDistribution')}</div>
                <div className="space-y-2">
                  {(diversityData?.ageDistribution || []).slice(0, 3).map((item, index) => (
                    <div key={item.range} className="flex items-center gap-2">
                      <span className="text-xs text-slate-600 w-16">{item.range}</span>
                      <div className="flex-1 bg-slate-100 rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${item.percentage}%`,
                            backgroundColor: COLORS[index],
                          }}
                        />
                      </div>
                      <span className="text-xs font-medium text-slate-700">{item.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PAYROLL SECTION */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-navy text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-500" />
              {t('hrAnalytics.payrollOverview')}
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-emerald-50 rounded-2xl">
              <div className="text-2xl font-bold text-emerald-600">
                {payrollData?.totalPayroll?.toLocaleString() || '-'} {t('common.sar')}
              </div>
              <div className="text-sm text-slate-500">{t('hrAnalytics.totalPayroll')}</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-2xl">
              <div className="text-2xl font-bold text-blue-600">
                {payrollData?.averageSalary?.toLocaleString() || '-'} {t('common.sar')}
              </div>
              <div className="text-sm text-slate-500">{t('hrAnalytics.avgSalary')}</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-2xl">
              <div className="text-2xl font-bold text-purple-600">
                {payrollData?.medianSalary?.toLocaleString() || '-'} {t('common.sar')}
              </div>
              <div className="text-sm text-slate-500">{t('hrAnalytics.medianSalary')}</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-2xl">
              <div className={`text-2xl font-bold ${
                (payrollData?.ytdGrowth || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {payrollData?.ytdGrowth >= 0 ? '+' : ''}{payrollData?.ytdGrowth?.toFixed(1) || 0}%
              </div>
              <div className="text-sm text-slate-500">{t('hrAnalytics.ytdGrowth')}</div>
            </div>
          </div>
        </div>
      </Main>
    </>
  )
}

// Metric Card Component
function MetricCard({
  title,
  value,
  change,
  prefix = '',
  suffix = '',
  icon: Icon,
  color,
  loading,
  format,
}: {
  title: string
  value?: number
  change?: number
  prefix?: string
  suffix?: string
  icon: React.ComponentType<{ className?: string }>
  color: 'emerald' | 'blue' | 'purple' | 'red' | 'orange'
  loading?: boolean
  format?: 'currency'
}) {
  const colorClasses = {
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600',
    orange: 'bg-orange-50 text-orange-600',
  }

  const formattedValue = format === 'currency'
    ? value?.toLocaleString()
    : value?.toFixed(value % 1 !== 0 ? 1 : 0)

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        {change !== undefined && (
          <Badge className={`${change >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'} border-0`}>
            {change >= 0 ? <TrendingUp className="h-3 w-3 me-1" /> : <TrendingDown className="h-3 w-3 me-1" />}
            {change >= 0 ? '+' : ''}{change}
          </Badge>
        )}
      </div>
      <div className="text-2xl font-bold text-navy">
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          `${prefix}${formattedValue || '-'}${suffix}`
        )}
      </div>
      <div className="text-sm text-slate-500 mt-1">{title}</div>
    </div>
  )
}
