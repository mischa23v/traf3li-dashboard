import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Search,
  Filter,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Bell,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/_authenticated/calendar/')({
  component: CalendarDashboard,
})

function CalendarDashboard() {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // TODO: Replace with real API data
  const events = [
    {
      id: 'EVT-001',
      title: 'جلسة محكمة - قضية مشاري الرابح',
      type: 'hearing',
      description: 'جلسة محكمة العمل للنظر في قضية المستحقات',
      startDate: '20 نوفمبر 2025',
      startTime: '10:00 ص',
      endTime: '11:30 ص',
      location: 'محكمة العمل بالرياض - قاعة 3',
      caseNumber: 'CASE-2025-001',
      attendees: ['أحمد السالم', 'مشاري الرابح'],
      status: 'scheduled',
      color: '#ef4444',
      allDay: false,
      hasReminder: true,
    },
    {
      id: 'EVT-002',
      title: 'اجتماع مع العميل',
      type: 'meeting',
      description: 'مناقشة تفاصيل القضية التجارية',
      startDate: '22 نوفمبر 2025',
      startTime: '02:00 م',
      endTime: '03:00 م',
      location: 'مكتب المحاماة - قاعة الاجتماعات',
      caseNumber: 'CASE-2025-002',
      attendees: ['سارة المحمد', 'سارة المطيري'],
      status: 'scheduled',
      color: '#3b82f6',
      allDay: false,
      hasReminder: true,
    },
    {
      id: 'EVT-003',
      title: 'موعد تسليم المذكرة',
      type: 'deadline',
      description: 'آخر موعد لتسليم مذكرة الدفاع',
      startDate: '25 نوفمبر 2025',
      startTime: null,
      endTime: null,
      location: null,
      caseNumber: 'CASE-2025-003',
      attendees: ['أحمد السالم'],
      status: 'scheduled',
      color: '#f59e0b',
      allDay: true,
      hasReminder: true,
    },
    {
      id: 'EVT-004',
      title: 'استشارة قانونية',
      type: 'meeting',
      description: 'استشارة أولية مع عميل جديد',
      startDate: '18 نوفمبر 2025',
      startTime: '11:00 ص',
      endTime: '12:00 م',
      location: 'مكتب المحاماة',
      caseNumber: null,
      attendees: ['سارة المحمد'],
      status: 'completed',
      color: '#10b981',
      allDay: false,
      hasReminder: false,
    },
  ]

  const filteredEvents = events.filter((event) => {
    if (activeTab === 'all') return true
    if (activeTab === 'hearing') return event.type === 'hearing'
    if (activeTab === 'meeting') return event.type === 'meeting'
    if (activeTab === 'deadline') return event.type === 'deadline'
    if (activeTab === 'today') return event.startDate === '20 نوفمبر 2025'
    return true
  })

  const hearings = events.filter((e) => e.type === 'hearing').length
  const meetings = events.filter((e) => e.type === 'meeting').length
  const deadlines = events.filter((e) => e.type === 'deadline').length
  const todayEvents = events.filter((e) => e.startDate === '20 نوفمبر 2025').length

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'hearing':
        return (
          <Badge className='bg-red-500'>
            {isRTL ? 'جلسة محكمة' : 'Hearing'}
          </Badge>
        )
      case 'meeting':
        return (
          <Badge className='bg-blue-500'>
            {isRTL ? 'اجتماع' : 'Meeting'}
          </Badge>
        )
      case 'deadline':
        return (
          <Badge className='bg-yellow-500'>
            {isRTL ? 'موعد نهائي' : 'Deadline'}
          </Badge>
        )
      case 'task':
        return (
          <Badge className='bg-purple-500'>
            {isRTL ? 'مهمة' : 'Task'}
          </Badge>
        )
      default:
        return (
          <Badge variant='outline'>
            {isRTL ? 'أخرى' : 'Other'}
          </Badge>
        )
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return (
          <Badge variant='outline' className='border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/20'>
            {isRTL ? 'مجدولة' : 'Scheduled'}
          </Badge>
        )
      case 'completed':
        return (
          <Badge variant='outline' className='border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/20'>
            {isRTL ? 'مكتملة' : 'Completed'}
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge variant='outline' className='border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/20'>
            {isRTL ? 'ملغاة' : 'Cancelled'}
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
              {isRTL ? 'التقويم' : 'Calendar'}
            </h1>
            <p className='text-sm text-muted-foreground'>
              {isRTL ? 'إدارة المواعيد والأحداث' : 'Manage appointments and events'}
            </p>
          </div>
          <div className='flex items-center gap-3'>
            <Button variant='outline'>
              <FileText className='me-2 h-4 w-4' />
              {isRTL ? 'تصدير' : 'Export'}
            </Button>
            <Button>
              <Plus className='me-2 h-4 w-4' />
              {isRTL ? 'حدث جديد' : 'New Event'}
            </Button>
          </div>
        </div>
      </div>

      <div className='mx-auto max-w-[1800px] p-6'>
        {/* Summary Cards */}
        <div className='mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          <Card className='bg-gradient-to-br from-red-50 to-background dark:from-red-950/20'>
            <CardContent className='p-6'>
              <div className='mb-3 flex items-center justify-between'>
                <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900'>
                  <AlertCircle className='h-5 w-5 text-red-600 dark:text-red-400' />
                </div>
                <Badge className='bg-red-500'>{isRTL ? 'جلسات' : 'Hearings'}</Badge>
              </div>
              <div className='mb-1 text-3xl font-bold'>{hearings}</div>
              <div className='text-xs text-muted-foreground'>
                {isRTL ? 'جلسات محكمة' : 'Court hearings'}
              </div>
            </CardContent>
          </Card>

          <Card className='bg-gradient-to-br from-blue-50 to-background dark:from-blue-950/20'>
            <CardContent className='p-6'>
              <div className='mb-3 flex items-center justify-between'>
                <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900'>
                  <Users className='h-5 w-5 text-blue-600 dark:text-blue-400' />
                </div>
                <Badge className='bg-blue-500'>{isRTL ? 'اجتماعات' : 'Meetings'}</Badge>
              </div>
              <div className='mb-1 text-3xl font-bold'>{meetings}</div>
              <div className='text-xs text-muted-foreground'>
                {isRTL ? 'اجتماعات مجدولة' : 'Scheduled meetings'}
              </div>
            </CardContent>
          </Card>

          <Card className='bg-gradient-to-br from-yellow-50 to-background dark:from-yellow-950/20'>
            <CardContent className='p-6'>
              <div className='mb-3 flex items-center justify-between'>
                <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900'>
                  <Clock className='h-5 w-5 text-yellow-600 dark:text-yellow-400' />
                </div>
                <Badge className='bg-yellow-500'>{isRTL ? 'مواعيد نهائية' : 'Deadlines'}</Badge>
              </div>
              <div className='mb-1 text-3xl font-bold'>{deadlines}</div>
              <div className='text-xs text-muted-foreground'>
                {isRTL ? 'مواعيد قادمة' : 'Upcoming deadlines'}
              </div>
            </CardContent>
          </Card>

          <Card className='bg-gradient-to-br from-purple-50 to-background dark:from-purple-950/20'>
            <CardContent className='p-6'>
              <div className='mb-3 flex items-center justify-between'>
                <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900'>
                  <CalendarIcon className='h-5 w-5 text-purple-600 dark:text-purple-400' />
                </div>
                <Badge variant='outline'>{isRTL ? 'اليوم' : 'Today'}</Badge>
              </div>
              <div className='mb-1 text-3xl font-bold'>{todayEvents}</div>
              <div className='text-xs text-muted-foreground'>
                {isRTL ? 'أحداث اليوم' : "Today's events"}
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
                {isRTL ? 'الكل' : 'All'} ({events.length})
              </Button>
              <Button
                variant={activeTab === 'today' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setActiveTab('today')}
              >
                {isRTL ? 'اليوم' : 'Today'} ({todayEvents})
              </Button>
              <Button
                variant={activeTab === 'hearing' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setActiveTab('hearing')}
              >
                {isRTL ? 'جلسات' : 'Hearings'} ({hearings})
              </Button>
              <Button
                variant={activeTab === 'meeting' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setActiveTab('meeting')}
              >
                {isRTL ? 'اجتماعات' : 'Meetings'} ({meetings})
              </Button>
              <Button
                variant={activeTab === 'deadline' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setActiveTab('deadline')}
              >
                {isRTL ? 'مواعيد نهائية' : 'Deadlines'} ({deadlines})
              </Button>
            </div>

            <div className='flex items-center gap-3'>
              <div className='relative flex-1'>
                <Search className='absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                <Input
                  placeholder={isRTL ? 'بحث في الأحداث...' : 'Search events...'}
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

        {/* Events List */}
        <div className='space-y-4'>
          {filteredEvents.map((event) => (
            <Card key={event.id} className='overflow-hidden border-s-4' style={{ borderLeftColor: event.color }}>
              <CardContent className='p-6'>
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <div className='mb-2 flex items-center gap-3'>
                      <h3 className='text-lg font-semibold'>{event.title}</h3>
                      {getTypeBadge(event.type)}
                      {getStatusBadge(event.status)}
                      {event.hasReminder && (
                        <Badge variant='outline' className='gap-1'>
                          <Bell className='h-3 w-3' />
                          {isRTL ? 'تذكير' : 'Reminder'}
                        </Badge>
                      )}
                    </div>

                    {event.description && (
                      <p className='mb-3 text-sm text-muted-foreground'>{event.description}</p>
                    )}

                    <div className='flex flex-wrap gap-4 text-sm'>
                      <div className='flex items-center gap-2'>
                        <CalendarIcon className='h-4 w-4 text-muted-foreground' />
                        <span>{event.startDate}</span>
                      </div>

                      {!event.allDay && event.startTime && (
                        <div className='flex items-center gap-2'>
                          <Clock className='h-4 w-4 text-muted-foreground' />
                          <span>
                            {event.startTime} - {event.endTime}
                          </span>
                        </div>
                      )}

                      {event.location && (
                        <div className='flex items-center gap-2'>
                          <MapPin className='h-4 w-4 text-muted-foreground' />
                          <span>{event.location}</span>
                        </div>
                      )}

                      {event.caseNumber && (
                        <div className='flex items-center gap-2'>
                          <FileText className='h-4 w-4 text-muted-foreground' />
                          <span className='font-mono'>{event.caseNumber}</span>
                        </div>
                      )}

                      {event.attendees.length > 0 && (
                        <div className='flex items-center gap-2'>
                          <Users className='h-4 w-4 text-muted-foreground' />
                          <span>{event.attendees.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className='flex gap-2'>
                    {event.status === 'scheduled' && (
                      <>
                        <Button variant='outline' size='sm'>
                          <CheckCircle className='me-2 h-4 w-4' />
                          {isRTL ? 'إكمال' : 'Complete'}
                        </Button>
                        <Button variant='outline' size='sm'>
                          <XCircle className='me-2 h-4 w-4' />
                          {isRTL ? 'إلغاء' : 'Cancel'}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className='mt-6 flex items-center justify-between'>
          <div className='text-sm text-muted-foreground'>
            {isRTL
              ? `عرض ${filteredEvents.length} من ${events.length} حدث`
              : `Showing ${filteredEvents.length} of ${events.length} events`}
          </div>
        </div>
      </div>
    </div>
  )
}
