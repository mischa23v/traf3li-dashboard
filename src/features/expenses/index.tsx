import { useState } from 'react'
import { Search, Filter, Download, Plus, Eye, Edit, Trash2, Upload, Receipt, TrendingDown, FileText, Building, Coffee, Car, Briefcase, Home } from 'lucide-react'
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
import { LucideIcon } from 'lucide-react'

interface Expense {
  id: string
  description: string
  category: string
  categoryIcon: LucideIcon
  amount: number
  date: string
  caseNumber: string | null
  caseName: string
  paymentMethod: string
  status: string
  statusColor: string
  hasReceipt: boolean
  vendor: string
}

interface CategoryData {
  total: number
  count: number
}

interface CaseData {
  name: string
  total: number
  count: number
}

export default function ExpensesDashboard() {
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState('month')

  // Sample expenses data
  const expenses: Expense[] = [
    {
      id: 'EXP-2025-001',
      description: 'استئجار قاعة المحكمة',
      category: 'رسوم قانونية',
      categoryIcon: Building,
      amount: 5000,
      date: '15 نوفمبر 2025',
      caseNumber: '4772077905',
      caseName: 'قضية مشاري الرابح',
      paymentMethod: 'بطاقة ائتمان',
      status: 'مدفوع',
      statusColor: 'bg-green-500',
      hasReceipt: true,
      vendor: 'وزارة العدل'
    },
    {
      id: 'EXP-2025-002',
      description: 'اشتراك المكتبة القانونية الرقمية',
      category: 'اشتراكات',
      categoryIcon: FileText,
      amount: 2500,
      date: '14 نوفمبر 2025',
      caseNumber: null,
      caseName: 'مصروف عام',
      paymentMethod: 'تحويل بنكي',
      status: 'مدفوع',
      statusColor: 'bg-green-500',
      hasReceipt: true,
      vendor: 'شركة المعلومات القانونية'
    },
    {
      id: 'EXP-2025-003',
      description: 'استشارة خبير مالي',
      category: 'استشارات',
      categoryIcon: Briefcase,
      amount: 8000,
      date: '12 نوفمبر 2025',
      caseNumber: '4772088016',
      caseName: 'قضية عبدالله الغامدي',
      paymentMethod: 'نقدي',
      status: 'مدفوع',
      statusColor: 'bg-green-500',
      hasReceipt: true,
      vendor: 'مكتب الخبراء الماليين'
    },
    {
      id: 'EXP-2025-004',
      description: 'وقود السيارة - زيارات العملاء',
      category: 'مواصلات',
      categoryIcon: Car,
      amount: 450,
      date: '10 نوفمبر 2025',
      caseNumber: '4772099127',
      caseName: 'قضية فاطمة العتيبي',
      paymentMethod: 'نقدي',
      status: 'مدفوع',
      statusColor: 'bg-green-500',
      hasReceipt: true,
      vendor: 'محطة الوقود'
    },
    {
      id: 'EXP-2025-005',
      description: 'اجتماع عمل مع العميل',
      category: 'ضيافة',
      categoryIcon: Coffee,
      amount: 320,
      date: '9 نوفمبر 2025',
      caseNumber: '4772100238',
      caseName: 'قضية خالد القحطاني',
      paymentMethod: 'بطاقة ائتمان',
      status: 'مدفوع',
      statusColor: 'bg-green-500',
      hasReceipt: true,
      vendor: 'مقهى النخيل'
    },
    {
      id: 'EXP-2025-006',
      description: 'رسوم ترجمة مستندات قانونية',
      category: 'خدمات',
      categoryIcon: FileText,
      amount: 1500,
      date: '8 نوفمبر 2025',
      caseNumber: '4772111349',
      caseName: 'قضية سارة المطيري',
      paymentMethod: 'تحويل بنكي',
      status: 'معلق',
      statusColor: 'bg-amber-500',
      hasReceipt: false,
      vendor: 'مكتب الترجمة المعتمد'
    },
    {
      id: 'EXP-2025-007',
      description: 'إيجار المكتب - نوفمبر',
      category: 'إيجار',
      categoryIcon: Home,
      amount: 15000,
      date: '1 نوفمبر 2025',
      caseNumber: null,
      caseName: 'مصروف عام',
      paymentMethod: 'تحويل بنكي',
      status: 'مدفوع',
      statusColor: 'bg-green-500',
      hasReceipt: true,
      vendor: 'شركة العقارات'
    },
    {
      id: 'EXP-2025-008',
      description: 'طباعة المستندات القانونية',
      category: 'مكتبية',
      categoryIcon: FileText,
      amount: 280,
      date: '7 نوفمبر 2025',
      caseNumber: '4772122450',
      caseName: 'قضية محمد الدوسري',
      paymentMethod: 'نقدي',
      status: 'مدفوع',
      statusColor: 'bg-green-500',
      hasReceipt: true,
      vendor: 'مركز الطباعة'
    },
    {
      id: 'EXP-2025-009',
      description: 'رسوم تسجيل علامة تجارية',
      category: 'رسوم قانونية',
      categoryIcon: Building,
      amount: 3500,
      date: '5 نوفمبر 2025',
      caseNumber: '4772133561',
      caseName: 'قضية نورة الشمري',
      paymentMethod: 'بطاقة ائتمان',
      status: 'مدفوع',
      statusColor: 'bg-green-500',
      hasReceipt: true,
      vendor: 'الهيئة السعودية للملكية الفكرية'
    },
    {
      id: 'EXP-2025-010',
      description: 'تكاليف السفر - حضور جلسة في جدة',
      category: 'مواصلات',
      categoryIcon: Car,
      amount: 1200,
      date: '3 نوفمبر 2025',
      caseNumber: '4772144672',
      caseName: 'قضية عمر العنزي',
      paymentMethod: 'بطاقة ائتمان',
      status: 'مدفوع',
      statusColor: 'bg-green-500',
      hasReceipt: true,
      vendor: 'الخطوط الجوية السعودية'
    }
  ]

  // Filter expenses based on active tab
  const filteredExpenses = expenses.filter((exp) => {
    if (activeTab === 'all') return true
    if (activeTab === 'case') return exp.caseNumber !== null
    if (activeTab === 'general') return exp.caseNumber === null
    if (activeTab === 'pending') return exp.status === 'معلق'
    return true
  })

  // Calculate statistics
  const totalExpenses = expenses.reduce((sum: number, exp) => sum + exp.amount, 0)
  const caseExpenses = expenses.filter((exp) => exp.caseNumber !== null).reduce((sum: number, exp) => sum + exp.amount, 0)
  const generalExpenses = expenses.filter((exp) => exp.caseNumber === null).reduce((sum: number, exp) => sum + exp.amount, 0)
  const pendingExpenses = expenses.filter((exp) => exp.status === 'معلق').reduce((sum: number, exp) => sum + exp.amount, 0)

  const expensesByCategory = expenses.reduce((acc: Record<string, CategoryData>, exp) => {
    if (!acc[exp.category]) {
      acc[exp.category] = { total: 0, count: 0 };
    }
    acc[exp.category].total += exp.amount;
    acc[exp.category].count += 1;
    return acc;
  }, {});

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
          <h1 className="text-xl font-bold">المصروفات</h1>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="بحث في المصروفات..."
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
            مصروف جديد
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
            {/* Total Expenses */}
            <Card className="bg-gradient-to-br from-muted to-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                    <Receipt className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className="text-xs">إجمالي</Badge>
                </div>
                <div className="text-3xl font-bold mb-1">{formatCurrency(totalExpenses)}</div>
                <div className="text-xs text-muted-foreground">إجمالي المصروفات</div>
              </CardContent>
            </Card>

            {/* Case Expenses */}
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-card dark:from-blue-950">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <Briefcase className="h-5 w-5 text-blue-700 dark:text-blue-300" />
                  </div>
                  <Badge className="bg-blue-600 text-xs">قضايا</Badge>
                </div>
                <div className="text-3xl font-bold text-blue-900 dark:text-blue-100 mb-1">{formatCurrency(caseExpenses)}</div>
                <div className="text-xs text-blue-700 dark:text-blue-300">مصروفات القضايا</div>
              </CardContent>
            </Card>

            {/* General Expenses */}
            <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-card dark:from-purple-950">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                    <Building className="h-5 w-5 text-purple-700 dark:text-purple-300" />
                  </div>
                  <Badge className="bg-purple-600 text-xs">عام</Badge>
                </div>
                <div className="text-3xl font-bold text-purple-900 dark:text-purple-100 mb-1">{formatCurrency(generalExpenses)}</div>
                <div className="text-xs text-purple-700 dark:text-purple-300">مصروفات عامة</div>
              </CardContent>
            </Card>

            {/* Pending Expenses */}
            <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-card dark:from-amber-950">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                    <TrendingDown className="h-5 w-5 text-amber-700 dark:text-amber-300" />
                  </div>
                  <Badge className="bg-amber-600 text-xs">معلق</Badge>
                </div>
                <div className="text-3xl font-bold text-amber-900 dark:text-amber-100 mb-1">{formatCurrency(pendingExpenses)}</div>
                <div className="text-xs text-amber-700 dark:text-amber-300">مصروفات معلقة</div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Row - Analytics */}
          <div className="grid grid-cols-3 gap-4">
            {/* Category Distribution */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold mb-4">توزيع الفئات</h3>
                <div className="space-y-3">
                  {Object.entries(expensesByCategory)
                    .sort((a, b) => b[1].total - a[1].total)
                    .slice(0, 3)
                    .map(([category, data], idx) => (
                      <div key={idx}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-muted-foreground">{category}</span>
                          <span className="text-xs font-bold">{formatCurrency(data.total)}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{width: `${(data.total / totalExpenses) * 100}%`}}
                          ></div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Cases by Expenses */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold mb-4">أعلى القضايا تكلفة</h3>
                <div className="space-y-3">
                  {Object.entries(
                    expenses
                      .filter((exp) => exp.caseNumber !== null)
                      .reduce((acc: Record<string, CaseData>, exp) => {
                        const key = exp.caseNumber!;
                        if (!acc[key]) {
                          acc[key] = { name: exp.caseName, total: 0, count: 0 };
                        }
                        acc[key].total += exp.amount;
                        acc[key].count += 1;
                        return acc;
                      }, {})
                  )
                  .sort((a, b) => b[1].total - a[1].total)
                  .slice(0, 3)
                  .map(([, data], idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                        <span className="text-xs font-bold">{data.count}</span>
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-medium">{data.name}</div>
                        <div className="text-[10px] text-muted-foreground">{formatCurrency(data.total)}</div>
                      </div>
                      <div className="w-16 bg-muted rounded-full h-1.5">
                        <div
                          className="bg-foreground/60 h-1.5 rounded-full"
                          style={{width: `${(data.total / caseExpenses) * 100}%`}}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold mb-4">آخر المصروفات</h3>
                <div className="space-y-3">
                  {expenses.slice(0, 3).map((exp, idx) => {
                    const Icon = exp.categoryIcon
                    return (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium truncate">{exp.description}</div>
                          <div className="text-[10px] text-muted-foreground">{exp.date}</div>
                        </div>
                        <div className="text-xs font-bold">
                          {formatCurrency(exp.amount)}
                        </div>
                      </div>
                    )
                  })}
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
                جميع المصروفات ({expenses.length})
              </Button>
              <Button
                variant={activeTab === 'case' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('case')}
                className="rounded-full"
              >
                مصروفات القضايا ({expenses.filter((e) => e.caseNumber !== null).length})
              </Button>
              <Button
                variant={activeTab === 'general' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('general')}
                className="rounded-full"
              >
                مصروفات عامة ({expenses.filter((e) => e.caseNumber === null).length})
              </Button>
              <Button
                variant={activeTab === 'pending' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('pending')}
                className="rounded-full"
              >
                معلقة ({expenses.filter((e) => e.status === 'معلق').length})
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
                <label className="text-xs font-medium text-muted-foreground mb-2 block text-right">الفئة</label>
                <Select>
                  <SelectTrigger className="w-full text-right" dir="rtl">
                    <SelectValue placeholder="جميع الفئات" />
                  </SelectTrigger>
                  <SelectContent dir="rtl">
                    <SelectItem value="all">جميع الفئات</SelectItem>
                    {Array.from(new Set(expenses.map((exp) => exp.category))).map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block text-right">القضية</label>
                <Select>
                  <SelectTrigger className="w-full text-right" dir="rtl">
                    <SelectValue placeholder="اختر..." />
                  </SelectTrigger>
                  <SelectContent dir="rtl">
                    <SelectItem value="all">جميع القضايا</SelectItem>
                    {Array.from(new Set(expenses.filter((e) => e.caseNumber).map((exp) => exp.caseName))).map((name) => (
                      <SelectItem key={name} value={name}>{name}</SelectItem>
                    ))}
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
                    <SelectItem value="card">بطاقة ائتمان</SelectItem>
                    <SelectItem value="bank">تحويل بنكي</SelectItem>
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

        {/* Expenses Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted border-b">
                  <tr>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground">رقم المصروف</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground">الوصف</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground">الفئة</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground">القضية</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground">المبلغ</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground">التاريخ</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground">طريقة الدفع</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground">الحالة</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map((expense) => {
                    const Icon = expense.categoryIcon
                    return (
                      <tr
                        key={expense.id}
                        className="border-b hover:bg-muted/50 transition-colors"
                      >
                        {/* Expense ID */}
                        <td className="px-6 py-4">
                          <div className="text-sm font-bold text-right">{expense.id}</div>
                        </td>

                        {/* Description */}
                        <td className="px-6 py-4">
                          <div className="text-right">
                            <div className="text-sm font-medium mb-1">{expense.description}</div>
                            <div className="text-xs text-muted-foreground">{expense.vendor}</div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 justify-end">
                            <span className="text-sm">{expense.category}</span>
                            <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                              <Icon className="h-4 w-4" />
                            </div>
                          </div>
                        </td>

                        {/* Case */}
                        <td className="px-6 py-4">
                          <div className="text-right">
                            {expense.caseNumber ? (
                              <>
                                <div className="text-sm">{expense.caseNumber}</div>
                                <div className="text-xs text-muted-foreground">{expense.caseName}</div>
                              </>
                            ) : (
                              <Badge variant="outline" className="text-xs">مصروف عام</Badge>
                            )}
                          </div>
                        </td>

                        {/* Amount */}
                        <td className="px-6 py-4">
                          <div className="text-sm font-bold text-right">
                            {formatCurrency(expense.amount)}
                          </div>
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4">
                          <div className="text-sm text-right">{expense.date}</div>
                        </td>

                        {/* Payment Method */}
                        <td className="px-6 py-4">
                          <div className="text-sm text-right">{expense.paymentMethod}</div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 justify-end">
                            <Badge className={expense.statusColor}>{expense.status}</Badge>
                            {expense.hasReceipt && (
                              <Receipt className="h-4 w-4 text-green-600" />
                            )}
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
                            {!expense.hasReceipt && (
                              <Button variant="ghost" size="sm" title="رفع إيصال">
                                <Upload className="h-4 w-4" />
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" title="حذف">
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </Main>
    </>
  )
}
