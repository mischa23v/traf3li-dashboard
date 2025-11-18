import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Clock,
  Play,
  Pause,
  Square,
  Plus,
  Download,
  DollarSign,
  Calendar,
  User,
  FileText,
  Search,
  Edit,
  Trash2,
  Filter,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/_authenticated/time-entries/')({
  component: TimeEntriesPage,
})

function TimeEntriesPage() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  // TODO: Replace with real API data
  const summary = {
    totalBillableHours: 156.5,
    totalUnbilledHours: 42.3,
    unbilledValue: 169200,
    thisWeekHours: 38.5,
  }

  const timeEntries = [
    {
      id: 'TE-001',
      date: '17 نوفمبر 2025',
      client: 'مشاري الرابح',
      caseNumber: 'CASE-2025-001',
      task: 'إعداد مذكرة دفاع في القضية التجارية',
      hours: 3.5,
      rate: 500,
      amount: 1750,
      status: 'unbilled',
      lawyer: 'أحمد السالم',
    },
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'unbilled':
        return (
          <Badge variant='outline' className='border-yellow-200 bg-yellow-50 text-yellow-700'>
            {isRTL ? 'لم تفوتر' : 'Unbilled'}
          </Badge>
        )
      case 'billed':
        return (
          <Badge variant='outline' className='border-green-200 bg-green-50 text-green-700'>
            {isRTL ? 'تم الفوترة' : 'Billed'}
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
              {isRTL ? 'تسجيل الساعات' : 'Time Entries'}
            </h1>
            <p className='text-sm text-muted-foreground'>
              {isRTL ? 'تتبع وإدارة ساعات العمل القابلة للفوترة' : 'Track and manage billable hours'}
            </p>
          </div>
          <div className='flex items-center gap-3'>
            <Button variant='outline'>
              <Download className='me-2 h-4 w-4' />
              {isRTL ? 'تصدير' : 'Export'}
            </Button>
            <Button>
              <Plus className='me-2 h-4 w-4' />
              {isRTL ? 'إضافة وقت يدوياً' : 'Add Time'}
            </Button>
          </div>
        </div>
      </div>

      <div className='mx-auto max-w-[1800px] p-6'>
        {/* Timer Card */}
        <Card className='mb-6 border bg-gradient-to-br from-blue-50 to-background dark:from-blue-950/20'>
          <CardContent className='p-6'>
            <div className='grid grid-cols-1 items-center gap-6 lg:grid-cols-3'>
              {/* Timer Display */}
              <div>
                <div className='mb-4 flex items-center gap-3'>
                  <div className='flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900'>
                    <Clock className='h-6 w-6 text-blue-600 dark:text-blue-400' />
                  </div>
                  <div>
                    <div className='text-xs text-muted-foreground'>
                      {isRTL ? 'المؤقت الحالي' : 'Current Timer'}
                    </div>
                    <div className='font-mono text-3xl font-bold'>{formatTime(currentTime)}</div>
                  </div>
                </div>
                <div className='flex gap-2'>
                  <Button onClick={() => setIsTimerRunning(!isTimerRunning)} className='flex-1'>
                    {isTimerRunning ? <Pause className='me-2 h-4 w-4' /> : <Play className='me-2 h-4 w-4' />}
                    {isTimerRunning ? (isRTL ? 'إيقاف' : 'Pause') : (isRTL ? 'بدء' : 'Start')}
                  </Button>
                  <Button onClick={() => setCurrentTime(0)} variant='outline' className='flex-1'>
                    <Square className='me-2 h-4 w-4' />
                    {isRTL ? 'إنهاء' : 'Stop'}
                  </Button>
                </div>
              </div>

              {/* Quick Entry Form - Placeholder */}
              <div className='lg:col-span-2'>
                <p className='text-sm text-muted-foreground'>
                  {isRTL
                    ? 'نموذج إدخال سريع - قيد التطوير'
                    : 'Quick entry form - Coming soon'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className='mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          <Card className='bg-gradient-to-br from-muted/50 to-background'>
            <CardContent className='p-6'>
              <div className='mb-3 flex items-center justify-between'>
                <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900'>
                  <Clock className='h-5 w-5 text-blue-600 dark:text-blue-400' />
                </div>
                <Badge variant='outline'>{isRTL ? 'الإجمالي' : 'Total'}</Badge>
              </div>
              <div className='mb-1 text-3xl font-bold'>{summary.totalBillableHours}</div>
              <div className='text-xs text-muted-foreground'>
                {isRTL ? 'ساعة قابلة للفوترة' : 'Billable hours'}
              </div>
            </CardContent>
          </Card>

          <Card className='bg-gradient-to-br from-muted/50 to-background'>
            <CardContent className='p-6'>
              <div className='mb-3 flex items-center justify-between'>
                <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900'>
                  <FileText className='h-5 w-5 text-yellow-600 dark:text-yellow-400' />
                </div>
                <Badge variant='outline' className='border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20'>
                  {isRTL ? 'لم تفوتر' : 'Unbilled'}
                </Badge>
              </div>
              <div className='mb-1 text-3xl font-bold'>{summary.totalUnbilledHours}</div>
              <div className='text-xs text-muted-foreground'>
                {isRTL ? 'ساعة غير مفوترة' : 'Unbilled hours'}
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
                  {isRTL ? 'قيمة' : 'Value'}
                </Badge>
              </div>
              <div className='mb-1 text-3xl font-bold'>{formatCurrency(summary.unbilledValue)}</div>
              <div className='text-xs text-muted-foreground'>
                {isRTL ? 'قيمة غير مفوترة' : 'Unbilled value'}
              </div>
            </CardContent>
          </Card>

          <Card className='bg-gradient-to-br from-muted/50 to-background'>
            <CardContent className='p-6'>
              <div className='mb-3 flex items-center justify-between'>
                <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900'>
                  <Calendar className='h-5 w-5 text-purple-600 dark:text-purple-400' />
                </div>
                <Badge variant='outline'>{isRTL ? 'هذا الأسبوع' : 'This Week'}</Badge>
              </div>
              <div className='mb-1 text-3xl font-bold'>{summary.thisWeekHours}</div>
              <div className='text-xs text-muted-foreground'>
                {isRTL ? 'ساعة العمل' : 'Work hours'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className='mb-6'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div className='relative'>
                  <Search className='absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                  <Input
                    placeholder={isRTL ? 'بحث في السجلات...' : 'Search entries...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='w-80 ps-10'
                  />
                </div>
                <div className='flex gap-2'>
                  <Button
                    variant={selectedFilter === 'all' ? 'default' : 'outline'}
                    size='sm'
                    onClick={() => setSelectedFilter('all')}
                  >
                    {isRTL ? 'الكل' : 'All'} ({timeEntries.length})
                  </Button>
                  <Button
                    variant={selectedFilter === 'unbilled' ? 'default' : 'outline'}
                    size='sm'
                    onClick={() => setSelectedFilter('unbilled')}
                  >
                    {isRTL ? 'لم تفوتر' : 'Unbilled'} (1)
                  </Button>
                </div>
              </div>
              <Button variant='outline' size='sm'>
                <Filter className='me-2 h-4 w-4' />
                {isRTL ? 'المزيد من الفلاتر' : 'More Filters'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Time Entries Table */}
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
                      {isRTL ? 'العميل' : 'Client'}
                    </th>
                    <th className='px-6 py-3 text-start text-xs font-semibold'>
                      {isRTL ? 'المهمة' : 'Task'}
                    </th>
                    <th className='px-6 py-3 text-center text-xs font-semibold'>
                      {isRTL ? 'الساعات' : 'Hours'}
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
                  {timeEntries.map((entry) => (
                    <tr key={entry.id} className='border-b hover:bg-muted/50'>
                      <td className='px-6 py-4'>
                        <div className='text-sm'>{entry.date}</div>
                        <div className='text-xs text-muted-foreground'>{entry.id}</div>
                      </td>
                      <td className='px-6 py-4'>
                        <div className='text-sm font-semibold'>{entry.client}</div>
                        <div className='font-mono text-xs text-muted-foreground'>{entry.caseNumber}</div>
                      </td>
                      <td className='px-6 py-4'>
                        <div className='max-w-xs text-sm'>{entry.task}</div>
                      </td>
                      <td className='px-6 py-4 text-center'>
                        <div className='text-sm font-bold'>{entry.hours}</div>
                      </td>
                      <td className='px-6 py-4 text-center'>
                        <div className='text-sm font-bold'>{formatCurrency(entry.amount)}</div>
                      </td>
                      <td className='px-6 py-4 text-center'>{getStatusBadge(entry.status)}</td>
                      <td className='px-6 py-4'>
                        <div className='flex items-center justify-center gap-1'>
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

        {/* Footer Actions */}
        <div className='mt-6 flex items-center justify-between'>
          <div className='text-sm text-muted-foreground'>
            {isRTL ? `عرض ${timeEntries.length} سجل` : `Showing ${timeEntries.length} entries`}
          </div>
          <div className='flex gap-3'>
            <Button variant='outline'>
              {isRTL ? 'تحويل إلى فاتورة' : 'Convert to Invoice'} (1)
            </Button>
            <Button>{isRTL ? 'إنشاء تقرير الساعات' : 'Create Report'}</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
