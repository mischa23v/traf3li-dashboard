import { useState } from 'react'
import { Bell, Briefcase, Clock, AlertCircle, CheckCircle, Plus, Filter, Search } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ProfileDropdown } from '@/components/profile-dropdown'

interface Reminder {
  id: number
  title: string
  description: string
  type: string
  dueDate: string
  dueTime: string
  priority: string
  status: string
  caseNumber?: string
  client?: string
  assignee?: string
  amount?: string
  daysUntil: number
  notifyBefore: string
  location?: string
}

export default function RemindersPage() {
  const [selectedFilter] = useState('all')
  const [selectedType] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const summary = {
    totalReminders: 24,
    urgent: 5,
    upcoming: 12,
    completed: 7,
    overdue: 3
  }

  const reminders: Reminder[] = [
    {
      id: 1,
      title: 'جلسة محكمة - شركة البناء الحديثة',
      description: 'جلسة المحكمة التجارية في قضية CASE-2025-012',
      type: 'court',
      dueDate: '2025-11-18',
      dueTime: '9:00 ص',
      priority: 'urgent',
      status: 'active',
      caseNumber: 'CASE-2025-012',
      client: 'شركة البناء الحديثة',
      assignee: 'فاطمة الغامدي',
      daysUntil: 1,
      notifyBefore: '24 ساعة'
    }
  ]

  const getTypeInfo = (type: string) => {
    const types: Record<string, { label: string; color: string }> = {
      court: { label: 'جلسة محكمة', color: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950' },
      payment: { label: 'دفعة مالية', color: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-950' },
      task: { label: 'مهمة', color: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950' },
      meeting: { label: 'اجتماع', color: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950' },
      deadline: { label: 'موعد نهائي', color: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950' },
      document: { label: 'مستند', color: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950' },
      followup: { label: 'متابعة', color: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950' }
    }
    return types[type] || { label: 'تذكير', color: 'bg-muted text-muted-foreground' }
  }

  const getPriorityBadge = (priority: string) => {
    const priorities: Record<string, { label: string; color: string }> = {
      urgent: { label: 'عاجل', color: 'bg-red-500 text-white' },
      high: { label: 'عالي', color: 'bg-orange-500 text-white' },
      medium: { label: 'متوسط', color: 'bg-yellow-500 text-white' },
      low: { label: 'منخفض', color: 'bg-green-500 text-white' }
    }
    return priorities[priority] || { label: 'عادي', color: 'bg-muted' }
  }

  const filteredReminders = reminders.filter(reminder => {
    const matchesFilter = selectedFilter === 'all' || reminder.status === selectedFilter
    const matchesType = selectedType === 'all' || reminder.type === selectedType
    const matchesSearch = reminder.title.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesType && matchesSearch
  })

  return (
    <>
      <Header>
        <div className='flex items-center gap-6 flex-1'>
          <div>
            <h1 className="text-2xl font-bold">التذكيرات والإشعارات</h1>
            <p className="text-sm text-muted-foreground">إدارة التذكيرات والمواعيد المهمة</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            تصفية متقدمة
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            إنشاء تذكير
          </Button>
          <LanguageSwitcher />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main dir="rtl">
        {/* Summary Stats */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-muted to-card">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                  <Bell className="h-5 w-5" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">{summary.totalReminders}</div>
              <div className="text-xs text-muted-foreground">إجمالي التذكيرات</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-card dark:from-red-950">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-lg bg-red-100 dark:bg-red-900 flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">{summary.urgent}</div>
              <div className="text-xs text-muted-foreground">عاجلة</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-card dark:from-blue-950">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">{summary.upcoming}</div>
              <div className="text-xs text-muted-foreground">قادمة</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-card dark:from-green-950">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">{summary.completed}</div>
              <div className="text-xs text-muted-foreground">مكتملة</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-card dark:from-orange-950">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-lg bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">{summary.overdue}</div>
              <div className="text-xs text-muted-foreground">متأخرة</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="بحث في التذكيرات..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10 pl-4 py-2 border rounded-lg text-sm w-full bg-card"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reminders List */}
        <div className="space-y-4">
          {filteredReminders.map((reminder) => {
            const typeInfo = getTypeInfo(reminder.type)
            const priority = getPriorityBadge(reminder.priority)

            return (
              <Card
                key={reminder.id}
                className={`border-r-4 ${
                  reminder.status === 'overdue' ? 'border-r-red-500 bg-red-50 dark:bg-red-950' :
                  reminder.priority === 'urgent' ? 'border-r-red-500' :
                  reminder.priority === 'high' ? 'border-r-orange-500' :
                  reminder.daysUntil <= 1 ? 'border-r-yellow-500' :
                  'border-r-blue-500'
                }`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={`h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      reminder.status === 'overdue' ? 'bg-red-100 dark:bg-red-900' :
                      reminder.priority === 'urgent' ? 'bg-red-100 dark:bg-red-900' :
                      'bg-blue-100 dark:bg-blue-900'
                    }`}>
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold mb-1">{reminder.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{reminder.description}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className={typeInfo.color}>
                          {typeInfo.label}
                        </Badge>
                        <Badge className={priority.color}>
                          {priority.label}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="mt-6 text-sm text-muted-foreground">
          عرض {filteredReminders.length} من {reminders.length} تذكير
        </div>
      </Main>
    </>
  )
}
