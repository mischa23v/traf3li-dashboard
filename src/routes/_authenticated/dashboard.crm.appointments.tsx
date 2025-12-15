import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import {
  Calendar,
  Plus,
  Search,
  Filter,
  Clock,
  User,
  Phone,
  Mail,
  Video,
  MapPin,
  MoreVertical,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { LanguageSwitcher } from '@/components/language-switcher'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Mock data for appointments
const mockAppointments = [
  {
    id: '1',
    title: 'استشارة أولية - قضية عقارية',
    leadName: 'أحمد محمد العلي',
    leadEmail: 'ahmed@example.com',
    leadPhone: '+966 55 123 4567',
    scheduledDate: new Date(2025, 0, 20, 10, 0),
    duration: 30,
    type: 'video' as const,
    status: 'confirmed' as const,
    assignedTo: 'محمد أحمد',
    notes: 'العميل مهتم بقضية نزاع عقاري',
  },
  {
    id: '2',
    title: 'متابعة - قضية تجارية',
    leadName: 'سارة عبدالله الحربي',
    leadEmail: 'sara@example.com',
    leadPhone: '+966 50 987 6543',
    scheduledDate: new Date(2025, 0, 20, 14, 30),
    duration: 45,
    type: 'in_person' as const,
    status: 'pending' as const,
    assignedTo: 'فاطمة علي',
    notes: 'مراجعة العقود',
  },
  {
    id: '3',
    title: 'مكالمة هاتفية - استفسار',
    leadName: 'خالد عمر السعدي',
    leadEmail: 'khalid@example.com',
    leadPhone: '+966 54 456 7890',
    scheduledDate: new Date(2025, 0, 21, 9, 0),
    duration: 15,
    type: 'phone' as const,
    status: 'confirmed' as const,
    assignedTo: 'عمر حسن',
    notes: 'استفسار عن الرسوم',
  },
  {
    id: '4',
    title: 'زيارة مكتبية - توقيع العقد',
    leadName: 'نورة فهد المالكي',
    leadEmail: 'noura@example.com',
    leadPhone: '+966 55 789 0123',
    scheduledDate: new Date(2025, 0, 19, 11, 0),
    duration: 60,
    type: 'in_person' as const,
    status: 'completed' as const,
    assignedTo: 'محمد أحمد',
    notes: 'توقيع عقد التوكيل',
  },
  {
    id: '5',
    title: 'استشارة - قضية أحوال شخصية',
    leadName: 'ريم سعود القحطاني',
    leadEmail: 'reem@example.com',
    leadPhone: '+966 50 234 5678',
    scheduledDate: new Date(2025, 0, 19, 15, 0),
    duration: 30,
    type: 'video' as const,
    status: 'cancelled' as const,
    assignedTo: 'فاطمة علي',
    notes: 'تم الإلغاء بطلب العميل',
  },
]

const statusConfig = {
  pending: { label: 'قيد الانتظار', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
  confirmed: { label: 'مؤكد', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  completed: { label: 'مكتمل', color: 'bg-blue-100 text-blue-800', icon: CheckCircle2 },
  cancelled: { label: 'ملغي', color: 'bg-red-100 text-red-800', icon: XCircle },
}

const typeConfig = {
  phone: { label: 'هاتفي', icon: Phone },
  video: { label: 'فيديو', icon: Video },
  in_person: { label: 'حضوري', icon: MapPin },
}

function AppointmentsPage() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const filteredAppointments = mockAppointments.filter((appointment) => {
    const matchesSearch =
      appointment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.leadName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter
    const matchesType = typeFilter === 'all' || appointment.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  // Group appointments by date
  const groupedAppointments = filteredAppointments.reduce(
    (groups, appointment) => {
      const dateKey = format(appointment.scheduledDate, 'yyyy-MM-dd')
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(appointment)
      return groups
    },
    {} as Record<string, typeof mockAppointments>
  )

  return (
    <>
      <Header>
        <div className='ms-auto flex items-center gap-4'>
          <LanguageSwitcher />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='p-6 lg:p-8'>
        {/* Header */}
        <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>
              {t('crm.appointments.title', 'المواعيد')}
            </h1>
            <p className='text-muted-foreground'>
              {t('crm.appointments.description', 'إدارة وجدولة مواعيد العملاء المحتملين')}
            </p>
          </div>
          <Button className='gap-2'>
            <Plus className='h-4 w-4' />
            {t('crm.appointments.newAppointment', 'موعد جديد')}
          </Button>
        </div>

        {/* Stats */}
        <div className='grid gap-4 md:grid-cols-4 mb-6'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-sm font-medium'>
                {t('crm.appointments.stats.today', 'مواعيد اليوم')}
              </CardTitle>
              <Calendar className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>3</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-sm font-medium'>
                {t('crm.appointments.stats.pending', 'قيد الانتظار')}
              </CardTitle>
              <AlertCircle className='h-4 w-4 text-yellow-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>5</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-sm font-medium'>
                {t('crm.appointments.stats.confirmed', 'مؤكدة')}
              </CardTitle>
              <CheckCircle2 className='h-4 w-4 text-green-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>12</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-sm font-medium'>
                {t('crm.appointments.stats.completed', 'مكتملة هذا الشهر')}
              </CardTitle>
              <CheckCircle2 className='h-4 w-4 text-blue-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>28</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className='flex flex-col gap-4 md:flex-row mb-6'>
          <div className='relative flex-1'>
            <Search className='absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              placeholder={t('crm.appointments.search', 'بحث في المواعيد...')}
              className='ps-10'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className='w-[180px]'>
              <SelectValue placeholder={t('crm.appointments.filterStatus', 'الحالة')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>{t('common.all', 'الكل')}</SelectItem>
              <SelectItem value='pending'>{t('crm.appointments.status.pending', 'قيد الانتظار')}</SelectItem>
              <SelectItem value='confirmed'>{t('crm.appointments.status.confirmed', 'مؤكد')}</SelectItem>
              <SelectItem value='completed'>{t('crm.appointments.status.completed', 'مكتمل')}</SelectItem>
              <SelectItem value='cancelled'>{t('crm.appointments.status.cancelled', 'ملغي')}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className='w-[180px]'>
              <SelectValue placeholder={t('crm.appointments.filterType', 'النوع')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>{t('common.all', 'الكل')}</SelectItem>
              <SelectItem value='phone'>{t('crm.appointments.type.phone', 'هاتفي')}</SelectItem>
              <SelectItem value='video'>{t('crm.appointments.type.video', 'فيديو')}</SelectItem>
              <SelectItem value='in_person'>{t('crm.appointments.type.inPerson', 'حضوري')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Appointments List */}
        <div className='space-y-6'>
          {Object.entries(groupedAppointments)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, appointments]) => (
              <div key={date}>
                <h3 className='text-lg font-semibold mb-3'>
                  {format(new Date(date), 'EEEE، d MMMM yyyy', {
                    locale: isRTL ? ar : undefined,
                  })}
                </h3>
                <div className='space-y-3'>
                  {appointments.map((appointment) => {
                    const StatusIcon = statusConfig[appointment.status].icon
                    const TypeIcon = typeConfig[appointment.type].icon
                    return (
                      <Card key={appointment.id}>
                        <CardContent className='p-4'>
                          <div className='flex items-start justify-between'>
                            <div className='flex gap-4'>
                              <div className='flex flex-col items-center justify-center bg-muted rounded-lg px-3 py-2 min-w-[60px]'>
                                <span className='text-lg font-bold'>
                                  {format(appointment.scheduledDate, 'HH:mm')}
                                </span>
                                <span className='text-xs text-muted-foreground'>
                                  {appointment.duration} {t('crm.appointments.minutes', 'دقيقة')}
                                </span>
                              </div>
                              <div className='flex-1'>
                                <div className='flex items-center gap-2 mb-1'>
                                  <h4 className='font-semibold'>{appointment.title}</h4>
                                  <Badge className={statusConfig[appointment.status].color}>
                                    <StatusIcon className='h-3 w-3 me-1' />
                                    {statusConfig[appointment.status].label}
                                  </Badge>
                                </div>
                                <div className='flex items-center gap-4 text-sm text-muted-foreground mb-2'>
                                  <span className='flex items-center gap-1'>
                                    <User className='h-3 w-3' />
                                    {appointment.leadName}
                                  </span>
                                  <span className='flex items-center gap-1'>
                                    <TypeIcon className='h-3 w-3' />
                                    {typeConfig[appointment.type].label}
                                  </span>
                                </div>
                                <div className='flex items-center gap-4 text-xs text-muted-foreground'>
                                  <span className='flex items-center gap-1'>
                                    <Mail className='h-3 w-3' />
                                    {appointment.leadEmail}
                                  </span>
                                  <span className='flex items-center gap-1' dir='ltr'>
                                    <Phone className='h-3 w-3' />
                                    {appointment.leadPhone}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant='ghost' size='icon'>
                                  <MoreVertical className='h-4 w-4' />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align='end'>
                                <DropdownMenuItem>
                                  {t('common.edit', 'تعديل')}
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  {t('crm.appointments.confirm', 'تأكيد')}
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  {t('crm.appointments.reschedule', 'إعادة جدولة')}
                                </DropdownMenuItem>
                                <DropdownMenuItem className='text-destructive'>
                                  {t('crm.appointments.cancel', 'إلغاء')}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            ))}
        </div>
      </Main>
    </>
  )
}

export const Route = createFileRoute('/_authenticated/dashboard/crm/appointments')({
  component: AppointmentsPage,
})
