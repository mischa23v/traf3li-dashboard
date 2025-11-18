import { TrendingUp, DollarSign, Receipt, AlertCircle, Clock, ArrowUpRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ProfileDropdown } from '@/components/profile-dropdown'

export default function BillingDashboard() {
  // Financial data from design
  const financialSummary = {
    totalRevenue: 485600,
    revenueThisMonth: 125400,
    monthlyGrowth: 15.3,
    outstandingBalance: 105807.50,
    overdueAmount: 70000,
    collectionRate: 72.5,
    averagePaymentTime: 18,
    monthlyExpenses: 48320,
    netProfit: 77080,
    profitMargin: 38.5
  }

  const outstandingInvoices = [
    { id: 'INV-2025-001', client: 'مشاري الرابح', amount: 52900, dueDate: '15 ديسمبر', daysOverdue: 0, urgent: false },
    { id: 'INV-2025-005', client: 'سارة المطيري', amount: 28000, dueDate: '10 نوفمبر', daysOverdue: 7, urgent: true },
    { id: 'INV-2025-006', client: 'محمد الدوسري', amount: 42000, dueDate: '5 نوفمبر', daysOverdue: 12, urgent: true },
    { id: 'INV-2025-008', client: 'عمر العنزي', amount: 78000, dueDate: '30 نوفمبر', daysOverdue: 0, urgent: false }
  ]

  const revenueByArea = [
    { area: 'قضايا عمالية', amount: 185000, percentage: 38, cases: 12 },
    { area: 'قضايا تجارية', amount: 145000, percentage: 30, cases: 8 },
    { area: 'قضايا مدنية', amount: 95600, percentage: 20, cases: 15 },
    { area: 'استشارات قانونية', amount: 60000, percentage: 12, cases: 25 }
  ]

  const cashFlow = [
    { month: 'يونيو', income: 75000, expenses: 42000 },
    { month: 'يوليو', income: 82000, expenses: 45000 },
    { month: 'أغسطس', income: 68000, expenses: 38000 },
    { month: 'سبتمبر', income: 95000, expenses: 52000 },
    { month: 'أكتوبر', income: 118000, expenses: 48000 },
    { month: 'نوفمبر', income: 125400, expenses: 48320 }
  ]

  const topClients = [
    { name: 'المصنع السعودي للمنتجات', totalPaid: 245000, cases: 3, lastPayment: '3 أيام' },
    { name: 'شركة البناء الحديثة', totalPaid: 185000, cases: 2, lastPayment: '5 أيام' },
    { name: 'المجموعة التجارية الكبرى', totalPaid: 142000, cases: 4, lastPayment: '10 أيام' },
    { name: 'مستشفى النور الطبي', totalPaid: 98000, cases: 2, lastPayment: '4 أيام' }
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const maxCashFlow = Math.max(...cashFlow.map(m => Math.max(m.income, m.expenses)))

  return (
    <>
      <Header>
        <div className='ms-auto flex items-center space-x-4'>
          <LanguageSwitcher />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main dir="rtl">
        <div className='mb-6 flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>لوحة الحسابات</h1>
            <p className="text-sm text-muted-foreground">نظرة شاملة على الوضع المالي</p>
          </div>
          <div className='flex items-center gap-3'>
            <Button variant="outline">تصدير التقرير</Button>
            <Button>إنشاء فاتورة</Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <Badge variant="outline" className="text-xs">هذا الشهر</Badge>
              </div>
              <div className="text-3xl font-bold mb-1">{formatCurrency(financialSummary.revenueThisMonth)}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" />
                <span>+{financialSummary.monthlyGrowth}% عن الشهر الماضي</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                  <Clock className="h-5 w-5" />
                </div>
                <Badge variant="outline" className="text-xs">معلق</Badge>
              </div>
              <div className="text-3xl font-bold mb-1">{formatCurrency(financialSummary.outstandingBalance)}</div>
              <div className="text-xs text-muted-foreground">رصيد غير مدفوع</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <Badge variant="outline" className="text-xs">متأخر</Badge>
              </div>
              <div className="text-3xl font-bold mb-1">{formatCurrency(financialSummary.overdueAmount)}</div>
              <div className="text-xs text-muted-foreground">يتطلب متابعة فورية</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                  <DollarSign className="h-5 w-5" />
                </div>
                <Badge variant="outline" className="text-xs">صافي</Badge>
              </div>
              <div className="text-3xl font-bold mb-1">{formatCurrency(financialSummary.netProfit)}</div>
              <div className="text-xs text-muted-foreground">هامش ربح {financialSummary.profitMargin}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          {/* Cash Flow Chart */}
          <Card className="col-span-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold">التدفق النقدي</h3>
                  <p className="text-xs text-muted-foreground">الإيرادات مقابل المصروفات - آخر 6 شهور</p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                    <span>الإيرادات</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-muted"></div>
                    <span>المصروفات</span>
                  </div>
                </div>
              </div>

              <div className="relative h-64">
                <div className="absolute inset-0 flex items-end justify-between gap-4">
                  {cashFlow.map((month, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full flex items-end justify-center gap-1" style={{ height: '220px' }}>
                        <div
                          className="w-full bg-primary rounded-t hover:opacity-80 transition-opacity"
                          style={{ height: `${(month.income / maxCashFlow) * 100}%`, minHeight: '10px' }}
                        ></div>
                        <div
                          className="w-full bg-muted rounded-t hover:opacity-80 transition-opacity"
                          style={{ height: `${(month.expenses / maxCashFlow) * 100}%`, minHeight: '10px' }}
                        ></div>
                      </div>
                      <div className="text-xs text-muted-foreground">{month.month}</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-6">مؤشرات الأداء</h3>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">معدل التحصيل</span>
                  <span className="text-2xl font-bold">{financialSummary.collectionRate}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div className="bg-green-500 h-3 rounded-full" style={{ width: `${financialSummary.collectionRate}%` }}></div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">متوسط وقت الدفع</div>
                    <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{financialSummary.averagePaymentTime} يوم</div>
                  </div>
                  <Clock className="h-10 w-10 text-blue-600" />
                </div>
              </div>

              <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">مصروفات الشهر</div>
                    <div className="text-2xl font-bold text-red-900 dark:text-red-100">{formatCurrency(financialSummary.monthlyExpenses)}</div>
                  </div>
                  <Receipt className="h-10 w-10 text-red-600" />
                </div>
              </div>

              <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">إجمالي الإيرادات</div>
                    <div className="text-2xl font-bold text-green-900 dark:text-green-100">{formatCurrency(financialSummary.totalRevenue)}</div>
                  </div>
                  <TrendingUp className="h-10 w-10 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Outstanding Invoices */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold">فواتير تحتاج متابعة</h3>
                <Badge variant="destructive">{outstandingInvoices.filter(i => i.urgent).length} عاجل</Badge>
              </div>
              <div className="space-y-3">
                {outstandingInvoices.map((invoice, idx) => (
                  <div key={idx} className={`p-3 rounded-lg ${invoice.urgent ? 'bg-red-50 dark:bg-red-950 border border-red-200' : 'bg-muted'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="text-xs font-mono text-muted-foreground">{invoice.id}</div>
                        <div className="text-sm font-semibold">{invoice.client}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold">{formatCurrency(invoice.amount)}</div>
                        {invoice.daysOverdue > 0 && (
                          <Badge variant="destructive" className="text-xs mt-1">متأخر {invoice.daysOverdue} يوم</Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">الاستحقاق: {invoice.dueDate}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Revenue by Area */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-sm font-bold mb-4">الإيرادات حسب نوع القضية</h3>
              <div className="space-y-4">
                {revenueByArea.map((area, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="text-sm font-medium">{area.area}</div>
                        <div className="text-xs text-muted-foreground">{area.cases} قضية</div>
                      </div>
                      <div className="text-sm font-bold">{formatCurrency(area.amount)}</div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${area.percentage}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Clients */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-sm font-bold mb-4">أهم العملاء</h3>
              <div className="space-y-4">
                {topClients.map((client, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold">{client.name}</div>
                      <div className="text-xs text-muted-foreground">{client.cases} قضايا • آخر دفعة {client.lastPayment}</div>
                    </div>
                    <div className="text-sm font-bold text-green-700 dark:text-green-400">{formatCurrency(client.totalPaid)}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </Main>
    </>
  )
}
