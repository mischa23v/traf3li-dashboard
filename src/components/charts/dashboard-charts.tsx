/**
 * Dashboard Charts Component
 * Recharts-based charts for revenue, cases, and activity
 * RTL-aware with Arabic/English support
 */

import { useMemo } from 'react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadialBarChart,
  RadialBar,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

/**
 * Chart color palette
 */
const COLORS = {
  primary: '#0f766e', // teal-700
  secondary: '#0ea5e9', // sky-500
  success: '#22c55e', // green-500
  warning: '#f59e0b', // amber-500
  danger: '#ef4444', // red-500
  muted: '#94a3b8', // slate-400
  palette: ['#0f766e', '#0ea5e9', '#8b5cf6', '#f59e0b', '#ef4444', '#22c55e', '#ec4899', '#14b8a6'],
}

/**
 * Common chart props
 */
interface BaseChartProps {
  locale?: 'ar' | 'en'
  className?: string
}

/**
 * Format number for display
 */
function formatNumber(value: number, locale: 'ar' | 'en' = 'ar'): string {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US').format(value)
}

/**
 * Format currency
 */
function formatCurrency(value: number, locale: 'ar' | 'en' = 'ar'): string {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

// ============ Revenue Chart ============

interface RevenueData {
  month: string
  monthAr?: string
  revenue: number
  expenses: number
  profit: number
}

interface RevenueChartProps extends BaseChartProps {
  data: RevenueData[]
  title?: string
  description?: string
}

export function RevenueChart({
  data,
  title,
  description,
  locale = 'ar',
  className,
}: RevenueChartProps) {
  const isRTL = locale === 'ar'

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle className="text-lg">
          {title || (isRTL ? 'الإيرادات والمصروفات' : 'Revenue & Expenses')}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={data}
            margin={{ top: 10, right: isRTL ? 10 : 30, left: isRTL ? 30 : 10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.3} />
                <stop offset="95%" stopColor={COLORS.success} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.danger} stopOpacity={0.3} />
                <stop offset="95%" stopColor={COLORS.danger} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis
              dataKey={isRTL ? 'monthAr' : 'month'}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              reversed={isRTL}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => formatCurrency(value, locale)}
              orientation={isRTL ? 'right' : 'left'}
              width={80}
            />
            <Tooltip
              formatter={(value: number, name: string) => [
                formatCurrency(value, locale),
                name === 'revenue'
                  ? isRTL ? 'الإيرادات' : 'Revenue'
                  : isRTL ? 'المصروفات' : 'Expenses',
              ]}
              contentStyle={{
                direction: isRTL ? 'rtl' : 'ltr',
                textAlign: isRTL ? 'right' : 'left',
              }}
            />
            <Legend
              formatter={(value) =>
                value === 'revenue'
                  ? isRTL ? 'الإيرادات' : 'Revenue'
                  : isRTL ? 'المصروفات' : 'Expenses'
              }
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke={COLORS.success}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
            <Area
              type="monotone"
              dataKey="expenses"
              stroke={COLORS.danger}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorExpenses)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// ============ Cases Status Chart ============

interface CaseStatusData {
  status: string
  statusAr?: string
  count: number
  color?: string
}

interface CasesStatusChartProps extends BaseChartProps {
  data: CaseStatusData[]
  title?: string
  description?: string
}

