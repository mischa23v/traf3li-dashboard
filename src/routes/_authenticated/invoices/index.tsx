import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  Send,
  DollarSign,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/_authenticated/invoices/')({
  component: InvoicesDashboard,
})

function InvoicesDashboard() {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // TODO: Replace with real API data
  const invoices = [
    {
      id: 'INV-2025-001',
      client: 'مشاري الرابح',
      caseNumber: 'CASE-2025-001',
      issueDate: '15 نوفمبر 2025',
      dueDate: '15 ديسمبر 2025',
      amount: 52900,
      balance: 52900,
      status: 'pending',
      statusColor: 'bg-yellow-500',
    },
    {
      id: 'INV-2025-002',
      client: 'سارة المطيري',
      caseNumber: 'CASE-2025-005',
      issueDate: '10 نوفمبر 2025',
      dueDate: '10 ديسمبر 2025',
      amount: 28000,
      balance: 0,
      status: 'paid',
      statusColor: 'bg-green-500',
    },
  ]

  const filteredInvoices = invoices.filter((inv) => {
    if (activeTab === 'all') return true
    if (activeTab === 'pending') return inv.status === 'pending'
    if (activeTab === 'paid') return inv.status === 'paid'
    if (activeTab === 'overdue') return inv.status === 'overdue'
    return true
  })

  const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0)
  const totalPaid = invoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0)
  const totalPending = invoices
    .filter((inv) => inv.status === 'pending')
    .reduce((sum, inv) => sum + inv.balance, 0)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <Badge className='bg-green-500'>
            {isRTL ? 'مدفوعة' : 'Paid'}
          </Badge>
        )
      case 'pending':
        return (
          <Badge className='bg-yellow-500'>
            {isRTL ? 'معلقة' : 'Pending'}
          </Badge>
        )
      case 'overdue':
        return (
          <Badge className='bg-red-500'>
            {isRTL ? 'متأخرة' : 'Overdue'}
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
              {isRTL ? 'الفواتير' : 'Invoices'}
            </h1>
            <p className='text-sm text-muted-foreground'>
              {isRTL ? 'إدارة ومتابعة جميع الفواتير' : 'Manage and track all invoices'}
            </p>
          </div>
          <div className='flex items-center gap-3'>
            <Button variant='outline'>
              <Download className='me-2 h-4 w-4' />
              {isRTL ? 'تصدير' : 'Export'}
            </Button>
            <Button>
              <Plus className='me-2 h-4 w-4' />
              {isRTL ? 'إنشاء فاتورة' : 'Create Invoice'}
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
                <Badge variant='outline'>{isRTL ? 'الإجمالي' : 'Total'}</Badge>
              </div>
              <div className='mb-1 text-3xl font-bold'>{formatCurrency(totalAmount)}</div>
              <div className='text-xs text-muted-foreground'>
                {isRTL ? 'إجمالي الفواتير' : 'Total invoices'}
              </div>
            </CardContent>
          </Card>

          <Card className='border bg-gradient-to-br from-green-50 to-background dark:from-green-950/20'>
            <CardContent className='p-6'>
              <div className='mb-3 flex items-center justify-between'>
                <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900'>
                  <CheckCircle className='h-5 w-5 text-green-600 dark:text-green-400' />
                </div>
                <Badge className='bg-green-500'>{isRTL ? 'مدفوعة' : 'Paid'}</Badge>
              </div>
              <div className='mb-1 text-3xl font-bold'>{formatCurrency(totalPaid)}</div>
              <div className='text-xs text-muted-foreground'>
                {isRTL ? 'مدفوعة' : 'Paid invoices'}
              </div>
            </CardContent>
          </Card>

          <Card className='border bg-gradient-to-br from-yellow-50 to-background dark:from-yellow-950/20'>
            <CardContent className='p-6'>
              <div className='mb-3 flex items-center justify-between'>
                <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900'>
                  <Clock className='h-5 w-5 text-yellow-600 dark:text-yellow-400' />
                </div>
                <Badge className='bg-yellow-500'>{isRTL ? 'معلقة' : 'Pending'}</Badge>
              </div>
              <div className='mb-1 text-3xl font-bold'>{formatCurrency(totalPending)}</div>
              <div className='text-xs text-muted-foreground'>
                {isRTL ? 'معلقة' : 'Pending invoices'}
              </div>
            </CardContent>
          </Card>

          <Card className='bg-gradient-to-br from-muted/50 to-background'>
            <CardContent className='p-6'>
              <div className='mb-3 flex items-center justify-between'>
                <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900'>
                  <DollarSign className='h-5 w-5 text-purple-600 dark:text-purple-400' />
                </div>
                <Badge variant='outline'>{isRTL ? 'هذا الشهر' : 'This Month'}</Badge>
              </div>
              <div className='mb-1 text-3xl font-bold'>{invoices.length}</div>
              <div className='text-xs text-muted-foreground'>
                {isRTL ? 'عدد الفواتير' : 'Invoice count'}
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
                {isRTL ? 'الكل' : 'All'} ({invoices.length})
              </Button>
              <Button
                variant={activeTab === 'pending' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setActiveTab('pending')}
              >
                {isRTL ? 'معلقة' : 'Pending'} (
                {invoices.filter((i) => i.status === 'pending').length})
              </Button>
              <Button
                variant={activeTab === 'paid' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setActiveTab('paid')}
              >
                {isRTL ? 'مدفوعة' : 'Paid'} (
                {invoices.filter((i) => i.status === 'paid').length})
              </Button>
            </div>

            <div className='flex items-center gap-3'>
              <div className='relative flex-1'>
                <Search className='absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                <Input
                  placeholder={isRTL ? 'بحث في الفواتير...' : 'Search invoices...'}
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

        {/* Invoices Table */}
        <Card>
          <CardContent className='p-0'>
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead className='border-b bg-muted/50'>
                  <tr>
                    <th className='px-6 py-3 text-start text-xs font-semibold'>
                      {isRTL ? 'رقم الفاتورة' : 'Invoice #'}
                    </th>
                    <th className='px-6 py-3 text-start text-xs font-semibold'>
                      {isRTL ? 'العميل' : 'Client'}
                    </th>
                    <th className='px-6 py-3 text-start text-xs font-semibold'>
                      {isRTL ? 'تاريخ الإصدار' : 'Issue Date'}
                    </th>
                    <th className='px-6 py-3 text-start text-xs font-semibold'>
                      {isRTL ? 'تاريخ الاستحقاق' : 'Due Date'}
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
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className='border-b hover:bg-muted/50'>
                      <td className='px-6 py-4'>
                        <div className='font-mono text-sm font-semibold'>{invoice.id}</div>
                        <div className='text-xs text-muted-foreground'>{invoice.caseNumber}</div>
                      </td>
                      <td className='px-6 py-4'>
                        <div className='text-sm font-semibold'>{invoice.client}</div>
                      </td>
                      <td className='px-6 py-4'>
                        <div className='text-sm'>{invoice.issueDate}</div>
                      </td>
                      <td className='px-6 py-4'>
                        <div className='text-sm'>{invoice.dueDate}</div>
                      </td>
                      <td className='px-6 py-4 text-center'>
                        <div className='text-sm font-bold'>{formatCurrency(invoice.amount)}</div>
                        {invoice.balance > 0 && (
                          <div className='text-xs text-muted-foreground'>
                            {isRTL ? 'متبقي:' : 'Balance:'} {formatCurrency(invoice.balance)}
                          </div>
                        )}
                      </td>
                      <td className='px-6 py-4 text-center'>{getStatusBadge(invoice.status)}</td>
                      <td className='px-6 py-4'>
                        <div className='flex items-center justify-center gap-1'>
                          <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                            <Eye className='h-4 w-4' />
                          </Button>
                          <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                            <Send className='h-4 w-4' />
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
              ? `عرض ${filteredInvoices.length} من ${invoices.length} فاتورة`
              : `Showing ${filteredInvoices.length} of ${invoices.length} invoices`}
          </div>
        </div>
      </div>
    </div>
  )
}
