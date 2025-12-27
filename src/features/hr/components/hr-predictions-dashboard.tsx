import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  AlertTriangle,
  TrendingUp,
  Users,
  UserPlus,
  Award,
  Search,
  Bell,
  Download,
  RefreshCw,
  Brain,
  Activity,
  ChevronLeft,
  Eye,
  MoreHorizontal,
  Loader2,
  AlertCircle,
  Plane,
  Heart,
  Calendar,
  BarChart3,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  useAttritionRisk,
  useHiringNeedsForecast,
  usePromotionReadiness,
  useFlightRisk,
  useEngagementPredictions,
  useAbsencePredictions,
  useRecalculatePredictions,
  useExportReport,
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
} from 'recharts'
import { Link, useNavigate } from '@tanstack/react-router'
import { ROUTES } from '@/constants/routes'

const RISK_COLORS = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#10b981',
}

type PredictionType = 'all' | 'attrition' | 'hiring' | 'promotion' | 'flight' | 'engagement' | 'absence'
type RiskFilter = 'all' | 'high' | 'medium' | 'low'

export function HrPredictionsDashboard() {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const [searchQuery, setSearchQuery] = useState('')
  const [predictionTypeFilter, setPredictionTypeFilter] = useState<PredictionType>('all')
  const [riskFilter, setRiskFilter] = useState<RiskFilter>('all')
  const [forecastMonths, setForecastMonths] = useState(12)

  // Fetch predictions data
  const { data: attritionData, isLoading: attritionLoading, error: attritionError } = useAttritionRisk()
  const { data: hiringData, isLoading: hiringLoading } = useHiringNeedsForecast(forecastMonths)
  const { data: promotionData, isLoading: promotionLoading } = usePromotionReadiness(75)
  const { data: flightRiskData, isLoading: flightLoading } = useFlightRisk()
  const { data: engagementData, isLoading: engagementLoading } = useEngagementPredictions()
  const { data: absenceData, isLoading: absenceLoading } = useAbsencePredictions()
  const { mutate: recalculate, isPending: isRecalculating } = useRecalculatePredictions()
  const { mutate: exportReport, isPending: isExporting } = useExportReport()

  const isLoading = attritionLoading || hiringLoading || promotionLoading || flightLoading || engagementLoading || absenceLoading
  const hasError = attritionError

  const topNav = [
    { title: t('biometric.devices'), href: ROUTES.dashboard.hr.biometric.list, isActive: false },
    { title: t('biometric.geofencing'), href: ROUTES.dashboard.hr.geofencing.list, isActive: false },
    { title: t('hrAnalytics.title'), href: ROUTES.dashboard.hr.analytics.list, isActive: false },
    { title: t('hrPredictions.title'), href: ROUTES.dashboard.hr.predictions.list, isActive: true },
  ]

  const handleRecalculate = () => {
    recalculate()
  }

  const handleExport = (format: 'json' | 'excel' | 'pdf') => {
    exportReport({ format })
  }

  const getRiskColor = (level: string) => {
    const colors: Record<string, string> = {
      high: 'bg-red-100 text-red-700 border-red-200',
      medium: 'bg-amber-100 text-amber-700 border-amber-200',
      low: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    }
    return colors[level] || colors.low
  }

  const getRiskBgColor = (level: string) => {
    const colors: Record<string, string> = {
      high: 'bg-red-50',
      medium: 'bg-amber-50',
      low: 'bg-emerald-50',
    }
    return colors[level] || colors.low
  }

  // Filter employees based on search and filters
  const filteredAttritionEmployees = attritionData?.employees?.filter(emp => {
    const matchesSearch = !searchQuery ||
      emp.employeeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRisk = riskFilter === 'all' || emp.riskLevel === riskFilter
    return matchesSearch && matchesRisk
  }) || []

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
              className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500"
              aria-hidden="true"
            />
            <input
              type="text"
              placeholder={t('common.search')}
              aria-label={t('common.search')}
              className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0"
            aria-label={t('common.notifications')}
          >
            <Bell className="h-5 w-5" aria-hidden="true" />
            <span className="absolute top-2 end-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
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
        className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']"
      >
        {/* HERO CARD - Always visible */}
        <ProductivityHero
          badge={t('hrPredictions.badge')}
          title={t('hrPredictions.title')}
          type="analytics"
          listMode={true}
        />

        {/* MAIN GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* RIGHT COLUMN (Main Content) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-xl">
                      <AlertTriangle className="w-5 h-5 text-red-600" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">{t('hrPredictions.highRiskEmployees')}</p>
                      <p className="text-xl font-bold text-navy">
                        {attritionLoading ? <Skeleton className="h-6 w-8" /> : attritionData?.summary?.highRisk || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-xl">
                      <UserPlus className="w-5 h-5 text-blue-600" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">{t('hrPredictions.hiringNeeds')}</p>
                      <p className="text-xl font-bold text-navy">
                        {hiringLoading ? <Skeleton className="h-6 w-8" /> : hiringData?.summary?.totalPositions || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-xl">
                      <Award className="w-5 h-5 text-purple-600" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">{t('hrPredictions.promotionReady')}</p>
                      <p className="text-xl font-bold text-navy">
                        {promotionLoading ? <Skeleton className="h-6 w-8" /> : promotionData?.summary?.readyCount || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-xl">
                      <Brain className="w-5 h-5 text-emerald-600" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">{t('hrPredictions.aiPowered')}</p>
                      <p className="text-xl font-bold text-navy">
                        {attritionLoading ? <Skeleton className="h-6 w-8" /> : attritionData?.summary?.totalAnalyzed || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filter Bar */}
            <Card className="rounded-2xl border-slate-100">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-48">
                      <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t('common.search')}
                        className="pe-9 rounded-xl"
                      />
                    </div>
                    <Select value={predictionTypeFilter} onValueChange={(v) => setPredictionTypeFilter(v as PredictionType)}>
                      <SelectTrigger className="w-[140px] rounded-xl">
                        <SelectValue placeholder={t('hrPredictions.filters.all')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('hrPredictions.filters.all')}</SelectItem>
                        <SelectItem value="attrition">{t('hrPredictions.predictionTypes.attrition')}</SelectItem>
                        <SelectItem value="hiring">{t('hrPredictions.predictionTypes.hiring')}</SelectItem>
                        <SelectItem value="promotion">{t('hrPredictions.predictionTypes.promotion')}</SelectItem>
                        <SelectItem value="flight">{t('hrPredictions.predictionTypes.flightRisk')}</SelectItem>
                        <SelectItem value="engagement">{t('hrPredictions.predictionTypes.engagement')}</SelectItem>
                        <SelectItem value="absence">{t('hrPredictions.predictionTypes.absence')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={riskFilter} onValueChange={(v) => setRiskFilter(v as RiskFilter)}>
                      <SelectTrigger className="w-[130px] rounded-xl">
                        <SelectValue placeholder={t('hrPredictions.filters.riskLevel')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('hrPredictions.filters.all')}</SelectItem>
                        <SelectItem value="high">{t('hrPredictions.filters.high')}</SelectItem>
                        <SelectItem value="medium">{t('hrPredictions.filters.medium')}</SelectItem>
                        <SelectItem value="low">{t('hrPredictions.filters.low')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRecalculate}
                      disabled={isRecalculating}
                      className="rounded-xl"
                    >
                      <RefreshCw className={`w-4 h-4 ms-1 ${isRecalculating ? 'animate-spin' : ''}`} aria-hidden="true" />
                      {t('common.refresh')}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isExporting}
                          className="rounded-xl"
                        >
                          <Download className="w-4 h-4 ms-1" aria-hidden="true" />
                          {t('common.export')}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleExport('excel')}>
                          Excel (.xlsx)
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExport('pdf')}>
                          PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExport('json')}>
                          JSON
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Main Content Based on Filter */}
            {isLoading ? (
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-8 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-500" aria-hidden="true" />
                  <p className="mt-4 text-slate-500">{t('hrPredictions.loadingPredictions')}</p>
                </CardContent>
              </Card>
            ) : hasError ? (
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-8 text-center">
                  <AlertCircle className="w-8 h-8 mx-auto text-red-500" aria-hidden="true" />
                  <p className="mt-4 text-red-600">{t('hrPredictions.errorLoading')}</p>
                  <Button
                    onClick={handleRecalculate}
                    className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                  >
                    {t('hrPredictions.retryLoad')}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Attrition Risk Section */}
                {(predictionTypeFilter === 'all' || predictionTypeFilter === 'attrition') && (
                  <Card className="rounded-2xl border-slate-100">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-navy text-lg flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-red-500" aria-hidden="true" />
                          {t('hrPredictions.attritionRisk')}
                        </h3>
                        <Badge className="bg-slate-100 text-slate-600 border-0 rounded-full px-4 py-1">
                          {attritionData?.employees?.length || 0} {t('common.employees')}
                        </Badge>
                      </div>

                      {/* Risk Distribution Chart */}
                      {attritionData?.riskDistribution && attritionData.riskDistribution.length > 0 && (
                        <div className="mb-6">
                          <ResponsiveContainer width="100%" height={180}>
                            <BarChart
                              data={attritionData.riskDistribution}
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
                                {attritionData.riskDistribution.map((entry) => (
                                  <Cell
                                    key={entry.level}
                                    fill={RISK_COLORS[entry.level as keyof typeof RISK_COLORS] || '#10b981'}
                                  />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      )}

                      {/* High Risk Employees Cards */}
                      {filteredAttritionEmployees.length > 0 ? (
                        <div className="space-y-3">
                          <h4 className="font-bold text-slate-700 text-sm mb-3">
                            {t('hrPredictions.highRiskEmployeesList')}
                          </h4>
                          {filteredAttritionEmployees.slice(0, 5).map((employee) => (
                            <Card
                              key={employee.employeeId}
                              className={`rounded-xl border-slate-100 hover:shadow-md transition-shadow ${getRiskBgColor(employee.riskLevel)}`}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                                      employee.riskLevel === 'high' ? 'bg-red-100 text-red-600' :
                                      employee.riskLevel === 'medium' ? 'bg-amber-100 text-amber-600' :
                                      'bg-emerald-100 text-emerald-600'
                                    }`}>
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
                                      <p className={`font-bold ${
                                        employee.riskLevel === 'high' ? 'text-red-600' :
                                        employee.riskLevel === 'medium' ? 'text-amber-600' :
                                        'text-emerald-600'
                                      }`}>{employee.riskScore}%</p>
                                    </div>
                                    <Badge className={getRiskColor(employee.riskLevel)}>
                                      {t(`hrPredictions.${employee.riskLevel}RiskLabel`)}
                                    </Badge>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="rounded-xl" aria-label={t('common.options')}>
                                          <MoreHorizontal className="w-4 h-4" aria-hidden="true" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem asChild>
                                          <Link to={ROUTES.dashboard.hr.employees.detail(employee.employeeId)}>
                                            <Eye className="w-4 h-4 ms-2" aria-hidden="true" />
                                            {t('hrPredictions.viewDetails')}
                                          </Link>
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                          {filteredAttritionEmployees.length > 5 && (
                            <Button
                              variant="ghost"
                              className="w-full text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl"
                            >
                              {t('hrPredictions.viewAll')} ({filteredAttritionEmployees.length})
                              <ChevronLeft className="w-4 h-4 me-1 rtl:rotate-180" aria-hidden="true" />
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-slate-500">
                          <Users className="w-12 h-12 mx-auto text-slate-300 mb-3" aria-hidden="true" />
                          <p>{t('hrPredictions.noData')}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Hiring Forecast Section */}
                {(predictionTypeFilter === 'all' || predictionTypeFilter === 'hiring') && (
                  <Card className="rounded-2xl border-slate-100">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-navy text-lg flex items-center gap-2">
                          <UserPlus className="h-5 w-5 text-blue-500" aria-hidden="true" />
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

                      {hiringData?.forecast && hiringData.forecast.length > 0 && (
                        <div className="mb-6">
                          <ResponsiveContainer width="100%" height={220}>
                            <LineChart data={hiringData.forecast}>
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
                        </div>
                      )}

                      {/* Department Needs Cards */}
                      {hiringData?.byDepartment && hiringData.byDepartment.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {hiringData.byDepartment.slice(0, 6).map((dept) => (
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
                    </CardContent>
                  </Card>
                )}

                {/* Promotion Readiness Section */}
                {(predictionTypeFilter === 'all' || predictionTypeFilter === 'promotion') && (
                  <Card className="rounded-2xl border-slate-100">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-navy text-lg flex items-center gap-2">
                          <Award className="h-5 w-5 text-purple-500" aria-hidden="true" />
                          {t('hrPredictions.promotionReadiness')}
                        </h3>
                        <Badge className="bg-slate-100 text-slate-600 border-0 rounded-full px-4 py-1">
                          {promotionData?.employees?.length || 0} {t('common.employees')}
                        </Badge>
                      </div>

                      {/* Score Distribution */}
                      {promotionData?.scoreDistribution && promotionData.scoreDistribution.length > 0 && (
                        <div className="mb-6">
                          <ResponsiveContainer width="100%" height={180}>
                            <BarChart data={promotionData.scoreDistribution}>
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
                        </div>
                      )}

                      {/* Ready Employees Cards */}
                      {promotionData?.employees && promotionData.employees.length > 0 ? (
                        <div className="space-y-3">
                          <h4 className="font-bold text-slate-700 text-sm mb-3">
                            {t('hrPredictions.topCandidates')}
                          </h4>
                          {promotionData.employees.slice(0, 5).map((employee) => (
                            <Card key={employee.employeeId} className="rounded-xl border-slate-100 bg-purple-50 hover:shadow-md transition-shadow">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
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
                                  <div className="flex items-center gap-3">
                                    <div className="text-end">
                                      <p className="text-xs text-slate-500">{t('hrPredictions.readinessScore')}</p>
                                      <p className="font-bold text-purple-600">{employee.readinessScore}%</p>
                                    </div>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="rounded-xl" aria-label={t('common.options')}>
                                          <MoreHorizontal className="w-4 h-4" aria-hidden="true" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem asChild>
                                          <Link to={ROUTES.dashboard.hr.employees.detail(employee.employeeId)}>
                                            <Eye className="w-4 h-4 ms-2" aria-hidden="true" />
                                            {t('hrPredictions.viewDetails')}
                                          </Link>
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-slate-500">
                          <Award className="w-12 h-12 mx-auto text-slate-300 mb-3" aria-hidden="true" />
                          <p>{t('hrPredictions.noData')}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Flight Risk Section */}
                {(predictionTypeFilter === 'all' || predictionTypeFilter === 'flight') && flightRiskData?.employees && flightRiskData.employees.length > 0 && (
                  <Card className="rounded-2xl border-slate-100">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-navy text-lg flex items-center gap-2">
                          <Plane className="h-5 w-5 text-orange-500" aria-hidden="true" />
                          {t('hrPredictions.flightRisk')}
                        </h3>
                        <Badge className="bg-orange-100 text-orange-600 border-0 rounded-full px-4 py-1">
                          {flightRiskData.summary?.totalAtRisk || 0} {t('common.atRisk')}
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        {flightRiskData.employees.slice(0, 5).map((employee) => (
                          <Card key={employee.employeeId} className="rounded-xl border-slate-100 bg-orange-50 hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
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
                                    <p className="font-bold text-orange-600">{employee.riskScore}%</p>
                                  </div>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="rounded-xl" aria-label={t('common.options')}>
                                        <MoreHorizontal className="w-4 h-4" aria-hidden="true" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem asChild>
                                        <Link to={ROUTES.dashboard.hr.employees.detail(employee.employeeId)}>
                                          <Eye className="w-4 h-4 ms-2" aria-hidden="true" />
                                          {t('hrPredictions.viewDetails')}
                                        </Link>
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Engagement Predictions Section */}
                {(predictionTypeFilter === 'all' || predictionTypeFilter === 'engagement') && engagementData && (
                  <Card className="rounded-2xl border-slate-100">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-navy text-lg flex items-center gap-2">
                          <Heart className="h-5 w-5 text-pink-500" aria-hidden="true" />
                          {t('hrPredictions.engagement')}
                        </h3>
                        <Badge className={`border-0 rounded-full px-4 py-1 ${
                          engagementData.summary?.trendDirection === 'up'
                            ? 'bg-emerald-100 text-emerald-600'
                            : engagementData.summary?.trendDirection === 'down'
                            ? 'bg-red-100 text-red-600'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          <TrendingUp className={`w-4 h-4 me-1 ${
                            engagementData.summary?.trendDirection === 'down' ? 'rotate-180' : ''
                          }`} />
                          {engagementData.summary?.averageEngagement || 0}%
                        </Badge>
                      </div>

                      {engagementData.trends && engagementData.trends.length > 0 && (
                        <ResponsiveContainer width="100%" height={180}>
                          <AreaChart data={engagementData.trends}>
                            <defs>
                              <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
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
                            <Area
                              type="monotone"
                              dataKey="score"
                              stroke="#ec4899"
                              fillOpacity={1}
                              fill="url(#colorEngagement)"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Absence Predictions Section */}
                {(predictionTypeFilter === 'all' || predictionTypeFilter === 'absence') && absenceData && (
                  <Card className="rounded-2xl border-slate-100">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-navy text-lg flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-cyan-500" aria-hidden="true" />
                          {t('hrPredictions.absence')}
                        </h3>
                        <Badge className="bg-cyan-100 text-cyan-600 border-0 rounded-full px-4 py-1">
                          {absenceData.summary?.predictedAbsences || 0} {t('common.days')}
                        </Badge>
                      </div>

                      {absenceData.byMonth && absenceData.byMonth.length > 0 && (
                        <ResponsiveContainer width="100%" height={180}>
                          <BarChart data={absenceData.byMonth}>
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
                            <Bar dataKey="predictedAbsences" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>

          {/* LEFT COLUMN (Sidebar) */}
          <HRSidebar context="predictions" />
        </div>
      </Main>
    </>
  )
}
