import { useState, useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Calendar,
  List,
} from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useTimeEntries } from '@/hooks/useFinance'
import { useCasesAndClients } from '@/hooks/useCasesAndClients'

const arabicMonths = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
]

const arabicDays = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']

interface TimeEntry {
  id: string
  date: string
  description: string
  duration: number
  clientName?: string
  caseName?: string
  billable: boolean
}

export function MonthCalendarView() {
  const navigate = useNavigate()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [filterClient, setFilterClient] = useState('')

  const { data: timeEntries, isLoading } = useTimeEntries({
    startDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString(),
    endDate: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString(),
    clientId: filterClient,
  })
  const { data: casesAndClients } = useCasesAndClients()

  // Mock data for demonstration
  const mockEntries: TimeEntry[] = [
    { id: '1', date: '2024-03-05', description: 'مراجعة عقود', duration: 180, clientName: 'شركة النور', billable: true },
    { id: '2', date: '2024-03-05', description: 'اجتماع مع العميل', duration: 60, clientName: 'مؤسسة الأمل', billable: true },
    { id: '3', date: '2024-03-07', description: 'بحث قانوني', duration: 240, clientName: 'شركة المستقبل', billable: true },
    { id: '4', date: '2024-03-10', description: 'صياغة مذكرة', duration: 120, clientName: 'شركة النور', billable: true },
    { id: '5', date: '2024-03-12', description: 'حضور محكمة', duration: 180, clientName: 'مؤسسة الأمل', billable: true },
    { id: '6', date: '2024-03-15', description: 'استشارة هاتفية', duration: 30, clientName: 'مجموعة الرياض', billable: false },
    { id: '7', date: '2024-03-18', description: 'مراجعة مستندات', duration: 150, clientName: 'شركة النور', billable: true },
    { id: '8', date: '2024-03-20', description: 'إعداد تقرير', duration: 90, clientName: 'شركة المستقبل', billable: true },
  ]

  const entries = timeEntries || mockEntries

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startDayOfWeek = firstDay.getDay()

    const days: (Date | null)[] = []

    // Add empty slots for days before the first day of the month
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null)
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }, [currentDate])

  const getEntriesForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return entries.filter((entry: TimeEntry) => entry.date === dateStr)
  }

  const getTotalDuration = (date: Date) => {
    const dayEntries = getEntriesForDate(date)
    return dayEntries.reduce((total: number, entry: TimeEntry) => total + entry.duration, 0)
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins}د`
    if (mins === 0) return `${hours}س`
    return `${hours}س ${mins}د`
  }

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const monthTotal = useMemo(() => {
    return entries.reduce((total: number, entry: TimeEntry) => total + entry.duration, 0)
  }, [entries])

  const billableTotal = useMemo(() => {
    return entries
      .filter((entry: TimeEntry) => entry.billable)
      .reduce((total: number, entry: TimeEntry) => total + entry.duration, 0)
  }, [entries])

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>المالية</span>
          <ArrowRight className="h-4 w-4 rotate-180" />
          <span>تتبع الوقت</span>
          <ArrowRight className="h-4 w-4 rotate-180" />
          <span className="text-foreground">التقويم الشهري</span>
        </div>
        <div className="flex gap-2">
          <Link to="/dashboard/finance/time-tracking">
            <Button variant="outline" size="sm">
              <List className="h-4 w-4 ml-2" />
              القائمة
            </Button>
          </Link>
          <Link to="/dashboard/finance/time-tracking/weekly">
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 ml-2" />
              أسبوعي
            </Button>
          </Link>
          <Link to="/dashboard/finance/time-tracking/new">
            <Button size="sm">
              <Plus className="h-4 w-4 ml-2" />
              إضافة إدخال
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الشهر</p>
                <p className="text-2xl font-bold">{formatDuration(monthTotal)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">قابل للفوترة</p>
                <p className="text-2xl font-bold text-green-600">{formatDuration(billableTotal)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <Clock className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">غير قابل للفوترة</p>
                <p className="text-2xl font-bold text-gray-600">{formatDuration(monthTotal - billableTotal)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">عدد الإدخالات</p>
                <p className="text-2xl font-bold">{entries.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <CardTitle>
              {arabicMonths[currentDate.getMonth()]} {currentDate.getFullYear()}
            </CardTitle>
            <Button variant="outline" size="icon" onClick={goToNextMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              اليوم
            </Button>
          </div>

          <Select value={filterClient} onValueChange={setFilterClient}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="جميع العملاء" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">جميع العملاء</SelectItem>
              {casesAndClients?.clients?.map((client: { id: string; name: string }) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {arabicDays.map((day) => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((date, index) => {
              if (!date) {
                return <div key={index} className="min-h-[100px] bg-muted/20 rounded" />
              }

              const dayEntries = getEntriesForDate(date)
              const totalDuration = getTotalDuration(date)
              const today = isToday(date)

              return (
                <Dialog key={index}>
                  <DialogTrigger asChild>
                    <button
                      className={`min-h-[100px] p-2 rounded border text-right transition-all hover:border-primary ${
                        today ? 'bg-primary/10 border-primary' : 'bg-background border-muted'
                      } ${dayEntries.length > 0 ? 'cursor-pointer' : ''}`}
                      onClick={() => setSelectedDate(date)}
                    >
                      <div className={`text-sm font-medium ${today ? 'text-primary' : ''}`}>
                        {date.getDate()}
                      </div>
                      {totalDuration > 0 && (
                        <div className="mt-1">
                          <div className="text-xs bg-green-100 text-green-800 rounded px-1 py-0.5 inline-block">
                            {formatDuration(totalDuration)}
                          </div>
                        </div>
                      )}
                      {dayEntries.length > 0 && (
                        <div className="mt-1 space-y-1">
                          {dayEntries.slice(0, 2).map((entry: TimeEntry) => (
                            <div
                              key={entry.id}
                              className={`text-xs truncate rounded px-1 ${
                                entry.billable ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-700'
                              }`}
                            >
                              {entry.description}
                            </div>
                          ))}
                          {dayEntries.length > 2 && (
                            <div className="text-xs text-muted-foreground">
                              +{dayEntries.length - 2} أخرى
                            </div>
                          )}
                        </div>
                      )}
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>
                        {date.toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      {dayEntries.length > 0 ? (
                        <>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">إجمالي اليوم:</span>
                            <span className="font-bold">{formatDuration(totalDuration)}</span>
                          </div>
                          <div className="space-y-2">
                            {dayEntries.map((entry: TimeEntry) => (
                              <div
                                key={entry.id}
                                className="p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted"
                                onClick={() => navigate({ to: '/dashboard/finance/time-tracking/$entryId', params: { entryId: entry.id } })}
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-medium">{entry.description}</p>
                                    {entry.clientName && (
                                      <p className="text-sm text-muted-foreground">{entry.clientName}</p>
                                    )}
                                  </div>
                                  <div className="text-left">
                                    <p className="font-medium">{formatDuration(entry.duration)}</p>
                                    <span className={`text-xs ${entry.billable ? 'text-green-600' : 'text-gray-500'}`}>
                                      {entry.billable ? 'قابل للفوترة' : 'غير قابل'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <p className="text-center text-muted-foreground py-4">
                          لا توجد إدخالات في هذا اليوم
                        </p>
                      )}
                      <Button
                        className="w-full"
                        onClick={() => navigate({ to: '/dashboard/finance/time-tracking/new' })}
                      >
                        <Plus className="h-4 w-4 ml-2" />
                        إضافة إدخال جديد
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
