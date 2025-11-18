import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
  TrendingUp,
  DollarSign,
  Clock,
  AlertCircle,
  Receipt,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import financialService from '@/services/financialService'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/_authenticated/billing/')({
  component: BillingDashboard,
})

function BillingDashboard() {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  // Fetch dashboard overview data
  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['financial-dashboard-overview'],
    queryFn: () => financialService.getDashboardOverview(),
  })

  // Fetch cash flow data
  const { data: cashFlow, isLoading: cashFlowLoading } = useQuery({
    queryKey: ['financial-cash-flow', 6],
    queryFn: () => financialService.getCashFlow(6),
  })

  // Fetch outstanding invoices
  const { data: outstandingInvoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ['financial-outstanding-invoices'],
    queryFn: () => financialService.getOutstandingInvoices(),
  })

  // Fetch revenue by area
  const { data: revenueByArea, isLoading: areaLoading } = useQuery({
    queryKey: ['financial-revenue-by-area'],
    queryFn: () => financialService.getRevenueByArea(),
  })

  // Fetch top clients
  const { data: topClients, isLoading: clientsLoading } = useQuery({
    queryKey: ['financial-top-clients', 4],
    queryFn: () => financialService.getTopClients(4),
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const maxCashFlow = Math.max(
    ...(cashFlow?.map((m) => Math.max(m.income, m.expenses)) || [0])
  )

  const urgentCount =
    outstandingInvoices?.filter((i) => i.urgent).length || 0

  return (
    <div className='min-h-screen'>
      {/* Top Header */}
      <div className='border-b bg-background px-6 py-4'>
        <div className='mx-auto flex max-w-[1800px] items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold'>
              {isRTL ? 'لوحة الحسابات' : 'Billing Dashboard'}
            </h1>
            <p className='text-sm text-muted-foreground'>
              {isRTL
                ? 'نظرة شاملة على الوضع المالي'
                : 'Comprehensive financial overview'}
            </p>
          </div>
          <div className='flex items-center gap-3'>
            <Button variant='outline'>
              {isRTL ? 'تصدير التقرير' : 'Export Report'}
            </Button>
            <Button>{isRTL ? 'إنشاء فاتورة' : 'Create Invoice'}</Button>
          </div>
        </div>
      </div>

      <div className='mx-auto max-w-[1800px] p-6'>
        {/* Key Metrics */}
        <div className='mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {/* Monthly Revenue */}
          <Card className='bg-gradient-to-br from-muted/50 to-background'>
            <CardContent className='p-6'>
              <div className='mb-3 flex items-center justify-between'>
                <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-muted'>
                  <TrendingUp className='h-5 w-5' />
                </div>
                <Badge variant='outline' className='text-xs'>
                  {isRTL ? 'هذا الشهر' : 'This Month'}
                </Badge>
              </div>
              <div className='mb-1 text-3xl font-bold'>
                {overviewLoading ? '...' : formatCurrency(overview?.revenueThisMonth || 0)}
              </div>
              <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                <TrendingUp className='h-3 w-3' />
                <span>
                  {overviewLoading
                    ? '...'
                    : `+${overview?.monthlyGrowth.toFixed(1)}% ${isRTL ? 'عن الشهر الماضي' : 'vs last month'}`}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Outstanding Balance */}
          <Card className='bg-gradient-to-br from-muted/50 to-background'>
            <CardContent className='p-6'>
              <div className='mb-3 flex items-center justify-between'>
                <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-muted'>
                  <Clock className='h-5 w-5' />
                </div>
                <Badge variant='outline' className='text-xs'>
                  {isRTL ? 'معلق' : 'Pending'}
                </Badge>
              </div>
              <div className='mb-1 text-3xl font-bold'>
                {overviewLoading
                  ? '...'
                  : formatCurrency(overview?.outstandingBalance || 0)}
              </div>
              <div className='text-xs text-muted-foreground'>
                {isRTL ? 'رصيد غير مدفوع' : 'Unpaid balance'}
              </div>
            </CardContent>
          </Card>

          {/* Overdue Amount */}
          <Card className='bg-gradient-to-br from-muted/50 to-background'>
            <CardContent className='p-6'>
              <div className='mb-3 flex items-center justify-between'>
                <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-muted'>
                  <AlertCircle className='h-5 w-5' />
                </div>
                <Badge variant='outline' className='text-xs'>
                  {isRTL ? 'متأخر' : 'Overdue'}
                </Badge>
              </div>
              <div className='mb-1 text-3xl font-bold'>
                {overviewLoading
                  ? '...'
                  : formatCurrency(overview?.overdueAmount || 0)}
              </div>
              <div className='text-xs text-muted-foreground'>
                {isRTL ? 'يتطلب متابعة فورية' : 'Requires immediate follow-up'}
              </div>
            </CardContent>
          </Card>

          {/* Net Profit */}
          <Card className='bg-gradient-to-br from-muted/50 to-background'>
            <CardContent className='p-6'>
              <div className='mb-3 flex items-center justify-between'>
                <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-muted'>
                  <DollarSign className='h-5 w-5' />
                </div>
                <Badge variant='outline' className='text-xs'>
                  {isRTL ? 'صافي' : 'Net'}
                </Badge>
              </div>
              <div className='mb-1 text-3xl font-bold'>
                {overviewLoading ? '...' : formatCurrency(overview?.netProfit || 0)}
              </div>
              <div className='text-xs text-muted-foreground'>
                {isRTL
                  ? `هامش ربح ${overview?.profitMargin.toFixed(1)}%`
                  : `Profit margin ${overview?.profitMargin.toFixed(1)}%`}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className='mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3'>
          {/* Cash Flow Chart */}
          <Card className='lg:col-span-2'>
            <CardContent className='p-6'>
              <div className='mb-6 flex items-center justify-between'>
                <div>
                  <h3 className='text-lg font-bold'>
                    {isRTL ? 'التدفق النقدي' : 'Cash Flow'}
                  </h3>
                  <p className='text-xs text-muted-foreground'>
                    {isRTL
                      ? 'الإيرادات مقابل المصروفات - آخر 6 شهور'
                      : 'Revenue vs Expenses - Last 6 months'}
                  </p>
                </div>
                <div className='flex items-center gap-4 text-xs'>
                  <div className='flex items-center gap-2'>
                    <div className='h-3 w-3 rounded-full bg-primary'></div>
                    <span>{isRTL ? 'الإيرادات' : 'Revenue'}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <div className='h-3 w-3 rounded-full bg-muted-foreground/50'></div>
                    <span>{isRTL ? 'المصروفات' : 'Expenses'}</span>
                  </div>
                </div>
              </div>

              {cashFlowLoading ? (
                <div className='flex h-64 items-center justify-center'>
                  <p className='text-muted-foreground'>
                    {isRTL ? 'جاري التحميل...' : 'Loading...'}
                  </p>
                </div>
              ) : (
                <div className='relative h-64'>
                  <div className='absolute inset-0 flex items-end justify-between gap-4'>
                    {cashFlow?.map((month, idx) => (
                      <div
                        key={idx}
                        className='flex flex-1 flex-col items-center gap-2'
                      >
                        <div
                          className='flex w-full items-end justify-center gap-1'
                          style={{ height: '220px' }}
                        >
                          <div
                            className='w-full rounded-t bg-primary transition-colors hover:opacity-80'
                            style={{
                              height: `${(month.income / maxCashFlow) * 100}%`,
                              minHeight: '10px',
                            }}
                          ></div>
                          <div
                            className='w-full rounded-t bg-muted-foreground/50 transition-colors hover:opacity-80'
                            style={{
                              height: `${(month.expenses / maxCashFlow) * 100}%`,
                              minHeight: '10px',
                            }}
                          ></div>
                        </div>
                        <div className='text-xs text-muted-foreground'>
                          {month.month}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card>
            <CardContent className='p-6'>
              <h3 className='mb-6 text-lg font-bold'>
                {isRTL ? 'مؤشرات الأداء' : 'Performance Metrics'}
              </h3>

              <div className='mb-6'>
                <div className='mb-2 flex items-center justify-between'>
                  <span className='text-sm text-muted-foreground'>
                    {isRTL ? 'معدل التحصيل' : 'Collection Rate'}
                  </span>
                  <span className='text-2xl font-bold'>
                    {overviewLoading ? '...' : `${overview?.collectionRate.toFixed(1)}%`}
                  </span>
                </div>
                <div className='h-3 w-full rounded-full bg-muted'>
                  <div
                    className='h-3 rounded-full bg-green-500'
                    style={{
                      width: `${overview?.collectionRate || 0}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className='mb-4 rounded-lg bg-blue-50 p-4 dark:bg-blue-950/20'>
                <div className='flex items-center justify-between'>
                  <div>
                    <div className='mb-1 text-xs text-muted-foreground'>
                      {isRTL ? 'متوسط وقت الدفع' : 'Average Payment Time'}
                    </div>
                    <div className='text-2xl font-bold text-blue-900 dark:text-blue-100'>
                      {overviewLoading
                        ? '...'
                        : `${overview?.averagePaymentTime} ${isRTL ? 'يوم' : 'days'}`}
                    </div>
                  </div>
                  <Clock className='h-10 w-10 text-blue-600 dark:text-blue-400' />
                </div>
              </div>

              <div className='mb-4 rounded-lg bg-red-50 p-4 dark:bg-red-950/20'>
                <div className='flex items-center justify-between'>
                  <div>
                    <div className='mb-1 text-xs text-muted-foreground'>
                      {isRTL ? 'مصروفات الشهر' : 'Monthly Expenses'}
                    </div>
                    <div className='text-2xl font-bold text-red-900 dark:text-red-100'>
                      {overviewLoading
                        ? '...'
                        : formatCurrency(overview?.monthlyExpenses || 0)}
                    </div>
                  </div>
                  <Receipt className='h-10 w-10 text-red-600 dark:text-red-400' />
                </div>
              </div>

              <div className='rounded-lg bg-green-50 p-4 dark:bg-green-950/20'>
                <div className='flex items-center justify-between'>
                  <div>
                    <div className='mb-1 text-xs text-muted-foreground'>
                      {isRTL ? 'إجمالي الإيرادات' : 'Total Revenue'}
                    </div>
                    <div className='text-2xl font-bold text-green-900 dark:text-green-100'>
                      {overviewLoading
                        ? '...'
                        : formatCurrency(overview?.totalRevenue || 0)}
                    </div>
                  </div>
                  <TrendingUp className='h-10 w-10 text-green-600 dark:text-green-400' />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Grid */}
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
          {/* Outstanding Invoices */}
          <Card>
            <CardContent className='p-6'>
              <div className='mb-4 flex items-center justify-between'>
                <h3 className='text-sm font-bold'>
                  {isRTL ? 'فواتير تحتاج متابعة' : 'Invoices Needing Follow-up'}
                </h3>
                {urgentCount > 0 && (
                  <Badge variant='destructive'>
                    {urgentCount} {isRTL ? 'عاجل' : 'urgent'}
                  </Badge>
                )}
              </div>

              {invoicesLoading ? (
                <p className='text-sm text-muted-foreground'>
                  {isRTL ? 'جاري التحميل...' : 'Loading...'}
                </p>
              ) : (
                <div className='space-y-3'>
                  {outstandingInvoices?.slice(0, 4).map((invoice, idx) => (
                    <div
                      key={idx}
                      className={`rounded-lg p-3 ${
                        invoice.urgent
                          ? 'border border-destructive bg-destructive/10'
                          : 'bg-muted'
                      }`}
                    >
                      <div className='mb-2 flex items-center justify-between'>
                        <div>
                          <div className='font-mono text-xs text-muted-foreground'>
                            {invoice.id}
                          </div>
                          <div className='text-sm font-semibold'>
                            {invoice.client}
                          </div>
                        </div>
                        <div className='text-end'>
                          <div className='text-sm font-bold'>
                            {formatCurrency(invoice.amount)}
                          </div>
                          {invoice.daysOverdue > 0 && (
                            <Badge variant='destructive' className='mt-1 text-xs'>
                              {isRTL ? 'متأخر' : 'Overdue'} {invoice.daysOverdue}{' '}
                              {isRTL ? 'يوم' : 'days'}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className='text-xs text-muted-foreground'>
                        {isRTL ? 'الاستحقاق:' : 'Due:'}{' '}
                        {new Date(invoice.dueDate).toLocaleDateString(
                          isRTL ? 'ar-SA' : 'en-US'
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Revenue by Area */}
          <Card>
            <CardContent className='p-6'>
              <h3 className='mb-4 text-sm font-bold'>
                {isRTL ? 'الإيرادات حسب نوع القضية' : 'Revenue by Case Type'}
              </h3>

              {areaLoading ? (
                <p className='text-sm text-muted-foreground'>
                  {isRTL ? 'جاري التحميل...' : 'Loading...'}
                </p>
              ) : (
                <div className='space-y-4'>
                  {revenueByArea?.map((area, idx) => (
                    <div key={idx}>
                      <div className='mb-2 flex items-center justify-between'>
                        <div>
                          <div className='text-sm font-medium'>{area.area}</div>
                          <div className='text-xs text-muted-foreground'>
                            {area.cases} {isRTL ? 'قضية' : 'cases'}
                          </div>
                        </div>
                        <div className='text-sm font-bold'>
                          {formatCurrency(area.amount)}
                        </div>
                      </div>
                      <div className='h-2 w-full rounded-full bg-muted'>
                        <div
                          className='h-2 rounded-full bg-primary'
                          style={{ width: `${area.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Clients */}
          <Card>
            <CardContent className='p-6'>
              <h3 className='mb-4 text-sm font-bold'>
                {isRTL ? 'أهم العملاء' : 'Top Clients'}
              </h3>

              {clientsLoading ? (
                <p className='text-sm text-muted-foreground'>
                  {isRTL ? 'جاري التحميل...' : 'Loading...'}
                </p>
              ) : (
                <div className='space-y-4'>
                  {topClients?.map((client, idx) => (
                    <div key={idx} className='flex items-center justify-between'>
                      <div>
                        <div className='text-sm font-semibold'>{client.name}</div>
                        <div className='text-xs text-muted-foreground'>
                          {client.cases} {isRTL ? 'قضايا' : 'cases'} •{' '}
                          {isRTL ? 'آخر دفعة' : 'Last payment'}{' '}
                          {client.lastPayment}
                        </div>
                      </div>
                      <div className='text-sm font-bold text-green-700 dark:text-green-500'>
                        {formatCurrency(client.totalPaid)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
