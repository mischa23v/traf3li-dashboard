import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Search,
  Filter,
  Download,
  Calendar,
  DollarSign,
  FileText,
  Send,
  Receipt,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Clock,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/_authenticated/account-activity/')({
  component: AccountActivityDashboard,
})

function AccountActivityDashboard() {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // TODO: Replace with real API data
  const activities = [
    {
      id: 'ACT-001',
      type: 'payment_received',
      description: 'دفعة مستلمة من مشاري الرابح',
      reference: 'INV-2025-001',
      amount: 15000,
      status: 'completed',
      date: '18 نوفمبر 2025',
      time: '10:30 ص',
      clientName: 'مشاري الرابح',
      caseNumber: 'CASE-2025-001',
    },
    {
      id: 'ACT-002',
      type: 'invoice_sent',
      description: 'إرسال فاتورة إلى سارة المطيري',
      reference: 'INV-2025-002',
      amount: 28000,
      status: 'sent',
      date: '17 نوفمبر 2025',
      time: '02:15 م',
      clientName: 'سارة المطيري',
      caseNumber: 'CASE-2025-005',
    },
    {
      id: 'ACT-003',
      type: 'expense_added',
      description: 'إضافة مصروف - رسوم محكمة',
      reference: 'EXP-2025-010',
      amount: 500,
      status: 'completed',
      date: '16 نوفمبر 2025',
      time: '11:45 ص',
      clientName: null,
      caseNumber: 'CASE-2025-001',
    },
    {
      id: 'ACT-004',
      type: 'invoice_created',
      description: 'إنشاء فاتورة جديدة',
      reference: 'INV-2025-003',
      amount: 35000,
      status: 'draft',
      date: '15 نوفمبر 2025',
      time: '09:00 ص',
      clientName: 'خالد الشمري',
      caseNumber: 'CASE-2025-003',
    },
    {
      id: 'ACT-005',
      type: 'payment_reminder',
      description: 'إرسال تذكير بالدفع',
      reference: 'INV-2025-001',
      amount: 37900,
      status: 'sent',
      date: '14 نوفمبر 2025',
      time: '03:00 م',
      clientName: 'مشاري الرابح',
      caseNumber: 'CASE-2025-001',
    },
  ]

  const filteredActivities = activities.filter((activity) => {
    if (activeTab === 'all') return true
    if (activeTab === 'payments') return activity.type.includes('payment')
    if (activeTab === 'invoices') return activity.type.includes('invoice')
    if (activeTab === 'expenses') return activity.type.includes('expense')
    return true
  })

  const paymentActivities = activities.filter((a) => a.type.includes('payment')).length
  const invoiceActivities = activities.filter((a) => a.type.includes('invoice')).length
  const expenseActivities = activities.filter((a) => a.type.includes('expense')).length

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'payment_received':
        return <TrendingUp className='h-5 w-5 text-green-600' />
      case 'invoice_sent':
      case 'invoice_created':
        return <FileText className='h-5 w-5 text-blue-600' />
      case 'expense_added':
        return <TrendingDown className='h-5 w-5 text-red-600' />
      case 'statement_sent':
        return <Send className='h-5 w-5 text-purple-600' />
      case 'payment_reminder':
        return <Clock className='h-5 w-5 text-yellow-600' />
      default:
        return <Receipt className='h-5 w-5 text-gray-600' />
    }
  }

  const getActivityBadge = (type: string) => {
    switch (type) {
      case 'payment_received':
        return (
          <Badge className='bg-green-500'>
            {isRTL ? 'دفعة مستلمة' : 'Payment Received'}
          </Badge>
        )
      case 'invoice_sent':
        return (
          <Badge className='bg-blue-500'>
            {isRTL ? 'فاتورة مرسلة' : 'Invoice Sent'}
          </Badge>
        )
      case 'invoice_created':
        return (
          <Badge variant='outline'>
            {isRTL ? 'فاتورة منشأة' : 'Invoice Created'}
          </Badge>
        )
      case 'expense_added':
        return (
          <Badge className='bg-red-500'>
            {isRTL ? 'مصروف مضاف' : 'Expense Added'}
          </Badge>
        )
      case 'payment_reminder':
        return (
          <Badge className='bg-yellow-500'>
            {isRTL ? 'تذكير بالدفع' : 'Payment Reminder'}
          </Badge>
        )
      case 'statement_sent':
        return (
          <Badge className='bg-purple-500'>
            {isRTL ? 'كشف حساب مرسل' : 'Statement Sent'}
          </Badge>
        )
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant='outline' className='border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/20'>
            {isRTL ? 'مكتملة' : 'Completed'}
          </Badge>
        )
      case 'pending':
        return (
          <Badge variant='outline' className='border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950/20'>
            {isRTL ? 'معلقة' : 'Pending'}
          </Badge>
        )
      case 'sent':
        return (
          <Badge variant='outline' className='border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/20'>
            {isRTL ? 'مرسلة' : 'Sent'}
          </Badge>
        )
      case 'draft':
        return (
          <Badge variant='outline' className='border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-800 dark:bg-gray-950/20'>
            {isRTL ? 'مسودة' : 'Draft'}
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className='min-h-screen'>
      {/* Top Header */}
      <div className='border-b bg-background px-6 py-4'>
        <div className='mx-auto flex max-w-[1800px] items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold'>
              {isRTL ? 'نشاط الحساب' : 'Account Activity'}
            </h1>
            <p className='text-sm text-muted-foreground'>
              {isRTL ? 'تتبع جميع الأنشطة المالية والمعاملات' : 'Track all financial activities and transactions'}
            </p>
          </div>
          <div className='flex items-center gap-3'>
            <Button variant='outline'>
              <Download className='me-2 h-4 w-4' />
              {isRTL ? 'تصدير' : 'Export'}
            </Button>
          </div>
        </div>
      </div>

      <div className='mx-auto max-w-[1800px] p-6'>
        {/* Summary Cards */}
        <div className='mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          <Card className='bg-gradient-to-br from-muted/50 to-background'>
            <CardContent className='p-6'>
              <div className='mb-3 flex items-center justify-between'>
                <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900'>
                  <FileText className='h-5 w-5 text-blue-600 dark:text-blue-400' />
                </div>
                <Badge variant='outline'>{isRTL ? 'الكل' : 'Total'}</Badge>
              </div>
              <div className='mb-1 text-3xl font-bold'>{activities.length}</div>
              <div className='text-xs text-muted-foreground'>
                {isRTL ? 'إجمالي الأنشطة' : 'Total activities'}
              </div>
            </CardContent>
          </Card>

          <Card className='bg-gradient-to-br from-green-50 to-background dark:from-green-950/20'>
            <CardContent className='p-6'>
              <div className='mb-3 flex items-center justify-between'>
                <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900'>
                  <DollarSign className='h-5 w-5 text-green-600 dark:text-green-400' />
                </div>
                <Badge className='bg-green-500'>{isRTL ? 'دفعات' : 'Payments'}</Badge>
              </div>
              <div className='mb-1 text-3xl font-bold'>{paymentActivities}</div>
              <div className='text-xs text-muted-foreground'>
                {isRTL ? 'أنشطة الدفع' : 'Payment activities'}
              </div>
            </CardContent>
          </Card>

          <Card className='bg-gradient-to-br from-blue-50 to-background dark:from-blue-950/20'>
            <CardContent className='p-6'>
              <div className='mb-3 flex items-center justify-between'>
                <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900'>
                  <FileText className='h-5 w-5 text-blue-600 dark:text-blue-400' />
                </div>
                <Badge className='bg-blue-500'>{isRTL ? 'فواتير' : 'Invoices'}</Badge>
              </div>
              <div className='mb-1 text-3xl font-bold'>{invoiceActivities}</div>
              <div className='text-xs text-muted-foreground'>
                {isRTL ? 'أنشطة الفواتير' : 'Invoice activities'}
              </div>
            </CardContent>
          </Card>

          <Card className='bg-gradient-to-br from-red-50 to-background dark:from-red-950/20'>
            <CardContent className='p-6'>
              <div className='mb-3 flex items-center justify-between'>
                <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900'>
                  <Receipt className='h-5 w-5 text-red-600 dark:text-red-400' />
                </div>
                <Badge className='bg-red-500'>{isRTL ? 'مصروفات' : 'Expenses'}</Badge>
              </div>
              <div className='mb-1 text-3xl font-bold'>{expenseActivities}</div>
              <div className='text-xs text-muted-foreground'>
                {isRTL ? 'أنشطة المصروفات' : 'Expense activities'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className='mb-6'>
          <CardContent className='p-6'>
            <div className='mb-4 flex flex-wrap items-center gap-3'>
              <Button
                variant={activeTab === 'all' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setActiveTab('all')}
              >
                {isRTL ? 'الكل' : 'All'} ({activities.length})
              </Button>
              <Button
                variant={activeTab === 'payments' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setActiveTab('payments')}
              >
                {isRTL ? 'دفعات' : 'Payments'} ({paymentActivities})
              </Button>
              <Button
                variant={activeTab === 'invoices' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setActiveTab('invoices')}
              >
                {isRTL ? 'فواتير' : 'Invoices'} ({invoiceActivities})
              </Button>
              <Button
                variant={activeTab === 'expenses' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setActiveTab('expenses')}
              >
                {isRTL ? 'مصروفات' : 'Expenses'} ({expenseActivities})
              </Button>
            </div>

            <div className='flex items-center gap-3'>
              <div className='relative flex-1'>
                <Search className='absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                <Input
                  placeholder={isRTL ? 'بحث في الأنشطة...' : 'Search activities...'}
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

        {/* Activity Timeline */}
        <Card>
          <CardContent className='p-6'>
            <div className='space-y-4'>
              {filteredActivities.map((activity) => (
                <div
                  key={activity.id}
                  className='flex items-start gap-4 rounded-lg border p-4 hover:bg-muted/50'
                >
                  <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted'>
                    {getActivityIcon(activity.type)}
                  </div>

                  <div className='flex-1'>
                    <div className='mb-2 flex items-start justify-between'>
                      <div>
                        <div className='mb-1 flex items-center gap-2'>
                          <h4 className='font-semibold'>{activity.description}</h4>
                          {getActivityBadge(activity.type)}
                        </div>
                        <div className='flex flex-wrap gap-3 text-sm text-muted-foreground'>
                          <div className='flex items-center gap-1'>
                            <Calendar className='h-3 w-3' />
                            <span>{activity.date}</span>
                            <span>{activity.time}</span>
                          </div>
                          <div className='flex items-center gap-1'>
                            <FileText className='h-3 w-3' />
                            <span className='font-mono'>{activity.reference}</span>
                          </div>
                          {activity.caseNumber && (
                            <div className='flex items-center gap-1'>
                              <span className='font-mono'>{activity.caseNumber}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className='text-end'>
                        <div className='mb-1 text-lg font-bold'>
                          {formatCurrency(activity.amount)}
                        </div>
                        {getStatusBadge(activity.status)}
                      </div>
                    </div>

                    {activity.clientName && (
                      <div className='text-sm text-muted-foreground'>
                        {isRTL ? 'العميل:' : 'Client:'} {activity.clientName}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className='mt-6 flex items-center justify-between'>
          <div className='text-sm text-muted-foreground'>
            {isRTL
              ? `عرض ${filteredActivities.length} من ${activities.length} نشاط`
              : `Showing ${filteredActivities.length} of ${activities.length} activities`}
          </div>
        </div>
      </div>
    </div>
  )
}
