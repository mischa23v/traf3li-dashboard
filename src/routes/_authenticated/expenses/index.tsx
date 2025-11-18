import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  Edit,
  Trash2,
  DollarSign,
  TrendingDown,
  Receipt,
  FileText,
  Building,
  Home,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/_authenticated/expenses/')({
  component: ExpensesDashboard,
})

function ExpensesDashboard() {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // TODO: Replace with real API data
  const expenses = [
    {
      id: 'EXP-2025-001',
      description: 'استئجار قاعة المحكمة',
      category: 'رسوم قانونية',
      categoryIcon: Building,
      amount: 5000,
      date: '15 نوفمبر 2025',
      caseNumber: '4772077905',
      caseName: 'قضية مشاري الرابح',
      status: 'مدفوع',
      statusColor: 'bg-green-500',
      hasReceipt: true,
    },
    {
      id: 'EXP-2025-002',
      description: 'اشتراك المكتبة القانونية',
      category: 'اشتراكات',
      categoryIcon: FileText,
      amount: 2500,
      date: '14 نوفمبر 2025',
      caseNumber: null,
      caseName: 'مصروف عام',
      status: 'مدفوع',
      statusColor: 'bg-green-500',
      hasReceipt: true,
    },
  ]

  const filteredExpenses = expenses.filter((exp) => {
    if (activeTab === 'all') return true
    if (activeTab === 'case') return exp.caseNumber !== null
    if (activeTab === 'general') return exp.caseNumber === null
    if (activeTab === 'pending') return exp.status === 'معلق'
    return true
  })

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)
  const caseExpenses = expenses
    .filter((exp) => exp.caseNumber !== null)
    .reduce((sum, exp) => sum + exp.amount, 0)
  const generalExpenses = expenses
    .filter((exp) => exp.caseNumber === null)
    .reduce((sum, exp) => sum + exp.amount, 0)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getCategoryIcon = (IconComponent: any) => {
    return <IconComponent className='h-4 w-4' />
  }

  return (
    <div className='min-h-screen'>
      {/* Top Header */}
      <div className='border-b bg-background px-6 py-4'>
        <div className='mx-auto flex max-w-[1800px] items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold'>
              {isRTL ? 'المصروفات' : 'Expenses'}
            </h1>
            <p className='text-sm text-muted-foreground'>
              {isRTL ? 'تتبع وإدارة جميع المصروفات' : 'Track and manage all expenses'}
            </p>
          </div>
          <div className='flex items-center gap-3'>
            <Button variant='outline'>
              <Download className='me-2 h-4 w-4' />
              {isRTL ? 'تصدير' : 'Export'}
            </Button>
            <Button>
              <Plus className='me-2 h-4 w-4' />
              {isRTL ? 'إضافة مصروف' : 'Add Expense'}
            </Button>
          </div>
        </div>
      </div>

      <div className='mx-auto max-w-[1800px] p-6'>
        {/* Summary Cards */}
        <div className='mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          <Card className='border bg-gradient-to-br from-red-50 to-background dark:from-red-950/20'>
            <CardContent className='p-6'>
              <div className='mb-3 flex items-center justify-between'>
                <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900'>
                  <TrendingDown className='h-5 w-5 text-red-600 dark:text-red-400' />
                </div>
                <Badge variant='outline'>{isRTL ? 'الإجمالي' : 'Total'}</Badge>
              </div>
              <div className='mb-1 text-3xl font-bold'>{formatCurrency(totalExpenses)}</div>
              <div className='text-xs text-muted-foreground'>
                {isRTL ? 'إجمالي المصروفات' : 'Total expenses'}
              </div>
            </CardContent>
          </Card>

          <Card className='bg-gradient-to-br from-muted/50 to-background'>
            <CardContent className='p-6'>
              <div className='mb-3 flex items-center justify-between'>
                <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900'>
                  <Receipt className='h-5 w-5 text-blue-600 dark:text-blue-400' />
                </div>
                <Badge variant='outline'>{isRTL ? 'القضايا' : 'Cases'}</Badge>
              </div>
              <div className='mb-1 text-3xl font-bold'>{formatCurrency(caseExpenses)}</div>
              <div className='text-xs text-muted-foreground'>
                {isRTL ? 'مصروفات القضايا' : 'Case expenses'}
              </div>
            </CardContent>
          </Card>

          <Card className='bg-gradient-to-br from-muted/50 to-background'>
            <CardContent className='p-6'>
              <div className='mb-3 flex items-center justify-between'>
                <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900'>
                  <Home className='h-5 w-5 text-purple-600 dark:text-purple-400' />
                </div>
                <Badge variant='outline'>{isRTL ? 'عامة' : 'General'}</Badge>
              </div>
              <div className='mb-1 text-3xl font-bold'>{formatCurrency(generalExpenses)}</div>
              <div className='text-xs text-muted-foreground'>
                {isRTL ? 'مصروفات عامة' : 'General expenses'}
              </div>
            </CardContent>
          </Card>

          <Card className='bg-gradient-to-br from-muted/50 to-background'>
            <CardContent className='p-6'>
              <div className='mb-3 flex items-center justify-between'>
                <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900'>
                  <DollarSign className='h-5 w-5 text-green-600 dark:text-green-400' />
                </div>
                <Badge variant='outline' className='border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20'>
                  {isRTL ? 'هذا الشهر' : 'This month'}
                </Badge>
              </div>
              <div className='mb-1 text-3xl font-bold'>{expenses.length}</div>
              <div className='text-xs text-muted-foreground'>
                {isRTL ? 'عدد المصروفات' : 'Number of expenses'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Tabs */}
        <Card className='mb-6'>
          <CardContent className='p-6'>
            <div className='mb-4 flex flex-wrap items-center gap-3'>
              <Button
                variant={activeTab === 'all' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setActiveTab('all')}
              >
                {isRTL ? 'جميع المصروفات' : 'All'} ({expenses.length})
              </Button>
              <Button
                variant={activeTab === 'case' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setActiveTab('case')}
              >
                {isRTL ? 'مصروفات القضايا' : 'Case Expenses'} (
                {expenses.filter((e) => e.caseNumber !== null).length})
              </Button>
              <Button
                variant={activeTab === 'general' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setActiveTab('general')}
              >
                {isRTL ? 'مصروفات عامة' : 'General'} (
                {expenses.filter((e) => e.caseNumber === null).length})
              </Button>
            </div>

            <div className='flex items-center gap-3'>
              <div className='relative flex-1'>
                <Search className='absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                <Input
                  placeholder={isRTL ? 'بحث في المصروفات...' : 'Search expenses...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='ps-10'
                />
              </div>
              <Button variant='outline' size='sm'>
                <Filter className='me-2 h-4 w-4' />
                {isRTL ? 'فلاتر' : 'Filters'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Expenses Table */}
        <Card>
          <CardContent className='p-0'>
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead className='border-b bg-muted/50'>
                  <tr>
                    <th className='px-6 py-3 text-start text-xs font-semibold'>
                      {isRTL ? 'التاريخ' : 'Date'}
                    </th>
                    <th className='px-6 py-3 text-start text-xs font-semibold'>
                      {isRTL ? 'الوصف' : 'Description'}
                    </th>
                    <th className='px-6 py-3 text-start text-xs font-semibold'>
                      {isRTL ? 'الفئة' : 'Category'}
                    </th>
                    <th className='px-6 py-3 text-start text-xs font-semibold'>
                      {isRTL ? 'القضية' : 'Case'}
                    </th>
                    <th className='px-6 py-3 text-center text-xs font-semibold'>
                      {isRTL ? 'المبلغ' : 'Amount'}
                    </th>
                    <th className='px-6 py-3 text-center text-xs font-semibold'>
                      {isRTL ? 'الحالة' : 'Status'}
                    </th>
                    <th className='px-6 py-3 text-center text-xs font-semibold'>
                      {isRTL ? 'إجراءات' : 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map((expense) => (
                    <tr key={expense.id} className='border-b hover:bg-muted/50'>
                      <td className='px-6 py-4'>
                        <div className='text-sm'>{expense.date}</div>
                        <div className='text-xs text-muted-foreground'>{expense.id}</div>
                      </td>
                      <td className='px-6 py-4'>
                        <div className='text-sm font-semibold'>{expense.description}</div>
                        {expense.hasReceipt && (
                          <Badge variant='outline' className='mt-1 text-xs'>
                            <Receipt className='me-1 h-3 w-3' />
                            {isRTL ? 'إيصال' : 'Receipt'}
                          </Badge>
                        )}
                      </td>
                      <td className='px-6 py-4'>
                        <div className='flex items-center gap-2'>
                          {getCategoryIcon(expense.categoryIcon)}
                          <span className='text-sm'>{expense.category}</span>
                        </div>
                      </td>
                      <td className='px-6 py-4'>
                        {expense.caseNumber ? (
                          <div>
                            <div className='font-mono text-xs text-muted-foreground'>
                              {expense.caseNumber}
                            </div>
                            <div className='text-sm'>{expense.caseName}</div>
                          </div>
                        ) : (
                          <Badge variant='outline'>{isRTL ? 'عام' : 'General'}</Badge>
                        )}
                      </td>
                      <td className='px-6 py-4 text-center'>
                        <div className='text-sm font-bold text-red-600 dark:text-red-400'>
                          {formatCurrency(expense.amount)}
                        </div>
                      </td>
                      <td className='px-6 py-4 text-center'>
                        <Badge className={expense.statusColor}>{expense.status}</Badge>
                      </td>
                      <td className='px-6 py-4'>
                        <div className='flex items-center justify-center gap-1'>
                          <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                            <Eye className='h-4 w-4' />
                          </Button>
                          <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                            <Edit className='h-4 w-4' />
                          </Button>
                          <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                            <Trash2 className='h-4 w-4 text-destructive' />
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

        {/* Footer */}
        <div className='mt-6 flex items-center justify-between'>
          <div className='text-sm text-muted-foreground'>
            {isRTL
              ? `عرض ${filteredExpenses.length} من ${expenses.length} مصروف`
              : `Showing ${filteredExpenses.length} of ${expenses.length} expenses`}
          </div>
          <div className='flex gap-3'>
            <Button variant='outline'>{isRTL ? 'إنشاء تقرير' : 'Create Report'}</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