export function CasesStatusChart({
  data,
  title,
  description,
  locale = 'ar',
  className,
}: CasesStatusChartProps) {
  const isRTL = locale === 'ar'

  const chartData = useMemo(
    () =>
      data.map((item, index) => ({
        ...item,
        color: item.color || COLORS.palette[index % COLORS.palette.length],
      })),
    [data]
  )

  const total = useMemo(() => chartData.reduce((sum, item) => sum + item.count, 0), [chartData])

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle className="text-lg">
          {title || (isRTL ? 'حالة القضايا' : 'Cases by Status')}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row items-center gap-4">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="count"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string, props: any) => [
                  formatNumber(value, locale),
                  isRTL ? props.payload.statusAr || name : name,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="flex flex-wrap lg:flex-col gap-2 justify-center">
            {chartData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm">
                  {isRTL ? item.statusAr || item.status : item.status}
                </span>
                <span className="text-sm text-muted-foreground">
                  ({Math.round((item.count / total) * 100)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ============ Activity Timeline Chart ============

interface ActivityData {
  date: string
  dateAr?: string
  tasks: number
  cases: number
  payments: number
}

interface ActivityChartProps extends BaseChartProps {
  data: ActivityData[]
  title?: string
  description?: string
}

export function ActivityChart({
  data,
  title,
  description,
  locale = 'ar',
  className,
}: ActivityChartProps) {
  const isRTL = locale === 'ar'

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle className="text-lg">
          {title || (isRTL ? 'النشاط الأسبوعي' : 'Weekly Activity')}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{ top: 10, right: isRTL ? 10 : 30, left: isRTL ? 30 : 10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis
              dataKey={isRTL ? 'dateAr' : 'date'}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              reversed={isRTL}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              orientation={isRTL ? 'right' : 'left'}
            />
            <Tooltip
              formatter={(value: number, name: string) => [
                formatNumber(value, locale),
                name === 'tasks'
                  ? isRTL ? 'المهام' : 'Tasks'
                  : name === 'cases'
                  ? isRTL ? 'القضايا' : 'Cases'
                  : isRTL ? 'المدفوعات' : 'Payments',
              ]}
              contentStyle={{
                direction: isRTL ? 'rtl' : 'ltr',
                textAlign: isRTL ? 'right' : 'left',
              }}
            />
            <Legend
              formatter={(value) =>
                value === 'tasks'
                  ? isRTL ? 'المهام' : 'Tasks'
                  : value === 'cases'
                  ? isRTL ? 'القضايا' : 'Cases'
                  : isRTL ? 'المدفوعات' : 'Payments'
              }
            />
            <Bar dataKey="tasks" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
            <Bar dataKey="cases" fill={COLORS.secondary} radius={[4, 4, 0, 0]} />
            <Bar dataKey="payments" fill={COLORS.success} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// ============ Monthly Trend Chart ============

interface TrendData {
  month: string
  monthAr?: string
  value: number
  previousValue?: number
}

interface TrendChartProps extends BaseChartProps {
  data: TrendData[]
  title?: string
  description?: string
  valueLabel?: string
  previousLabel?: string
  showComparison?: boolean
}

export function TrendChart({
  data,
  title,
  description,
  valueLabel,
  previousLabel,
  showComparison = true,
  locale = 'ar',
  className,
}: TrendChartProps) {
  const isRTL = locale === 'ar'

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle className="text-lg">
          {title || (isRTL ? 'الاتجاه الشهري' : 'Monthly Trend')}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={data}
            margin={{ top: 10, right: isRTL ? 10 : 30, left: isRTL ? 30 : 10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis
              dataKey={isRTL ? 'monthAr' : 'month'}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              reversed={isRTL}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => formatNumber(value, locale)}
              orientation={isRTL ? 'right' : 'left'}
            />
            <Tooltip
              formatter={(value: number, name: string) => [
                formatNumber(value, locale),
                name === 'value'
                  ? valueLabel || (isRTL ? 'القيمة الحالية' : 'Current')
                  : previousLabel || (isRTL ? 'القيمة السابقة' : 'Previous'),
              ]}
              contentStyle={{
                direction: isRTL ? 'rtl' : 'ltr',
                textAlign: isRTL ? 'right' : 'left',
              }}
            />
            {showComparison && (
              <Legend
                formatter={(value) =>
                  value === 'value'
                    ? valueLabel || (isRTL ? 'الحالي' : 'Current')
                    : previousLabel || (isRTL ? 'السابق' : 'Previous')
                }
              />
            )}
            <Line
              type="monotone"
              dataKey="value"
              stroke={COLORS.primary}
              strokeWidth={3}
              dot={{ fill: COLORS.primary, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
            {showComparison && (
              <Line
                type="monotone"
                dataKey="previousValue"
                stroke={COLORS.muted}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: COLORS.muted, strokeWidth: 2, r: 3 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// ============ Progress Radial Chart ============

interface ProgressData {
  name: string
  nameAr?: string
  value: number
  target: number
  color?: string
}

interface ProgressChartProps extends BaseChartProps {
  data: ProgressData[]
  title?: string
  description?: string
}

export function ProgressChart({
  data,
  title,
  description,
  locale = 'ar',
  className,
}: ProgressChartProps) {
  const isRTL = locale === 'ar'

  const chartData = useMemo(
    () =>
      data.map((item, index) => ({
        ...item,
        fill: item.color || COLORS.palette[index % COLORS.palette.length],
        percent: Math.round((item.value / item.target) * 100),
      })),
    [data]
  )

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle className="text-lg">
          {title || (isRTL ? 'تقدم الأهداف' : 'Goals Progress')}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="30%"
            outerRadius="100%"
            barSize={15}
            data={chartData}
            startAngle={isRTL ? 0 : 180}
            endAngle={isRTL ? 360 : -180}
          >
            <RadialBar
              background
              dataKey="percent"
              cornerRadius={10}
            />
            <Tooltip
              formatter={(value: number, name: string, props: any) => [
                `${value}%`,
                isRTL ? props.payload.nameAr || name : name,
              ]}
            />
          </RadialBarChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.fill }}
              />
              <span className="text-sm">
                {isRTL ? item.nameAr || item.name : item.name}
              </span>
              <span className="text-sm text-muted-foreground">
                ({item.percent}%)
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ============ Stats Summary Cards ============

interface StatCardData {
  label: string
  labelAr?: string
  value: number
  change?: number
  changeLabel?: string
  format?: 'number' | 'currency' | 'percent'
  icon?: React.ReactNode
  color?: string
}

interface StatsCardsProps extends BaseChartProps {
  data: StatCardData[]
}

export function StatsCards({ data, locale = 'ar', className }: StatsCardsProps) {
  const isRTL = locale === 'ar'

  const formatValue = (value: number, format?: string) => {
    if (format === 'currency') return formatCurrency(value, locale)
    if (format === 'percent') return `${value}%`
    return formatNumber(value, locale)
  }

  return (
    <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-4', className)}>
      {data.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {isRTL ? stat.labelAr || stat.label : stat.label}
                </p>
                <p className="text-2xl font-bold mt-1">
                  {formatValue(stat.value, stat.format)}
                </p>
                {stat.change !== undefined && (
                  <div className="flex items-center gap-1 mt-1">
                    <span
                      className={cn(
                        'text-xs font-medium',
                        stat.change >= 0 ? 'text-green-600' : 'text-red-600'
                      )}
                    >
                      {stat.change >= 0 ? '+' : ''}
                      {stat.change}%
                    </span>
                    {stat.changeLabel && (
                      <span className="text-xs text-muted-foreground">
                        {stat.changeLabel}
                      </span>
                    )}
                  </div>
                )}
              </div>
              {stat.icon && (
                <div
                  className="p-3 rounded-full bg-primary/10"
                  style={{ color: stat.color || COLORS.primary }}
                >
                  {stat.icon}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export {
  COLORS as chartColors,
  formatNumber,
  formatCurrency,
}
