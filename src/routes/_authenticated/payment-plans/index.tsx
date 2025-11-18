import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Search,
  Filter,
  Plus,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  CreditCard,
  TrendingUp,
  FileText,
  Eye,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useTranslation } from 'react-i18next'
import { Progress } from '@/components/ui/progress'

export const Route = createFileRoute('/_authenticated/payment-plans/')({
  component: PaymentPlansPage,
})

function PaymentPlansPage() {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // TODO: Replace with real API data
  const paymentPlans = [
    {
      id: 'PP-2025-00001',
      planNumber: 'PP-2025-00001',
      clientName: 'مشاري الرابح',
      invoiceNumber: 'INV-2025-001',
      caseNumber: 'CASE-2025-001',
      totalAmount: 52900,
      paidAmount: 15000,
      remainingAmount: 37900,
      numberOfInstallments: 6,
      completionPercentage: 28,
      status: 'active',
      startDate: '01 نوفمبر 2025',
      nextDueDate: '25 نوفمبر 2025',
      nextInstallmentAmount: 8800,
      overdueAmount: 0,
      installments: [
        {
          id: '1',
          installmentNumber: 1,
          amount: 8800,
          paidAmount: 8800,
          dueDate: '01 نوفمبر 2025',
          paidDate: '01 نوفمبر 2025',
          status: 'paid',
          paymentMethod: 'bank_transfer',
        },
        {
          id: '2',
          installmentNumber: 2,
          amount: 8800,
          paidAmount: 6200,
          dueDate: '25 نوفمبر 2025',
          paidDate: null,
          status: 'partial',
          paymentMethod: null,
        },
        {
          id: '3',
          installmentNumber: 3,
          amount: 8800,
          paidAmount: 0,
          dueDate: '25 ديسمبر 2025',
          paidDate: null,
          status: 'pending',
          paymentMethod: null,
        },
      ],
    },
    {
      id: 'PP-2025-00002',
      planNumber: 'PP-2025-00002',
      clientName: 'سارة المطيري',
      invoiceNumber: 'INV-2025-002',
      caseNumber: 'CASE-2025-005',
      totalAmount: 28000,
      paidAmount: 28000,
      remainingAmount: 0,
      numberOfInstallments: 4,
      completionPercentage: 100,
      status: 'completed',
      startDate: '10 أكتوبر 2025',
      nextDueDate: null,
      nextInstallmentAmount: 0,
      overdueAmount: 0,
      installments: [],
    },
  ]

  const filteredPlans = paymentPlans.filter((plan) => {
    if (activeTab === 'all') return true
    if (activeTab === 'active') return plan.status === 'active'
    if (activeTab === 'completed') return plan.status === 'completed'
    if (activeTab === 'overdue') return plan.overdueAmount > 0
    return true
  })

  const activePlans = paymentPlans.filter((p) => p.status === 'active').length
  const totalRemaining = paymentPlans
    .filter((p) => p.status === 'active')
    .reduce((sum, p) => sum + p.remainingAmount, 0)
  const totalOverdue = paymentPlans.reduce((sum, p) => sum + p.overdueAmount, 0)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className='bg-blue-500'>
            {isRTL ? 'نشطة' : 'Active'}
          </Badge>
        )
      case 'completed':
        return (
          <Badge className='bg-green-500'>
            {isRTL ? 'مكتملة' : 'Completed'}
          </Badge>
        )
      case 'defaulted':
        return (
          <Badge className='bg-red-500'>
            {isRTL ? 'متعثرة' : 'Defaulted'}
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge className='bg-gray-500'>
            {isRTL ? 'ملغاة' : 'Cancelled'}
          </Badge>
        )
      default:
        return null
    }
  }

  const getInstallmentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <Badge variant='outline' className='border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/20'>
            {isRTL ? 'مدفوعة' : 'Paid'}
          </Badge>
        )
      case 'pending':
        return (
          <Badge variant='outline' className='border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950/20'>
            {isRTL ? 'معلقة' : 'Pending'}
          </Badge>
        )
      case 'overdue':
        return (
          <Badge variant='outline' className='border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/20'>
            {isRTL ? 'متأخرة' : 'Overdue'}
          </Badge>
        )
      case 'partial':
        return (
          <Badge variant='outline' className='border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/20'>
            {isRTL ? 'جزئية' : 'Partial'}
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
              {isRTL ? 'خطط الدفع' : 'Payment Plans'}
            </h1>
            <p className='text-sm text-muted-foreground'>
              {isRTL ? 'إدارة ومتابعة خطط الدفع بالتقسيط' : 'Manage and track installment payment plans'}
            </p>
          </div>
          <div className='flex items-center gap-3'>
            <Button variant='outline'>
              <FileText className='me-2 h-4 w-4' />
              {isRTL ? 'تصدير' : 'Export'}
            </Button>
            <Button>
              <Plus className='me-2 h-4 w-4' />
              {isRTL ? 'خطة جديدة' : 'New Plan'}
            </Button>
          </div>
        </div>
      </div>

      <div className='mx-auto max-w-[1800px] p-6'>
        {/* Summary Cards */}
        <div className='mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          <Card className='bg-gradient-to-br from-blue-50 to-background dark:from-blue-950/20'>
            <CardContent className='p-6'>
              <div className='mb-3 flex items-center justify-between'>
                <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900'>
                  <CreditCard className='h-5 w-5 text-blue-600 dark:text-blue-400' />
                </div>
                <Badge className='bg-blue-500'>{isRTL ? 'نشطة' : 'Active'}</Badge>
              </div>
              <div className='mb-1 text-3xl font-bold'>{activePlans}</div>
              <div className='text-xs text-muted-foreground'>
                {isRTL ? 'خطط دفع نشطة' : 'Active payment plans'}
              </div>
            </CardContent>
          </Card>

          <Card className='bg-gradient-to-br from-muted/50 to-background'>
            <CardContent className='p-6'>
              <div className='mb-3 flex items-center justify-between'>
                <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900'>
                  <DollarSign className='h-5 w-5 text-purple-600 dark:text-purple-400' />
                </div>
                <Badge variant='outline'>{isRTL ? 'متبقي' : 'Remaining'}</Badge>
              </div>
              <div className='mb-1 text-3xl font-bold'>{formatCurrency(totalRemaining)}</div>
              <div className='text-xs text-muted-foreground'>
                {isRTL ? 'المبلغ المتبقي' : 'Total remaining'}
              </div>
            </CardContent>
          </Card>

          <Card className='bg-gradient-to-br from-green-50 to-background dark:from-green-950/20'>
            <CardContent className='p-6'>
              <div className='mb-3 flex items-center justify-between'>
                <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900'>
                  <CheckCircle className='h-5 w-5 text-green-600 dark:text-green-400' />
                </div>
                <Badge className='bg-green-500'>{isRTL ? 'مكتملة' : 'Completed'}</Badge>
              </div>
              <div className='mb-1 text-3xl font-bold'>
                {paymentPlans.filter((p) => p.status === 'completed').length}
              </div>
              <div className='text-xs text-muted-foreground'>
                {isRTL ? 'خطط مكتملة' : 'Completed plans'}
              </div>
            </CardContent>
          </Card>

          <Card className='bg-gradient-to-br from-red-50 to-background dark:from-red-950/20'>
            <CardContent className='p-6'>
              <div className='mb-3 flex items-center justify-between'>
                <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900'>
                  <AlertCircle className='h-5 w-5 text-red-600 dark:text-red-400' />
                </div>
                <Badge className='bg-red-500'>{isRTL ? 'متأخر' : 'Overdue'}</Badge>
              </div>
              <div className='mb-1 text-3xl font-bold'>{formatCurrency(totalOverdue)}</div>
              <div className='text-xs text-muted-foreground'>
                {isRTL ? 'المبلغ المتأخر' : 'Overdue amount'}
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
                {isRTL ? 'الكل' : 'All'} ({paymentPlans.length})
              </Button>
              <Button
                variant={activeTab === 'active' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setActiveTab('active')}
              >
                {isRTL ? 'نشطة' : 'Active'} ({activePlans})
              </Button>
              <Button
                variant={activeTab === 'completed' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setActiveTab('completed')}
              >
                {isRTL ? 'مكتملة' : 'Completed'} (
                {paymentPlans.filter((p) => p.status === 'completed').length})
              </Button>
            </div>

            <div className='flex items-center gap-3'>
              <div className='relative flex-1'>
                <Search className='absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                <Input
                  placeholder={isRTL ? 'بحث في خطط الدفع...' : 'Search payment plans...'}
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

        {/* Payment Plans List */}
        <div className='space-y-4'>
          {filteredPlans.map((plan) => (
            <Card key={plan.id} className='overflow-hidden'>
              <CardHeader className='border-b bg-muted/30'>
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <div className='mb-2 flex items-center gap-3'>
                      <CardTitle className='text-lg font-semibold'>
                        {plan.clientName}
                      </CardTitle>
                      {getStatusBadge(plan.status)}
                    </div>
                    <div className='flex flex-wrap gap-4 text-sm text-muted-foreground'>
                      <div className='flex items-center gap-1'>
                        <FileText className='h-4 w-4' />
                        <span>{plan.planNumber}</span>
                      </div>
                      <div className='flex items-center gap-1'>
                        <span className='font-mono'>{plan.invoiceNumber}</span>
                      </div>
                      <div className='flex items-center gap-1'>
                        <span>{plan.caseNumber}</span>
                      </div>
                      <div className='flex items-center gap-1'>
                        <Calendar className='h-4 w-4' />
                        <span>
                          {isRTL ? 'بدأت في' : 'Started'} {plan.startDate}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button variant='outline' size='sm'>
                    <Eye className='me-2 h-4 w-4' />
                    {isRTL ? 'عرض التفاصيل' : 'View Details'}
                  </Button>
                </div>
              </CardHeader>

              <CardContent className='p-6'>
                {/* Progress Section */}
                <div className='mb-6'>
                  <div className='mb-2 flex items-center justify-between text-sm'>
                    <span className='text-muted-foreground'>
                      {isRTL ? 'التقدم' : 'Progress'}
                    </span>
                    <span className='font-semibold'>
                      {plan.completionPercentage}%
                    </span>
                  </div>
                  <Progress value={plan.completionPercentage} className='h-2' />
                  <div className='mt-2 flex items-center justify-between text-sm'>
                    <div>
                      <span className='text-muted-foreground'>
                        {isRTL ? 'مدفوع:' : 'Paid:'}{' '}
                      </span>
                      <span className='font-semibold text-green-600'>
                        {formatCurrency(plan.paidAmount)}
                      </span>
                    </div>
                    <div>
                      <span className='text-muted-foreground'>
                        {isRTL ? 'متبقي:' : 'Remaining:'}{' '}
                      </span>
                      <span className='font-semibold text-blue-600'>
                        {formatCurrency(plan.remainingAmount)}
                      </span>
                    </div>
                    <div>
                      <span className='text-muted-foreground'>
                        {isRTL ? 'الإجمالي:' : 'Total:'}{' '}
                      </span>
                      <span className='font-semibold'>
                        {formatCurrency(plan.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Installments Timeline */}
                {plan.installments.length > 0 && (
                  <div>
                    <h4 className='mb-3 text-sm font-semibold'>
                      {isRTL ? 'الأقساط' : 'Installments'} ({plan.installments.length}/{plan.numberOfInstallments})
                    </h4>
                    <div className='overflow-x-auto'>
                      <table className='w-full'>
                        <thead className='border-b bg-muted/50'>
                          <tr>
                            <th className='px-4 py-2 text-start text-xs font-semibold'>
                              {isRTL ? 'القسط' : 'Installment'}
                            </th>
                            <th className='px-4 py-2 text-start text-xs font-semibold'>
                              {isRTL ? 'تاريخ الاستحقاق' : 'Due Date'}
                            </th>
                            <th className='px-4 py-2 text-center text-xs font-semibold'>
                              {isRTL ? 'المبلغ' : 'Amount'}
                            </th>
                            <th className='px-4 py-2 text-center text-xs font-semibold'>
                              {isRTL ? 'المدفوع' : 'Paid'}
                            </th>
                            <th className='px-4 py-2 text-center text-xs font-semibold'>
                              {isRTL ? 'الحالة' : 'Status'}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {plan.installments.map((inst) => (
                            <tr key={inst.id} className='border-b hover:bg-muted/30'>
                              <td className='px-4 py-3 text-sm font-semibold'>
                                #{inst.installmentNumber}
                              </td>
                              <td className='px-4 py-3 text-sm'>
                                <div className='flex items-center gap-2'>
                                  <Clock className='h-4 w-4 text-muted-foreground' />
                                  {inst.dueDate}
                                </div>
                              </td>
                              <td className='px-4 py-3 text-center text-sm font-semibold'>
                                {formatCurrency(inst.amount)}
                              </td>
                              <td className='px-4 py-3 text-center text-sm font-semibold text-green-600'>
                                {formatCurrency(inst.paidAmount)}
                              </td>
                              <td className='px-4 py-3 text-center'>
                                {getInstallmentStatusBadge(inst.status)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Next Payment Info */}
                {plan.status === 'active' && plan.nextDueDate && (
                  <div className='mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950/20'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-3'>
                        <div className='flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900'>
                          <TrendingUp className='h-5 w-5 text-yellow-600 dark:text-yellow-400' />
                        </div>
                        <div>
                          <div className='text-sm font-semibold'>
                            {isRTL ? 'القسط القادم' : 'Next Payment'}
                          </div>
                          <div className='text-xs text-muted-foreground'>
                            {isRTL ? 'مستحق في' : 'Due on'} {plan.nextDueDate}
                          </div>
                        </div>
                      </div>
                      <div className='text-end'>
                        <div className='text-lg font-bold'>
                          {formatCurrency(plan.nextInstallmentAmount)}
                        </div>
                        <Button size='sm' className='mt-2'>
                          {isRTL ? 'تسجيل دفعة' : 'Record Payment'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className='mt-6 flex items-center justify-between'>
          <div className='text-sm text-muted-foreground'>
            {isRTL
              ? `عرض ${filteredPlans.length} من ${paymentPlans.length} خطة`
              : `Showing ${filteredPlans.length} of ${paymentPlans.length} plans`}
          </div>
        </div>
      </div>
    </div>
  )
}
