import { useState } from 'react'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Filter, Clock, MapPin, Users, FileText, CheckSquare, Briefcase, Bell, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ProfileDropdown } from '@/components/profile-dropdown'

interface CalendarItem {
  id: number
  type: 'event' | 'task' | 'case'
  title: string
  date: Date
  time: string
  duration?: string
  location?: string
  court?: string
  caseNumber?: string
  client?: string
  lawyer?: string
  attendees?: string[]
  priority?: string
  assignee?: string
  estimatedHours?: number
  sessionType?: string
  status?: string
  color: string
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 10, 17))
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedItem, setSelectedItem] = useState<CalendarItem | null>(null)

  const monthNames = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ]

  const dayNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']

  const calendarItems: CalendarItem[] = [
    {
      id: 1,
      type: 'event',
      title: 'اجتماع مع العميل - مشاري الرابح',
      date: new Date(2025, 10, 17),
      time: '10:00 ص',
      duration: '1 ساعة',
      location: 'مكتب المحاماة - الرياض',
      attendees: ['أحمد السالم', 'فاطمة الغامدي'],
      caseNumber: 'CASE-2025-001',
      color: 'blue',
      status: 'upcoming'
    },
    {
      id: 4,
      type: 'task',
      title: 'إعداد مذكرة دفاع في القضية التجارية',
      date: new Date(2025, 10, 17),
      time: '2:00 م',
      priority: 'high',
      assignee: 'أحمد السالم',
      caseNumber: 'CASE-2025-001',
      client: 'مشاري الرابح',
      estimatedHours: 3.5,
      color: 'red',
      status: 'pending'
    },
    {
      id: 9,
      type: 'case',
      title: 'جلسة المحكمة التجارية - شركة البناء الحديثة',
      date: new Date(2025, 10, 18),
      time: '9:00 ص',
      duration: '2 ساعة',
      court: 'المحكمة التجارية - الرياض',
      caseNumber: 'CASE-2025-012',
      client: 'شركة البناء الحديثة',
      lawyer: 'فاطمة الغامدي',
      sessionType: 'جلسة مرافعة',
      color: 'purple',
      status: 'scheduled'
    }
  ]

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    const days: Array<{ day: number | string; isCurrentMonth: boolean; date?: Date }> = []
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ day: '', isCurrentMonth: false })
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, isCurrentMonth: true, date: new Date(year, month, i) })
    }
    
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ day: '', isCurrentMonth: false })
    }
    
    return days
  }

  const getItemsForDate = (date: Date | undefined) => {
    if (!date) return []
    return calendarItems.filter(item => 
      item.date.toDateString() === date.toDateString()
    )
  }

  const changeMonth = (direction: number) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(currentDate.getMonth() + direction)
    setCurrentDate(newDate)
  }

  const isToday = (date: Date | undefined) => {
    if (!date) return false
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      event: 'حدث',
      task: 'مهمة',
      case: 'قضية'
    }
    return types[type] || ''
  }

  const getTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      event: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950',
      task: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950',
      case: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950'
    }
    return colors[type] || 'bg-muted text-muted-foreground'
  }

  const days = getDaysInMonth(currentDate)

  return (
    <>
      <Header>
        <div className='flex items-center gap-6 flex-1'>
          <div>
            <h1 className="text-2xl font-bold">التقويم</h1>
            <p className="text-sm text-muted-foreground">إدارة الأحداث والمهام والقضايا</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            تصفية
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            إضافة جديد
          </Button>
          <LanguageSwitcher />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main dir="rtl">
        {/* Calendar Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <div className="flex gap-2">
                  <Button
                    onClick={() => changeMonth(-1)}
                    variant="outline"
                    size="sm"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                  <Button
                    onClick={() => changeMonth(1)}
                    variant="outline"
                    size="sm"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                </div>
                <Button
                  onClick={() => setCurrentDate(new Date())}
                  variant="outline"
                  size="sm"
                >
                  اليوم
                </Button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Day Headers */}
              {dayNames.map(day => (
                <div key={day} className="text-center py-3 text-sm font-semibold text-muted-foreground bg-muted rounded-lg">
                  {day}
                </div>
              ))}

              {/* Calendar Days */}
              {days.map((dayObj, idx) => {
                const itemsOnThisDay = dayObj.date ? getItemsForDate(dayObj.date) : []
                const isCurrentDay = dayObj.date && isToday(dayObj.date)
                
                return (
                  <button
                    key={idx}
                    onClick={() => dayObj.date && setSelectedDate(dayObj.date)}
                    className={`min-h-32 p-2 border rounded-lg text-right hover:bg-muted/50 transition-colors ${
                      !dayObj.isCurrentMonth ? 'bg-muted/50 opacity-40' : 'bg-card'
                    } ${
                      selectedDate && dayObj.date && selectedDate.toDateString() === dayObj.date.toDateString()
                        ? 'border-blue-500 border-2 bg-blue-50 dark:bg-blue-950'
                        : 'border-border'
                    } ${
                      isCurrentDay ? 'ring-2 ring-blue-400' : ''
                    }`}
                    disabled={!dayObj.isCurrentMonth}
                  >
                    {dayObj.day && (
                      <>
                        <div className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-semibold mb-1 ${
                          isCurrentDay 
                            ? 'bg-blue-600 text-white' 
                            : ''
                        }`}>
                          {dayObj.day}
                        </div>
                        
                        <div className="space-y-1">
                          {itemsOnThisDay.slice(0, 3).map(item => (
                            <div
                              key={item.id}
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedItem(item)
                              }}
                              className={`text-xs px-2 py-1 rounded truncate cursor-pointer ${
                                item.type === 'event' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-950' :
                                item.type === 'task' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-950' :
                                'bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-950'
                              }`}
                            >
                              {item.time} {item.title}
                            </div>
                          ))}
                          {itemsOnThisDay.length > 3 && (
                            <div className="text-xs text-muted-foreground text-center">
                              +{itemsOnThisDay.length - 3} المزيد
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events Summary */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h4 className="text-sm font-bold mb-4 flex items-center gap-2">
              <Bell className="h-4 w-4 text-blue-600" />
              الأحداث القادمة
            </h4>
            
            <div className="space-y-2">
              {calendarItems
                .filter(i => {
                  const today = new Date()
                  today.setHours(0, 0, 0, 0)
                  return i.date >= today
                })
                .sort((a, b) => a.date.getTime() - b.date.getTime())
                .slice(0, 5)
                .map((event) => (
                  <div
                    key={event.id}
                    onClick={() => setSelectedItem(event)}
                    className={`flex items-center justify-between text-sm p-3 rounded-lg cursor-pointer transition-colors ${
                      event.type === 'event' ? 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-950' :
                      event.type === 'task' ? 'bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-950' :
                      'bg-purple-50 hover:bg-purple-100 dark:bg-purple-950'
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className={`h-2 w-2 rounded-full flex-shrink-0 ${
                        event.type === 'event' ? 'bg-blue-500' :
                        event.type === 'task' ? 'bg-yellow-500' :
                        'bg-purple-500'
                      }`}></div>
                      <div className="flex-1 min-w-0">
                        <div className="truncate">{event.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {event.date.getDate()} {monthNames[event.date.getMonth()]}
                        </div>
                      </div>
                    </div>
                    <span className="font-semibold text-xs ml-2">{event.time}</span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Items List for Selected Date */}
        {selectedDate && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">
                  {dayNames[selectedDate.getDay()]} - {selectedDate.getDate()} {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                </h3>
                <Button
                  onClick={() => setSelectedDate(null)}
                  variant="outline"
                  size="sm"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              {getItemsForDate(selectedDate).length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">لا توجد أحداث أو مهام في هذا اليوم</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {getItemsForDate(selectedDate).map(item => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className={`p-4 rounded-lg border-2 hover:shadow-md cursor-pointer transition-all ${
                        item.type === 'event' ? 'bg-blue-50 border-blue-200 hover:border-blue-300 dark:bg-blue-950' :
                        item.type === 'task' ? 'bg-yellow-50 border-yellow-200 hover:border-yellow-300 dark:bg-yellow-950' :
                        'bg-purple-50 border-purple-200 hover:border-purple-300 dark:bg-purple-950'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2.5 rounded-lg ${
                          item.type === 'event' ? 'bg-blue-100 dark:bg-blue-900' :
                          item.type === 'task' ? 'bg-yellow-100 dark:bg-yellow-900' :
                          'bg-purple-100 dark:bg-purple-900'
                        }`}>
                          {item.type === 'event' && <CalendarIcon className="h-4 w-4" />}
                          {item.type === 'task' && <CheckSquare className="h-4 w-4" />}
                          {item.type === 'case' && <Briefcase className="h-4 w-4" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-bold">{item.title}</h4>
                            <Badge variant="outline" className={getTypeBadgeColor(item.type)}>
                              {getTypeLabel(item.type)}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-2">
                            <span className="flex items-center gap-1 font-semibold">
                              <Clock className="h-4 w-4" />
                              {item.time}
                            </span>
                            {item.duration && (
                              <span className="text-xs bg-muted px-2 py-0.5 rounded">
                                {item.duration}
                              </span>
                            )}
                            {item.location && (
                              <span className="flex items-center gap-1 text-xs">
                                <MapPin className="h-3 w-3" />
                                {item.location}
                              </span>
                            )}
                            {item.court && (
                              <span className="flex items-center gap-1 text-xs">
                                <MapPin className="h-3 w-3" />
                                {item.court}
                              </span>
                            )}
                          </div>
                          {item.client && (
                            <div className="text-xs text-muted-foreground">
                              العميل: <span className="font-semibold">{item.client}</span>
                            </div>
                          )}
                          {item.caseNumber && (
                            <div className="text-xs text-muted-foreground mt-1">
                              <span className="font-mono text-blue-600 font-semibold">{item.caseNumber}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Item Detail Modal */}
        {selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedItem(null)}>
            <Card className="max-w-2xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="outline" className={getTypeBadgeColor(selectedItem.type)}>
                    {getTypeLabel(selectedItem.type)}
                  </Badge>
                  <Button
                    onClick={() => setSelectedItem(null)}
                    variant="outline"
                    size="sm"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <h2 className="text-2xl font-bold mb-4">{selectedItem.title}</h2>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <span>{selectedItem.time} {selectedItem.duration && `- ${selectedItem.duration}`}</span>
                  </div>

                  {selectedItem.location && (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <span>{selectedItem.location}</span>
                    </div>
                  )}

                  {selectedItem.court && (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <span>{selectedItem.court}</span>
                    </div>
                  )}

                  {selectedItem.attendees && (
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">الحضور:</div>
                        <div className="flex flex-wrap gap-2">
                          {selectedItem.attendees.map((attendee, idx) => (
                            <span key={idx} className="px-3 py-1 bg-muted rounded-full text-sm">
                              {attendee}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedItem.caseNumber && (
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <span>رقم القضية: <span className="font-mono font-semibold">{selectedItem.caseNumber}</span></span>
                    </div>
                  )}

                  {selectedItem.client && (
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-muted-foreground" />
                      <span>العميل: <span className="font-semibold">{selectedItem.client}</span></span>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-6">
                  <Button className="flex-1">
                    تعديل
                  </Button>
                  <Button variant="outline" className="flex-1">
                    حذف
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </Main>
    </>
  )
}
