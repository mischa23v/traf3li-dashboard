import { useState } from 'react'
import { CheckSquare, Clock, AlertCircle, User, Calendar, Search, Plus, Download, MoreVertical, Edit, Trash2, Eye, Flag, Briefcase, FileText } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ProfileDropdown } from '@/components/profile-dropdown'

interface Task {
  id: string
  title: string
  client: string
  status: 'pending' | 'in_progress' | 'completed'
  priority: 'high' | 'medium' | 'low'
  dueDate: string
  assignee: string
  caseNumber: string
  progress: number
  type: string
  overdue?: boolean
}

export function Tasks() {
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [selectedPriority, setSelectedPriority] = useState('all')
  const [selectedAssignee, setSelectedAssignee] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Summary stats
  const summary = {
    totalTasks: 18,
    pending: 7,
    inProgress: 6,
    completed: 5,
    overdue: 2
  }

  // Tasks data
  const tasks: Task[] = [
    {
      id: 'CASE-1001',
      title: 'تحضير استراتيجية الدفاع في قضية نزاع الأراضي التجاري',
      client: 'تحضير استراتيجية',
      status: 'pending',
      priority: 'high',
      dueDate: '2024-11-25',
      assignee: 'أحمد السالم',
      caseNumber: 'CASE-1001',
      progress: 0,
      type: 'legal_prep'
    },
    {
      id: 'CASE-1002',
      title: 'مراجعة وتحليل مستندات العقد لشركة لمعرفة',
      client: 'مراجعة مستندات',
      status: 'pending',
      priority: 'high',
      dueDate: '2024-11-26',
      assignee: 'فاطمة الغامدي',
      caseNumber: 'CASE-1002',
      progress: 0,
      type: 'document_review'
    },
    {
      id: 'CASE-1003',
      title: 'استشارة العميل - تحضير لجلسات المحاكمة القادمة فيو',
      client: 'استشارة عميل',
      status: 'in_progress',
      priority: 'medium',
      dueDate: '2024-11-28',
      assignee: 'خالد المري',
      caseNumber: 'CASE-1003',
      progress: 45,
      type: 'consultation'
    },
    {
      id: 'CASE-1004',
      title: 'تقييم ممتلكات - قضية #4521/2024 - قضية دعوى محكمة العدل',
      client: 'تقييم ممتلكات',
      status: 'pending',
      priority: 'high',
      dueDate: '2024-11-22',
      assignee: 'سارة الدوسري',
      caseNumber: 'CASE-1004',
      progress: 0,
      type: 'assessment',
      overdue: true
    },
    {
      id: 'CASE-1005',
      title: 'بحث قانوني عن سوابق قضائية متشابهة للقضية',
      client: 'بحث قانوني',
      status: 'in_progress',
      priority: 'medium',
      dueDate: '2024-11-30',
      assignee: 'محمد العتيبي',
      caseNumber: 'CASE-1005',
      progress: 60,
      type: 'research'
    },
    {
      id: 'CASE-1006',
      title: 'مراجعة دقيقة لعقود شركة الشركة في قضية التجارية',
      client: 'مراجعة مستندات',
      status: 'completed',
      priority: 'medium',
      dueDate: '2024-11-20',
      assignee: 'فاطمة الغامدي',
      caseNumber: 'CASE-1006',
      progress: 100,
      type: 'document_review'
    },
    {
      id: 'CASE-1007',
      title: 'تحضير شهادات الشهود لتقديم الدخول',
      client: 'تحضير استراتيجية',
      status: 'in_progress',
      priority: 'medium',
      dueDate: '2024-12-01',
      assignee: 'أحمد السالم',
      caseNumber: 'CASE-1007',
      progress: 30,
      type: 'legal_prep'
    },
    {
      id: 'CASE-1008',
      title: 'اجتماع مع عميل لمناقشة مع تفاصيل دعوى العرض الشرعية',
      client: 'استشارة عميل',
      status: 'completed',
      priority: 'low',
      dueDate: '2024-11-18',
      assignee: 'خالد المري',
      caseNumber: 'CASE-1008',
      progress: 100,
      type: 'consultation'
    },
    {
      id: 'CASE-1009',
      title: 'بحث قانوني عن تشريعات العمل الصدري 2024',
      client: 'بحث قانوني',
      status: 'pending',
      priority: 'high',
      dueDate: '2024-11-27',
      assignee: 'محمد العتيبي',
      caseNumber: 'CASE-1009',
      progress: 0,
      type: 'research'
    },
    {
      id: 'CASE-1010',
      title: 'تقييم ممتلكات - قضيم للمحكمة موكيل - في انتظار مستندات العميل',
      client: 'تقييم ممتلكات',
      status: 'in_progress',
      priority: 'medium',
      dueDate: '2024-12-05',
      assignee: 'سارة الدوسري',
      caseNumber: 'CASE-1010',
      progress: 20,
      type: 'assessment',
      overdue: true
    },
    {
      id: 'CASE-1011',
      title: 'إعداد مذكرة دفاع في القضية التجارية',
      client: 'مشاري الرابح',
      status: 'in_progress',
      priority: 'high',
      dueDate: '2024-11-24',
      assignee: 'أحمد السالم',
      caseNumber: 'CASE-2025-001',
      progress: 70,
      type: 'legal_prep'
    },
    {
      id: 'CASE-1012',
      title: 'مراجعة العقد وإبداء الملاحظات القانونية',
      client: 'سارة المطيري',
      status: 'pending',
      priority: 'medium',
      dueDate: '2024-11-29',
      assignee: 'فاطمة الغامدي',
      caseNumber: 'CASE-2025-005',
      progress: 0,
      type: 'document_review'
    },
    {
      id: 'CASE-1013',
      title: 'صياغة عقد المقاولة والمراجعة النهائية',
      client: 'شركة البناء الحديثة',
      status: 'completed',
      priority: 'high',
      dueDate: '2024-11-21',
      assignee: 'فاطمة الغامدي',
      caseNumber: 'CASE-2025-012',
      progress: 100,
      type: 'document_review'
    },
    {
      id: 'CASE-1014',
      title: 'البحث القانوني في سوابق قضائية مشابهة',
      client: 'عمر العنزي',
      status: 'in_progress',
      priority: 'medium',
      dueDate: '2024-11-26',
      assignee: 'محمد العتيبي',
      caseNumber: 'CASE-2025-008',
      progress: 55,
      type: 'research'
    },
    {
      id: 'CASE-1015',
      title: 'إعداد صحيفة الدعوى وتقديمها للمحكمة',
      client: 'سارة المطيري',
      status: 'pending',
      priority: 'high',
      dueDate: '2024-11-25',
      assignee: 'فاطمة الغامدي',
      caseNumber: 'CASE-2025-005',
      progress: 0,
      type: 'legal_prep'
    },
    {
      id: 'CASE-1016',
      title: 'تحضير مستندات القضية ورفعها إلكترونياً',
      client: 'المجموعة التجارية الكبرى',
      status: 'in_progress',
      priority: 'high',
      dueDate: '2024-11-23',
      assignee: 'خالد المري',
      caseNumber: 'CASE-2025-018',
      progress: 80,
      type: 'document_review'
    },
    {
      id: 'CASE-1017',
      title: 'متابعة مع العميل بخصوص المستندات الناقصة',
      client: 'مشاري الرابح',
      status: 'completed',
      priority: 'low',
      dueDate: '2024-11-19',
      assignee: 'أحمد السالم',
      caseNumber: 'CASE-2025-001',
      progress: 100,
      type: 'consultation'
    },
    {
      id: 'CASE-1018',
      title: 'مراجعة نهائية للمستندات قبل الجلسة',
      client: 'عمر العنزي',
      status: 'pending',
      priority: 'high',
      dueDate: '2024-11-21',
      assignee: 'أحمد السالم',
      caseNumber: 'CASE-2025-008',
      progress: 0,
      type: 'legal_prep'
    }
  ]

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'legal_prep':
        return <Briefcase className="h-4 w-4" />
      case 'document_review':
        return <FileText className="h-4 w-4" />
      case 'consultation':
        return <User className="h-4 w-4" />
      case 'research':
        return <Search className="h-4 w-4" />
      case 'assessment':
        return <CheckSquare className="h-4 w-4" />
      default:
        return <CheckSquare className="h-4 w-4" />
    }
  }

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = selectedFilter === 'all' || task.status === selectedFilter
    const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority
    const matchesAssignee = selectedAssignee === 'all' || task.assignee === selectedAssignee
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.caseNumber.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesPriority && matchesAssignee && matchesSearch
  })

  return (
    <>
      <Header>
        <div className='flex items-center gap-6 flex-1'>
          <h1 className="text-xl font-bold">المهام القانونية</h1>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="بحث في المهام..."
              className="w-80 pr-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            تصدير
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            إنشاء مهمة
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
                  <CheckSquare className="h-5 w-5" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">{summary.totalTasks}</div>
              <div className="text-xs text-muted-foreground">إجمالي المهام</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-card border-yellow-200 dark:from-yellow-950">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-lg bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">{summary.pending}</div>
              <div className="text-xs text-muted-foreground">قيد الانتظار</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-card border-blue-200 dark:from-blue-950">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <CheckSquare className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">{summary.inProgress}</div>
              <div className="text-xs text-muted-foreground">قيد التنفيذ</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-card border-green-200 dark:from-green-950">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <CheckSquare className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">{summary.completed}</div>
              <div className="text-xs text-muted-foreground">مكتملة</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-card border-red-200 dark:from-red-950">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-lg bg-red-100 dark:bg-red-900 flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-red-600" />
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
                <div className="flex gap-2">
                  <Button
                    variant={selectedFilter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedFilter('all')}
                  >
                    الكل ({tasks.length})
                  </Button>
                  <Button
                    variant={selectedFilter === 'pending' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedFilter('pending')}
                  >
                    انتظار ({tasks.filter(t => t.status === 'pending').length})
                  </Button>
                  <Button
                    variant={selectedFilter === 'in_progress' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedFilter('in_progress')}
                  >
                    تنفيذ ({tasks.filter(t => t.status === 'in_progress').length})
                  </Button>
                  <Button
                    variant={selectedFilter === 'completed' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedFilter('completed')}
                  >
                    مكتملة ({tasks.filter(t => t.status === 'completed').length})
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                  <SelectTrigger className="w-40 text-right" dir="rtl">
                    <SelectValue placeholder="كل الأولويات" />
                  </SelectTrigger>
                  <SelectContent dir="rtl">
                    <SelectItem value="all">كل الأولويات</SelectItem>
                    <SelectItem value="high">عاجل</SelectItem>
                    <SelectItem value="medium">متوسط</SelectItem>
                    <SelectItem value="low">منخفض</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
                  <SelectTrigger className="w-40 text-right" dir="rtl">
                    <SelectValue placeholder="كل المكلفين" />
                  </SelectTrigger>
                  <SelectContent dir="rtl">
                    <SelectItem value="all">كل المكلفين</SelectItem>
                    <SelectItem value="أحمد السالم">أحمد السالم</SelectItem>
                    <SelectItem value="فاطمة الغامدي">فاطمة الغامدي</SelectItem>
                    <SelectItem value="خالد المري">خالد المري</SelectItem>
                    <SelectItem value="محمد العتيبي">محمد العتيبي</SelectItem>
                    <SelectItem value="سارة الدوسري">سارة الدوسري</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasks Grid */}
        <div className="grid grid-cols-1 gap-4">
          {filteredTasks.map((task) => {
            const daysUntil = getDaysUntilDue(task.dueDate)

            return (
              <Card
                key={task.id}
                className={`border-r-4 hover:shadow-md transition-all cursor-pointer ${
                  task.priority === 'high' ? 'border-r-red-500' :
                  task.priority === 'medium' ? 'border-r-yellow-500' :
                  'border-r-green-500'
                } ${task.overdue ? 'bg-red-50 dark:bg-red-950' : ''}`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      task.status === 'completed' ? 'bg-green-100 dark:bg-green-900' :
                      task.status === 'in_progress' ? 'bg-blue-100 dark:bg-blue-900' :
                      'bg-yellow-100 dark:bg-yellow-900'
                    }`}>
                      <div className={
                        task.status === 'completed' ? 'text-green-600' :
                        task.status === 'in_progress' ? 'text-blue-600' :
                        'text-yellow-600'
                      }>
                        {getTypeIcon(task.type)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-bold mb-1">{task.title}</h3>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant={
                              task.status === 'completed' ? 'default' :
                              task.status === 'in_progress' ? 'secondary' :
                              'outline'
                            }>
                              {task.status === 'pending' ? 'قيد الانتظار' :
                               task.status === 'in_progress' ? 'قيد التنفيذ' :
                               'مكتملة'}
                            </Badge>
                            <Badge variant={
                              task.priority === 'high' ? 'destructive' :
                              task.priority === 'medium' ? 'secondary' :
                              'outline'
                            } className="gap-1">
                              <Flag className="h-3 w-3" />
                              {task.priority === 'high' ? 'عاجل' :
                               task.priority === 'medium' ? 'متوسط' :
                               'منخفض'}
                            </Badge>
                            {task.overdue && (
                              <Badge variant="destructive" className="gap-1">
                                <AlertCircle className="h-3 w-3" />
                                متأخر
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </div>

                      {/* Progress Bar */}
                      {task.status === 'in_progress' && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                            <span>التقدم</span>
                            <span className="font-semibold">{task.progress}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full transition-all"
                              style={{ width: `${task.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* Details */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>{task.assignee}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(task.dueDate).toLocaleDateString('ar-SA')}
                            {daysUntil >= 0 && !task.overdue && (
                              <span className="mr-1 text-xs">
                                (بعد {daysUntil} {daysUntil === 1 ? 'يوم' : 'أيام'})
                              </span>
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4" />
                          <span className="font-mono text-xs">{task.caseNumber}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1 flex-shrink-0">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Results Info */}
        <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
          <div>
            عرض {filteredTasks.length} من {tasks.length} مهمة
          </div>
          <div className="flex items-center gap-2">
            <span>الصفحة 1 من 1</span>
          </div>
        </div>
      </Main>
    </>
  )
}
