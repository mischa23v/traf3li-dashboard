import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Clock,
  Download,
  Filter,
  BarChart3,
  Award,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import financialService from '@/services/financialService'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/_authenticated/financial/')({
  component: FinancialInsights,
})

function FinancialInsights() {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const [selectedPeriod, setSelectedPeriod] = useState('12months')

  // Fetch key metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['financial-key-metrics'],
    queryFn: () => financialService.getKeyMetrics(),
  })

  // Fetch revenue trends
  const { data: revenueTrends, isLoading: trendsLoading } = useQuery({
    queryKey: ['financial-revenue-trends', 12],
    queryFn: () => financialService.getRevenueTrends(12),
  })

  // Fetch practice area performance
  const { data: practiceAreas, isLoading: areasLoading } = useQuery({
    queryKey: ['financial-practice-area-performance'],
    queryFn: () => financialService.getPracticeAreaPerformance(),
  })

  // Fetch top clients profitability
  const { data: topClients, isLoading: clientsLoading } = useQuery({
    queryKey: ['financial-top-clients-profitability', 4],
    queryFn: () => financialService.getTopClientsProfitability(4),
  })

  // Fetch expense breakdown
  const { data: expenses, isLoading: expensesLoading } = useQuery({
    queryKey: ['financial-expense-breakdown'],
    queryFn: () => financialService.getExpenseBreakdown(),
  })

  // Fetch collection performance
  const { data: collectionData, isLoading: collectionLoading } = useQuery({
    queryKey: ['financial-collection-performance'],
    queryFn: () => financialService.getCollectionPerformance(),
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const maxRevenue = Math.max(
    ...(revenueTrends?.map((m) => m.revenue) || [0])
  )

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'green':
        return {
          bg: 'bg-green-50 dark:bg-green-950/20',
          border: 'border-green-200 dark:border-green-800',
          iconBg: 'bg-green-100 dark:bg-green-900',
          text: 'text-green-700 dark:text-green-400',
          bar: 'bg-green-500',
        }
      case 'blue':
        return {
          bg: 'bg-blue-50 dark:bg-blue-950/20',
          border: 'border-blue-200 dark:border-blue-800',
          iconBg: 'bg-blue-100 dark:bg-blue-900',
          text: 'text-blue-700 dark:text-blue-400',
          bar: 'bg-blue-500',
        }
      case 'yellow':
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-950/20',
          border: 'border-yellow-200 dark:border-yellow-800',
          iconBg: 'bg-yellow-100 dark:bg-yellow-900',
          text: 'text-yellow-700 dark:text-yellow-400',
          bar: 'bg-yellow-500',
        }
      case 'red':
        return {
          bg: 'bg-red-50 dark:bg-red-950/20',
          border: 'border-red-200 dark:border-red-800',
          iconBg: 'bg-red-100 dark:bg-red-900',
          text: 'text-red-700 dark:text-red-400',
          bar: 'bg-red-500',
        }
      default:
        return {
          bg: 'bg-muted',
          border: 'border-border',
          iconBg: 'bg-muted-foreground/10',
          text: 'text-foreground',
          bar: 'bg-primary',
        }
    }
  }

  return (
    <div className='min-h-screen'>
      {/* Top Header */}
      <div className='border-b bg-background px-6 py-4'>
        <div className='mx-auto flex max-w-7xl items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold'>
              {isRTL ? 'الرؤى المالية' : 'Financial Insights'}
            </h1>
            <p className='text-sm text-muted-foreground'>
              {isRTL
                ? 'تحليلات متقدمة وتقارير الأداء المالي'
                : 'Advanced analytics and financial performance reports'}
            </p>
          </div>
          <div className='flex items-center gap-3'>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className='rounded-lg border bg-background px-4 py-2 text-sm'
            >
              <option value='3months'>
                {isRTL ? 'آخر 3 شهور' : 'Last 3 months'}
              </option>
              <option value='6months'>
                {isRTL ? 'آخر 6 شهور' : 'Last 6 months'}
              </option>
              <option value='12months'>
                {isRTL ? 'آخر 12 شهر' : 'Last 12 months'}
              </option>
              <option value='ytd'>
                {isRTL ? 'من بداية السنة' : 'Year to date'}
              </option>
            </select>
            <Button variant='outline' className='flex items-center gap-2'>
              <Download className='h-4 w-4' />
              {isRTL ? 'تصدير التقرير' : 'Export Report'}
            </Button>
            <Button className='flex items-center gap-2'>
              <Filter className='h-4 w-4' />
              {isRTL ? 'فلاتر متقدمة' : 'Advanced Filters'}
            </Button>
          </div>
        </div>
      </div>

      <div className='mx-auto max-w-7xl p-6'>
        {/* Key Metrics */}
        <div className='mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5'>
          {/* Total Revenue */}
          <div className='rounded-lg border bg-gradient-to-br from-green-50 to-background p-5 dark:from-green-950/20'>
            <div className='mb-3 flex items-center justify-between'>
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900'>
                <TrendingUp className='h-5 w-5 text-green-600 dark:text-green-400' />
              </div>
              <Badge className='bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'>
                <ArrowUpRight className='me-1 h-3 w-3' />
                +{metricsLoading ? '...' : metrics?.revenueGrowth.toFixed(1)}%
              </Badge>
            </div>
            <div className='mb-1 text-2xl font-bold'>
              {metricsLoading ? '...' : formatCurrency(metrics?.totalRevenue || 0)}
            </div>
            <div className='text-xs text-muted-foreground'>
              {isRTL ? 'إجمالي الإيرادات' : 'Total Revenue'}
            </div>
          </div>

          {/* Net Profit */}
          <div className='rounded-lg border bg-gradient-to-br from-blue-50 to-background p-5 dark:from-blue-950/20'>
            <div className='mb-3 flex items-center justify-between'>
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900'>
                <DollarSign className='h-5 w-5 text-blue-600 dark:text-blue-400' />
              </div>
              <Badge className='bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'>
                {metricsLoading ? '...' : `${metrics?.profitMargin.toFixed(1)}%`}
              </Badge>
            </div>
            <div className='mb-1 text-2xl font-bold'>
              {metricsLoading ? '...' : formatCurrency(metrics?.netProfit || 0)}
            </div>
            <div className='text-xs text-muted-foreground'>
              {isRTL ? 'صافي الربح' : 'Net Profit'}
            </div>
          </div>

          {/* Total Expenses */}
          <div className='rounded-lg border bg-gradient-to-br from-red-50 to-background p-5 dark:from-red-950/20'>
            <div className='mb-3 flex items-center justify-between'>
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900'>
                <TrendingDown className='h-5 w-5 text-red-600 dark:text-red-400' />
              </div>
              <Badge className='bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'>
                <ArrowDownRight className='me-1 h-3 w-3' />
                {metricsLoading ? '...' : Math.abs(metrics?.expenseGrowth || 0).toFixed(1)}%
              </Badge>
            </div>
            <div className='mb-1 text-2xl font-bold'>
              {metricsLoading ? '...' : formatCurrency(metrics?.totalExpenses || 0)}
            </div>
            <div className='text-xs text-muted-foreground'>
              {isRTL ? 'إجمالي المصروفات' : 'Total Expenses'}
            </div>
          </div>

          {/* Average Invoice */}
          <div className='rounded-lg border bg-gradient-to-br from-purple-50 to-background p-5 dark:from-purple-950/20'>
            <div className='mb-3 flex items-center justify-between'>
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900'>
                <Users className='h-5 w-5 text-purple-600 dark:text-purple-400' />
              </div>
              <Badge className='bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'>
                {metricsLoading ? '...' : `${metrics?.clientRetention.toFixed(1)}%`}
              </Badge>
            </div>
            <div className='mb-1 text-2xl font-bold'>
              {metricsLoading ? '...' : formatCurrency(metrics?.averageInvoice || 0)}
            </div>
            <div className='text-xs text-muted-foreground'>
              {isRTL ? 'متوسط الفاتورة' : 'Average Invoice'}
            </div>
          </div>

          {/* Average Payment Days */}
          <div className='rounded-lg border bg-gradient-to-br from-yellow-50 to-background p-5 dark:from-yellow-950/20'>
            <div className='mb-3 flex items-center justify-between'>
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900'>
                <Clock className='h-5 w-5 text-yellow-600 dark:text-yellow-400' />
              </div>
              <Badge className='bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'>
                <CheckCircle className='me-1 h-3 w-3' />
                {isRTL ? 'جيد' : 'Good'}
              </Badge>
            </div>
            <div className='mb-1 text-2xl font-bold'>
              {metricsLoading ? '...' : metrics?.averagePaymentDays || 0}
            </div>
            <div className='text-xs text-muted-foreground'>
              {isRTL ? 'متوسط أيام الدفع' : 'Avg Payment Days'}
            </div>
          </div>
        </div>

        {/* Revenue Trend Chart */}
        <Card className='mb-6'>
          <CardContent className='p-6'>
            <div className='mb-6 flex items-center justify-between'>
              <div>
                <h3 className='text-lg font-bold'>
                  {isRTL ? 'اتجاه الإيرادات والأرباح' : 'Revenue & Profit Trend'}
                </h3>
                <p className='text-xs text-muted-foreground'>
                  {isRTL
                    ? 'مقارنة شهرية - آخر 12 شهر'
                    : 'Monthly comparison - Last 12 months'}
                </p>
              </div>
              <div className='flex items-center gap-4 text-xs'>
                <div className='flex items-center gap-2'>
                  <div className='h-3 w-3 rounded-full bg-primary'></div>
                  <span>{isRTL ? 'الإيرادات' : 'Revenue'}</span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='h-3 w-3 rounded-full bg-blue-500'></div>
                  <span>{isRTL ? 'الأرباح' : 'Profit'}</span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='h-3 w-3 rounded-full bg-red-400'></div>
                  <span>{isRTL ? 'المصروفات' : 'Expenses'}</span>
                </div>
              </div>
            </div>

            {trendsLoading ? (
              <div className='flex h-80 items-center justify-center'>
                <p className='text-muted-foreground'>
                  {isRTL ? 'جاري التحميل...' : 'Loading...'}
                </p>
              </div>
            ) : (
              <div className='relative h-80'>
                <div className='absolute inset-0 flex items-end justify-between gap-2'>
                  {revenueTrends?.slice(-12).map((month, idx) => (
                    <div
                      key={idx}
                      className='flex flex-1 flex-col items-center gap-2'
                    >
                      <div
                        className='flex w-full items-end justify-center gap-0.5'
                        style={{ height: '300px' }}
                      >
                        <div
                          className='group relative w-full cursor-pointer rounded-t bg-primary transition-all hover:opacity-80'
                          style={{
                            height: `${(month.revenue / maxRevenue) * 100}%`,
                            minHeight: '8px',
                          }}
                        >
                          <div className='absolute bottom-full start-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-900 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 dark:bg-slate-100 dark:text-slate-900'>
                            {formatCurrency(month.revenue)}
                          </div>
                        </div>
                        <div
                          className='group relative w-full cursor-pointer rounded-t bg-blue-500 transition-all hover:opacity-80'
                          style={{
                            height: `${(month.profit / maxRevenue) * 100}%`,
                            minHeight: '8px',
                          }}
                        >
                          <div className='absolute bottom-full start-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-blue-900 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100'>
                            {formatCurrency(month.profit)}
                          </div>
                        </div>
                        <div
                          className='group relative w-full cursor-pointer rounded-t bg-red-400 transition-all hover:opacity-80'
                          style={{
                            height: `${(month.expenses / maxRevenue) * 100}%`,
                            minHeight: '8px',
                          }}
                        >
                          <div className='absolute bottom-full start-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-red-900 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100'>
                            {formatCurrency(month.expenses)}
                          </div>
                        </div>
                      </div>
                      <div className='w-16 origin-top-right -rotate-45 text-end text-xs text-muted-foreground'>
                        {month.month}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Practice Areas & Top Clients */}
        <div className='mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2'>
          {/* Practice Area Performance */}
          <Card>
            <CardContent className='p-6'>
              <div className='mb-4 flex items-center justify-between'>
                <h3 className='text-sm font-bold'>
                  {isRTL ? 'أداء مجالات الممارسة' : 'Practice Area Performance'}
                </h3>
                <Badge variant='outline' className='flex items-center gap-1'>
                  <BarChart3 className='h-3 w-3' />
                  {isRTL ? 'تحليل تفصيلي' : 'Detailed Analysis'}
                </Badge>
              </div>

              {areasLoading ? (
                <p className='text-sm text-muted-foreground'>
                  {isRTL ? 'جاري التحميل...' : 'Loading...'}
                </p>
              ) : (
                <div className='space-y-4'>
                  {practiceAreas?.map((area, idx) => (
                    <div
                      key={idx}
                      className='rounded-lg bg-muted p-4 transition-colors hover:bg-muted/80'
                    >
                      <div className='mb-2 flex items-center justify-between'>
                        <div className='flex-1'>
                          <div className='mb-1 flex items-center justify-between'>
                            <span className='text-sm font-semibold'>
                              {area.name}
                            </span>
                            <span className='text-lg font-bold'>
                              {formatCurrency(area.revenue)}
                            </span>
                          </div>
                          <div className='flex items-center gap-3 text-xs text-muted-foreground'>
                            <span>
                              {area.cases} {isRTL ? 'قضية' : 'cases'}
                            </span>
                            <span>•</span>
                            <span>
                              {isRTL ? 'متوسط:' : 'Avg:'}{' '}
                              {formatCurrency(area.avgValue)}
                            </span>
                            <span>•</span>
                            <span className='font-semibold text-green-600 dark:text-green-400'>
                              +{area.growth}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className='mb-2 flex items-center gap-2'>
                        <div className='h-2 flex-1 rounded-full bg-muted-foreground/20'>
                          <div
                            className='h-2 rounded-full bg-primary'
                            style={{ width: `${area.percentage}%` }}
                          ></div>
                        </div>
                        <span className='text-xs font-semibold'>
                          {area.percentage}%
                        </span>
                      </div>
                      <div className='flex items-center justify-between text-xs'>
                        <span className='text-muted-foreground'>
                          {isRTL ? 'صافي الربح:' : 'Net Profit:'}
                        </span>
                        <span className='font-bold text-green-600 dark:text-green-400'>
                          {formatCurrency(area.profit)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Clients Profitability */}
          <Card>
            <CardContent className='p-6'>
              <div className='mb-4 flex items-center justify-between'>
                <h3 className='text-sm font-bold'>
                  {isRTL ? 'أكثر العملاء ربحية' : 'Most Profitable Clients'}
                </h3>
                <Badge
                  variant='outline'
                  className='border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/20 dark:text-green-400'
                >
                  <Award className='me-1 h-3 w-3' />
                  {isRTL ? 'أفضل أداء' : 'Best Performance'}
                </Badge>
              </div>

              {clientsLoading ? (
                <p className='text-sm text-muted-foreground'>
                  {isRTL ? 'جاري التحميل...' : 'Loading...'}
                </p>
              ) : (
                <div className='space-y-3'>
                  {topClients?.map((client, idx) => (
                    <div
                      key={idx}
                      className='rounded-lg bg-muted p-4 transition-colors hover:bg-muted/80'
                    >
                      <div className='mb-2 flex items-start justify-between'>
                        <div className='flex flex-1 items-center gap-3'>
                          <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10'>
                            <span className='text-sm font-bold text-primary'>
                              #{idx + 1}
                            </span>
                          </div>
                          <div className='flex-1'>
                            <div className='mb-1 text-sm font-semibold'>
                              {client.name}
                            </div>
                            <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                              <span>
                                {client.cases} {isRTL ? 'قضايا' : 'cases'}
                              </span>
                              <span>•</span>
                              <span className='flex items-center gap-1'>
                                <Clock className='h-3 w-3' />
                                {client.paymentSpeed} {isRTL ? 'يوم' : 'days'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className='text-end'>
                          {client.trend === 'up' && (
                            <Badge className='mb-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'>
                              <TrendingUp className='h-3 w-3' />
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className='mt-3 grid grid-cols-3 gap-2'>
                        <div className='rounded border bg-background p-2 text-center'>
                          <div className='mb-1 text-xs text-muted-foreground'>
                            {isRTL ? 'إيرادات' : 'Revenue'}
                          </div>
                          <div className='text-sm font-bold'>
                            {formatCurrency(client.revenue)}
                          </div>
                        </div>
                        <div className='rounded border border-green-200 bg-green-50 p-2 text-center dark:border-green-800 dark:bg-green-950/20'>
                          <div className='mb-1 text-xs text-muted-foreground'>
                            {isRTL ? 'ربح' : 'Profit'}
                          </div>
                          <div className='text-sm font-bold text-green-700 dark:text-green-400'>
                            {formatCurrency(client.profit)}
                          </div>
                        </div>
                        <div className='rounded border border-blue-200 bg-blue-50 p-2 text-center dark:border-blue-800 dark:bg-blue-950/20'>
                          <div className='mb-1 text-xs text-muted-foreground'>
                            {isRTL ? 'هامش' : 'Margin'}
                          </div>
                          <div className='text-sm font-bold text-blue-700 dark:text-blue-400'>
                            {client.margin.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Expense Breakdown & Collection Performance */}
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
          {/* Expense Breakdown */}
          <Card>
            <CardContent className='p-6'>
              <div className='mb-4 flex items-center justify-between'>
                <h3 className='text-sm font-bold'>
                  {isRTL ? 'تفصيل المصروفات' : 'Expense Breakdown'}
                </h3>
                <span className='text-lg font-bold text-red-700 dark:text-red-400'>
                  {expensesLoading
                    ? '...'
                    : formatCurrency(metrics?.totalExpenses || 0)}
                </span>
              </div>

              {expensesLoading ? (
                <p className='text-sm text-muted-foreground'>
                  {isRTL ? 'جاري التحميل...' : 'Loading...'}
                </p>
              ) : (
                <div className='space-y-3'>
                  {expenses?.map((expense, idx) => (
                    <div key={idx} className='rounded-lg bg-muted p-3'>
                      <div className='mb-2 flex items-center justify-between'>
                        <span className='text-sm font-medium'>
                          {expense.category}
                        </span>
                        <div className='flex items-center gap-2'>
                          <span className='text-sm font-bold'>
                            {formatCurrency(expense.amount)}
                          </span>
                          <span
                            className={`text-xs font-semibold ${
                              expense.change < 0
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}
                          >
                            {expense.change > 0 ? '+' : ''}
                            {expense.change}%
                          </span>
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        <div className='h-2 flex-1 rounded-full bg-muted-foreground/20'>
                          <div
                            className='h-2 rounded-full bg-red-500'
                            style={{ width: `${expense.percentage}%` }}
                          ></div>
                        </div>
                        <span className='text-xs font-semibold'>
                          {expense.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Collection Performance */}
          <Card>
            <CardContent className='p-6'>
              <div className='mb-4 flex items-center justify-between'>
                <h3 className='text-sm font-bold'>
                  {isRTL ? 'أداء التحصيل حسب الفترة' : 'Collection Performance'}
                </h3>
                <Badge className='bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400'>
                  {metricsLoading
                    ? '...'
                    : `${metrics?.collectionRate.toFixed(1)}% ${isRTL ? 'معدل التحصيل' : 'collection rate'}`}
                </Badge>
              </div>

              {collectionLoading ? (
                <p className='text-sm text-muted-foreground'>
                  {isRTL ? 'جاري التحميل...' : 'Loading...'}
                </p>
              ) : (
                <div className='space-y-3'>
                  {collectionData?.map((data, idx) => {
                    const colors = getColorClasses(data.color)
                    return (
                      <div
                        key={idx}
                        className={`rounded-lg border-2 p-4 ${colors.bg} ${colors.border}`}
                      >
                        <div className='mb-2 flex items-center justify-between'>
                          <div className='flex items-center gap-3'>
                            <div
                              className={`flex h-10 w-10 items-center justify-center rounded-lg ${colors.iconBg}`}
                            >
                              <span className={`text-sm font-bold ${colors.text}`}>
                                {data.count}
                              </span>
                            </div>
                            <div>
                              <div className='text-sm font-semibold'>
                                {data.range}
                              </div>
                              <div className='text-xs text-muted-foreground'>
                                {data.count} {isRTL ? 'فاتورة' : 'invoices'}
                              </div>
                            </div>
                          </div>
                          <div className='text-end'>
                            <div className='text-lg font-bold'>
                              {formatCurrency(data.amount)}
                            </div>
                            <div className='text-xs text-muted-foreground'>
                              {data.percentage}%
                            </div>
                          </div>
                        </div>
                        <div className='h-2 w-full rounded-full bg-background'>
                          <div
                            className={`h-2 rounded-full ${colors.bar}`}
                            style={{ width: `${data.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
