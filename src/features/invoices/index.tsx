import { useState } from 'react'
import { Search, Filter, Download, Plus, Eye, Edit, Send, DollarSign, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ProfileDropdown } from '@/components/profile-dropdown'

interface Invoice {
  id: string
  clientName: string
  clientCompany: string
  caseNumber: string
  amount: number
  issueDate: string
  dueDate: string
  paidDate: string | null
  status: string
  statusColor: string
  daysUntilDue?: number
  daysOverdue?: number
  services: string[]
  paymentMethod: string | null
}

interface ClientData {
  total: number
  count: number
}

export default function InvoicesDashboard() {
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState('month')

  // Sample invoice data
  const invoices: Invoice[] = [
    {
      id: 'INV-2025-001',
      clientName: 'مشاري بن ناهد الرابح',
      clientCompany: 'المصنع السعودي للمنتجات المعدنية',
      caseNumber: '4772077905',
      amount: 45000,
      issueDate: '15 نوفمبر 2025',
      dueDate: '15 ديسمبر 2025',
      paidDate: null,
      status: 'معلقة',
      statusColor: 'bg-amber-500',
      daysUntilDue: 28,
      services: ['استشارة قانونية', 'صياغة عقود'],
      paymentMethod: null
    },
    {
      id: 'INV-2025-002',
      clientName: 'عبدالله بن سعد الغامدي',
      clientCompany: 'شركة البناء الحديثة',
      caseNumber: '4772088016',
      amount: 38000,
      issueDate: '10 نوفمبر 2025',
      dueDate: '10 ديسمبر 2025',
      paidDate: '16 نوفمبر 2025',
      status: 'مدفوعة',
      statusColor: 'bg-green-500',
      daysUntilDue: undefined,
      services: ['تمثيل قانوني', 'مرافعة'],
      paymentMethod: 'تحويل بنكي'
    },
    {
      id: 'INV-2025-003',
      clientName: 'فاطمة بنت محمد العتيبي',
      clientCompany: 'مستشفى النور الطبي',
      caseNumber: '4772099127',
      amount: 52000,
      issueDate: '8 نوفمبر 2025',
      dueDate: '8 ديسمبر 2025',
      paidDate: '14 نوفمبر 2025',
      status: 'مدفوعة',
      statusColor: 'bg-green-500',
      daysUntilDue: undefined,
      services: ['استشارة', 'تسوية ودية'],
      paymentMethod: 'شيك'
    },
    {
      id: 'INV-2025-004',
      clientName: 'خالد بن عبدالرحمن القحطاني',
      clientCompany: 'شركة التقنية المتقدمة',
      caseNumber: '4772100238',
      amount: 65000,
      issueDate: '5 نوفمبر 2025',
      dueDate: '20 نوفمبر 2025',
      paidDate: null,
      status: 'معلقة',
      statusColor: 'bg-amber-500',
      daysUntilDue: 3,
      services: ['تمثيل قانوني', 'استئناف', 'استشارة'],
      paymentMethod: null
    },
    {
      id: 'INV-2025-005',
      clientName: 'سارة بنت أحمد المطيري',
      clientCompany: 'المجموعة التجارية الكبرى',
      caseNumber: '4772111349',
      amount: 28000,
      issueDate: '1 نوفمبر 2025',
      dueDate: '10 نوفمبر 2025',
      paidDate: null,
      status: 'متأخرة',
      statusColor: 'bg-red-500',
      daysOverdue: 7,
      services: ['استشارة قانونية'],
      paymentMethod: null
    },
    {
      id: 'INV-2025-006',
      clientName: 'محمد بن يوسف الدوسري',
      clientCompany: 'شركة النقل السريع',
      caseNumber: '4772122450',
      amount: 42000,
      issueDate: '28 أكتوبر 2025',
      dueDate: '5 نوفمبر 2025',
      paidDate: null,
      status: 'متأخرة',
      statusColor: 'bg-red-500',
      daysOverdue: 12,
      services: ['تسوية ودية', 'صياغة اتفاقية'],
      paymentMethod: null
    },
    {
      id: 'INV-2025-007',
      clientName: 'نورة بنت خالد الشمري',
      clientCompany: 'مركز التدريب الوطني',
      caseNumber: '4772133561',
      amount: 35000,
      issueDate: '25 أكتوبر 2025',
      dueDate: '25 نوفمبر 2025',
      paidDate: '30 أكتوبر 2025',
      status: 'مدفوعة',
      statusColor: 'bg-green-500',
      daysUntilDue: undefined,
      services: ['تمثيل قانوني'],
      paymentMethod: 'تحويل بنكي'
    },
    {
      id: 'INV-2025-008',
      clientName: 'عمر بن فهد العنزي',
      clientCompany: 'الشركة الصناعية المتحدة',
      caseNumber: '4772144672',
      amount: 78000,
      issueDate: '20 أكتوبر 2025',
      dueDate: '30 نوفمبر 2025',
      paidDate: null,
      status: 'معلقة',
      statusColor: 'bg-amber-500',
      daysUntilDue: 13,
      services: ['استئناف', 'مرافعة', 'بحث قانوني'],
      paymentMethod: null
    }
  ]

  // Filter invoices based on active tab
  const filteredInvoices = invoices.filter((inv) => {
    if (activeTab === 'all') return true
    if (activeTab === 'paid') return inv.status === 'مدفوعة'
    if (activeTab === 'pending') return inv.status === 'معلقة'
    if (activeTab === 'overdue') return inv.status === 'متأخرة'
    return true
  })

  // Calculate statistics
  const totalInvoices = invoices.length
  const paidInvoices = invoices.filter((inv) => inv.status === 'مدفوعة').length
  const pendingInvoices = invoices.filter((inv) => inv.status === 'معلقة').length
  const overdueInvoices = invoices.filter((inv) => inv.status === 'متأخرة').length

  const totalRevenue = invoices.reduce((sum: number, inv) => sum + inv.amount, 0)
  const paidRevenue = invoices.filter((inv) => inv.status === 'مدفوعة').reduce((sum: number, inv) => sum + inv.amount, 0)
  const pendingRevenue = invoices.filter((inv) => inv.status === 'معلقة').reduce((sum: number, inv) => sum + inv.amount, 0)
  const overdueRevenue = invoices.filter((inv) => inv.status === 'متأخرة').reduce((sum: number, inv) => sum + inv.amount, 0)


  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <>
      <Header>
        <div className='flex items-center gap-6 flex-1'>
          <h1 className="text-xl font-bold">الفواتير</h1>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="بحث في الفواتير..."
              className="w-80 pr-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            تصدير
          </Button>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            تصفية
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            فاتورة جديدة
          </Button>
          <LanguageSwitcher />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main dir="rtl">
        {/* Modern Dashboard Overview */}
        <div className="mb-6">
          {/* Top Row - Key Metrics */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            {/* Total Revenue */}
            <Card className="bg-gradient-to-br from-muted to-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className="text-xs">إجمالي</Badge>
                </div>
                <div className="text-3xl font-bold mb-1">{formatCurrency(totalRevenue)}</div>
                <div className="text-xs text-muted-foreground">إجمالي الإيرادات</div>
              </CardContent>
            </Card>

            {/* Paid Revenue */}
            <Card className="border-green-200 bg-gradient-to-br from-green-50 to-card dark:from-green-950">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-700 dark:text-green-300" />
                  </div>
                  <Badge className="bg-green-600 text-xs">مدفوع</Badge>
                </div>
                <div className="text-3xl font-bold text-green-900 dark:text-green-100 mb-1">{formatCurrency(paidRevenue)}</div>
                <div className="text-xs text-green-700 dark:text-green-300">المبالغ المحصلة</div>
              </CardContent>
            </Card>

            {/* Pending Revenue */}
            <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-card dark:from-amber-950">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-amber-700 dark:text-amber-300" />
                  </div>
                  <Badge className="bg-amber-600 text-xs">معلق</Badge>
                </div>
                <div className="text-3xl font-bold text-amber-900 dark:text-amber-100 mb-1">{formatCurrency(pendingRevenue)}</div>
                <div className="text-xs text-amber-700 dark:text-amber-300">قيد الانتظار</div>
              </CardContent>
            </Card>

            {/* Overdue Revenue */}
            <Card className="border-red-200 bg-gradient-to-br from-red-50 to-card dark:from-red-950">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-lg bg-red-100 dark:bg-red-900 flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-red-700 dark:text-red-300" />
                  </div>
                  <Badge variant="destructive" className="text-xs">متأخر</Badge>
                </div>
                <div className="text-3xl font-bold text-red-900 dark:text-red-100 mb-1">{formatCurrency(overdueRevenue)}</div>
                <div className="text-xs text-red-700 dark:text-red-300">المبالغ المتأخرة</div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Row - Analytics */}
          <div className="grid grid-cols-3 gap-4">
            {/* Status Distribution */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold mb-4">توزيع الحالات</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-muted-foreground">مدفوعة</span>
                      <span className="text-xs font-bold">{paidInvoices}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{width: `${(paidInvoices / totalInvoices) * 100}%`}}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-muted-foreground">معلقة</span>
                      <span className="text-xs font-bold">{pendingInvoices}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-amber-500 h-2 rounded-full"
                        style={{width: `${(pendingInvoices / totalInvoices) * 100}%`}}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-muted-foreground">متأخرة</span>
                      <span className="text-xs font-bold">{overdueInvoices}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{width: `${(overdueInvoices / totalInvoices) * 100}%`}}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Timeline */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold mb-4">الجدول الزمني</h3>
                <div className="space-y-3">
                  {invoices
                    .filter((inv) => inv.status !== 'مدفوعة')
                    .sort((a, b) => {
                      if (a.status === 'متأخرة') return -1
                      if (b.status === 'متأخرة') return 1
                      return (a.daysUntilDue || 999) - (b.daysUntilDue || 999)
                    })
                    .slice(0, 3)
                    .map((inv, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
                          inv.status === 'متأخرة'
                            ? 'bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900 dark:to-red-950'
                            : inv.daysUntilDue && inv.daysUntilDue <= 7
                            ? 'bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900 dark:to-amber-950'
                            : 'bg-gradient-to-br from-muted to-muted/50'
                        }`}>
                          <div className="text-center">
                            <div className={`text-lg font-bold ${
                              inv.status === 'متأخرة'
                                ? 'text-red-900 dark:text-red-100'
                                : inv.daysUntilDue && inv.daysUntilDue <= 7
                                ? 'text-amber-900 dark:text-amber-100'
                                : ''
                            }`}>
                              {inv.status === 'متأخرة' ? inv.daysOverdue : inv.daysUntilDue}
                            </div>
                            <div className="text-[8px] text-muted-foreground">يوم</div>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium truncate">{inv.clientName}</div>
                          <div className="text-[10px] text-muted-foreground">{formatCurrency(inv.amount)}</div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Clients */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold mb-4">أكبر العملاء</h3>
                <div className="space-y-3">
                  {Object.entries(
                    invoices.reduce((acc: Record<string, ClientData>, inv) => {
                      if (!acc[inv.clientName]) {
                        acc[inv.clientName] = { total: 0, count: 0 };
                      }
                      acc[inv.clientName].total += inv.amount;
                      acc[inv.clientName].count += 1;
                      return acc;
                    }, {})
                  )
                  .sort((a, b) => b[1].total - a[1].total)
                  .slice(0, 3)
                  .map(([name, data], idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                        <span className="text-xs font-bold">{data.count}</span>
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-medium">{name}</div>
                        <div className="text-[10px] text-muted-foreground">{formatCurrency(data.total)}</div>
                      </div>
                      <div className="w-16 bg-muted rounded-full h-1.5">
                        <div
                          className="bg-foreground/60 h-1.5 rounded-full"
                          style={{width: `${(data.total / totalRevenue) * 100}%`}}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs and Filters */}
        <div className="bg-card rounded-lg border mb-6">
          <div className="border-b px-6 py-3">
            <div className="flex items-center gap-2">
              <Button
                variant={activeTab === 'all' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('all')}
                className="rounded-full"
              >
                جميع الفواتير ({totalInvoices})
              </Button>
              <Button
                variant={activeTab === 'paid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('paid')}
                className="rounded-full"
              >
                مدفوعة ({paidInvoices})
              </Button>
              <Button
                variant={activeTab === 'pending' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('pending')}
                className="rounded-full"
              >
                معلقة ({pendingInvoices})
              </Button>
              <Button
                variant={activeTab === 'overdue' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('overdue')}
                className="rounded-full"
              >
                متأخرة ({overdueInvoices})
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="px-6 py-4 bg-muted border-b">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block text-right">الفترة الزمنية</label>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-full text-right" dir="rtl">
                    <SelectValue placeholder="اختر..." />
                  </SelectTrigger>
                  <SelectContent dir="rtl">
                    <SelectItem value="week">هذا الأسبوع</SelectItem>
                    <SelectItem value="month">هذا الشهر</SelectItem>
                    <SelectItem value="quarter">هذا الربع</SelectItem>
                    <SelectItem value="year">هذا العام</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block text-right">العميل</label>
                <Select>
                  <SelectTrigger className="w-full text-right" dir="rtl">
                    <SelectValue placeholder="جميع العملاء" />
                  </SelectTrigger>
                  <SelectContent dir="rtl">
                    <SelectItem value="all">جميع العملاء</SelectItem>
                    {Array.from(new Set(invoices.map((inv) => inv.clientName))).map((name) => (
                      <SelectItem key={name} value={name}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block text-right">المبلغ</label>
                <Select>
                  <SelectTrigger className="w-full text-right" dir="rtl">
                    <SelectValue placeholder="اختر..." />
                  </SelectTrigger>
                  <SelectContent dir="rtl">
                    <SelectItem value="all">جميع المبالغ</SelectItem>
                    <SelectItem value="low">أقل من 30,000</SelectItem>
                    <SelectItem value="medium">30,000 - 50,000</SelectItem>
                    <SelectItem value="high">أكثر من 50,000</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block text-right">طريقة الدفع</label>
                <Select>
                  <SelectTrigger className="w-full text-right" dir="rtl">
                    <SelectValue placeholder="اختر..." />
                  </SelectTrigger>
                  <SelectContent dir="rtl">
                    <SelectItem value="all">الكل</SelectItem>
                    <SelectItem value="bank">تحويل بنكي</SelectItem>
                    <SelectItem value="check">شيك</SelectItem>
                    <SelectItem value="cash">نقدي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <Button size="sm">تطبيق</Button>
              <Button size="sm" variant="outline">مسح</Button>
            </div>
          </div>
        </div>

        {/* Invoices Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted border-b">
                  <tr>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground">رقم الفاتورة</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground">العميل</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground">رقم القضية</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground">الخدمات</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground">المبلغ</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground">تاريخ الإصدار</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground">تاريخ الاستحقاق</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground">الحالة</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className="border-b hover:bg-muted/50 transition-colors"
                    >
                      {/* Invoice Number */}
                      <td className="px-6 py-4">
                        <div className="text-right">
                          <div className="text-sm font-bold">{invoice.id}</div>
                        </div>
                      </td>

                      {/* Client */}
                      <td className="px-6 py-4">
                        <div className="text-right">
                          <div className="text-sm font-medium mb-1">{invoice.clientName}</div>
                          <div className="text-xs text-muted-foreground">{invoice.clientCompany}</div>
                        </div>
                      </td>

                      {/* Case Number */}
                      <td className="px-6 py-4">
                        <div className="text-sm text-right">{invoice.caseNumber}</div>
                      </td>

                      {/* Services */}
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 justify-end">
                          {invoice.services.slice(0, 2).map((service, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {service}
                            </Badge>
                          ))}
                          {invoice.services.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{invoice.services.length - 2}
                            </Badge>
                          )}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-right">
                          {formatCurrency(invoice.amount)}
                        </div>
                      </td>

                      {/* Issue Date */}
                      <td className="px-6 py-4">
                        <div className="text-sm text-right">{invoice.issueDate}</div>
                      </td>

                      {/* Due Date */}
                      <td className="px-6 py-4">
                        <div className="text-right">
                          <div className="text-sm mb-1">{invoice.dueDate}</div>
                          {invoice.status === 'متأخرة' && (
                            <Badge variant="destructive" className="text-xs">
                              متأخر {invoice.daysOverdue} يوم
                            </Badge>
                          )}
                          {invoice.status === 'معلقة' && invoice.daysUntilDue && invoice.daysUntilDue <= 7 && (
                            <Badge className="bg-amber-500 text-xs">
                              باقي {invoice.daysUntilDue} يوم
                            </Badge>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <div className="flex justify-end">
                          <Badge className={invoice.statusColor}>{invoice.status}</Badge>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 justify-end">
                          <Button variant="ghost" size="sm" title="عرض">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" title="تعديل">
                            <Edit className="h-4 w-4" />
                          </Button>
                          {invoice.status !== 'مدفوعة' && (
                            <Button variant="ghost" size="sm" title="إرسال تذكير">
                              <Send className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" title="تحميل">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </Main>
    </>
  )
}
